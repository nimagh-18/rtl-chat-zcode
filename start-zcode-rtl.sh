#!/usr/bin/env bash
#
# Launch ZCode with RTL extension via Chrome DevTools Protocol (CDP) on Linux
# Alternative emergency launcher if app.asar is not patched.
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="${script_dir}/extension"
INJECTOR="${script_dir}/inject-cdp.mjs"

# 1. Locate ZCode binary
find_zcode_bin() {
  if command -v zcode >/dev/null 2>&1; then
    command -v zcode
    return 0
  fi
  if [[ -x "/opt/ZCode/zcode" ]]; then
    echo "/opt/ZCode/zcode"
    return 0
  fi
  echo ""
}

ZCODE_BIN="$(find_zcode_bin)"

if [[ -z "$ZCODE_BIN" ]]; then
  echo "[Error] Could not find 'zcode' binary." >&2
  exit 1
fi

echo "[RTL Chat] Using ZCode executable: $ZCODE_BIN"

# 2. Close existing ZCode process
if pgrep -f "/opt/ZCode/zcode" >/dev/null 2>&1 || pgrep -f "zcode" >/dev/null 2>&1; then
  echo "[RTL Chat] Closing running ZCode instance..."
  pkill -f "/opt/ZCode/zcode" 2>/dev/null || true
  pkill -x "zcode" 2>/dev/null || true
  sleep 2
fi

# 3. Launch ZCode with CDP and extension flags in background
echo "[RTL Chat] Starting ZCode with CDP and extension flags..."
nohup "$ZCODE_BIN" \
  --remote-debugging-port=9229 \
  --load-extension="$EXT_DIR" \
  --disable-extensions-except="$EXT_DIR" >/dev/null 2>&1 &

# 4. Wait for CDP port
echo "[RTL Chat] Waiting for CDP port 9229 to be available..."
for i in {1..30}; do
  if node -e 'fetch("http://127.0.0.1:9229/json").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))' 2>/dev/null; then
    echo "[RTL Chat] CDP port ready."
    break
  fi
  sleep 1
done

# 5. Start CDP injector daemon in background
echo "[RTL Chat] Starting CDP injector daemon..."
nohup node "$INJECTOR" >/dev/null 2>&1 &

echo ""
echo "=========================================================="
echo "  [OK] ZCode launched with RTL support!"
echo "  Look for the red RTL badge in the chat window."
echo "  You can verify anytime with: node inject-cdp.mjs --verify"
echo "=========================================================="
