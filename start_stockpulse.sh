#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================
# 🚀 StockPulse Startup Script
# ==============================

# --- Colors for pretty output ---
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Base directories ---
repo_root="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$repo_root/logs"
mkdir -p "$LOG_DIR"

MODE=${1:-prod}   # Usage: ./start_stockpulse.sh [dev|prod]

echo -e "${CYAN}🔧 Starting StockPulse services...${NC}"

# --- Activate Python virtual environment (if present) ---
if [ -d "$repo_root/nlp/.venv" ]; then
  echo -e "${GREEN}➡ Activating Python venv...${NC}"
  # shellcheck disable=SC1091
  source "$repo_root/nlp/.venv/bin/activate"
else
  echo -e "${YELLOW}⚠️  No Python venv found at ./nlp/.venv (skipping)${NC}"
fi

# --- Caddy (proxy + static server in prod) ---
echo -e "${GREEN}➡ Starting Caddy on :8080...${NC}"
sudo caddy run --config "$repo_root/Caddyfile" > "$LOG_DIR/caddy.log" 2>&1 &
CADDY_PID=$!

# --- Frontend ---
if [ "$MODE" = "dev" ]; then
  echo -e "${GREEN}➡ DEV mode: starting Vite on :5173 (hot reload)...${NC}"
  (cd "$repo_root/frontend" && npm run dev -- --host) > "$LOG_DIR/vite.log" 2>&1 &
  VITE_PID=$!
else
  echo -e "${GREEN}➡ PROD mode: building frontend...${NC}"
  (cd "$repo_root/frontend" && npm run build) > "$LOG_DIR/build.log" 2>&1
  VITE_PID=""
fi

# --- NLP (FastAPI) ---
echo -e "${GREEN}➡ Starting NLP FastAPI service on :8000...${NC}"
uvicorn nlp.main:app --host 127.0.0.1 --port 8000 --reload > "$LOG_DIR/nlp.log" 2>&1 &
NLP_PID=$!

# --- .NET API ---
echo -e "${GREEN}➡ Starting .NET API on :5166...${NC}"
(cd "$repo_root/StockPulse.Api" && dotnet run) > "$LOG_DIR/dotnet.log" 2>&1 &
DOTNET_PID=$!

# --- Summary ---
echo -e "${CYAN}\n✅ All services started successfully!${NC}"
echo -e "🧱 Caddy PID:  $CADDY_PID  (http://localhost:8080)"
[ -n "${VITE_PID:-}" ] && echo -e "⚡ Vite PID:   $VITE_PID  (http://localhost:5173)"
echo -e "📊 NLP PID:    $NLP_PID     (http://127.0.0.1:8000)"
echo -e "🌐 API PID:    $DOTNET_PID  (http://127.0.0.1:5166)\n"

if [ "$MODE" = "dev" ]; then
  echo -e "${YELLOW}🔎 DEV usage:${NC}"
  echo " - Open the app at http://localhost:5173 (Vite, hot reload)"
  echo " - APIs are proxied through http://localhost:8080 (/api, /nlp)"
else
  echo -e "${YELLOW}🚀 PROD usage:${NC}"
  echo " - Open the app at http://localhost:8080 (Caddy serves build + proxies)"
fi
echo

# --- Graceful shutdown ---
cleanup() {
  echo -e "\n🛑 Stopping all services..."
  [ -n "${VITE_PID:-}" ] && kill "$VITE_PID" 2>/dev/null || true
  kill "$NLP_PID" "$DOTNET_PID" "$CADDY_PID" 2>/dev/null || true
  echo -e "${GREEN}✅ All processes stopped.${NC}"
}
trap cleanup INT TERM EXIT

# Keep alive
wait
