#!/usr/bin/env bash
#
# Verify RTL Chat injection in running ZCode (with --remote-debugging-port=9229)
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[RTL Chat] Running verification script..."
node "${script_dir}/verify-no-inject.mjs"
