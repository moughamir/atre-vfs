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
  [ "$CODE" = '200' ] && { echo "[e2e] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/e2e
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/e2e/snap.tmp
  local ref=$(grep -i "$label" /tmp/e2e/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[e2e] NOT FOUND: $label"; return 1; }
  echo "[e2e] click '$label' ($ref)"
  agent-browser scrollintoview @$ref 2>&1 | tail -1
  sleep 1
  agent-browser click @$ref 2>&1 | tail -1
  sleep 2
}

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 6
agent-browser console --clear 2>&1 | tail -1

echo "=== Start: Create Studio ==="
click_text "Create new studio"

echo "=== Select White Linen Shirt ==="
click_text "White Linen Shirt White"
echo "=== Click NEXT ==="
click_text "NEXT"

echo "=== Model: click NEXT (default woman) ==="
click_text "NEXT"

echo "=== Scene: click NEXT (default studio) ==="
click_text "NEXT"

echo "=== Style: click Luxury ==="
click_text "Luxury"
echo "=== Style: click CREATE IMAGES ==="
click_text "CREATE IMAGES"

echo "=== Summary: click CREATE IMAGES to start generation ==="
click_text "CREATE IMAGES"
sleep 3
agent-browser screenshot /tmp/e2e/01-generating.png 2>&1 | tail -1

echo "=== Wait for generation (up to 180s) ==="
for i in $(seq 1 36); do
  sleep 5
  TXT=$(agent-browser eval "document.body.innerText.slice(0,200)" 2>&1 | tail -1)
  SHORT=$(echo "$TXT" | head -c 80)
  echo "[e2e] t=${i}*5s: $SHORT"
  if echo "$TXT" | grep -qE "Your collection|images created"; then
    echo "[e2e] === RESULTS reached! ==="
    break
  fi
  if echo "$TXT" | grep -qiE "couldn.t create"; then
    echo "[e2e] === Generation FAILED ==="
    break
  fi
done
agent-browser screenshot /tmp/e2e/02-results.png 2>&1 | tail -1

echo "=== Verify project was persisted to DB ==="
PROJECTS=$(curl -s -m 5 http://127.0.0.1:3000/api/projects)
echo "$PROJECTS" | head -c 400
echo ""
PROJECT_COUNT=$(echo "$PROJECTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('projects',[])))" 2>/dev/null || echo "0")
echo "[e2e] Projects in DB: $PROJECT_COUNT"

echo "=== Favorite an image ==="
agent-browser snapshot -i 2>&1 > /tmp/e2e/r.txt
IMG1=$(grep "Image 1" /tmp/e2e/r.txt | get_ref)
[ -n "$IMG1" ] && agent-browser click @$IMG1 2>&1 | tail -1
sleep 1
# Open image detail via double-click
agent-browser dblclick @$IMG1 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/e2e/03-image-detail.png 2>&1 | tail -1
# Click Save (favorite)
click_text "Save"
sleep 2

echo "=== Verify favorites API ==="
FAVS=$(curl -s -m 5 http://127.0.0.1:3000/api/favorites)
echo "$FAVS" | head -c 300
echo ""
FAV_COUNT=$(echo "$FAVS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('favorites',[])))" 2>/dev/null || echo "0")
echo "[e2e] Favorites in DB: $FAV_COUNT"

echo "=== Go to Home and verify Projects tile shows count ==="
# Navigate via bottom nav
agent-browser snapshot -i 2>&1 > /tmp/e2e/id.txt
HOME_BTN=$(grep '"Home"' /tmp/e2e/id.txt | get_ref)
[ -n "$HOME_BTN" ] && agent-browser click @$HOME_BTN 2>&1 | tail -1
sleep 3
agent-browser screenshot /tmp/e2e/04-home-after.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/e2e/home2.txt
grep -iE "Projects|studios|Favorites|saved" /tmp/e2e/home2.txt | head -5

echo "=== Go to Projects screen ==="
click_text "View all projects"
sleep 2
agent-browser screenshot /tmp/e2e/05-projects.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/e2e/projects.txt
head -15 /tmp/e2e/projects.txt

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -5

echo "=== Done ==="
