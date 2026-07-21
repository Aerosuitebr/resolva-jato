#!/bin/sh
set -eu

echo "[resolva-jato] Aguardando banco e aplicando schema (prisma db push)..."
npx prisma db push --skip-generate

echo "[resolva-jato] Iniciando Next.js em 0.0.0.0:${PORT:-3000}"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
