#!/bin/bash
# Find pnpm
export PATH="$PATH:/home/runner/.local/share/pnpm:/usr/local/bin"
PNPM=$(which pnpm 2>/dev/null || echo "/home/runner/.local/share/pnpm/pnpm")

# Build and start API server
cd /home/runner/workspace/artifacts/api-server
PORT=3000 DATABASE_URL=file:../../artifacts/api-server/dev.db node --enable-source-maps ./dist/index.mjs &

# Start frontend
cd /home/runner/workspace/artifacts/kidspeak
$PNPM run dev --host 0.0.0.0
