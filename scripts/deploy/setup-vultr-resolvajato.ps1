#Requires -Version 5.1
<#
.SYNOPSIS
  Publica o Resolva Jato no Vultr (mesmo VPS do Aerosuite): código, .env, Docker e tunnel Cloudflare.
#>
param(
  [string]$HostName = "216.238.102.195",
  [string]$User = "root",
  [string]$SshKey = "$env:USERPROFILE\.ssh\aerosuite_ed25519",
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [switch]$SkipEnv,
  [switch]$SkipTunnel,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$sshOpts = @("-i", $SshKey, "-o", "StrictHostKeyChecking=accept-new", "-o", "BatchMode=yes")
$remote = "${User}@${HostName}"

function Invoke-Remote {
  param([Parameter(Mandatory)][string]$Command)
  & ssh @sshOpts $remote $Command
  if ($LASTEXITCODE -ne 0) { throw "SSH falhou: $Command" }
}

function Copy-ToRemote {
  param([Parameter(Mandatory)][string]$Local, [Parameter(Mandatory)][string]$RemotePath)
  & scp @sshOpts $Local "${remote}:${RemotePath}"
  if ($LASTEXITCODE -ne 0) { throw "SCP falhou: $Local -> $RemotePath" }
}

Write-Host "==> Repo: $RepoRoot"
Set-Location $RepoRoot

if (-not (Test-Path $SshKey)) { throw "Chave SSH ausente: $SshKey" }

# --- .env.production ---
$envProdLocal = Join-Path $env:TEMP "resolva-jato.env.production"
if (-not $SkipEnv) {
  Write-Host "==> Montando .env.production"
  $localEnv = Join-Path $RepoRoot ".env"
  if (-not (Test-Path $localEnv)) { throw ".env local ausente" }

  # Senhas fortes para o servidor (não reutiliza defaults fracos)
  $pgPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 28 | ForEach-Object { [char]$_ })
  $evoKey = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 36 | ForEach-Object { [char]$_ })
  $evoDbPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })

  $kv = @{}
  Get-Content $localEnv | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $parts = $_.Split('=', 2)
    $k = $parts[0].Trim()
    $v = $parts[1].Trim().Trim('"')
    $kv[$k] = $v
  }

  $lines = @(
    "DOMAIN=resolvajato.com.br",
    "NEXT_PUBLIC_APP_URL=https://resolvajato.com.br",
    "POSTGRES_USER=resolvajato",
    "POSTGRES_PASSWORD=$pgPass",
    "POSTGRES_DB=resolvajato",
    "EVOLUTION_API_KEY=$evoKey",
    "EVOLUTION_DB_PASSWORD=$evoDbPass",
    "WHATSAPP_PROVIDER=evolution",
    "WHATSAPP_API_ENABLED=true",
    "WHATSAPP_INSTANCE=resolva-jato",
    "EVOLUTION_SERVER_URL=http://127.0.0.1:18083",
    "MERCADOPAGO_MODE=production",
    "NEXT_PUBLIC_MERCADOPAGO_MODE=production",
    "MERCADOPAGO_ACCESS_TOKEN=$($kv['MERCADOPAGO_ACCESS_TOKEN'])",
    "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=$($kv['NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY'])",
    "MERCADOPAGO_CLIENT_ID=$($kv['MERCADOPAGO_CLIENT_ID'])",
    "MERCADOPAGO_CLIENT_SECRET=$($kv['MERCADOPAGO_CLIENT_SECRET'])",
    "MERCADOPAGO_WEBHOOK_SECRET=$($kv['MERCADOPAGO_WEBHOOK_SECRET'])",
    "RESEND_API_KEY=$($kv['RESEND_API_KEY'])",
    "RESEND_FROM=$($kv['RESEND_FROM'])",
    "AUTH_SECRET=$($kv['AUTH_SECRET'])",
    "TURNSTILE_SECRET_KEY=$($kv['TURNSTILE_SECRET_KEY'])",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY=$($kv['NEXT_PUBLIC_TURNSTILE_SITE_KEY'])",
    "TWILIO_ACCOUNT_SID=$($kv['TWILIO_ACCOUNT_SID'])",
    "TWILIO_AUTH_TOKEN=$($kv['TWILIO_AUTH_TOKEN'])",
    "TWILIO_FROM_NUMBER=$($kv['TWILIO_FROM_NUMBER'])",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY=$($kv['NEXT_PUBLIC_VAPID_PUBLIC_KEY'])",
    "VAPID_PRIVATE_KEY=$($kv['VAPID_PRIVATE_KEY'])",
    "VAPID_SUBJECT=$($kv['VAPID_SUBJECT'])"
  )
  $lines | Set-Content -Path $envProdLocal -Encoding utf8
}

# --- tarball ---
$tarball = Join-Path $env:TEMP "resolva-jato-repo.tgz"
Write-Host "==> Empacotando codigo"
if (Test-Path $tarball) { Remove-Item $tarball -Force }

# Prefer tar if available (Git Bash / Windows tar)
Push-Location $RepoRoot
& tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=.angular `
  --exclude=.env --exclude=.env.local --exclude=*.pack `
  -czf $tarball .
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "tar falhou" }
Pop-Location

Write-Host "==> Enviando para $remote"
Invoke-Remote "mkdir -p /opt/resolva-jato /var/resolva-jato /etc/cloudflared-resolvajato"
Copy-ToRemote $tarball "/tmp/resolva-jato-repo.tgz"
Copy-ToRemote (Join-Path $RepoRoot "scripts\deploy\vultr-deploy-resolvajato.sh") "/tmp/vultr-deploy-resolvajato.sh"

if (-not $SkipEnv) {
  Copy-ToRemote $envProdLocal "/opt/resolva-jato/.env.production"
  Invoke-Remote "chmod 600 /opt/resolva-jato/.env.production"
}

if (-not $SkipTunnel) {
  $credLocal = Join-Path $env:USERPROFILE ".cloudflared\3f99aa58-2811-4cd2-9b0b-a0819ee70242.json"
  $cfgLocal = Join-Path $RepoRoot "scripts\deploy\cloudflared-config.resolvajato.yml"
  $installLocal = Join-Path $RepoRoot "scripts\deploy\install-cloudflared-resolvajato.sh"
  if (-not (Test-Path $credLocal)) { throw "Credencial tunnel ausente: $credLocal" }
  Copy-ToRemote $credLocal "/etc/cloudflared-resolvajato/3f99aa58-2811-4cd2-9b0b-a0819ee70242.json"
  Copy-ToRemote $cfgLocal "/etc/cloudflared-resolvajato/config.yml"
  Copy-ToRemote $installLocal "/tmp/install-cloudflared-resolvajato.sh"
  Invoke-Remote "chmod +x /tmp/install-cloudflared-resolvajato.sh && bash /tmp/install-cloudflared-resolvajato.sh"
}

if (-not $SkipBuild) {
  Invoke-Remote "chmod +x /tmp/vultr-deploy-resolvajato.sh && INSTALL_DIR=/opt/resolva-jato TARBALL=/tmp/resolva-jato-repo.tgz bash /tmp/vultr-deploy-resolvajato.sh"
}

Write-Host ""
Write-Host "OK - Resolva Jato no Vultr."
Write-Host "  Local:  http://127.0.0.1:3000 (no servidor)"
Write-Host "  Public: https://resolvajato.com.br"
Write-Host "  Docs:   aerosuite/scripts/deploy/RESOLVA-JATO-VULTR.md"
