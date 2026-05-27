#!/bin/bash
# ============================================
# Malahot - 拉取所有 Docker 镜像（带重试）
# 解决国内 Docker Hub 访问不稳定问题
# ============================================

set -e

MAX_RETRIES=5
RETRY_DELAY=10

IMAGES=(
    "mysql:8.0"
    "redis:7-alpine"
    "nginx:alpine"
    "eclipse-temurin:17-jre-alpine"
)

pull_with_retry() {
    local image=$1
    local attempt=1

    while [ $attempt -le $MAX_RETRIES ]; do
        echo "  拉取 $image (第 ${attempt}/${MAX_RETRIES} 次)..."
        if docker pull "$image" 2>&1; then
            echo "  ✓ $image 拉取成功"
            return 0
        fi
        echo "  ✗ 失败，${RETRY_DELAY}秒后重试..."
        sleep $RETRY_DELAY
        attempt=$((attempt + 1))
    done

    echo "  ✗✗ $image 拉取失败（已重试 $MAX_RETRIES 次）"
    return 1
}

echo "=========================================="
echo "  拉取所有 Docker 镜像"
echo "=========================================="
echo ""
echo "共 ${#IMAGES[@]} 个镜像，每个最多重试 ${MAX_RETRIES} 次"
echo ""

FAILED=()

for image in "${IMAGES[@]}"; do
    # 检查本地是否已有
    if docker image inspect "$image" &>/dev/null; then
        echo "  ✓ $image 已存在，跳过"
        continue
    fi

    if ! pull_with_retry "$image"; then
        FAILED+=("$image")
    fi
    echo ""
done

echo "=========================================="
if [ ${#FAILED[@]} -eq 0 ]; then
    echo "  所有镜像拉取成功！"
    echo "  运行: cd /opt/malahot && docker compose up -d --build"
else
    echo "  以下镜像拉取失败:"
    for img in "${FAILED[@]}"; do
        echo "    - $img"
    done
    echo ""
    echo "  建议："
    echo "  1. 检查 /etc/docker/daemon.json 的镜像加速器配置"
    echo "  2. 稍后重新运行此脚本"
    echo "  3. 或手动拉取: docker pull <镜像名>"
fi
echo "=========================================="
