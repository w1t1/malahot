#!/bin/bash
# ============================================
# Malahot - 部署 / 更新脚本
# 在服务器的 /opt/malahot 目录下运行
# ============================================

set -e

cd /opt/malahot

echo "=========================================="
echo "  Malahot 部署"
echo "=========================================="

# 1. 创建 .env 文件（首次部署）
if [ ! -f .env ]; then
    echo "[1/4] 创建 .env 配置文件..."
    # 生成随机 JWT Secret
    JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n/+=')
    # 生成随机 MySQL 密码
    MYSQL_PWD=$(openssl rand -base64 16 | tr -d '\n/+=')

    cat > .env <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_PWD}
MYSQL_PASSWORD=${MYSQL_PWD}
JWT_SECRET=${JWT_SECRET}
EOF
    echo "  .env 已生成（密码已随机生成）"
    echo "  MySQL 密码: ${MYSQL_PWD}"
    echo "  请妥善保管以上信息！"
else
    echo "[1/4] .env 已存在，跳过"
fi

# 2. 构建前端
echo "[2/4] 构建前端..."
cd frontend
if [ -d node_modules ]; then
    npm run build
else
    npm ci && npm run build
fi
cd ..

# 3. 构建并启动所有服务
echo "[3/4] 构建 Docker 镜像并启动服务..."
docker compose up -d --build

# 4. 等待服务就绪
echo "[4/4] 等待服务启动..."
echo -n "  等待 MySQL"
for i in $(seq 1 30); do
    if docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo " ✓"
        break
    fi
    echo -n "."
    sleep 2
done

echo -n "  等待后端"
for i in $(seq 1 30); do
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        echo " ✓"
        break
    fi
    echo -n "."
    sleep 2
done

# 获取服务器公网IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "YOUR_SERVER_IP")

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "  访问地址:  http://${PUBLIC_IP}"
echo "  API 文档:  http://${PUBLIC_IP}/api/doc.html"
echo ""
echo "  默认管理员: 手机号 13800000000"
echo "  开发验证码: 8888"
echo ""
echo "  常用命令:"
echo "    查看日志:   docker compose logs -f backend"
echo "    重启服务:   docker compose restart"
echo "    停止服务:   docker compose down"
echo "    查看状态:   docker compose ps"
echo ""
