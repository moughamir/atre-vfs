#!/bin/bash
# QA round 9: start server, keep warm, snapshot all screens
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
  [ "$CODE" = '200' ] && { echo "[qa9] ready ${i}s"; break; }
  sleep 1
done

mkdir -p /tmp/qa9
( while true; do curl -s -m 3 http://127.0.0.1:3000/ -o /dev/null; sleep 3; done ) &
HB_PID=$!
trap "kill $HB_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; pkill -f next-server 2>/dev/null" EXIT

agent-browser set device "iPhone 14" 2>&1 | tail -1
agent-browser open http://localhost:3000/ 2>&1 | tail -1
sleep 6
agent-browser console --clear 2>&1 | tail -1
agent-browser press Escape 2>&1 | tail -1

echo "=== 01 Home ==="
agent-browser screenshot /tmp/qa9/01-home.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -16

echo "=== 02 Products ==="
agent-browser find text "Products" click 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa9/02-products.png 2>&1 | tail -1

echo "=== 03 Shop ==="
agent-browser find text "Shop" click 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa9/03-shop.png 2>&1 | tail -1

echo "=== 04 More ==="
agent-browser find text "More" click 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa9/04-more.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -14

echo "=== 05 Activity ==="
agent-browser find text "Home" click 2>&1 | tail -1
sleep 2
agent-browser snapshot -i 2>&1 > /tmp/qa9/h.txt
ACT_REF=$(grep -i "images.*published\|See insights" /tmp/qa9/h.txt | sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1)
[ -n "$ACT_REF" ] && agent-browser click @$ACT_REF 2>&1 | tail -1
sleep 3
agent-browser screenshot /tmp/qa9/05-activity.png 2>&1 | tail -1
agent-browser snapshot 2>&1 | head -20

echo "=== 06 Brand Profile ==="
agent-browser find text "More" click 2>&1 | tail -1
sleep 2
agent-browser snapshot -i 2>&1 > /tmp/qa9/m.txt
BRAND_REF=$(grep "Brand profile" /tmp/qa9/m.txt | sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1)
[ -n "$BRAND_REF" ] && agent-browser click @$BRAND_REF 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa9/06-brand.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -10

echo "=== 07 Lookbook ==="
agent-browser find text "Home" click 2>&1 | tail -1
sleep 2
agent-browser snapshot -i 2>&1 > /tmp/qa9/h2.txt
LB_REF=$(grep "View lookbook" /tmp/qa9/h2.txt | sed -n 's/.*\[ref=\(e[0-9]*\).*/\1/p' | head -1)
[ -n "$LB_REF" ] && agent-browser click @$LB_REF 2>&1 | tail -1
sleep 2
agent-browser screenshot /tmp/qa9/07-lookbook.png 2>&1 | tail -1

echo "=== Console errors ==="
agent-browser console 2>&1 | grep -iE "error|fail" | grep -v "HMR\|Fast Refresh\|devtools" | head -5

echo "=== Unique screenshots ==="
md5sum /tmp/qa9/*.png 2>/dev/null | awk '{print $1}' | sort -u | wc -l
ls -la /tmp/qa9/*.png
