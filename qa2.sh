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
  [ "$CODE" = '200' ] && { echo "[qa2] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa2
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/qa2/snap.tmp
  local ref=$(grep -i "$label" /tmp/qa2/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[qa2] NOT FOUND: $label"; return 1; }
  echo "[qa2] click '$label' ($ref)"
  agent-browser scrollintoview @$ref 2>&1 | tail -1
  sleep 1
  agent-browser click @$ref 2>&1 | tail -1
  sleep 2
}

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 6
agent-browser console --clear 2>&1 | tail -1

echo "=== 01 Home with quick access ==="
agent-browser screenshot /tmp/qa2/01-home.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa2/home.txt
grep -iE "Projects|Favorites|in progress|studio" /tmp/qa2/home.txt | head -8

echo "=== 02 Click Favorites tile ==="
click_text "Favorites"
agent-browser screenshot /tmp/qa2/02-favorites.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa2/fav.txt
head -12 /tmp/qa2/fav.txt

echo "=== 03 Go back to home, click Projects ==="
agent-browser find text "Back" click 2>&1 | tail -1 || agent-browser goBack 2>&1 | tail -1
sleep 2
click_text "Projects"
agent-browser screenshot /tmp/qa2/03-projects.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/qa2/proj.txt
head -12 /tmp/qa2/proj.txt

echo "=== 04 More screen ==="
agent-browser find text "More" click 2>&1 | tail -1 || click_text "More"
sleep 2
agent-browser screenshot /tmp/qa2/04-more.png 2>&1 | tail -1

echo "=== 05 Studio scene (preset images now load) ==="
click_text "Studio"
sleep 2
# Select first product then go through flow to scene
agent-browser snapshot -i 2>&1 > /tmp/qa2/sp.txt
SHIRT=$(grep "White Linen Shirt White" /tmp/qa2/sp.txt | get_ref)
[ -n "$SHIRT" ] && agent-browser click @$SHIRT 2>&1 | tail -1
sleep 1
NEXT=$(grep "NEXT" /tmp/qa2/sp.txt | get_ref)
agent-browser click @$NEXT 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa2/06-model.png 2>&1 | tail -1
# Next to scene
agent-browser snapshot -i 2>&1 > /tmp/qa2/model.txt
NEXT=$(grep "NEXT" /tmp/qa2/model.txt | get_ref)
agent-browser click @$NEXT 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa2/07-scene.png 2>&1 | tail -1
echo "=== Scene snapshot ==="
agent-browser snapshot -i 2>&1 > /tmp/qa2/scene.txt
head -12 /tmp/qa2/scene.txt

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -8

echo "=== Unique screenshots ==="
md5sum /tmp/qa2/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
ls -la /tmp/qa2/*.png
