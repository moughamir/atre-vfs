#!/bin/bash
# Keep the Next.js dev server alive — restart if it dies.
cd /home/z/my-project
while true; do
  echo "=== [keep-alive] starting next dev ==="
  setsid /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null &
  PID=$!
  echo "=== [keep-alive] pid $PID ==="
  # Wait for the process to exit
  wait $PID
  echo "=== [keep-alive] next dev exited, restarting in 2s ==="
  sleep 2
done
