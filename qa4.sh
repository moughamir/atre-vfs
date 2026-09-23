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
  [ "$CODE" = '200' ] && { echo "[qa4] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa4
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/qa4/snap.tmp
  local ref=$(grep -i "$label" /tmp/qa4/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[qa4] NOT FOUND: $label"; return 1; }
  echo "[qa4] click '$label' ($ref)"
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
agent-browser screenshot /tmp/qa4/01-home.png 2>&1 | tail -1

echo "=== 02 Shop (with search + sort) ==="
click_text "Shop"
agent-browser screenshot /tmp/qa4/02-shop.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== 03 Test search ==="
agent-browser snapshot -i 2>&1 > /tmp/qa4/shop.txt
SEARCH_REF=$(grep "Search shop" /tmp/qa4/shop.txt | get_ref)
[ -n "$SEARCH_REF" ] && agent-browser fill @$SEARCH_REF "cashmere" 2>&1 | tail -1
sleep 1
agent-browser screenshot /tmp/qa4/03-shop-search.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -8

echo "=== 04 Test sort ==="
# Clear search
agent-browser fill @$SEARCH_REF "" 2>&1 | tail -1
sleep 1
SORT_REF=$(grep "Sort" /tmp/qa4/shop.txt | get_ref)
[ -n "$SORT_REF" ] && agent-browser click @$SORT_REF 2>&1 | tail -1
sleep 1
agent-browser screenshot /tmp/qa4/04-shop-sort.png 2>&1 | tail -1
# Click Price ↑
agent-browser find text "Price ↑" click 2>&1 | tail -1 || click_text "Price"
sleep 1
agent-browser screenshot /tmp/qa4/05-shop-sorted.png 2>&1 | tail -1

echo "=== 06 More screen with dark mode ==="
click_text "More"
agent-browser screenshot /tmp/qa4/06-more.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -15

echo "=== 07 Toggle dark mode ==="
agent-browser find text "Toggle theme" click 2>&1 | tail -1 || click_text "Appearance"
sleep 2
agent-browser screenshot /tmp/qa4/07-dark-mode.png 2>&1 | tail -1
# Check if dark class is applied
agent-browser eval "document.documentElement.className" 2>&1 | tail -1

echo "=== 08 Toggle back to light ==="
agent-browser find text "Toggle theme" click 2>&1 | tail -1 || click_text "Appearance"
sleep 2
agent-browser screenshot /tmp/qa4/08-light-mode.png 2>&1 | tail -1

echo "=== 09 Projects ==="
click_text "My projects"
agent-browser screenshot /tmp/qa4/09-projects.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -5

echo "=== Unique screenshots ==="
md5sum /tmp/qa4/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
ls -la /tmp/qa4/*.png
