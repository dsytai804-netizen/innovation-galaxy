# 🎯 手势旋转功能 - 实施完成

## ✅ 新增功能

### 手势控制升级
现在手势控制支持**双重功能**：

1. **🤏 缩放控制**（保留原功能）
   - 👊 握拳 → 图谱缩小（远离）
   - ✋ 张开 → 图谱放大（靠近）

2. **🔄 旋转控制**（新增功能）
   - 👈 手向左划 → 图谱向左旋转
   - 👉 手向右划 → 图谱向右旋转
   - ☝️ 手向上划 → 图谱向上旋转
   - 👇 手向下划 → 图谱向下旋转

### 同时控制
你可以**同时**：
- 改变手部张开度 → 控制缩放
- 移动手掌位置 → 控制旋转

---

## 🎮 使用方法

### 基础操作
1. 点击左下角"手势控制"按钮
2. 允许摄像头权限
3. 将手掌放在摄像头前（距离30-50cm）

### 缩放控制
- 保持手在固定位置
- 慢慢张开或握紧手掌
- 图谱会相应缩放

### 旋转控制
- 保持手部张开度不变
- 左右移动手掌 → 水平旋转
- 上下移动手掌 → 垂直旋转

### 组合控制（高级）
- 边移动边改变张开度
- 同时控制旋转和缩放
- 像《钢铁侠》里的手势操作！🦾

---

## 🔧 技术实现

### 核心算法

#### 1. 手掌位置追踪
```typescript
// 获取手腕位置作为手掌中心
const palm = landmarks[0];
const palmPosition = { x: palm.x, y: palm.y };
```

#### 2. 运动向量计算
```typescript
// 计算相对于上一帧的位移
const deltaX = currentPalm.x - lastPalm.x;
const deltaY = currentPalm.y - lastPalm.y;

// 映射到旋转角度（灵敏度系数3.0）
const rotationY = -deltaX * 3.0; // 水平移动 → Y轴旋转
const rotationX = -deltaY * 3.0; // 垂直移动 → X轴旋转
```

#### 3. 球面坐标转换
```typescript
// 将旋转应用到相机位置
const spherical = new THREE.Spherical();
spherical.setFromVector3(camera.position);

// 应用旋转增量
spherical.theta += rotationY; // 水平旋转
spherical.phi += rotationX;   // 垂直旋转

// 防止翻转（限制phi范围）
spherical.phi = clamp(spherical.phi, 0.1, Math.PI - 0.1);

// 转回笛卡尔坐标
camera.position.setFromSpherical(spherical);
```

#### 4. 平滑算法
```typescript
// 3帧移动平均消除抖动
rotationHistory.push(newRotation);
if (rotationHistory.length > 3) {
  rotationHistory.shift();
}
smoothedRotation = average(rotationHistory);
```

---

## 📊 性能优化

### 优化点
1. **帧率限制**: 30fps处理（33ms间隔）
2. **平滑算法**:
   - 手势值：5帧平均
   - 旋转值：3帧平均（更灵敏）
3. **阈值过滤**: 忽略<0.001的微小旋转
4. **增量更新**: 只传递旋转变化量，不是绝对值

### 预期性能
- **FPS**: 28-32
- **CPU占用**: <25%
- **响应延迟**: <80ms
- **平滑度**: 无明显抖动

---

## 🎯 参数调优

### 调整旋转灵敏度

**位置**: `src/hooks/useHandGesture.ts:32`

```typescript
// 当前值
const SENSITIVITY = 3.0;

// 更快旋转（适合演示）
const SENSITIVITY = 5.0;

// 更慢旋转（更精确）
const SENSITIVITY = 1.5;
```

### 调整平滑程度

**位置**: `src/hooks/useHandGesture.ts:38`

```typescript
// 当前值（3帧历史）
if (rotationHistoryRef.current[axis].length > 3) {

// 更平滑（5帧历史，但延迟更高）
> 5

// 更灵敏（1帧，无平滑）
> 1
```

### 防翻转角度

**位置**: `src/components/galaxy/GalaxyCanvas.tsx:60`

```typescript
// 当前值（防止相机翻转）
spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

// 允许更大俯仰角度
Math.max(0.05, Math.min(Math.PI - 0.05, spherical.phi))

// 限制更严格（防止倒置）
Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi))
```

---

## 🧪 测试步骤

### 测试1: 基础旋转
1. 打开应用: http://localhost:5173
2. 启动手势控制
3. 保持手部半张开（50%）
4. **慢慢向左移动手掌**
   - ✅ 预期：图谱向左旋转
   - ✅ Console: `rotation: { y: 负值 }`

5. **慢慢向右移动手掌**
   - ✅ 预期：图谱向右旋转
   - ✅ Console: `rotation: { y: 正值 }`

### 测试2: 垂直旋转
1. **向上移动手掌**
   - ✅ 预期：图谱视角向上
   - ✅ Console: `rotation: { x: 负值 }`

2. **向下移动手掌**
   - ✅ 预期：图谱视角向下
   - ✅ Console: `rotation: { x: 正值 }`

### 测试3: 组合控制
1. **边移动边改变张开度**
   - 向左移动 + 握拳 → 向左旋转同时缩小
   - 向右移动 + 张开 → 向右旋转同时放大
   - ✅ 预期：两种控制同时生效

### 测试4: 边界测试
1. **快速大幅度移动**
   - ✅ 预期：有平滑过渡，无跳变

2. **手掌离开画面**
   - ✅ 预期：旋转停止，缩放保持

3. **极限角度**
   - ✅ 预期：不会翻转倒置

---

## 🐛 故障排查

### 问题1: 旋转太快
**解决**: 降低SENSITIVITY从3.0到1.5

### 问题2: 旋转太慢
**解决**: 增加SENSITIVITY从3.0到5.0

### 问题3: 旋转有抖动
**解决**: 增加平滑帧数从3到5

### 问题4: 旋转方向反了
**解决**:
```typescript
// 移除负号
const rotationY = deltaX * 3.0; // 去掉-号
const rotationX = deltaY * 3.0; // 去掉-号
```

### 问题5: 相机翻转倒置
**解决**: 检查phi限制范围是否正确设置

---

## 📝 Console日志

### 正常输出示例
```javascript
// 初始化
GestureCamera: Activating...
MediaPipe initialized successfully

// 手势识别（每秒约10次）
Gesture - openness: 52% rotation: { x: "0.012", y: "-0.034" }
Gesture - openness: 54% rotation: { x: "0.008", y: "-0.029" }

// 旋转控制（有移动时）
Camera rotation applied: θ=1.234, φ=0.856
```

### 调试技巧
```javascript
// 在Console输入查看实时数据
setInterval(() => {
  const gesture = useHandGesture.getState();
  console.log('Current gesture:', {
    openness: gesture.handOpenness,
    rotation: gesture.handRotation
  });
}, 500);
```

---

## 📚 修改文件列表

### 1. `src/hooks/useHandGesture.ts` (核心修改)
```diff
+ export interface HandGestureData {
+   openness: number;
+   rotation: { x: number; y: number };
+   palmPosition: { x: number; y: number };
+ }

+ const [handRotation, setHandRotation] = useState({ x: 0, y: 0 })
+ const lastPalmPositionRef = useRef<{ x: number; y: number } | null>(null)
+ const rotationHistoryRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] })

+ const calculateHandRotation = useCallback((palmCenter) => {
+   // 计算移动增量并映射到旋转角度
+ })

+ return { handOpenness, handRotation, palmPosition, ... }
```

### 2. `src/components/gesture/GestureCamera.tsx` (接口修改)
```diff
  interface GestureCameraProps {
    isActive: boolean;
-   onGestureChange: (openness: number) => void;
+   onGestureChange: (openness: number, rotation: { x: number; y: number }) => void;
    onClose: () => void;
  }

- const { handOpenness, initMediaPipe, cleanup } = useHandGesture();
+ const { handOpenness, handRotation, initMediaPipe, cleanup } = useHandGesture();

- onGestureChange(handOpenness);
+ onGestureChange(handOpenness, handRotation);
```

### 3. `src/components/galaxy/GalaxyCanvas.tsx` (旋转控制)
```diff
- const handleGestureChange = useCallback((openness: number) => {
+ const handleGestureChange = useCallback((openness: number, rotation: { x, y }) => {
    // 1. 缩放控制（保留）
    // 2. 旋转控制（新增）
+   const spherical = new THREE.Spherical();
+   spherical.theta += rotation.y;
+   spherical.phi += rotation.x;
+   camera.position.setFromSpherical(spherical);
  })
```

---

## 🎉 功能完成！

### ✅ 实现的功能
- [x] 手掌位置追踪
- [x] 移动向量计算
- [x] 旋转角度映射
- [x] 球面坐标转换
- [x] 平滑算法优化
- [x] 边界防翻转保护
- [x] 缩放+旋转同时控制
- [x] TypeScript编译通过

### 🚀 开始体验

```bash
# 开发服务器已运行
访问: http://localhost:5173

# 操作步骤
1. 点击"手势控制"
2. 允许摄像头
3. 握拳/张开 → 缩放
4. 左右/上下移动 → 旋转
```

### 🎬 体验建议

**最佳姿势**:
1. 坐在摄像头前30-50cm
2. 手掌朝向摄像头
3. 光线充足
4. 手部完全在画面内

**推荐动作**:
- 画圈动作 → 360度观察图谱
- Z字移动 → 多角度探索
- 握拳缩小 + 移动旋转 → 全局浏览
- 张开放大 + 微调旋转 → 细节查看

---

## 📖 相关文档

- `GESTURE_FIX_SUMMARY.md` - 上次修复总结
- `GESTURE_DEBUGGING_GUIDE.md` - 调试手册
- `GESTURE_CONTROL_IMPLEMENTATION_REPORT.md` - 完整实施报告

**Have fun! 🎮**
