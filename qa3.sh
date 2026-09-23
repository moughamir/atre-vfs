#!/bin/bash
# QA round 3: start server, keep warm, snapshot all screens, check console errors
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
  [ "$CODE" = '200' ] && { echo "[qa3] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa3
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/qa3/snap.tmp
  local ref=$(grep -i "$label" /tmp/qa3/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[qa3] NOT FOUND: $label"; return 1; }
  echo "[qa3] click '$label' ($ref)"
  agent-browser scrollintoview @$ref 2>&1 | tail -1
  sleep 1
  agent-browser click @$ref 2>&1 | tail -1
  sleep 2
}

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 6
agent-browser console --clear 2>&1 | tail -1

echo "=== 01 Home ==="
agent-browser screenshot /tmp/qa3/01-home.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -16

echo "=== 02 Products ==="
click_text "Products"
agent-browser screenshot /tmp/qa3/02-products.png 2>&1 | tail -1

echo "=== 03 Shop ==="
click_text "Shop"
agent-browser screenshot /tmp/qa3/03-shop.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -8

echo "=== 04 More ==="
click_text "More"
agent-browser screenshot /tmp/qa3/04-more.png 2>&1 | tail -1

echo "=== 05 Projects tile (from home) ==="
click_text "Home"
sleep 1
click_text "View all projects"
agent-browser screenshot /tmp/qa3/05-projects.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== 06 Open project detail ==="
agent-browser snapshot -i 2>&1 > /tmp/qa3/p.txt
PROJ=$(grep "White Linen Shirt" /tmp/qa3/p.txt | get_ref)
[ -n "$PROJ" ] && agent-browser click @$PROJ 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa3/06-project-detail.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== 07 Studio flow start ==="
agent-browser goBack 2>&1 | tail -1
sleep 1
agent-browser goBack 2>&1 | tail -1
sleep 1
click_text "Home"
click_text "Create new studio"
sleep 2
agent-browser screenshot /tmp/qa3/07-studio-product.png 2>&1 | tail -1

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -8

echo "=== Unique screenshots ==="
md5sum /tmp/qa3/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
ls -la /tmp/qa3/*.png
