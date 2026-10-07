#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

lsof -ti:5003 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

cd "$DIR/execution-service"
nohup env PORT=5003 node dist/index.js > "$DIR/execution.log" 2>&1 &
disown

cd "$DIR/backend"
nohup env PORT=5002 node dist/server.js > "$DIR/backend.log" 2>&1 &
disown

cd "$DIR/frontend"
nohup npx vite --port 5173 --host > "$DIR/frontend.log" 2>&1 &
disown

sleep 3
