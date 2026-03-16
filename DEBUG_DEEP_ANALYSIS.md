# 🐛 Deep Analysis 调试指南

## ⚠️ 重要提示

开发服务器当前运行在: **http://localhost:5175/**

（自动选择了5175端口，因为5173和5174被占用）

---

## 🧪 测试步骤

### 1. 打开浏览器
```
http://localhost:5175
```

### 2. 打开开发者工具
- Windows/Linux: `F12` 或 `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`
- 或右键页面 → "检查" → "Console"标签页

### 3. 执行完整测试流程

1. **添加关键词**
   - 双击3D空间中的节点（如"AI技术"、"医疗健康"、"老年人"）
   - 确认关键词出现在右侧灵感篮子中

2. **生成创意**
   - 点击"Surprise Me"按钮
   - 等待约10秒，应该看到3个创意卡片

3. **选择创意**
   - 点击任意创意卡片
   - 确认卡片边框变成紫色（表示选中）

4. **深度分析**
   - 点击"Deep Analysis"按钮
   - **重点观察控制台日志！**

---

## 📊 预期控制台日志

### ✅ 成功的日志模式

```javascript
// 1. 开始分析
🚀 handleDeepAnalysis started for: [创意标题]
🚀 Starting MultiAgentGraph analysis for: [创意标题]

// 2. PM和Tech Agent并行执行
📊 Step 1: Running PM and Tech agents in parallel...
🎯 PM Agent starting...
📞 LangChain-style call (delegating to llmClient)
🚀 Calling LLM API: {endpoint: "/llm-api/v1/messages", ...}
✅ API Response Status: 200
📝 Extracted Content Length: 1523
✅ Call completed: {responseLength: 1523}
✅ PM Agent completed

🔧 Tech Agent starting...
📞 LangChain-style call (delegating to llmClient)
🚀 Calling LLM API: {...}
✅ API Response Status: 200
✅ Tech Agent completed

✅ PM Analysis length: 1523
✅ Tech Analysis length: 1450

// 3. Orchestrator流式生成
📊 Step 2: Running Orchestrator (streaming)...
📊 Orchestrator starting (streaming)...
🌊 LangChain-style streaming call (delegating to llmClient)
🌊 Starting streaming LLM call: {...}

// 4. 流式chunk接收
📊 Agent callback: orchestrator, chunk length: 2
📊 Agent callback: orchestrator, chunk length: 1
📊 Agent callback: orchestrator, chunk length: 1
🎉 First chunk received, switching to conversation view
📦 Streamed 10 chunks, total length: 45
📦 Streamed 20 chunks, total length: 123
📦 Streamed 30 chunks, total length: 256
... (持续滚动)

// 5. 完成
✅ Stream completed
✅ Orchestrator completed
✅ MultiAgentGraph analysis completed
📝 Final report length: 3456 characters
📦 Total chunks: 234
✅ Switched to conversation view
```

### ❌ 可能的错误日志

如果看到这些日志，请把完整内容发给我：

```javascript
// 错误1: API调用失败
💥 LLM Call Error: {error: "...", type: "..."}
❌ LLM API Error Response: ...

// 错误2: 流式失败
💥 Stream call failed: {error: "...", ...}

// 错误3: 报告为空
❌ WARNING: Final report is empty!
⚠️ Report is empty!

// 错误4: Agent失败
💥 MultiAgentGraph analysis failed: ...
💥 Failed to analyze idea: ...
```

---

## 🔍 额外调试 - Network标签页

1. 在开发者工具切换到 **Network** 标签页

2. 勾选 **Preserve log** (保留日志)

3. 点击"Deep Analysis"

4. 查找这些请求:
   - `/llm-api/v1/messages` (应该有3个请求)
   - 第1个: PM Agent
   - 第2个: Tech Agent
   - 第3个: Orchestrator (streaming)

5. 检查每个请求:
   - **Status**: 应该是 `200 OK`
   - **Type**: 应该是 `fetch` 或 `xhr`
   - 点击请求查看:
     - **Headers** → Request Headers → 确认有 `x-api-key`
     - **Response** → 应该有JSON响应内容

---

## 🚨 常见问题排查

### 问题1: 页面停在"多Agent思考中..."不动

**可能原因:**
1. API调用超时或失败
2. 流式响应没有正确解析
3. JavaScript错误中断执行

**排查步骤:**
- 查看Console有无红色错误
- 查看Network标签页请求状态
- 查看是否有 `💥` 开头的错误日志

### 问题2: 有日志但是没有报告显示

**可能原因:**
1. 报告内容为空 (`❌ WARNING: Final report is empty!`)
2. 没有切换到conversation视图
3. React状态更新失败

**排查步骤:**
- 查找 `📝 Final report length:` 日志，确认长度>0
- 查找 `✅ Switched to conversation view` 日志
- 查找 `🎉 First chunk received` 日志

### 问题3: 立即显示"分析失败"弹窗

**可能原因:**
1. API端点不可达
2. API密钥无效
3. 网络错误

**排查步骤:**
- 检查 `.env` 文件配置是否正确
- 运行 `./test-api.sh` 测试API连接
- 查看 `💥 Failed to analyze idea:` 后的错误信息

---

## 🛠️ 快速修复命令

### 重启开发服务器
```bash
cd innovation-galaxy
pkill -f vite
npm run dev
```

### 测试API连接
```bash
cd innovation-galaxy
./test-api.sh
```

### 查看环境变量
```bash
cd innovation-galaxy
cat .env
```

---

## 📝 收集错误信息的清单

如果遇到问题，请提供以下信息：

- [ ] Console标签页的**完整日志**（从 `🚀 handleDeepAnalysis` 开始）
- [ ] 任何**红色错误消息**
- [ ] Network标签页中 `/llm-api/v1/messages` 请求的:
  - [ ] Status code
  - [ ] Response内容（如果失败）
- [ ] 页面状态:
  - [ ] 停在哪个阶段?（思考中/空白/错误弹窗）
  - [ ] 右侧面板显示什么？
- [ ] 截图（如果可能）

---

## ✅ 成功的标志

如果一切正常，你应该看到：

1. ✅ Console有完整的日志流
2. ✅ 页面从"多Agent思考中"切换到报告显示
3. ✅ 右侧面板显示完整的Markdown格式报告
4. ✅ 报告包含多个章节（产品概述、市场分析、技术架构等）
5. ✅ 底部有对话输入框

---

**当前时间:** 2026-03-16
**调试版本:** v2 (带详细日志)
**服务器地址:** http://localhost:5175
