#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "==> Starting Supabase (Docker)..."
supabase start

echo ""
echo "==> Generating frontend .env from Supabase status..."

API_URL=$(supabase status --output json 2>/dev/null | grep -o '"API URL":"[^"]*"' | cut -d'"' -f4)
ANON_KEY=$(supabase status --output json 2>/dev/null | grep -o '"anon key":"[^"]*"' | cut -d'"' -f4)

cat > frontend/.env <<EOF
VITE_SUPABASE_URL=${API_URL}
VITE_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

echo "   Written to frontend/.env"
echo ""
echo "==> Done! Services available:"
echo "   Frontend:        http://localhost:5173/mtgapp/"
echo "   Supabase Studio: http://localhost:54323"
echo "   Inbucket (mail): http://localhost:54324"
echo "   API:             ${API_URL}"
echo ""
echo "   Run 'cd frontend && npm run dev' to start the frontend."
