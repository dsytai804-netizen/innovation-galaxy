# Innovation Galaxy - 项目结构说明

## 📁 根目录文件

| 文件 | 说明 |
|------|------|
| `.env` | 环境变量配置（包含LLM API密钥，已在.gitignore中） |
| `.env.example` | 环境变量模板，供其他开发者参考 |
| `README.md` | 项目说明文档 |
| `package.json` | NPM依赖配置和脚本命令 |
| `vite.config.ts` | Vite构建配置，包含代理设置解决CORS |
| `tsconfig.json` | TypeScript主配置文件 |
| `tailwind.config.js` | Tailwind CSS配置 |
| `index.html` | 应用入口HTML |

---

## 📂 /docs

项目文档目录

```
docs/
└── plans/
    └── 2026-03-07-innovation-galaxy-completion.md  # 实施计划文档
```

---

## 📂 /public

静态资源目录（不经过构建处理）

```
public/
├── data/
│   └── initial-graph.json          # 初始知识图谱种子数据（3大星系+核心节点）
└── models/                         # 预留3D模型目录（暂未使用）
```

**initial-graph.json 说明：**
- 包含Innovation Core核心节点
- 3大星系：Technology Galaxy、Scenario Galaxy、User Galaxy
- 每个星系下8个子节点（技术、场景、用户维度）
- 定义节点位置、颜色、大小、连接关系

---

## 📂 /src

源代码主目录

### 📄 入口文件

| 文件 | 说明 |
|------|------|
| `main.tsx` | React应用入口，渲染根组件 |
| `App.tsx` | 根组件，布局Header + GalaxyCanvas + ChatPanel + Footer |
| `index.css` | 全局样式，隐藏默认光标 |

---

### 📂 /src/components

React组件目录

#### 🌌 galaxy/ - 3D宇宙核心组件

| 文件 | 功能 |
|------|------|
| `GalaxyCanvas.tsx` | 3D场景容器，包含Camera、Lights、OrbitControls、Bloom效果 |
| `Planet.tsx` | 节点星球组件，处理单击/双击交互、悬停效果、旋转动画 |
| `ConnectionLine.tsx` | 节点间连接线，使用QuadraticBezierLine绘制 |
| `ParticleField.tsx` | 背景粒子场，5000个随机分布的星点 |

#### 💬 chat/ - 对话面板子组件

| 文件 | 功能 |
|------|------|
| `IdeaCard.tsx` | 创意卡片，展示单个生成的idea（标题+描述） |
| `AnalysisProgress.tsx` | 多Agent分析进度指示器 |
| `ReportView.tsx` | Markdown报告渲染组件 |
| `ChatMessage.tsx` | 聊天消息气泡（用户/AI） |
| `ChatInput.tsx` | 多行输入框+发送按钮 |

#### 🧩 layout/ - 布局组件

| 文件 | 功能 |
|------|------|
| `Header.tsx` | 顶部导航栏，显示标题和logo |
| `Footer.tsx` | 底部信息栏，操作提示+版权信息 |
| `ChatPanel.tsx` | 右侧面板，整合灵感篮子+Surprise Me+内容展示+对话 |

#### 🎨 ui/ - 通用UI组件

| 文件 | 功能 |
|------|------|
| `CustomCursor.tsx` | VR风格自定义光标（双圈+中心点） |

---

### 📂 /src/services

业务逻辑服务层

#### 🤖 llm/ - LLM调用服务

| 文件 | 功能 |
|------|------|
| `llmClient.ts` | LLM API客户端，封装HTTP调用、重试逻辑、JSON解析 |
| `promptBuilder.ts` | Prompt模板管理，包含节点扩展、创意生成、多Agent分析提示词 |
| `ideaGenerationService.ts` | Surprise Me创意生成服务，调用LLM生成3个idea |
| `multiAgentService.ts` | 多Agent分析服务（PM+Tech+Orchestrator协作） |

**API配置：**
- 使用Anthropic Claude Messages API格式
- 通过Vite代理转发到 `llm-gateway-proxy.inner.chj.cloud`
- 支持重试、超时控制

#### 📊 graph/ - 知识图谱服务

| 文件 | 功能 |
|------|------|
| `nodeExpansionService.ts` | 节点扩展服务，双击节点时调用LLM生成子节点 |

---

### 📂 /src/stores

Zustand状态管理

| 文件 | 功能 |
|------|------|
| `useGraphStore.ts` | 知识图谱状态（nodes/edges/expandNode/loadInitialGraph） |
| `useBasketStore.ts` | 灵感篮子状态（keywords/addKeyword/removeKeyword） |
| `useAnalysisStore.ts` | 分析状态（报告内容/对话历史/Agent进度） |

---

### 📂 /src/config

配置文件

| 文件 | 功能 |
|------|------|
| `llm.config.ts` | LLM API配置（endpoint/apiKey/model/timeout/retry） |
| `constants.ts` | 全局常量（颜色映射、节点类型等） |

---

### 📂 /src/utils

工具函数

| 文件 | 功能 |
|------|------|
| `sphericalLayout.ts` | 斐波那契球面分布算法，生成子节点3D坐标 |

---

## 🗑️ 已删除的空目录

以下目录在清理时已删除（无实际文件）：

- `src/components/analysis` - 分析组件已移至chat/
- `src/components/basket` - 篮子UI已整合到ChatPanel
- `src/components/controls` - 控制组件未实现
- `src/components/generation` - 生成组件已移至chat/
- `src/services/gesture` - 手势识别为可选功能，暂未实现
- `src/types` - 类型定义已内联到各组件中

---

## 🎯 核心功能对应关系

| PRD功能 | 实现文件 |
|---------|---------|
| 3D知识宇宙 | `components/galaxy/GalaxyCanvas.tsx` + `Planet.tsx` |
| 节点扩展（LLM） | `services/graph/nodeExpansionService.ts` |
| 灵感篮子 | `stores/useBasketStore.ts` + `layout/ChatPanel.tsx` |
| Surprise Me | `services/llm/ideaGenerationService.ts` |
| 多Agent分析 | `services/llm/multiAgentService.ts` |
| 多轮对话 | `stores/useAnalysisStore.ts` + `chat/ChatInput.tsx` |
| 粒子系统 | `components/galaxy/ParticleField.tsx` |
| Bloom效果 | `GalaxyCanvas.tsx` 中的 `<EffectComposer>` |
| VR交互 | `components/ui/CustomCursor.tsx` + `OrbitControls` |

---

## 🚀 启动命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

开发服务器地址：http://localhost:5173

---

## ⚙️ 环境变量配置

复制 `.env.example` 为 `.env`，填入以下配置：

```bash
VITE_LLM_API_ENDPOINT=/llm-api/v1/messages
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_MODEL=aws-claude-sonnet-4-6
```

---

## 📌 待实现功能

根据PRD，以下功能为可选增强：

- ⏳ 手势识别（MediaPipe Hands）
- ⏳ 性能优化（LOD、FPS监控）
- ⏳ 错误边界处理
- ⏳ 加载动画

当前版本已实现所有核心功能（阶段1-3），可用于黑客松演示。
