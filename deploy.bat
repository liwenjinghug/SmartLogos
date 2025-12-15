@echo off
REM SmartLogos 后端快速部署脚本（Windows 版本）
REM 使用方法：双击运行 deploy.bat

echo ==========================================
echo   SmartLogos 后端 Docker 部署脚本
echo ==========================================
echo.

REM 检查 Docker 是否运行
docker version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 已运行
echo.

REM 创建上传目录
echo 📁 创建上传目录...
if not exist uploads mkdir uploads

echo.
echo 🔨 构建并启动服务...
docker-compose down
docker-compose up -d --build

echo.
echo ⏳ 等待服务启动（约 30 秒）...
timeout /t 30 /nobreak

REM 检查服务状态
echo.
echo 📊 服务状态：
docker-compose ps

echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo 后端 API 地址: http://localhost:8080/api
echo 测试接口: http://localhost:8080/api/documents?user_id=1
echo.
echo 常用命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose stop
echo   重启服务: docker-compose restart
echo   完全清理: docker-compose down -v
echo ==========================================
echo.

pause
