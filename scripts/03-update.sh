#!/bin/bash
# ============================================
# Malahot - 快速更新脚本（代码更新后执行）
# ============================================

set -e
cd /opt/malahot

echo "拉取最新代码..."
git pull

echo "重新构建并重启服务..."
docker compose up -d --build

echo "更新完成！"
docker compose ps
