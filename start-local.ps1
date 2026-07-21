$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:HOST = '127.0.0.1'
$env:PORT = if ($env:PORT) { $env:PORT } else { '5173' }
node server.mjs
