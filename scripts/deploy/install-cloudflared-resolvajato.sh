#!/usr/bin/env bash
# Instala conector Cloudflare Tunnel do Resolva Jato SEM mexer no cloudflared do Aerosuite.
# Pré-requisito: credentials JSON já em /etc/cloudflared-resolvajato/
# Uso: bash install-cloudflared-resolvajato.sh

set -euo pipefail

CF_DIR="/etc/cloudflared-resolvajato"
TUNNEL_ID="3f99aa58-2811-4cd2-9b0b-a0819ee70242"
CRED="${CF_DIR}/${TUNNEL_ID}.json"
CFG="${CF_DIR}/config.yml"
UNIT="/etc/systemd/system/cloudflared-resolvajato.service"

if [[ ! -f "${CRED}" ]]; then
  echo "ERRO: falta ${CRED}"
  exit 1
fi

if [[ ! -f "${CFG}" ]]; then
  echo "ERRO: falta ${CFG}"
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  curl -fsSL -o /tmp/cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  dpkg -i /tmp/cloudflared.deb
  rm -f /tmp/cloudflared.deb
fi

chmod 600 "${CRED}" "${CFG}"

cat > "${UNIT}" <<'EOF'
[Unit]
Description=cloudflared Resolva Jato
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/cloudflared --no-autoupdate --config /etc/cloudflared-resolvajato/config.yml tunnel run
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cloudflared-resolvajato
systemctl restart cloudflared-resolvajato
sleep 5
systemctl is-active cloudflared-resolvajato
systemctl is-active cloudflared
journalctl -u cloudflared-resolvajato -n 15 --no-pager

echo "OK — tunnel Resolva Jato ativo (Aerosuite cloudflared intacto)."
echo "Teste: https://resolvajato.com.br"
