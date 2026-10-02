#!/usr/bin/env bash
#
# Restore original ZCode app.asar from backup on Linux
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_FILE="${script_dir}/asar-work/app.asar.bak"

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

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "[Error] Backup file not found at: $BACKUP_FILE" >&2
  exit 1
fi

if [[ -z "$ASAR_PATH" ]]; then
  echo "[Error] Could not find ZCode app.asar target location." >&2
  exit 1
fi

echo "[RTL Chat] Backup found: $BACKUP_FILE"
echo "[RTL Chat] Target ZCode asar: $ASAR_PATH"

# Close running ZCode
if pgrep -f "/opt/ZCode/zcode" >/dev/null 2>&1 || pgrep -f "zcode" >/dev/null 2>&1; then
  echo "[RTL Chat] Closing running ZCode..."
  pkill -f "/opt/ZCode/zcode" 2>/dev/null || true
  pkill -x "zcode" 2>/dev/null || true
  sleep 2
fi

# Elevate if necessary
if [[ ! -w "$ASAR_PATH" && "$(id -u)" -ne 0 ]]; then
  if command -v pkexec >/dev/null 2>&1; then
    echo "[RTL Chat] Elevating privileges via pkexec to restore original app.asar..."
    exec pkexec env ZCODE_ASAR="$ASAR_PATH" bash "$0" "$@"
  else
    echo "[RTL Chat] Requesting sudo to restore original app.asar..."
    exec sudo ZCODE_ASAR="$ASAR_PATH" bash "$0" "$@"
  fi
fi

cp -f "$BACKUP_FILE" "$ASAR_PATH"
echo ""
echo "=========================================================="
echo "  [OK] Original ZCode app.asar restored successfully."
echo "=========================================================="
