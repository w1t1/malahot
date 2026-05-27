#!/bin/bash
# ============================================
# Malahot 电竞赛事平台 - 服务器初始化脚本
# 适用于 Alibaba Cloud Linux (2核2G)
# ============================================

set -e

echo "=========================================="
echo "  Malahot 服务器环境初始化"
echo "=========================================="

# 1. 更新系统
echo "[1/7] 更新系统包..."
sudo yum update -y

# 2. 创建 2G Swap（2G内存必须加swap）
echo "[2/7] 创建 2G Swap 分区..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    # 调低 swappiness，尽量用物理内存
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "  Swap 创建完成"
else
    echo "  Swap 已存在，跳过"
fi

# 3. 安装 Docker
echo "[3/7] 安装 Docker..."
if ! command -v docker &> /dev/null; then
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    # 将当前用户加入 docker 组（免 sudo）
    sudo usermod -aG docker $USER
    echo "  Docker 安装完成"
else
    echo "  Docker 已安装，跳过"
fi

# 4. 配置 Docker 镜像加速（阿里云）
echo "[4/7] 配置 Docker 镜像加速..."
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
    "registry-mirrors": [
        "https://mirror.ccs.tencentyun.com",
        "https://docker.mirrors.ustc.edu.cn"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

# 5. 安装 Git
echo "[5/7] 安装 Git..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git
    echo "  Git 安装完成"
else
    echo "  Git 已安装，跳过"
fi

# 6. 配置防火墙
echo "[6/7] 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    sudo systemctl start firewalld 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=80/tcp    # HTTP
    sudo firewall-cmd --permanent --add-port=443/tcp   # HTTPS（后续用）
    sudo firewall-cmd --permanent --add-port=8080/tcp  # 后端（调试用，生产可关）
    sudo firewall-cmd --reload
    echo "  防火墙配置完成"
else
    echo "  未检测到 firewalld，跳过（请确认阿里云安全组已放通 80 端口）"
fi

# 7. 创建项目目录
echo "[7/7] 创建项目目录..."
sudo mkdir -p /opt/malahot
sudo chown $USER:$USER /opt/malahot

echo ""
echo "=========================================="
echo "  初始化完成！"
echo "=========================================="
echo ""
echo "重要提醒："
echo "  1. 请在阿里云控制台 → 安全组 中放通以下端口："
echo "     - 80 (HTTP)"
echo "     - 443 (HTTPS，后续可选)"
echo "  2. 请退出并重新登录 SSH，使 docker 组权限生效"
echo "  3. 验证安装：docker --version && docker compose version"
echo ""
