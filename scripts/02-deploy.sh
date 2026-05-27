#!/bin/bash
# ============================================
# Malahot - 部署 / 更新脚本
# 在服务器的 /opt/malahot 目录下运行
# ============================================

set -e

cd /opt/malahot

# 确保使用 JDK 17
if [ -f /etc/profile.d/jdk17.sh ]; then
    source /etc/profile.d/jdk17.sh
fi

echo "=========================================="
echo "  Malahot 部署"
echo "=========================================="

# 1. 创建 .env 文件（首次部署）
if [ ! -f .env ]; then
    echo "[1/5] 创建 .env 配置文件..."
    JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n/+=')
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
    echo "[1/5] .env 已存在，跳过"
fi

# 2. 确保所有镜像已拉取
echo "[2/5] 检查 Docker 镜像..."
bash scripts/pull-images.sh

# 3. 构建后端 JAR（宿主机构建，不依赖 Docker 拉 maven 镜像）
echo "[3/5] 构建后端 JAR..."
cd backend
mvn package -DskipTests -B -q
cd ..
echo "  ✓ 后端构建完成: $(ls -lh backend/target/*.jar | awk '{print $5, $9}')"

# 4. 构建前端 dist（宿主机构建，不依赖 Docker 拉 node 镜像）
echo "[4/5] 构建前端..."
cd frontend
# 清除可能从其他平台复制的 node_modules
rm -rf node_modules
npm install --silent
npm run build
cd ..
echo "  ✓ 前端构建完成: $(du -sh frontend/dist | awk '{print $1}')"

# 5. Docker 打包运行时镜像并启动
echo "[5/5] 构建 Docker 运行时镜像并启动服务..."
docker compose up -d --build

# 等待服务就绪
echo "等待服务启动..."
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
echo "  正式环境:  http://${PUBLIC_IP}"
echo "  测试环境:  http://${PUBLIC_IP}:8081"
echo "  API 文档(测试):  http://${PUBLIC_IP}:8081/api/doc.html"
echo ""
echo "  默认管理员: 手机号 13800000000"
echo "  开发验证码: 8888"
echo ""
echo "  常用命令:"
echo "    查看日志:   docker compose logs -f backend"
echo "    测试日志:   docker compose logs -f backend-test"
echo "    重启服务:   docker compose restart"
echo "    停止服务:   docker compose down"
echo "    查看状态:   docker compose ps"
echo ""
