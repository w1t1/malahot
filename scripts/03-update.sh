#!/bin/bash
# ============================================
# Malahot - 快速更新脚本（代码更新后执行）
# ============================================

set -e
cd /opt/malahot

echo "拉取最新代码..."
git pull

echo "重新构建前端..."
cd frontend && npm run build && cd ..

echo "重新构建并重启后端..."
docker compose up -d --build backend

echo "重启 Nginx 加载新前端..."
docker compose restart nginx

echo "更新完成！"
docker compose ps
