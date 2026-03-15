# 触控板缩放修复说明

## 🐛 问题

苹果触控板的双指缩放功能失效了，之前可以正常工作。

## 🔍 根本原因

当我们添加了`mouseButtons`配置后，OrbitControls使用了自定义的鼠标按键映射。但是触控板的手势（如双指缩放）是通过**触摸事件**而不是鼠标事件处理的。

Three.js OrbitControls有两套独立的输入系统：
1. **`mouseButtons`** - 鼠标按键映射（鼠标左键、右键、中键）
2. **`touches`** - 触摸手势映射（单指、双指、三指等）

当我们只设置了`mouseButtons`但没有设置`touches`时，OrbitControls会使用**默认的触摸配置**，但这可能与我们的鼠标配置不一致，导致触控板缩放失效。

## ✅ 解决方案

显式配置`touches`属性，确保触控板的双指手势正确映射到缩放操作。

### 旋转模式（Rotation Mode）
```typescript
touches: {
  ONE: THREE.TOUCH.ROTATE,      // 单指滑动 = 旋转
  TWO: THREE.TOUCH.DOLLY_PAN,   // 双指缩放 = 缩放+平移
}
```

### 平移模式（Pan Mode）
```typescript
touches: {
  ONE: THREE.TOUCH.PAN,         // 单指滑动 = 平移
  TWO: THREE.TOUCH.DOLLY_PAN,   // 双指缩放 = 缩放+平移
}
```

**关键**：`THREE.TOUCH.DOLLY_PAN`同时支持：
- 双指捏合/扩张 → 缩放（zoom in/out）
- 双指平移 → 平移相机

## 📝 代码修改

**文件**: `src/components/galaxy/GalaxyCanvas.tsx`

在OrbitControls中添加`touches`属性：

```typescript
<OrbitControls
  enableDamping
  dampingFactor={0.05}
  rotateSpeed={0.6}
  zoomSpeed={1.0}
  enableRotate={controlMode === 'rotation'}
  enablePan={controlMode === 'pan'}
  panSpeed={1.0}
  // 鼠标按键映射
  mouseButtons={
    controlMode === 'pan'
      ? {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }
      : {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }
  }
  // 🆕 触摸手势映射（触控板支持）
  touches={
    controlMode === 'pan'
      ? {
          ONE: THREE.TOUCH.PAN,         // 单指 = 平移
          TWO: THREE.TOUCH.DOLLY_PAN,   // 双指 = 缩放+平移
        }
      : {
          ONE: THREE.TOUCH.ROTATE,      // 单指 = 旋转
          TWO: THREE.TOUCH.DOLLY_PAN,   // 双指 = 缩放+平移
        }
  }
  minDistance={10}
  maxDistance={80}
  enableZoom={true}
  zoomToCursor={false}
/>
```

## 🧪 测试方法（苹果触控板）

### 旋转模式
1. **单指滑动** → 相机旋转 ✅
2. **双指捏合/扩张** → 相机缩放 ✅（修复后应该工作）
3. **双指平移** → 相机平移 ✅
4. **鼠标左键拖拽** → 相机旋转 ✅

### 平移模式
1. 点击"切换平移"按钮
2. **单指滑动** → 相机平移 ✅
3. **双指捏合/扩张** → 相机缩放 ✅（修复后应该工作）
4. **双指平移** → 相机平移 ✅
5. **鼠标左键拖拽** → 相机平移 ✅

### 滚轮鼠标测试（如果有外接鼠标）
1. **滚轮滚动** → 相机缩放 ✅（应该在两种模式下都工作）

## 📊 TOUCH常量值

Three.js中的TOUCH枚举：
```typescript
THREE.TOUCH = {
  ROTATE: 0,           // 旋转（单指滑动）
  PAN: 1,              // 平移（单指滑动）
  DOLLY_PAN: 2,        // 缩放+平移（双指）
  DOLLY_ROTATE: 3,     // 缩放+旋转（双指）
}
```

## 🍎 苹果触控板手势映射

| 手势 | 浏览器事件 | OrbitControls处理 |
|------|-----------|------------------|
| 单指滑动 | touchmove (1 touch) | ONE → ROTATE 或 PAN |
| 双指捏合/扩张 | touchmove (2 touches) + 距离变化 | TWO → DOLLY (缩放) |
| 双指平移 | touchmove (2 touches) + 平行移动 | TWO → PAN (平移) |
| 滚轮滚动 | wheel event | enableZoom → DOLLY (缩放) |

**注意**：`DOLLY_PAN`会同时检测双指的距离变化（缩放）和位置平移，所以既支持捏合缩放，也支持双指平移。

## ✨ 用户体验

**修复前**:
- ❌ 触控板双指缩放失效
- ❌ 只能用鼠标滚轮缩放（如果有外接鼠标）
- ❌ 触控板用户体验很差

**修复后**:
- ✅ 触控板双指捏合/扩张 = 缩放（与系统手势一致）
- ✅ 触控板双指平移 = 平移相机
- ✅ 触控板单指滑动根据模式切换（旋转/平移）
- ✅ 外接鼠标滚轮缩放仍然正常工作
- ✅ 完整支持苹果触控板的多点触控手势

## 🎯 关键要点

1. **`mouseButtons`** 控制鼠标按键（左键、右键、中键）
2. **`touches`** 控制触摸手势（单指、双指、三指）
3. **苹果触控板使用触摸事件**，不是鼠标事件
4. **必须同时配置两者**才能支持触控板+鼠标混合使用
5. `DOLLY_PAN`是双指手势的最佳选择，同时支持缩放和平移

## 🔗 相关链接

- [Three.js OrbitControls - touches](https://threejs.org/docs/#examples/en/controls/OrbitControls.touches)
- [Three.js TOUCH Constants](https://threejs.org/docs/#api/en/constants/Core)
- [MacBook 触控板手势](https://support.apple.com/zh-cn/guide/mac-help/mh35719/mac)

## 📝 测试清单

- [ ] 旋转模式：触控板双指缩放 ✅
- [ ] 平移模式：触控板双指缩放 ✅
- [ ] 旋转模式：触控板单指旋转 ✅
- [ ] 平移模式：触控板单指平移 ✅
- [ ] 鼠标滚轮缩放（两种模式） ✅
- [ ] 鼠标左键拖拽（旋转/平移切换） ✅
- [ ] 切换模式时立即生效 ✅
