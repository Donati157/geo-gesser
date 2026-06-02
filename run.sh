#!/usr/bin/env bash
# Sobe o GeoGesser usando o Node portátil em .toolchain/ (caso você não tenha
# Node instalado no sistema). Se você já tem Node, pode ignorar este script e
# usar "npm run dev" direto.
set -e
cd "$(dirname "$0")"

NODE_DIR="$(pwd)/.toolchain/node-v22.14.0-darwin-arm64/bin"
if [ -d "$NODE_DIR" ]; then
  export PATH="$NODE_DIR:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node não encontrado. Instale o Node 18+ (https://nodejs.org) e rode 'npm run dev'."
  exit 1
fi

echo "Usando node $(node -v)"

# Instala dependências na primeira vez.
[ -d node_modules ] || npm install --no-audit --no-fund
[ -d server/node_modules ] || npm --prefix server install --no-audit --no-fund
[ -d client/node_modules ] || npm --prefix client install --no-audit --no-fund

# Avisa se o token do Mapillary não estiver configurado.
if [ ! -f server/.env ] && [ ! -f .env ]; then
  echo ""
  echo "⚠️  Nenhum .env encontrado. Crie um com seu token do Mapillary:"
  echo "    cp .env.example server/.env   (e edite MAPILLARY_TOKEN)"
  echo ""
fi

npm run dev
