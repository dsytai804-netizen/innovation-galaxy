# 平移模式修复说明

## 🐛 问题

切换到平移模式后，左键拖拽仍然无法平移相机。

## 🔍 根本原因

Three.js OrbitControls的默认鼠标按键映射：
- **左键（LEFT）** → ROTATE（旋转）
- **右键（RIGHT）** → PAN（平移）
- **中键（MIDDLE）** → DOLLY（缩放）

即使设置了`enablePan={true}`和`enableRotate={false}`，OrbitControls默认仍然需要**右键**来触发平移操作。这对用户来说不直观，因为用户期望：
- 旋转模式：左键拖拽 = 旋转
- 平移模式：左键拖拽 = 平移

## ✅ 解决方案

使用`mouseButtons`属性重新映射鼠标按键，根据当前模式动态调整：

### 旋转模式（Rotation Mode）
```typescript
mouseButtons: {
  LEFT: THREE.MOUSE.ROTATE,   // 左键 = 旋转
  MIDDLE: THREE.MOUSE.DOLLY,  // 中键 = 缩放
  RIGHT: THREE.MOUSE.PAN,     // 右键 = 平移
}
```

### 平移模式（Pan Mode）
```typescript
mouseButtons: {
  LEFT: THREE.MOUSE.PAN,      // 左键 = 平移 ✅
  MIDDLE: THREE.MOUSE.DOLLY,  // 中键 = 缩放
  RIGHT: THREE.MOUSE.ROTATE,  // 右键 = 旋转
}
```

## 📝 代码修改

**文件**: `src/components/galaxy/GalaxyCanvas.tsx`

**改动**:
1. 导入Three.js以使用MOUSE常量:
   ```typescript
   import * as THREE from 'three';
   ```

2. 在OrbitControls中添加`mouseButtons`属性:
   ```typescript
   <OrbitControls
     enableDamping
     dampingFactor={0.05}
     rotateSpeed={0.6}
     zoomSpeed={1.0}
     enableRotate={controlMode === 'rotation'}
     enablePan={controlMode === 'pan'}
     panSpeed={1.0}
     // 关键修复：根据模式动态映射鼠标按键
     mouseButtons={
       controlMode === 'pan'
         ? {
             LEFT: THREE.MOUSE.PAN,      // 平移模式：左键平移
             MIDDLE: THREE.MOUSE.DOLLY,
             RIGHT: THREE.MOUSE.ROTATE,
           }
         : {
             LEFT: THREE.MOUSE.ROTATE,   // 旋转模式：左键旋转
             MIDDLE: THREE.MOUSE.DOLLY,
             RIGHT: THREE.MOUSE.PAN,
           }
     }
     minDistance={10}
     maxDistance={80}
     enableZoom={true}
     zoomToCursor={false}
   />
   ```

## 🧪 测试方法

### 旋转模式（默认）
1. 打开应用：http://localhost:5178/
2. Footer显示"拖拽旋转"
3. **左键拖拽** → 相机旋转 ✅
4. 滚轮缩放 → 正常工作 ✅
5. 单击/双击节点 → 正常工作 ✅

### 平移模式
1. 点击Footer的"切换平移"按钮
2. Footer更新为"拖拽平移"
3. **左键拖拽** → 相机平移（上下左右移动） ✅
4. 滚轮缩放 → 仍然工作 ✅
5. 单击/双击节点 → 仍然工作 ✅

### 切换测试
1. 多次点击切换按钮
2. 每次切换后拖拽行为应立即改变
3. 无需刷新页面

## 📊 MOUSE常量值

Three.js中的MOUSE枚举值：
```typescript
THREE.MOUSE = {
  ROTATE: 0,  // 旋转
  DOLLY: 1,   // 缩放（推拉）
  PAN: 2,     // 平移
}
```

## ✨ 用户体验改进

**修复前**:
- ❌ 平移模式需要右键拖拽（不直观）
- ❌ 左键在平移模式下无效
- ❌ 用户困惑为什么切换无效

**修复后**:
- ✅ 平移模式使用左键拖拽（符合直觉）
- ✅ 旋转模式使用左键拖拽（保持一致）
- ✅ 主要操作始终是左键，更符合用户习惯
- ✅ 与常见3D软件（Blender、Maya等）行为一致

## 🎯 关键要点

1. **`enablePan`和`enableRotate`** 只是启用/禁用功能，不改变鼠标映射
2. **`mouseButtons`** 才是控制哪个按键触发哪个操作的关键
3. 动态设置`mouseButtons`可以让左键始终执行当前模式的主要操作
4. 使用`THREE.MOUSE`常量比硬编码数字更清晰、更可维护

## 🔗 参考文档

- [Three.js OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [@react-three/drei OrbitControls](https://github.com/pmndrs/drei#controls)
- [Three.js MOUSE Constants](https://threejs.org/docs/#api/en/constants/Core)
