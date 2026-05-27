#!/bin/bash
# ============================================
# Malahot - 快速更新脚本（代码更新后执行）
# ============================================

set -e
cd /opt/malahot

# 确保使用 JDK 17
if [ -f /etc/profile.d/jdk17.sh ]; then
    source /etc/profile.d/jdk17.sh
fi

echo "拉取最新代码..."
git pull

echo "构建后端..."
cd backend && mvn package -DskipTests -B -q && cd ..

echo "构建前端..."
cd frontend && npm run build --silent && cd ..

echo "重新构建 Docker 镜像并重启..."
docker compose up -d --build

echo "更新完成！"
docker compose ps
