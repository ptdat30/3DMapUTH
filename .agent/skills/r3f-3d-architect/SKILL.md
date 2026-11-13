---
name: r3f-3d-architect
description: "TỰ ĐỘNG KÍCH HOẠT khi dựng cảnh 3D trên web, tích hợp file .glb/.gltf vào React/Next.js, cấu hình Three.js, @react-three/fiber, @react-three/drei, ánh sáng, camera, hoặc vật lý 3D (Rapier)."
---

# React Three Fiber (R3F) 3D Architect Skill

## 1. Quy trình Chuyển đổi Model .glb sang JSX Component
Sử dụng công cụ `gltfjsx` để tạo mã nguồn TypeScript chuẩn, tự động nén Draco và tối ưu hóa mesh:

```bash
npx gltfjsx public/models/cs3/building.glb --transform --types --output src/components/canvas/Building.tsx
```

Lệnh trên tự động:
- Trích xuất mesh và vật liệu thành các biến có kiểu dữ liệu TypeScript chính xác.
- Tạo mã tự động tái sử dụng bộ nhớ đệm (preload) qua `useGLTF.preload(url)`.

## 2. Quy tắc Bắt buộc Đạt 60 FPS (Performance Rules)
1. **CẤM gọi React `setState` trong `useFrame`:**
   Mỗi lần `setState` sẽ kích hoạt Virtual DOM re-render toàn bộ component, làm rớt FPS từ 60 xuống dưới 15. Hãy mutate trực tiếp thuộc tính Three.js qua `ref.current`.
2. **CẤM cấp phát bộ nhớ (Zero Allocation) trong `useFrame`:**
   Không bao giờ viết `new THREE.Vector3()`, `new THREE.Color()`, hoặc `new THREE.Matrix4()` trong vòng lặp tick. Hãy khai báo biến tĩnh (static vector) ở cấp module hoặc dùng `useMemo`.
3. **InstancedMesh cho đối tượng lặp lại:**
   Khi hiển thị hàng trăm đối tượng cùng hình học (cây cối, cột mốc, rào chắn), luôn dùng `instancedMesh` hoặc `@react-three/drei` `<Instances>` để gộp toàn bộ thành 1 draw call duy nhất.
4. **Giải phóng tài nguyên (Resource Disposing):**
   Luôn giải phóng geometries và materials khi unmount hoặc đổi scene.
5. **Frustum Culling & Shadow Suppression:**
   - Gán `child.frustumCulled = true` để Three.js bỏ qua các đối tượng ngoài góc nhìn camera.
   - Tắt `receiveShadow` và `castShadow` trên các đối tượng phẳng/tĩnh (đường đi, nền, bãi xe).

## 3. Cấu trúc Canvas Chuẩn & Màn hình chờ Loading

```tsx
// src/components/canvas/StandardCanvas.tsx
'use client';

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useProgress,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';

// 1. Loading Overlay Screen
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center zIndexRange={[200, 0]}>
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-900/90 px-6 py-4 text-white shadow-2xl backdrop-blur-md border border-white/10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        <p className="text-xs font-semibold tracking-wider">{Math.round(progress)}% LOADING 3D SCENE</p>
      </div>
    </Html>
  );
}

// 2. High-Performance Rotating Mesh Example (Zero Allocation)
const DUMMY_ROTATION = new THREE.Euler();

function PerformanceObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Mutate trực tiếp, không setState
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// 3. Main Scene Container
export function Standard3DScene() {
  return (
    <div className="relative h-full w-full select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 20, 20], fov: 40, near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <color attach="background" args={['#0f172a']} />
        
        {/* Ánh sáng kiến trúc */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[25, 40, 20]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        <Suspense fallback={<CanvasLoader />}>
          <Environment preset="city" />
          <PerformanceObject />
          
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.6}
            scale={40}
            blur={1.5}
            far={10}
            resolution={512}
            color="#000000"
          />
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
```

