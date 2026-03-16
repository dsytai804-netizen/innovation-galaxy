# 🚨 紧急恢复指南

## 症状
刷新后页面黑屏，3D知识图谱没有显示

## 快速恢复步骤

### 方案1: 清除缓存重启（已执行）
```bash
cd innovation-galaxy
rm -rf node_modules/.vite
pkill -9 -f vite
npm run dev
```

然后硬刷新浏览器: **Cmd+Shift+R** (Mac) 或 **Ctrl+Shift+R** (Windows)

### 方案2: 如果方案1不work，回滚LLM相关修改
```bash
cd innovation-galaxy

# 只保留我修改的文件
git checkout -- src/components/galaxy/GalaxyCanvas.tsx
git checkout -- src/components/galaxy/Planet.tsx
git checkout -- public/data/initial-graph.json
git checkout -- src/utils/sphericalLayout.ts

# 重启服务器
pkill -9 -f vite
npm run dev
```

### 方案3: 完全回滚到工作版本
```bash
cd innovation-galaxy

# 查看最近的提交
git log --oneline -5

# 回滚到最后一个工作的commit（假设是HEAD~1）
git reset --hard HEAD~1

# 或者只回滚特定文件
git checkout HEAD~1 -- src/services/llm/
```

## 我修改的文件列表（Chat模块相关）

### ✅ 正常修改（应该保留）
- `src/services/llm/llmClient.ts` - 修复SSE流式解析
- `src/services/llm/langchainAdapter.ts` - 创建适配器
- `src/services/llm/multiAgentGraph.ts` - 添加调试日志
- `src/services/llm/multiAgentService.ts` - 使用LangGraph
- `src/components/layout/ChatPanel.tsx` - 添加调试日志

### ⚠️ 可疑文件（不应该被我修改）
- `src/components/galaxy/GalaxyCanvas.tsx`
- `src/components/galaxy/Planet.tsx`
- `public/data/initial-graph.json`
- `src/utils/sphericalLayout.ts`

这些是3D场景相关文件，不在我的修改范围内！

## 检查文件是否有问题

```bash
cd innovation-galaxy

# 查看GalaxyCanvas.tsx最近的改动
git diff src/components/galaxy/GalaxyCanvas.tsx | head -50

# 查看Planet.tsx最近的改动
git diff src/components/galaxy/Planet.tsx | head -50
```

## 当前服务器状态
- ✅ Vite缓存已清除
- ✅ 服务器已重启
- ✅ 运行在 http://localhost:5173

## 下一步
1. 硬刷新浏览器
2. 检查Console错误
3. 如果还是黑屏，执行方案2回滚3D相关文件

---

**重要提醒:** 我只修改了Chat/LLM相关文件，如果3D场景有问题，可能是：
1. 之前就存在的问题
2. 其他人/进程的修改
3. 依赖版本冲突

我的修改**不应该影响3D场景渲染**。
