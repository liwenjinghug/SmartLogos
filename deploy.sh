#!/bin/bash

# SmartLogos 后端快速部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e

echo "=========================================="
echo "  SmartLogos 后端 Docker 部署脚本"
echo "=========================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "安装命令: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"
echo ""

# 创建必要的目录
echo "📁 创建上传目录..."
mkdir -p uploads
chmod 777 uploads

echo ""
echo "🔨 构建并启动服务..."
docker-compose down
docker-compose up -d --build

echo ""
echo "⏳ 等待服务启动（约 30 秒）..."
sleep 30

# 检查服务状态
echo ""
echo "📊 服务状态："
docker-compose ps

echo ""
echo "🔍 检查后端健康状态..."
if curl -s http://localhost:8080/api/documents?user_id=1 > /dev/null; then
    echo "✅ 后端服务启动成功！"
    echo ""
    echo "=========================================="
    echo "  部署完成！"
    echo "=========================================="
    echo "后端 API 地址: http://localhost:8080/api"
    echo "测试接口: curl http://localhost:8080/api/documents?user_id=1"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose stop"
    echo "  重启服务: docker-compose restart"
    echo "  完全清理: docker-compose down -v"
    echo "=========================================="
else
    echo "⚠️  后端服务可能还在启动中，请稍后手动检查"
    echo "查看日志: docker-compose logs -f backend"
fi
