#!/bin/bash
set -u
cd /home/z/my-project
pkill -f "next" 2>/dev/null
sleep 2

setsid /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown $!
SERVER_PID=$!

READY=0
for i in $(seq 1 40); do
  CODE=$(curl -s -m 5 http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}' 2>/dev/null || echo '000')
  CODE=$(echo "$CODE" | tr -d '[:space:]')
  [ "$CODE" = '200' ] && { echo "[test] ready ${i}s"; READY=1; break; }
  sleep 1
done
[ "$READY" != '1' ] && { echo "[test] FAILED to start"; tail -30 dev.log; exit 1; }

mkdir -p /tmp/atre-tests
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 4; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

# Helper: extract ref like e98 from "[ref=e98]"
get_ref() {
  sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1
}

click_by_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/snap.tmp
  local ref=$(grep -i "$label" /tmp/snap.tmp | get_ref)
  if [ -z "$ref" ]; then
    echo "[test] could not find '$label'"
    return 1
  fi
  echo "[test] clicking '$label' (ref=$ref)"
  agent-browser scrollintoview @$ref 2>&1 | tail -1
  sleep 1
  agent-browser click @$ref 2>&1 | tail -1
  sleep 2
  return 0
}

echo "[test] === Setup ==="
agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 5
agent-browser screenshot /tmp/atre-tests/01-home.png 2>&1 | tail -1
agent-browser console --clear 2>&1 | tail -1

echo "[test] === Step 1: Home -> Studio Product ==="
click_by_text "Create new studio"
agent-browser screenshot /tmp/atre-tests/02-studio-product.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-studio-product.txt
head -12 /tmp/atre-tests/snap-studio-product.txt

echo "[test] === Step 2: Select first product (Cashmere) ==="
click_by_text "Cashmere Knit Sweater Cashmere"
agent-browser screenshot /tmp/atre-tests/02b-selected.png 2>&1 | tail -1
# Verify NEXT is now enabled
agent-browser snapshot -i 2>&1 > /tmp/snap2.tmp
NEXT_LINE=$(grep "NEXT" /tmp/snap2.tmp | head -1)
echo "[test] NEXT state: $NEXT_LINE"

echo "[test] === Step 3: Click NEXT -> Model ==="
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests/03-studio-model.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-model.txt
head -10 /tmp/atre-tests/snap-model.txt

echo "[test] === Step 4: Select Woman model ==="
click_by_text "Woman"
echo "[test] === Step 5: NEXT -> Scene ==="
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests/04-studio-scene.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-scene.txt
head -10 /tmp/atre-tests/snap-scene.txt

echo "[test] === Step 6: NEXT -> Style ==="
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests/05-studio-style.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-style.txt
head -10 /tmp/atre-tests/snap-style.txt

echo "[test] === Step 7: Select Editorial style ==="
click_by_text "Editorial"
echo "[test] === Step 8: Create Images -> Summary ==="
click_by_text "CREATE IMAGES"
agent-browser screenshot /tmp/atre-tests/06-studio-summary.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-summary.txt
head -12 /tmp/atre-tests/snap-summary.txt

echo "[test] === Step 9: Create Images -> Generating ==="
click_by_text "CREATE IMAGES"
sleep 3
agent-browser screenshot /tmp/atre-tests/07-generating.png 2>&1 | tail -1

echo "[test] === Step 10: Wait for generation (up to 150s) ==="
for i in $(seq 1 30); do
  sleep 5
  TXT=$(agent-browser eval "document.body.innerText.slice(0,300)" 2>&1 | tail -1)
  SHORT=$(echo "$TXT" | head -c 100)
  echo "[test] t=${i}*5s: $SHORT"
  if echo "$TXT" | grep -qE "Your collection|images created"; then
    echo "[test] === RESULTS reached! ==="
    break
  fi
  if echo "$TXT" | grep -qiE "couldn.t create|Your product is ready"; then
    echo "[test] === Other state reached ==="
    break
  fi
done
agent-browser screenshot /tmp/atre-tests/08-results.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/atre-tests/snap-results.txt
head -20 /tmp/atre-tests/snap-results.txt

echo "[test] === Check console errors ==="
agent-browser console 2>&1 | grep -iE "error|warning|fail" | head -10

echo "[test] === Screenshots ==="
ls -la /tmp/atre-tests/*.png 2>/dev/null
echo "[test] === Unique screenshots ==="
md5sum /tmp/atre-tests/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
echo "[test] === Dev log tail ==="
tail -10 /home/z/my-project/dev.log
