#!/bin/bash
# ============================================
# Malahot - 数据库备份脚本
# 建议加入 crontab 每日自动备份
# crontab: 0 3 * * * /opt/malahot/scripts/04-backup.sh
# ============================================

set -e

BACKUP_DIR="/opt/malahot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/malahot_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "开始备份数据库..."
docker compose -f /opt/malahot/docker-compose.yml exec -T mysql \
    mysqldump -u malahot -p"${MYSQL_PASSWORD:-malahot2026!}" malahot \
    | gzip > "$BACKUP_FILE"

echo "备份完成: $BACKUP_FILE"

# 保留最近 7 天的备份
find "$BACKUP_DIR" -name "malahot_*.sql.gz" -mtime +7 -delete
echo "已清理 7 天前的旧备份"
