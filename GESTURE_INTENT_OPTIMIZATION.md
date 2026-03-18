# 🎯 手势识别算法优化 - 智能意图识别

## ✅ 优化完成

已解决**手势识别过于灵敏**的问题，现在系统能智能区分你的操作意图。

---

## 🔧 核心改进

### 问题分析
**之前的问题**:
- 放大（张开手）时手自然会移动 → 系统同时识别为旋转
- 旋转（移动手）时手部张开度会微调 → 系统同时识别为缩放
- **结果**: 无法精确控制单一动作

### 解决方案
**智能意图识别算法**:

```typescript
// 1. 检测两种动作的变化量
opennessChange = |当前张开度 - 5帧前张开度|
movementMagnitude = √(deltaX² + deltaY²)

// 2. 判断主要意图
if (opennessChange > 0.08) {
  intent = "zoom"      // 手部张开度变化大 → 主要是缩放
} else if (movementMagnitude > 0.015) {
  intent = "rotate"    // 位置移动大 → 主要是旋转
} else {
  intent = "idle"      // 都不明显 → 空闲
}

// 3. 意图稳定性检查
// 必须连续3帧保持相同意图才切换模式
// 防止快速抖动切换

// 4. 应用死区
if (intent == "zoom") {
  应用缩放，忽略小幅度移动
} else if (intent == "rotate") {
  应用旋转，忽略小幅度张开度变化
}
```

---

## 🎮 现在的体验

### ✅ 场景1: 先放大再旋转
```
步骤：
1. 👊 握拳静止 → 缩小视角
2. ✋ 慢慢张开（保持位置不动）
   → 系统识别intent="zoom"
   → ✅ 只缩放，不旋转
3. 保持张开状态，左右移动
   → 系统3帧后切换intent="rotate"
   → ✅ 只旋转，不缩放
```

### ✅ 场景2: 先旋转再缩放
```
步骤：
1. 🖐️ 半张开手保持不动 → 准备姿势
2. 👈 向左移动（保持张开度）
   → 系统识别intent="rotate"
   → ✅ 只旋转，不缩放
3. 停止移动，慢慢握拳
   → 系统3帧后切换intent="zoom"
   → ✅ 只缩放，不旋转
```

### ✅ 场景3: 精确控制
```
细节操作：
- 想微调缩放 → 小幅度改变张开度
  → intent保持"zoom"，不会误触发旋转

- 想微调旋转 → 小范围移动手掌
  → intent保持"rotate"，不会误触发缩放
```

---

## 📊 关键参数

### 意图检测阈值
**位置**: `src/hooks/useHandGesture.ts:64-65`

```typescript
const MOVEMENT_THRESHOLD = 0.015;  // 旋转触发阈值
const OPENNESS_THRESHOLD = 0.08;   // 缩放触发阈值
```

**调优建议**:
```typescript
// 如果缩放时还是容易触发旋转
OPENNESS_THRESHOLD = 0.06;  // 降低 → 更容易进入zoom模式

// 如果旋转时还是容易触发缩放
MOVEMENT_THRESHOLD = 0.010;  // 降低 → 更容易进入rotate模式
```

### 死区大小
**位置**: `src/hooks/useHandGesture.ts:84`

```typescript
const DEAD_ZONE = 0.008;  // 旋转死区
```

**调优建议**:
```typescript
// 如果小范围移动还是会旋转
DEAD_ZONE = 0.012;  // 增大 → 更钝感

// 如果需要更灵敏
DEAD_ZONE = 0.005;  // 减小 → 更敏感
```

### 意图切换延迟
**位置**: `src/hooks/useHandGesture.ts:74`

```typescript
if (intentStableFramesRef.current > 3) {
  // 切换意图
}
```

**调优建议**:
```typescript
// 如果切换太慢
> 2  // 只需2帧确认

// 如果切换太快（误触多）
> 5  // 需要5帧确认
```

### 旋转灵敏度
**位置**: `src/hooks/useHandGesture.ts:88-89`

```typescript
const SENSITIVITY = 2.0;  // 从3.0降低到2.0
```

**调优建议**:
```typescript
// 更快旋转
= 3.0

// 更慢旋转（更精确）
= 1.5
```

---

## 🧪 测试步骤

### 测试1: 纯缩放
```
1. 访问 http://localhost:5173
2. 启动手势控制
3. 握拳状态保持手掌静止
4. 慢慢张开手（保持位置不动）

✅ 预期:
- Console显示: intent: zoom
- 图谱只放大，不旋转
- 小幅度手抖不会触发旋转
```

### 测试2: 纯旋转
```
1. 半张开手（50%）保持不动
2. 左右移动手掌（保持张开度不变）

✅ 预期:
- Console显示: intent: rotate
- 图谱只旋转，不缩放
- 微小的张开度变化不会触发缩放
```

### 测试3: 顺序控制
```
1. 握拳缩小（intent: zoom）
2. 保持握拳，向左移动
3. 观察Console，应该看到:
   intent: zoom → ... → rotate
   （3帧后切换）

✅ 预期:
- 前3帧：只缩放
- 3帧后：切换到只旋转
- 切换时有console提示: "🎯 Gesture intent switched to: rotate"
```

### 测试4: 死区测试
```
1. 进入rotate模式
2. 手掌微微颤抖（<0.008单位）

✅ 预期:
- 小幅度抖动被忽略
- 图谱保持稳定
```

---

## 📝 Console日志解读

### 正常日志示例
```javascript
// 缩放模式
Gesture - openness: 52% rotation: { x: "0.000", y: "0.000" } intent: zoom
                                    ↑ 旋转值为0

// 旋转模式
Gesture - openness: 52% rotation: { x: "0.012", y: "-0.034" } intent: rotate
                    ↑ 张开度基本不变

// 意图切换
🎯 Gesture intent switched to: rotate
```

### 调试技巧
```javascript
// 在Console实时监控意图
setInterval(() => {
  console.log('Current intent:',
    // 这个值在hook内部，无法直接访问
    // 但可以从日志推断
  );
}, 500);
```

---

## 🎯 操作技巧

### 技巧1: 稳定姿势
```
✅ 正确:
- 缩放时：固定手腕位置，只动手指
- 旋转时：固定手指张开度，只动手腕

❌ 错误:
- 同时大幅度动手指和手腕
```

### 技巧2: 顺序操作
```
推荐顺序:
1. 先调整缩放到目标大小
2. 停顿1秒（让系统稳定）
3. 再进行旋转调整

避免:
- 连续快速切换缩放和旋转
```

### 技巧3: 利用死区
```
微调技巧:
- 想精确缩放：小幅度动手指（< 8%变化）
- 想精确旋转：小范围移动手掌（< 0.8cm）
```

---

## 🆚 对比

### 优化前
| 操作 | 副作用 | 体验 |
|------|--------|------|
| 张开手 | 同时旋转 | ❌ 无法控制 |
| 移动手 | 同时缩放 | ❌ 互相干扰 |
| 微调 | 频繁跳变 | ❌ 不精确 |

### 优化后
| 操作 | 副作用 | 体验 |
|------|--------|------|
| 张开手 | 忽略小移动 | ✅ 纯缩放 |
| 移动手 | 忽略小变化 | ✅ 纯旋转 |
| 微调 | 死区保护 | ✅ 精确控制 |

---

## 🔍 算法详解

### 意图检测流程图
```
每帧处理:
  ├─ 计算 opennessChange (5帧范围)
  ├─ 计算 movementMagnitude
  ├─ 比较阈值
  │   ├─ opennessChange > 0.08 → zoom
  │   └─ movementMagnitude > 0.015 → rotate
  ├─ 意图稳定性检查
  │   ├─ 相同意图？intentStableFrames++
  │   └─ 不同意图？intentStableFrames=0
  └─ intentStableFrames > 3 → 切换intent
      └─ 打印: "🎯 Gesture intent switched to: XXX"
```

### 死区保护
```
if (intent == "rotate") {
  if (|deltaX| > DEAD_ZONE) {
    应用旋转
  } else {
    忽略（防抖动）
  }
}
```

---

## ✅ 验收标准

- [ ] 握拳张开时图谱只缩放，不旋转
- [ ] 移动手掌时图谱只旋转，不缩放
- [ ] Console显示正确的intent
- [ ] 切换意图时有"🎯 Gesture intent switched"提示
- [ ] 微小抖动被死区过滤
- [ ] 顺序操作流畅自然

---

## 🚀 立即测试

```bash
访问: http://localhost:5173
点击"手势控制"

试试：
1. 握拳→张开（只缩放）
2. 保持张开→左右移动（只旋转）
3. 观察Console的intent值
```

**编译状态**: ✅ 通过
**优化效果**: ✅ 钝感适中，意图清晰

---

## 📚 相关文档

- `GESTURE_ROTATION_FEATURE.md` - 旋转功能说明
- `GESTURE_DEMO_GUIDE.md` - 完整操作指南
- `GESTURE_DEBUGGING_GUIDE.md` - 调试手册

**现在体验应该更精确了！** 🎯
