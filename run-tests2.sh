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
  [ "$CODE" = '200' ] && { echo "[test2] ready ${i}s"; break; }
  sleep 1
done

( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 4; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

get_ref() { sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1; }
click_by_text() {
  local label="$1"
  agent-browser snapshot -i 2>&1 > /tmp/snap.tmp
  local ref=$(grep -i "$label" /tmp/snap.tmp | get_ref)
  [ -z "$ref" ] && { echo "[t2] NOT FOUND: '$label'"; return 1; }
  echo "[t2] click '$label' ($ref)"
  agent-browser scrollintoview @$ref 2>&1 | tail -1
  sleep 1
  agent-browser click @$ref 2>&1 | tail -1
  sleep 2
}

mkdir -p /tmp/atre-tests2
agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 5

# Use the already-generated images from the previous run - go to Products tab
echo "[t2] === Go to Products tab ==="
click_by_text "Products"
agent-browser screenshot /tmp/atre-tests2/01-products.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/snap-prod.txt
head -15 /tmp/snap-prod.txt

echo "[t2] === Click first product ==="
click_by_text "Cashmere Knit Sweater Cashmere"
agent-browser screenshot /tmp/atre-tests2/02-product-detail.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/snap-pd.txt
head -12 /tmp/snap-pd.txt

echo "[t2] === Click Create Studio from product detail ==="
click_by_text "Create Studio"
agent-browser screenshot /tmp/atre-tests2/03-studio-product.png 2>&1 | tail -1

echo "[t2] === Select Cashmere and go through flow fast ==="
click_by_text "Cashmere Knit Sweater Cashmere"
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests2/04-model.png 2>&1 | tail -1
click_by_text "Woman"
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests2/05-scene.png 2>&1 | tail -1
click_by_text "NEXT"
agent-browser screenshot /tmp/atre-tests2/06-style.png 2>&1 | tail -1
click_by_text "Luxury"
click_by_text "CREATE IMAGES"
agent-browser screenshot /tmp/atre-tests2/07-summary.png 2>&1 | tail -1
click_by_text "CREATE IMAGES"
sleep 3
agent-browser screenshot /tmp/atre-tests2/08-generating.png 2>&1 | tail -1

echo "[t2] === Wait for generation ==="
for i in $(seq 1 30); do
  sleep 5
  TXT=$(agent-browser eval "document.body.innerText.slice(0,200)" 2>&1 | tail -1)
  if echo "$TXT" | grep -qE "Your collection|images created"; then
    echo "[t2] RESULTS at t=${i}*5s"
    break
  fi
done
agent-browser screenshot /tmp/atre-tests2/09-results.png 2>&1 | tail -1

echo "[t2] === Select first 2 images ==="
agent-browser snapshot -i 2>&1 > /tmp/snap-r.txt
IMG1_REF=$(grep "Image 1" /tmp/snap-r.txt | get_ref)
IMG2_REF=$(grep "Image 2" /tmp/snap-r.txt | get_ref)
echo "[t2] selecting $IMG1_REF and $IMG2_REF"
agent-browser click @$IMG1_REF 2>&1 | tail -1
sleep 1
agent-browser click @$IMG2_REF 2>&1 | tail -1
sleep 1
agent-browser screenshot /tmp/atre-tests2/10-selected.png 2>&1 | tail -1

echo "[t2] === Click PUBLISH ==="
click_by_text "PUBLISH"
agent-browser screenshot /tmp/atre-tests2/11-publish.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/snap-pub.txt
head -15 /tmp/snap-pub.txt

echo "[t2] === Wait for description gen and publish ==="
sleep 5
echo "[t2] === Click Publish Product ==="
click_by_text "PUBLISH PRODUCT"
sleep 3
agent-browser screenshot /tmp/atre-tests2/12-success.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/snap-succ.txt
head -15 /tmp/snap-succ.txt

echo "[t2] === Click Done to go to Shop ==="
click_by_text "Done"
sleep 2
agent-browser screenshot /tmp/atre-tests2/13-shop.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 > /tmp/snap-shop.txt
head -15 /tmp/snap-shop.txt

echo "[t2] === Go to More tab ==="
click_by_text "More"
agent-browser screenshot /tmp/atre-tests2/14-more.png 2>&1 | tail -1

echo "[t2] === Check console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh" | head -5

echo "[t2] === Screenshots ==="
ls -la /tmp/atre-tests2/*.png 2>/dev/null
echo "[t2] unique screenshots:"
md5sum /tmp/atre-tests2/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
