# 节点交互和布局优化

## 🎯 解决的问题

### 问题1：单击/双击行为混淆
**原问题**：
- 双击节点会同时触发展开和添加到灵感篮子
- 用户期望：单击=展开/收起，双击=添加到篮子（不展开）

### 问题2：展开后文字重叠
**原问题**：
- 展开节点后，子节点文字重叠在一起，难以阅读
- 原因：子节点分布半径太小（3单位），节点密集

## ✅ 解决方案

### 1. 单击/双击事件区分

**实现原理**：
使用延迟判断机制，区分单击和双击：

```typescript
const clickTimeoutRef = useRef<number | null>(null);

const handleClick = (e) => {
  e.stopPropagation();

  // 如果已有待处理的单击，说明这是双击，取消单击
  if (clickTimeoutRef.current) {
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = null;
    return; // 不展开
  }

  // 等待250ms，如果没有第二次点击，执行展开
  clickTimeoutRef.current = window.setTimeout(async () => {
    clickTimeoutRef.current = null;
    // 执行展开/收起逻辑
    if (node.expanded) {
      collapseNode(node.id);
    } else {
      // 展开节点...
    }
  }, 250);
};

const handleDoubleClick = (e) => {
  e.stopPropagation();

  // 取消单击的定时器
  if (clickTimeoutRef.current) {
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = null;
  }

  // 添加到灵感篮子
  if (!isSelected) {
    addKeyword({ ...node });
  }
};
```

**时序图**：
```
单击情况：
点击 → 等待250ms → 无第二次点击 → 执行展开/收起

双击情况：
第一次点击 → 等待250ms中...
第二次点击 → 取消等待 → 执行添加到篮子
```

### 2. 动态子节点布局半径

**优化前**：
```typescript
const radius = 3; // 固定半径，容易重叠
```

**优化后**：
```typescript
// 根据子节点数量动态调整半径
const baseRadius = 4; // 基础半径（增加33%）
const extraRadius = Math.min(childCount * 0.3, 3); // 每个节点额外0.3单位，最多+3
const radius = baseRadius + extraRadius;
```

**半径对照表**：

| 子节点数 | 优化前半径 | 优化后半径 | 增加 |
|---------|----------|----------|------|
| 3个 | 3 | 4.9 | +63% |
| 5个 | 3 | 5.5 | +83% |
| 8个 | 3 | 6.4 | +113% |
| 10个 | 3 | 7.0 | +133% |
| 15个+ | 3 | 7.0 (上限) | +133% |

**好处**：
- 子节点越多，分布越分散
- 避免密集重叠
- 保持合理的最大半径（7单位）

### 3. 文字标签位置和换行优化

**优化前**：
```typescript
<Text
  position={[0, node.size * 0.8, 0]}
  fontSize={0.3}
>
  {node.label}
</Text>
```

**优化后**：
```typescript
<Text
  position={[0, node.size * 0.9, 0]}  // 位置上移10%
  fontSize={hovered ? 0.36 : 0.3}
  maxWidth={3}                         // 限制宽度，自动换行
  textAlign="center"                   // 居中对齐
  outlineWidth={0.015}                 // 细描边保证可读性
>
  {node.label}
</Text>
```

**改进点**：
1. **位置上移**：从`size * 0.8`提升到`size * 0.9`，减少与下方节点重叠
2. **自动换行**：`maxWidth={3}`限制文字宽度，长文本自动换行
3. **居中对齐**：多行文本居中显示，更美观

## 📊 视觉效果对比

### 展开3个子节点

**优化前**：
```
        父节点
       /  |  \
   子1  子2  子3  ← 距离3单位，文字可能重叠
```

**优化后**：
```
        父节点
      /    |    \
   子1    子2    子3  ← 距离4.9单位，文字清晰分离
```

### 展开10个子节点

**优化前**：
```
         父节点
    ●●●●●●●●●●  ← 半径3，非常拥挤
```

**优化后**：
```
         父节点
   ●   ●   ●   ●   ●
     ●   ●   ●   ●   ●  ← 半径7，分布开阔
```

## 🧪 测试方法

### 测试单击/双击区分

1. **单击节点**：
   - 等待250ms
   - ✅ 节点展开（或收起）
   - ❌ 不添加到灵感篮子

2. **快速双击节点**：
   - 间隔<250ms的两次点击
   - ✅ 添加到灵感篮子
   - ❌ 不展开节点

3. **测试场景**：
   - 双击"AI技术"节点
   - 应该看到灵感篮子增加"AI技术"
   - 但节点不展开，不生成子节点

### 测试文字重叠修复

1. **展开节点**：
   - 单击"Technology Galaxy"
   - 等待LLM生成子节点

2. **检查文字**：
   - ✅ 子节点文字清晰可读
   - ✅ 无重叠现象
   - ✅ 长文本自动换行

3. **多个节点展开**：
   - 继续单击其他节点
   - 检查不同数量的子节点布局
   - ✅ 3个子节点：半径4.9
   - ✅ 8个子节点：半径6.4

### 测试收起功能

1. **单击已展开的节点**：
   - 节点从蓝色球体变回原状
   - ✅ 子节点消失
   - ✅ 连接线消失

## ⚙️ 技术细节

### 延迟时间选择：250ms

**为什么是250ms？**
- 太短（<200ms）：用户很难完成双击
- 太长（>300ms）：单击响应感觉迟缓
- 250ms：平衡点，符合用户习惯

**参考**：
- Windows系统双击间隔默认：500ms
- 网页常用双击延迟：200-300ms
- 触摸屏双击延迟：300-500ms

我们选择250ms，略快于触摸屏，适合桌面端使用。

### 斐波那契球面分布

子节点使用**斐波那契螺旋**算法分布在球面上：

```typescript
const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 约137.5°

for (let i = 0; i < count; i++) {
  const y = 1 - (i / (count - 1)) * 2;  // Y轴从+1到-1
  const radiusAtY = Math.sqrt(1 - y * y); // 该高度的圆半径
  const theta = goldenAngle * i;          // 黄金角旋转

  const x = Math.cos(theta) * radiusAtY;
  const z = Math.sin(theta) * radiusAtY;
  // ...
}
```

**优点**：
- 均匀分布，无聚集
- 任意数量都适用
- 视觉上自然美观

### 文字自动换行

Three.js的Text组件支持`maxWidth`属性：

```typescript
maxWidth={3}  // 最大宽度3单位
```

**效果**：
- "AI技术" → 单行显示
- "在线教育平台" → 自动换行为两行：
  ```
  在线教育
    平台
  ```
- "AR/VR/XR技术" → 自动换行为两行：
  ```
  AR/VR/
  XR技术
  ```

## 🎯 用户体验提升

### 交互明确性

| 操作 | 优化前 | 优化后 |
|------|-------|-------|
| 单击 | 展开+添加（混乱） | 仅展开 ✅ |
| 双击 | 展开+添加（重复） | 仅添加 ✅ |
| 意图明确性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

### 可读性

| 场景 | 优化前 | 优化后 |
|------|-------|-------|
| 3个子节点 | 拥挤 | 清晰 ✅ |
| 8个子节点 | 重叠严重 | 分离清晰 ✅ |
| 长文本 | 超出边界 | 自动换行 ✅ |
| 可读性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🐛 已知限制

### 1. 超长文本

如果节点标签超过20个字符，即使换行也可能占用大量空间。

**解决方案**（可选）：
```typescript
// 超长文本截断
const displayLabel = node.label.length > 15
  ? node.label.slice(0, 15) + '...'
  : node.label;
```

### 2. 极大量子节点

如果LLM生成超过20个子节点，半径上限为7，仍可能略显拥挤。

**解决方案**（可选）：
```typescript
// 增加半径上限
const extraRadius = Math.min(childCount * 0.3, 5); // 上限提高到5
```

## 📝 修改的文件

1. ✅ `src/components/galaxy/Planet.tsx` - 单击/双击区分，文字位置和换行
2. ✅ `src/utils/sphericalLayout.ts` - 动态半径计算

## 🎬 动画优化（未来可选）

当前子节点是瞬间出现，可以添加动画：

```typescript
// 使用framer-motion实现渐入动画
<motion.group
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
  <Planet node={child} />
</motion.group>
```

效果：子节点逐个从小到大弹出，更有趣。

## ✅ 验证清单

- [x] 单击节点展开/收起
- [x] 双击节点添加到篮子（不展开）
- [x] 子节点半径根据数量动态调整
- [x] 文字位置上移，减少重叠
- [x] 长文本自动换行
- [x] TypeScript类型正确
- [x] 构建成功

## 🚀 性能影响

- ✅ 延迟判断：极小开销（单个定时器）
- ✅ 动态半径计算：O(1)时间复杂度
- ✅ 文字换行：由Three.js原生处理，无额外开销

所有优化都不影响性能。
