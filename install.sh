#!/usr/bin/env bash
#
# Install / apply RTL Chat patch to ZCode on Linux
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[Error] Node.js is not installed or not in PATH." >&2
  echo "Please install Node.js (e.g., sudo apt install nodejs) and retry." >&2
  exit 1
fi

# 2. Locate ZCode app.asar
find_zcode_asar() {
  if [[ -n "${ZCODE_ASAR:-}" && -f "$ZCODE_ASAR" ]]; then
    echo "$ZCODE_ASAR"
    return 0
  fi

  local candidates=(
    "/opt/ZCode/resources/app.asar"
    "/usr/share/zcode/resources/app.asar"
    "/usr/lib/zcode/resources/app.asar"
    "${HOME}/.local/share/ZCode/resources/app.asar"
  )

  # Check PATH for zcode binary symlink
  if command -v zcode >/dev/null 2>&1; then
    local bin_path
    bin_path="$(readlink -f "$(command -v zcode)")"
    local bin_dir
    bin_dir="$(dirname "$bin_path")"
    if [[ -f "${bin_dir}/resources/app.asar" ]]; then
      echo "${bin_dir}/resources/app.asar"
      return 0
    fi
  fi

  for path in "${candidates[@]}"; do
    if [[ -f "$path" ]]; then
      echo "$path"
      return 0
    fi
  done

  echo ""
}

ASAR_PATH="$(find_zcode_asar)"

if [[ -z "$ASAR_PATH" ]]; then
  echo "[Error] Could not find ZCode app.asar automatically." >&2
  echo "Please specify its location via ZCODE_ASAR, for example:" >&2
  echo "  ZCODE_ASAR=/path/to/resources/app.asar $0" >&2
  exit 1
fi

echo "[RTL Chat] Found ZCode app.asar: $ASAR_PATH"

# 3. Check if ZCode is currently running
if pgrep -f "/opt/ZCode/zcode" >/dev/null 2>&1 || pgrep -f "zcode" >/dev/null 2>&1; then
  echo "[RTL Chat] ZCode appears to be running. Closing ZCode processes..."
  pkill -f "/opt/ZCode/zcode" 2>/dev/null || true
  pkill -x "zcode" 2>/dev/null || true
  sleep 2
fi

# 4. Check permissions and elevate if needed
if [[ ! -w "$ASAR_PATH" && "$(id -u)" -ne 0 ]]; then
  echo "[RTL Chat] Target file is not writable by current user: $ASAR_PATH"
  if command -v pkexec >/dev/null 2>&1; then
    echo "[RTL Chat] Elevating privileges via pkexec..."
    exec pkexec env ZCODE_ASAR="$ASAR_PATH" bash "$0" "$@"
  else
    echo "[RTL Chat] Requesting sudo privileges to apply the patch..."
    exec sudo ZCODE_ASAR="$ASAR_PATH" bash "$0" "$@"
  fi
fi

# 5. Apply the patch
echo "[RTL Chat] Applying patch using patch-asar.mjs..."
ZCODE_ASAR="$ASAR_PATH" node "${script_dir}/asar-work/patch-asar.mjs" --apply

# If run under sudo/pkexec, fix ownership of generated files in asar-work
orig_user="${SUDO_USER:-${PKEXEC_UID:-}}"
if [[ -n "$orig_user" ]]; then
  chown -R "$orig_user:" "${script_dir}/asar-work" 2>/dev/null || true
fi

echo ""
echo "=========================================================="
echo "  [OK] RTL Chat patch applied successfully to ZCode!"
echo "  You can now launch ZCode normally:"
echo "    zcode &"
echo "  Look for the red RTL badge in the bottom-right corner."
echo "=========================================================="
