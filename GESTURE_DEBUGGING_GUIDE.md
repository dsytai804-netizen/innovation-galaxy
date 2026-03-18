# 🔧 手势控制调试指南

## 问题修复说明

### 修复的问题
1. ✅ **使用错误的API**: 从`GestureRecognizer`改为`HandLandmarker`
   - `GestureRecognizer`: 识别预定义手势(👍, ✌️等)
   - `HandLandmarker`: 提供21个手部关键点坐标(适合我们的需求)

2. ✅ **摄像头初始化问题**: 添加了防止重复初始化的逻辑
3. ✅ **手势计算优化**: 调整了阈值，增加了Z轴计算
4. ✅ **调试日志**: 添加详细的console.log帮助排查问题

---

## 🧪 测试步骤

### 1. 打开浏览器控制台
```bash
# Chrome DevTools快捷键
# Mac: Cmd + Option + J
# Windows: Ctrl + Shift + J
```

### 2. 访问应用
```
http://localhost:5173
```

### 3. 启动手势控制
1. 点击左下角"手势控制"按钮
2. 允许摄像头权限
3. **查看Console输出**:

```
预期日志序列:
✓ GestureCamera: Activating...
✓ Requesting camera access...
✓ Camera access granted
✓ Video metadata loaded
✓ Video playing
✓ Initializing MediaPipe...
✓ Initializing MediaPipe HandLandmarker...
✓ MediaPipe initialized successfully
✓ Camera initialization complete
✓ Hand detected - openness: 45%
✓ Gesture update: 0.4523...
```

### 4. 测试手势识别

#### 测试A: 握拳 → 缩小
```
操作: 五指握紧成拳
预期Console输出:
- Raw distance: 0.095 → Normalized: 0%
- Gesture update: 0.0123
- Hand detected - openness: 5%

预期效果:
- 手势进度条接近0%
- 3D图谱缩小(远离)
- 相机距离增大(接近80)
```

#### 测试B: 张开 → 放大
```
操作: 五指完全张开
预期Console输出:
- Raw distance: 0.420 → Normalized: 100%
- Gesture update: 0.9876
- Hand detected - openness: 98%

预期效果:
- 手势进度条接近100%
- 3D图谱放大(靠近)
- 相机距离减小(接近3)
```

#### 测试C: 半握 → 中间
```
操作: 手指半张开
预期Console输出:
- Raw distance: 0.250 → Normalized: 50%
- Gesture update: 0.5234
- Hand detected - openness: 52%

预期效果:
- 手势进度条在50%左右
- 3D图谱保持中等距离
```

---

## 🐛 故障排查

### 问题1: Console没有任何日志
**原因**: 手势模式未成功启动

**排查**:
```javascript
// 在Console输入:
import { useGestureStore } from './stores/useGestureStore';
console.log(useGestureStore.getState());

// 预期输出:
// { isGestureMode: true, handOpenness: 0, ... }
```

**解决**: 刷新页面重试

---

### 问题2: 显示"Camera access granted"后卡住
**原因**: MediaPipe模型加载失败

**排查**:
1. 打开Network面板
2. 查找请求: `hand_landmarker.task`
3. 检查状态码(应该是200)

**解决**:
- 检查网络连接
- 确保CDN可访问: https://storage.googleapis.com
- 考虑使用VPN

---

### 问题3: "Hand detected"但手势值一直是0
**原因**: 手部距离计算异常

**排查**:
```javascript
// 在useHandGesture.ts的calculateHandOpenness函数中添加:
console.log('Landmarks:', landmarks.map(l => ({x: l.x, y: l.y})));
console.log('Avg distance:', avgDistance);
```

**解决**:
1. 检查光线是否充足
2. 手部是否完全在画面内
3. 调整MIN_DISTANCE和MAX_DISTANCE阈值

---

### 问题4: 摄像头预览黑屏
**原因**: 视频元素未正确初始化

**排查**:
```javascript
// 在Console输入:
const video = document.querySelector('video');
console.log('Video state:', {
  srcObject: video.srcObject,
  readyState: video.readyState,
  videoWidth: video.videoWidth,
  videoHeight: video.videoHeight
});

// 预期输出:
// readyState: 4 (HAVE_ENOUGH_DATA)
// videoWidth: 640
// videoHeight: 480
```

**解决**:
- 检查其他应用是否占用摄像头
- 重启浏览器
- 检查摄像头驱动

---

### 问题5: 图谱没有响应手势
**原因**: 手势值未传递到GalaxyCanvas

**排查**:
```javascript
// 在GalaxyCanvas.tsx的handleGestureChange中添加:
console.log('handleGestureChange called:', openness);
console.log('Current camera distance:', camera.position.length());
console.log('Target distance:', targetDistance);
```

**预期输出**:
```
handleGestureChange called: 0.523
Current camera distance: 45.23
Target distance: 39.78
```

**解决**:
1. 检查useGestureStore连接是否正确
2. 验证onGestureChange回调是否传递
3. 确认controlsRef是否正确引用OrbitControls

---

## 📊 性能监控

### 帧率监控
```javascript
// 在Console输入:
let frameCount = 0;
let lastTime = Date.now();

setInterval(() => {
  const now = Date.now();
  const fps = frameCount / ((now - lastTime) / 1000);
  console.log('FPS:', fps.toFixed(1));
  frameCount = 0;
  lastTime = now;
}, 2000);

// 在processFrame中添加:
frameCount++;
```

**预期**: FPS应该在28-32之间

---

### CPU占用监控
```javascript
// Chrome DevTools → Performance面板
// 1. 点击Record
// 2. 操作手势10秒
// 3. 点击Stop

// 检查:
// - Main线程: <60%
// - Scripting时间: <40%
```

---

## 🔍 参数调优

### 调整手势灵敏度

**位置**: `src/hooks/useHandGesture.ts:22-23`

```typescript
// 当前值:
const MIN_DISTANCE = 0.10; // 握拳阈值
const MAX_DISTANCE = 0.40; // 张开阈值

// 如果握拳不容易识别，减小MIN_DISTANCE:
const MIN_DISTANCE = 0.08; // ← 更容易识别握拳

// 如果张开不容易识别，增大MAX_DISTANCE:
const MAX_DISTANCE = 0.45; // ← 更容易识别张开
```

---

### 调整缩放速度

**位置**: `src/components/galaxy/GalaxyCanvas.tsx:41`

```typescript
// 当前值:
const newDistance = currentDistance +
  (targetDistance - currentDistance) * 0.15;

// 更快响应:
* 0.3  // ← 响应速度翻倍

// 更平滑:
* 0.08 // ← 更慢但更平滑
```

---

### 调整平滑程度

**位置**: `src/hooks/useHandGesture.ts:14-15`

```typescript
// 当前值:
if (historyRef.current.length > 5) {

// 更平滑(更多历史帧):
> 8  // ← 更平滑但延迟更高

// 更快响应(更少历史帧):
> 3  // ← 延迟更低但可能抖动
```

---

## 🎯 推荐设置

### 标准设置(当前)
```typescript
MIN_DISTANCE = 0.10
MAX_DISTANCE = 0.40
LERP_FACTOR = 0.15
SMOOTH_FRAMES = 5
FPS_LIMIT = 30
```

### 高性能设置(低端设备)
```typescript
MIN_DISTANCE = 0.12
MAX_DISTANCE = 0.38
LERP_FACTOR = 0.20
SMOOTH_FRAMES = 3
FPS_LIMIT = 20  // 修改: if (now - lastTime < 50)
```

### 高精度设置(演示用)
```typescript
MIN_DISTANCE = 0.08
MAX_DISTANCE = 0.45
LERP_FACTOR = 0.10
SMOOTH_FRAMES = 8
FPS_LIMIT = 30
```

---

## 📝 常见问题FAQ

### Q1: 手势值一直在跳动
A: 增加`SMOOTH_FRAMES`到8，或降低光线变化

### Q2: 响应太慢
A: 增大`LERP_FACTOR`到0.25，减少`SMOOTH_FRAMES`到3

### Q3: 握拳和张开都识别为中间值
A: 扩大阈值范围，MIN减小到0.08，MAX增大到0.45

### Q4: 手部骨架绘制不准
A: 这是正常的，因为镜像翻转。可以在Canvas上也应用scaleX(-1)修复

### Q5: 摄像头自动关闭
A: 检查浏览器是否有节能模式，或者系统是否限制后台应用摄像头使用

---

## ✅ 验收标准

测试通过条件:
- [ ] Console日志完整，无error
- [ ] 握拳时手势值<15%
- [ ] 张开时手势值>85%
- [ ] 手势变化时3D图谱有响应
- [ ] FPS保持>25
- [ ] CPU占用<30%
- [ ] 摄像头持续开启不断流
- [ ] 手部骨架正常绘制

---

## 🚀 下一步

如果所有测试通过:
1. 移除调试日志(console.log)
2. 优化错误提示文案
3. 添加手势教程提示
4. 考虑添加手势校准功能

如果仍有问题:
1. 截图Console输出
2. 录制手势操作视频
3. 提供浏览器型号和版本
4. 分享Network面板的请求列表
