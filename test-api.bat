@echo off
REM API 接口测试脚本（Windows 版本）
REM 使用方法：test-api.bat [服务器地址]

setlocal

set BASE_URL=%1
if "%BASE_URL%"=="" set BASE_URL=http://localhost:8080

echo ==========================================
echo   SmartLogos API 接口测试
echo   测试地址: %BASE_URL%
echo ==========================================
echo.

echo 📋 测试 1: 获取文档列表
echo 请求: GET %BASE_URL%/api/documents?user_id=1
curl -s "%BASE_URL%/api/documents?user_id=1"
echo.
echo.

echo 📝 测试 2: 获取题目列表
echo 请求: GET %BASE_URL%/api/quizzes?user_id=1
curl -s "%BASE_URL%/api/quizzes?user_id=1"
echo.
echo.

echo 💬 测试 3: AI 问答
echo 请求: POST %BASE_URL%/api/chat
curl -s -H "Content-Type: application/json" ^
    -d "{\"question\":\"什么是人工智能？\",\"context\":\"人工智能是计算机科学的一个分支\"}" ^
    "%BASE_URL%/api/chat"
echo.
echo.

echo ==========================================
echo   测试完成
echo ==========================================
echo.
pause
