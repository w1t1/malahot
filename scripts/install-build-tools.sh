#!/bin/bash
# ============================================
# Malahot - 安装构建工具（JDK + Maven + Node.js）
# Docker 只跑运行时，构建在宿主机完成
# ============================================

set -e

echo "=========================================="
echo "  安装构建工具"
echo "=========================================="

# 1. JDK 17
echo "[1/3] 安装 JDK 17..."
if ! rpm -q java-17-openjdk-devel &> /dev/null; then
    sudo yum install -y java-17-openjdk java-17-openjdk-devel
    echo "  ✓ JDK 17 安装完成"
else
    echo "  ✓ JDK 17 已安装"
fi

# 确保 JDK 17 为默认版本（系统可能有多个 JDK）
JDK17_HOME=$(find /usr/lib/jvm -maxdepth 1 -type d -name "*17*" | head -1)
if [ -n "$JDK17_HOME" ]; then
    export JAVA_HOME="$JDK17_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
    # 写入 profile 持久化
    sudo tee /etc/profile.d/jdk17.sh > /dev/null <<JDKEOF
export JAVA_HOME=$JAVA_HOME
export PATH=\$JAVA_HOME/bin:\$PATH
JDKEOF
    echo "  ✓ JAVA_HOME=$JAVA_HOME"
    echo "  ✓ java: $(java -version 2>&1 | head -1)"
else
    echo "  ✗ 未找到 JDK 17，请手动安装"
    exit 1
fi

# 2. Maven
echo "[2/3] 安装 Maven..."
if ! command -v mvn &> /dev/null; then
    sudo yum install -y maven 2>/dev/null || {
        echo "  yum 没有 Maven，手动安装..."
        MAVEN_VERSION=3.9.6
        curl -fsSL "https://mirrors.aliyun.com/apache/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o /tmp/maven.tar.gz
        sudo tar -xzf /tmp/maven.tar.gz -C /opt/
        sudo ln -sf "/opt/apache-maven-${MAVEN_VERSION}/bin/mvn" /usr/local/bin/mvn
        rm -f /tmp/maven.tar.gz
    }
    echo "  ✓ Maven 安装完成"
else
    echo "  ✓ Maven 已安装: $(mvn -v 2>&1 | head -1)"
fi

# 配置 Maven 阿里云镜像（加速依赖下载）
MAVEN_SETTINGS_DIR="$HOME/.m2"
mkdir -p "$MAVEN_SETTINGS_DIR"
if [ ! -f "$MAVEN_SETTINGS_DIR/settings.xml" ]; then
    cat > "$MAVEN_SETTINGS_DIR/settings.xml" <<'XMLEOF'
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <name>Aliyun Maven Mirror</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>
</settings>
XMLEOF
    echo "  ✓ Maven 阿里云镜像已配置"
fi

# 3. Node.js 20
echo "[3/3] 安装 Node.js 20..."
if ! command -v node &> /dev/null; then
    # 从 npmmirror 下载预编译二进制（兼容所有 Linux 发行版）
    NODE_VERSION=20.19.0
    echo "  下载 Node.js v${NODE_VERSION}..."
    curl -fsSL "https://npmmirror.com/mirrors/node/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz
    sudo tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
    rm -f /tmp/node.tar.xz
    # 配置 npm 使用淘宝镜像
    npm config set registry https://registry.npmmirror.com
    echo "  ✓ Node.js $(node -v) 安装完成"
else
    echo "  ✓ Node.js 已安装: $(node -v)"
fi

echo ""
echo "=========================================="
echo "  构建工具安装完成！"
echo "=========================================="
echo "  Java:  $(java -version 2>&1 | head -1)"
echo "  Maven: $(mvn -v 2>&1 | head -1)"
echo "  Node:  $(node -v)"
echo "  npm:   $(npm -v)"
echo ""
echo "下一步: bash scripts/pull-images.sh && bash scripts/02-deploy.sh"
