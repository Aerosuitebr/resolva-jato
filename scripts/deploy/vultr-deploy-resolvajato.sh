#!/usr/bin/env bash
# Deploy Resolva Jato no Vultr (mesmo host do Aerosuite).
# Não altera .env.production do servidor.
# Uso: INSTALL_DIR=/opt/resolva-jato bash vultr-deploy-resolvajato.sh

set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/resolva-jato}"
TARBALL="${TARBALL:-/tmp/resolva-jato-repo.tgz}"

if [[ ! -f "${TARBALL}" ]]; then
  echo "ERRO: tarball ausente: ${TARBALL}"
  exit 1
fi

echo "==> Extrair codigo em ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"
tar -xzf "${TARBALL}" -C "${INSTALL_DIR}"

cd "${INSTALL_DIR}"

if [[ ! -f .env.production ]]; then
  echo "ERRO: .env.production ausente em ${INSTALL_DIR}."
  echo "Envie o arquivo uma vez (setup) antes do deploy incremental."
  exit 1
fi

COMPOSE=(
  docker compose
  --env-file .env.production
  -f docker-compose.yml
  -f docker-compose.vultr.yml
)

echo "==> Validar compose"
"${COMPOSE[@]}" config -q

echo "==> Build + up (sem Caddy; app em 127.0.0.1:3000)"
"${COMPOSE[@]}" up -d --build --remove-orphans

echo "==> Aguardar health do app"
ok=0
for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 5
done

if [[ "${ok}" -ne 1 ]]; then
  echo "ERRO: app nao respondeu em http://127.0.0.1:3000/"
  "${COMPOSE[@]}" ps
  docker logs resolva-jato-app --tail 80 || true
  exit 1
fi

curl -sfI http://127.0.0.1:3000/ | head -1
"${COMPOSE[@]}" ps
echo "OK — Resolva Jato em ${INSTALL_DIR} (localhost:3000)"
