#!/bin/bash
# ============================================
# Malahot - 直接安装部署（不用 Docker）
# 适用于 Alibaba Cloud Linux 4, 2核2G
# ============================================

set -e

echo "=========================================="
echo "  Malahot 服务器环境安装"
echo "=========================================="

# 1. 创建 Swap
echo "[1/7] 创建 2G Swap..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "  Swap 创建完成"
else
    echo "  Swap 已存在，跳过"
fi

# 2. 安装 MySQL 8.0
echo "[2/7] 安装 MySQL 8.0..."
if ! command -v mysqld &> /dev/null; then
    sudo yum install -y mysql-server
    sudo systemctl start mysqld
    sudo systemctl enable mysqld
    echo "  MySQL 安装完成"
else
    echo "  MySQL 已安装，跳过"
fi

# 3. 安装 Redis
echo "[3/7] 安装 Redis..."
if ! command -v redis-server &> /dev/null; then
    sudo yum install -y redis
    # 配置 Redis 内存限制
    sudo sed -i 's/# maxmemory <bytes>/maxmemory 64mb/' /etc/redis/redis.conf 2>/dev/null || \
    sudo sed -i 's/# maxmemory <bytes>/maxmemory 64mb/' /etc/redis.conf 2>/dev/null || true
    sudo systemctl start redis
    sudo systemctl enable redis
    echo "  Redis 安装完成"
else
    echo "  Redis 已安装，跳过"
fi

# 4. 安装 JDK 17
echo "[4/7] 安装 JDK 17..."
if ! command -v javac &> /dev/null; then
    sudo yum install -y java-17-openjdk java-17-openjdk-devel
    echo "  JDK 17 安装完成"
else
    echo "  JDK 已安装: $(java -version 2>&1 | head -1)"
fi

# 5. 安装 Maven
echo "[5/7] 安装 Maven..."
if ! command -v mvn &> /dev/null; then
    sudo yum install -y maven || {
        # 手动安装 Maven
        MAVEN_VERSION=3.9.6
        cd /tmp
        curl -fsSL https://mirrors.aliyun.com/apache/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz -o maven.tar.gz
        sudo tar -xzf maven.tar.gz -C /opt/
        sudo ln -sf /opt/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/local/bin/mvn
        rm maven.tar.gz
    }
    echo "  Maven 安装完成"
else
    echo "  Maven 已安装，跳过"
fi

# 6. 安装 Node.js 20
echo "[6/7] 安装 Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
    echo "  Node.js $(node -v) 安装完成"
else
    echo "  Node.js 已安装: $(node -v)"
fi

# 7. 安装 Nginx
echo "[7/7] 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo yum install -y nginx
    sudo systemctl enable nginx
    echo "  Nginx 安装完成"
else
    echo "  Nginx 已安装，跳过"
fi

echo ""
echo "=========================================="
echo "  环境安装完成！"
echo "=========================================="
echo ""
echo "已安装组件:"
echo "  MySQL:  $(mysqld --version 2>&1 | head -1 || echo 'installed')"
echo "  Redis:  $(redis-server --version 2>&1 || echo 'installed')"
echo "  Java:   $(java -version 2>&1 | head -1)"
echo "  Maven:  $(mvn -v 2>&1 | head -1 || echo 'installed')"
echo "  Node:   $(node -v 2>&1)"
echo "  Nginx:  $(nginx -v 2>&1)"
echo ""
echo "下一步: 运行 bash scripts/setup-native.sh 初始化数据库并部署"
