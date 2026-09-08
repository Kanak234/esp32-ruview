#!/usr/bin/env bash
# RuView Backup & Restore script
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PARENT_DIR"

ACTION="${1:-backup}"
BACKUP_DIR="${PARENT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ "$ACTION" == "backup" ]; then
    mkdir -p "$BACKUP_DIR"
    ARCHIVE="${BACKUP_DIR}/ruview_backup_${TIMESTAMP}.tar.gz"
    echo "[+] Creating RuView backup in ${ARCHIVE}..."
    tar -czf "$ARCHIVE" .env docker-compose.yml ha_mqtt_discovery.json systemd/ 2>/dev/null || true
    echo "[✓] Backup complete: ${ARCHIVE}"
elif [ "$ACTION" == "restore" ]; then
    RESTORE_FILE="${2:-}"
    if [ -z "$RESTORE_FILE" ] || [ ! -f "$RESTORE_FILE" ]; then
        echo "[!] Usage: ./scripts/backup.sh restore <path_to_tar_gz>"
        exit 1
    fi
    echo "[+] Restoring RuView configuration from ${RESTORE_FILE}..."
    tar -xzf "$RESTORE_FILE" -C "$PARENT_DIR"
    echo "[✓] Restoration complete."
else
    echo "Usage: ./scripts/backup.sh [backup|restore <file>]"
fi
