#!/bin/bash
# All-in-one QA: start server, keep warm, run agent-browser, capture screenshots
set -u
cd /home/z/my-project
pkill -f "next" 2>/dev/null
pkill -f "keep-alive" 2>/dev/null
sleep 2

# Start dev server
setsid /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown $!
SERVER_PID=$!

# Wait for ready
for i in $(seq 1 40); do
  CODE=$(curl -s -m 5 http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}' 2>/dev/null || echo '000')
  CODE=$(echo "$CODE" | tr -d '[:space:]')
  [ "$CODE" = '200' ] && { echo "[qa] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa

# Persistent heartbeat — keeps server warm during whole QA
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

# Helper: extract ref like e98 from "[ref=e98]"
get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/qa/snap.tmp
  local ref=$(grep -i "$label" /tmp/qa/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[qa] NOT FOUND: $label"; return 1; }
  echo "[qa] click '$label' ($ref)"
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
agent-browser screenshot /tmp/qa/01-home.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa/home.txt
head -16 /tmp/qa/home.txt

echo "=== 02 Products ==="
click_text "Products"
agent-browser screenshot /tmp/qa/02-products.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa/products.txt
head -10 /tmp/qa/products.txt

echo "=== 03 Shop ==="
click_text "Shop"
agent-browser screenshot /tmp/qa/03-shop.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa/shop.txt
head -10 /tmp/qa/shop.txt

echo "=== 04 More ==="
click_text "More"
agent-browser screenshot /tmp/qa/04-more.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa/more.txt
head -10 /tmp/qa/more.txt

echo "=== 05 Studio (FAB) ==="
click_text "Studio"
agent-browser screenshot /tmp/qa/05-studio.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa/studio.txt
head -10 /tmp/qa/studio.txt

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -8

echo "=== Screenshots ==="
ls -la /tmp/qa/*.png
echo "=== Unique screenshots ==="
md5sum /tmp/qa/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
