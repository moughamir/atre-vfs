#!/bin/bash
# QA round 5: start server, keep warm, snapshot all screens
set -u
cd /home/z/my-project
pkill -f "next" 2>/dev/null
pkill -f "keep-alive" 2>/dev/null
sleep 2

setsid /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown $!
SERVER_PID=$!

for i in $(seq 1 40); do
  CODE=$(curl -s -m 5 http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}' 2>/dev/null || echo '000')
  CODE=$(echo "$CODE" | tr -d '[:space:]')
  [ "$CODE" = '200' ] && { echo "[qa5] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa5
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
js_click() {
  local label="$1"
  agent-browser eval "document.querySelectorAll('button').forEach(b => { if(b.textContent.trim().includes('$label')) b.click() })" 2>&1 | tail -1
  sleep 2
}

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 6
agent-browser console --clear 2>&1 | tail -1
agent-browser press Escape 2>&1 | tail -1

echo "=== 01 Home ==="
agent-browser screenshot /tmp/qa5/01-home.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -18

echo "=== 02 Products ==="
js_click "Products"
agent-browser screenshot /tmp/qa5/02-products.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -8

echo "=== 03 Shop ==="
js_click "Shop"
agent-browser screenshot /tmp/qa5/03-shop.png 2>&1 | tail -1

echo "=== 04 More ==="
js_click "More"
agent-browser screenshot /tmp/qa5/04-more.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -12

echo "=== 05 Settings (currently toast) ==="
js_click "Settings"
sleep 1
agent-browser screenshot /tmp/qa5/05-settings-toast.png 2>&1 | tail -1

echo "=== 06 Studio flow ==="
js_click "Studio"
sleep 2
agent-browser screenshot /tmp/qa5/06-studio-product.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== 07 Model screen ==="
agent-browser snapshot -i 2>&1 > /tmp/qa5/sp.txt
SHIRT=$(grep "White Linen Shirt White" /tmp/qa5/sp.txt | get_ref)
[ -n "$SHIRT" ] && agent-browser click @$SHIRT 2>&1 | tail -1
sleep 1
NEXT=$(grep "NEXT" /tmp/qa5/sp.txt | get_ref)
agent-browser click @$NEXT 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa5/07-model.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -5

echo "=== Unique screenshots ==="
md5sum /tmp/qa5/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
ls -la /tmp/qa5/*.png
