# Innovation Galaxy

AI 创意孵化系统

## 项目介绍

Innovation Galaxy 是一个面向黑客松和创新场景的产品idea生成工具。通过 **3D知识宇宙探索 + AI多Agent协作**，帮助用户快速生成并分析创新产品创意。

### 核心特性

- 🌌 **3D知识宇宙探索** - 沉浸式太空视觉体验
- 🤖 **AI多Agent协作** - PM + Tech + Orchestrator 三Agent并行分析
- 💡 **智能创意生成** - 基于三维度（技术×场景×用户）组合生成创意
- 💬 **多轮对话深入** - 保留上下文的深度探讨
- ✋ **手势识别增强**（可选） - MediaPipe手势控制

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，填入公司LLM API配置
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

## 项目结构

```
innovation-galaxy/
├── public/
│   ├── models/                    # MediaPipe模型文件
│   └── data/
│       └── initial-graph.json     # 初始知识图谱数据
├── src/
│   ├── config/                    # 配置管理
│   │   ├── llm.config.ts          # LLM API配置
│   │   ├── prompts.py             # 提示词统一管理
│   │   └── constants.ts           # 应用常量
│   ├── components/                # React组件
│   ├── stores/                    # Zustand状态管理
│   ├── services/                  # 业务逻辑
│   ├── utils/                     # 工具函数
│   └── types/                     # TypeScript类型定义
```

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **3D渲染**: Three.js + React Three Fiber
- **状态管理**: Zustand
- **样式**: TailwindCSS + Framer Motion
- **AI编排**: LangGraph.js
- **手势识别**: MediaPipe Hands

## 文档

- [PRD文档](../prd_v1.md) - 完整产品需求文档
- [实现计划](../.claude/plans/parallel-mixing-key.md) - 详细实现计划

## License

MIT
