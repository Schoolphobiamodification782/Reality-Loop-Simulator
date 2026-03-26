#!/bin/bash
# ═══════════════════════════════════════════════════
#  Reality Loop Simulator — One-Click Launcher
#  Works on Mac & Linux
# ═══════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
echo -e "${RED}║    REALITY LOOP SIMULATOR  v2.0          ║${NC}"
echo -e "${RED}║    Your future is predictable.           ║${NC}"
echo -e "${RED}║                                          ║${NC}"
echo -e "${RED}║    Dev: Chadi0x — The Maker. Legend.     ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check Python ──────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python3 not found. Install it from https://python.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"

# ── Check Node ────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install it from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

echo ""
echo -e "${CYAN}► Setting up backend...${NC}"

# ── Backend venv ──────────────────────────────────
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

echo -e "${YELLOW}  Installing Python dependencies...${NC}"
pip install -q -r requirements.txt

echo -e "${GREEN}✓ Backend ready.${NC}"
echo ""
echo -e "${CYAN}► Setting up frontend...${NC}"

# ── Frontend packages ─────────────────────────────
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  Installing npm packages (first time, ~30s)...${NC}"
    npm install --silent
fi

echo -e "${GREEN}✓ Frontend ready.${NC}"
echo ""
echo -e "${CYAN}► Starting backend on port 8000...${NC}"

# ── Start backend in background ───────────────────
cd ../backend
source venv/bin/activate
uvicorn main:app --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"

sleep 2

# ── Start frontend ────────────────────────────────
echo ""
echo -e "${CYAN}► Starting frontend on http://localhost:5173 ...${NC}"
cd ../frontend

sleep 2 && open http://localhost:5173 2>/dev/null || \
sleep 2 && xdg-open http://localhost:5173 2>/dev/null &

npm run dev

trap "echo ''; echo -e '${RED}Shutting down...${NC}'; kill $BACKEND_PID 2>/dev/null; exit 0" INT
wait
