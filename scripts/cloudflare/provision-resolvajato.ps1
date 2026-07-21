# Provisiona zona + DNS Resolva Jato na Cloudflare (conta Aero Suite)
# e reinicia o serviço cloudflared local.
#
# Uso:
#   .\scripts\cloudflare\provision-resolvajato.ps1 -ApiToken "seu-token"
# ou:
#   $env:CLOUDFLARE_API_TOKEN = "seu-token"
#   .\scripts\cloudflare\provision-resolvajato.ps1

param(
  [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN
)

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

if (-not $ApiToken) {
  Write-Host @"

Falta o token da Cloudflare.

1. Abra: https://dash.cloudflare.com/profile/api-tokens
2. Create Token → permissões:
   - Account → Cloudflare Tunnel → Read (opcional)
   - Zone → Zone → Edit
   - Zone → DNS → Edit
   Inclua a conta Aero Suite / todas as zones.
3. Rode de novo:
   .\scripts\cloudflare\provision-resolvajato.ps1 -ApiToken "COLE_O_TOKEN"

"@ -ForegroundColor Yellow
  exit 1
}

$env:CLOUDFLARE_API_TOKEN = $ApiToken
Write-Host "==> Criando/atualizando zone e DNS..." -ForegroundColor Cyan
node "$PSScriptRoot\provision-resolvajato-zone.mjs"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$config = "$env:USERPROFILE\.cloudflared\config.yml"
if (Test-Path $config) {
  $raw = Get-Content $config -Raw
  if ($raw -notmatch 'resolvajato\.com\.br') {
    Write-Host "AVISO: config.yml local ainda nao tem resolvajato.com.br" -ForegroundColor Yellow
  } else {
    Write-Host "==> config.yml ja inclui resolvajato.com.br → http://127.0.0.1:3000" -ForegroundColor Green
  }
}

Write-Host "==> Reiniciando servico Cloudflared..." -ForegroundColor Cyan
try {
  Restart-Service Cloudflared -Force
  Start-Sleep -Seconds 3
  Get-Service Cloudflared | Format-Table Name, Status
} catch {
  Write-Host "Nao foi possivel reiniciar o servico automaticamente (rode como Admin): $_" -ForegroundColor Yellow
  Write-Host "Manual: Restart-Service Cloudflared" -ForegroundColor Yellow
}

$result = Get-Content "$PSScriptRoot\provision-resolvajato-result.json" -Raw | ConvertFrom-Json
Write-Host "`n=== Proximo passo no Registro.br ===" -ForegroundColor Cyan
Write-Host "Altere os nameservers de resolvajato.com.br para:"
foreach ($ns in $result.nameservers) { Write-Host "  $ns" -ForegroundColor White }
Write-Host "`nCom o Next.js em :3000, teste https://resolvajato.com.br" -ForegroundColor Green
