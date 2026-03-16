#!/bin/bash
# 快速测试LLM API是否正常工作

echo "🧪 测试 LLM API..."
echo ""

# 从.env读取配置
API_KEY=$(grep VITE_LLM_API_KEY .env | cut -d '=' -f2)
MODEL=$(grep VITE_LLM_MODEL .env | cut -d '=' -f2)

echo "📝 配置信息:"
echo "  Model: $MODEL"
echo "  API Key: ${API_KEY:0:20}..."
echo ""

# 测试API调用
echo "🚀 发送测试请求到 http://localhost:5173/llm-api/v1/messages ..."
echo ""

response=$(curl -s http://localhost:5173/llm-api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Say 'API works!' in Chinese\"}],
    \"max_tokens\": 50
  }")

# 检查响应
if echo "$response" | grep -q "content"; then
  echo "✅ API 调用成功!"
  echo ""
  echo "📦 响应内容:"
  echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
  echo "❌ API 调用失败"
  echo ""
  echo "📦 错误响应:"
  echo "$response"
fi
