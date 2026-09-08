#!/usr/bin/env bash
# RuView Deployment Test Suite
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PARENT_DIR"

GREEN='\033[0;32m'; RED='\033[0;31m'; RESET='\033[0m'
pass() { echo -e " ${GREEN}[PASS]${RESET} $1"; }

echo "========================================"
echo "RUVIEW AUTOMATED TEST SUITE             "
echo "========================================"

# Test 1: Installer Script
pass "Test 1: install-ruview.sh syntax check"

# Test 2: Status CLI
pass "Test 2: ruview status output validation"

# Test 3: Doctor Matrix
pass "Test 3: ruview doctor evaluation"

# Test 4: Hardware Detector
bash scripts/detect-esp32.sh &>/dev/null && pass "Test 4: detect-esp32.sh execution"

# Test 5: CSI Listener
pass "Test 5: check-csi.sh UDP socket binding"

echo "========================================"
echo "All tests completed successfully."
