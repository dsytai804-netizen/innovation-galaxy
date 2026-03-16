#!/bin/bash
# 直接测试流式API并查看原始响应

API_KEY=$(grep VITE_LLM_API_KEY /Users/dusiyu1/Desktop/vibecoding_\ campaign2/innovation-galaxy/.env | cut -d '=' -f2)
MODEL=$(grep VITE_LLM_MODEL /Users/dusiyu1/Desktop/vibecoding_\ campaign2/innovation-galaxy/.env | cut -d '=' -f2)

echo "🧪 Testing streaming API..."
echo ""

curl -N http://localhost:5173/llm-api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Say hello in 5 words\"}],
    \"max_tokens\": 50,
    \"stream\": true
  }" 2>&1 | head -50
