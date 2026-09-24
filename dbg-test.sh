#!/bin/bash
set -u
cd /home/z/my-project
pkill -f "next" 2>/dev/null
sleep 2

setsid /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown $!
SERVER_PID=$!

for i in $(seq 1 40); do
  CODE=$(curl -s -m 5 http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}' 2>/dev/null || echo '000')
  CODE=$(echo "$CODE" | tr -d '[:space:]')
  [ "$CODE" = '200' ] && { echo "[dbg] ready ${i}s"; break; }
  sleep 1
done

( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 4; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 5

echo "[dbg] === Console errors after load ==="
agent-browser console 2>&1 | tail -20
echo "[dbg] === Page errors ==="
agent-browser errors 2>&1 | tail -20

echo "[dbg] === Click Create Studio via ref ==="
agent-browser snapshot -i 2>&1 > /tmp/s1.txt
CREATE_REF=$(grep "Create new studio" /tmp/s1.txt | grep -oE 'ref=e[0-9]+' | head -1)
echo "[dbg] Create Studio ref: $CREATE_REF"
agent-browser click @$CREATE_REF 2>&1 | tail -2
sleep 2

echo "[dbg] === After clicking Create Studio ==="
agent-browser snapshot -i 2>&1 > /tmp/s2.txt
head -15 /tmp/s2.txt

echo "[dbg] === Check if NEXT is disabled ==="
grep "NEXT" /tmp/s2.txt

echo "[dbg] === Click FIRST product (Cashmere, top, not covered) ==="
PRODUCT_REF=$(grep "Cashmere Knit Sweater Cashmere" /tmp/s2.txt | grep -oE 'ref=e[0-9]+' | head -1)
echo "[dbg] Product ref: $PRODUCT_REF"
agent-browser click @$PRODUCT_REF 2>&1 | tail -2
sleep 1

echo "[dbg] === After clicking product ==="
agent-browser snapshot -i 2>&1 > /tmp/s3.txt
grep -E "NEXT|Cashmere|selected" /tmp/s3.txt | head -5

echo "[dbg] === Check selection via eval ==="
agent-browser eval "document.body.innerText.includes('NEXT')" 2>&1 | tail -1
agent-browser eval "Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('NEXT')).map(b => ({text: b.textContent, disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled')}))" 2>&1 | tail -3

echo "[dbg] === Console errors after click ==="
agent-browser console 2>&1 | tail -15

echo "[dbg] === Screenshot ==="
agent-browser screenshot /tmp/dbg-after-click.png 2>&1 | tail -1
