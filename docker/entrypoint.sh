#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.install-stamp ]; then
  echo "Installing npm dependencies inside container..."
  npm install
  touch node_modules/.install-stamp
fi

exec "$@"
