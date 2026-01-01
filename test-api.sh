#!/bin/bash

# API 接口测试脚本
# 使用方法：chmod +x test-api.sh && ./test-api.sh

BASE_URL="${1:-http://localhost:8080}"

echo "=========================================="
echo "  SmartLogos API 接口测试"
echo "  测试地址: $BASE_URL"
echo "=========================================="
echo ""

# 测试 1: 获取文档列表
echo "📋 测试 1: 获取文档列表"
echo "请求: GET $BASE_URL/api/documents?user_id=1"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/documents?user_id=1")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ 成功 (HTTP $http_code)"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "❌ 失败 (HTTP $http_code)"
    echo "$body"
fi
echo ""

# 测试 2: 文件上传（需要准备测试文件）
if [ -f "test.txt" ]; then
    echo "📤 测试 2: 文件上传分析"
    echo "请求: POST $BASE_URL/api/analyze"
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -F "file=@test.txt" \
        -F "user_id=1" \
        "$BASE_URL/api/analyze?target_lang=zh")
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "✅ 成功 (HTTP $http_code)"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo "❌ 失败 (HTTP $http_code)"
        echo "$body"
    fi
    echo ""
else
    echo "⏭️  跳过测试 2: 未找到 test.txt 测试文件"
    echo ""
fi

# 测试 3: 题目列表
echo "📝 测试 3: 获取题目列表"
echo "请求: GET $BASE_URL/api/quizzes?user_id=1"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/quizzes?user_id=1")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ 成功 (HTTP $http_code)"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "❌ 失败 (HTTP $http_code)"
    echo "$body"
fi
echo ""

# 测试 4: AI 问答
echo "💬 测试 4: AI 问答"
echo "请求: POST $BASE_URL/api/chat"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "Content-Type: application/json" \
    -d '{"question":"什么是人工智能？","context":"人工智能是计算机科学的一个分支"}' \
    "$BASE_URL/api/chat")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ 成功 (HTTP $http_code)"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "❌ 失败 (HTTP $http_code)"
    echo "$body"
fi
echo ""

echo "=========================================="
echo "  测试完成"
echo "=========================================="
