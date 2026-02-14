#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Resetting database (migrations + seed)..."
supabase db reset

echo "==> Done!"
