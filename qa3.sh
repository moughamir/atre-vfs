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

echo "=== Verify Projects tile exists on Home ==="
agent-browser snapshot -i 2>&1 > /tmp/qa3/home.txt
grep -E "View all projects|View favorites|Projects|Favorites" /tmp/qa3/home.txt | head -5

echo "=== Click 'View all projects' tile ==="
click_text "View all projects"
sleep 2
agent-browser screenshot /tmp/qa3/01-projects.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa3/projects.txt
head -15 /tmp/qa3/projects.txt

echo "=== Click 'View favorites' (go back home first) ==="
# Use browser back via eval
agent-browser eval "window.history.back()" 2>&1 | tail -1
sleep 2
click_text "View favorites"
sleep 2
agent-browser screenshot /tmp/qa3/02-favorites.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa3/favorites.txt
head -10 /tmp/qa3/favorites.txt

echo "=== Test preset images load (scene screen) ==="
# Navigate Home -> Studio -> product -> model -> scene
agent-browser eval "window.history.back()" 2>&1 | tail -1
sleep 2
click_text "Create new studio"
sleep 2
agent-browser snapshot -i 2>&1 > /tmp/qa3/sp.txt
SHIRT=$(grep "White Linen Shirt White" /tmp/qa3/sp.txt | get_ref)
[ -n "$SHIRT" ] && agent-browser click @$SHIRT 2>&1 | tail -1
sleep 1
NEXT=$(grep "NEXT" /tmp/qa3/sp.txt | get_ref)
agent-browser click @$NEXT 2>&1 | tail -1
sleep 2
# Model screen — click NEXT
agent-browser snapshot -i 2>&1 > /tmp/qa3/model.txt
NEXT=$(grep "NEXT" /tmp/qa3/model.txt | get_ref)
agent-browser click @$NEXT 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa3/03-scene.png 2>&1 | tail -1
echo "=== Scene snapshot (preset images should load) ==="
agent-browser snapshot -i 2>&1 > /tmp/qa3/scene.txt
head -12 /tmp/qa3/scene.txt

echo "=== Verify scene preset images loaded (no fallback gradient) ==="
agent-browser eval "Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('/presets/scene-')).map(i => ({src: i.src.split('/').pop(), naturalWidth: i.naturalWidth, complete: i.complete}))" 2>&1 | tail -3

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -8

echo "=== Unique screenshots ==="
md5sum /tmp/qa3/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
