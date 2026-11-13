---
name: web-3d-motion-director
description: "TỰ ĐỘNG KÍCH HOẠT khi làm hiệu ứng cuộn trang (scroll animation), chuyển góc máy camera 3D mượt mà, kết hợp giao diện HTML với cảnh 3D bằng GSAP, ScrollTrigger, Framer Motion hoặc Theatre.js."
---

# Web 3D Motion Director Skill

Kỹ năng điều hướng camera, đồng bộ hoạt ảnh cuộn trang (Scroll-driven 3D Animation), phân tầng giao diện HTML/WebGL và điều phối hoạt họa chuyển cảnh mượt mà giữa 3D Canvas và Web UI.

---

## 1. Kiến trúc Phân tầng Giao diện (Layering & Pointer-Events Isolation)

Một lỗi phổ biến khiến người dùng không thể xoay/zoom Canvas hoặc không thể bấm nút HTML là do cấu hình sai CSS `pointer-events` và `z-index`.

### Quy tắc Vàng về Lớp phủ:
1. **Lớp Canvas 3D (Background / Base):** Đặt ở lớp dưới hoặc cùng cấp, nhận toàn bộ tương tác con trỏ (`pointer-events-auto`).
2. **Lớp Container UI/HUD (Overlay):** Phủ toàn màn hình (`fixed inset-0 z-10`), nhưng **BẮT BUỘC** phải có `pointer-events-none` để các sự kiện click/drag xuyên qua đến Canvas 3D bên dưới.
3. **Các Thành phần Tương tác (Buttons, Cards, Inputs, Modals):** Bên trong Container UI, phải gắn tường minh `pointer-events-auto` để nhận click, focus và scroll.

```tsx
// src/components/layout/SceneLayout.tsx
'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ZoomIn, Layers } from 'lucide-react';

interface SceneLayoutProps {
  children: React.ReactNode;
  activeBuildingTitle?: string;
  onResetCamera?: () => void;
}

export function SceneLayout({ children, activeBuildingTitle, onResetCamera }: SceneLayoutProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* LỚP 1: 3D Canvas - Tiếp nhận toàn bộ OrbitControls & Raycaster clicks */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 25, 45], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          {children}
        </Canvas>
      </div>

      {/* LỚP 2: Container HUD Overlay - pointer-events-none để không chặn chuột vào Canvas */}
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between">
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2.5 shadow-xl">
            <h1 className="text-white font-semibold text-lg flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" strokeWidth={1.5} />
              Bản Đồ 3D Tương Tác UTH
            </h1>
          </div>

          {/* Action Controls */}
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-1.5 shadow-xl">
            <button
              onClick={onResetCamera}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Khôi phục góc nhìn"
            >
              <ZoomIn className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bật/Tắt Layer"
            >
              <Layers className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Bottom Info Floating Card với Framer Motion */}
        <footer className="w-full flex justify-center">
          <AnimatePresence mode="wait">
            {activeBuildingTitle && (
              <motion.div
                key={activeBuildingTitle}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto bg-slate-900/90 backdrop-blur-lg border border-indigo-500/30 rounded-2xl p-5 shadow-2xl max-w-md w-full"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                      Thông Tin Tòa Nhà
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{activeBuildingTitle}</h2>
                  </div>
                  <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
                    Chi tiết
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </div>
  );
}
```

---

## 2. Hoạt Ảnh Cuộn Trang Đồng Bộ 3D bằng Drei `<ScrollControls>`

Sử dụng `@react-three/drei` `<ScrollControls>` và hook `useScroll` là cách mượt mà và tối ưu nhất trong R3F vì toàn bộ tiến trình cuộn được tính toán trực tiếp bên trong render loop của Three.js (tránh de-sync DOM).

```tsx
// src/components/canvas/ScrollDrivenCamera.tsx
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

// 1. Module-level static vectors để loại bỏ hoàn toàn cấp phát bộ nhớ trong useFrame
const TARGET_POS = new THREE.Vector3();
const LOOK_AT = new THREE.Vector3();

// 2. Điểm mốc camera theo tiến trình cuộn (0.0 -> 1.0)
const WAYPOINTS = [
  { scroll: 0.0, pos: [0, 15, 35], target: [0, 0, 0] },       // Điểm khởi đầu: Toàn cảnh
  { scroll: 0.33, pos: [-12, 6, 15], target: [-10, 2, 0] },   // Điểm 1: Tòa H
  { scroll: 0.66, pos: [14, 8, 12], target: [12, 1, -5] },    // Điểm 2: Tòa K & Nhà thi đấu
  { scroll: 1.0, pos: [0, 25, 5], target: [0, 0, -10] },       // Điểm 3: Góc nhìn chim bay (Bird's eye)
];

function CameraRig() {
  const scroll = useScroll(); // scroll.offset nhận giá trị từ 0 đến 1

  useFrame((state, delta) => {
    const offset = scroll.offset;

    // Tìm 2 mốc waypoint lân cận để lerp
    let p1 = WAYPOINTS[0];
    let p2 = WAYPOINTS[1];

    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      if (offset >= WAYPOINTS[i].scroll && offset <= WAYPOINTS[i + 1].scroll) {
        p1 = WAYPOINTS[i];
        p2 = WAYPOINTS[i + 1];
        break;
      }
    }

    // Tỉ lệ tiến trình giữa 2 mốc
    const range = p2.scroll - p1.scroll || 1;
    const localT = Math.min(Math.max((offset - p1.scroll) / range, 0), 1);

    // Tính vị trí mục tiêu
    TARGET_POS.set(
      THREE.MathUtils.lerp(p1.pos[0], p2.pos[0], localT),
      THREE.MathUtils.lerp(p1.pos[1], p2.pos[1], localT),
      THREE.MathUtils.lerp(p1.pos[2], p2.pos[2], localT)
    );

    LOOK_AT.set(
      THREE.MathUtils.lerp(p1.target[0], p2.target[0], localT),
      THREE.MathUtils.lerp(p1.target[1], p2.target[1], localT),
      THREE.MathUtils.lerp(p1.target[2], p2.target[2], localT)
    );

    // Làm mượt chuyển động camera với delta lerp (damped)
    state.camera.position.damp3(TARGET_POS, 0.25, delta);
    state.camera.lookAt(LOOK_AT);
  });

  return null;
}

export function ScrollExperience() {
  return (
    <ScrollControls pages={4} damping={0.2} distance={1}>
      <CameraRig />
      {/* Nội dung 3D */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 15]} intensity={1.2} />
    </ScrollControls>
  );
}
```

---

## 3. Chuyển Động Camera Mượt Mà Bằng GSAP & ScrollTrigger

Khi cần timeline cuộn trang tích hợp chặt chẽ với các animation phức tạp của trang web thương mại, dùng GSAP với Three.js Object:

```tsx
// src/components/canvas/GsapCameraDirector.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function setupGsapCameraTimeline(
  camera: THREE.PerspectiveCamera,
  triggerElement: HTMLElement,
  targetLookAt: THREE.Vector3
) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2, // Chống giật khung hình
    },
    onUpdate: () => {
      camera.lookAt(targetLookAt);
    },
  });

  tl.to(camera.position, {
    x: -8,
    y: 10,
    z: 20,
    ease: 'power2.inOut',
  })
  .to(targetLookAt, {
    x: -5,
    y: 2,
    z: 0,
    ease: 'power2.inOut',
  }, '<') // Chạy song song
  .to(camera.position, {
    x: 12,
    y: 15,
    z: 18,
    ease: 'power2.inOut',
  });

  return () => {
    tl.kill();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}
```

---

## 4. Tương Tác Hover 3D + Tooltip HTML Nổi (Drei `<Html>` Component)

Gắn tooltip HTML trực tiếp lên điểm neo (anchor) trong không gian 3D với hiệu ứng co giãn tự nhiên:

```tsx
// src/components/canvas/InteractiveMarker.tsx
import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface MarkerProps {
  position: [number, number, number];
  name: string;
  onClick?: () => void;
}

export function InteractiveMarker({ position, name, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* 3D Invisible Hitbox để bắt chuột chuẩn xác */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML Pin Label cố định tọa độ trong Scene */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={20} // Tự thu nhỏ theo độ sâu khoảng cách camera
        zIndexRange={[100, 0]}
      >
        <motion.div
          animate={{ scale: hovered ? 1.15 : 1.0, y: hovered ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="cursor-pointer select-none bg-slate-900/90 border border-indigo-500/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap hover:bg-indigo-600 transition-colors"
          onClick={onClick}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {name}
        </motion.div>
      </Html>
    </group>
  );
}
```

---

## 5. Checklist Tối Ưu UX Chuyển Động (UX Motion Checklist)
- [ ] Mọi overlay DOM đều có `pointer-events-none` và con interactive có `pointer-events-auto`.
- [ ] `useScroll` hoặc GSAP scrub luôn sử dụng damping (0.2s - 1.2s) để tránh micro-stuttering khi người dùng lăn chuột ngắt quãng.
- [ ] Dùng `camera.position.damp3` hoặc lerp dựa trên `delta` trong `useFrame` thay vì giá trị cố định để bảo đảm tốc độ đồng nhất trên màn hình 60Hz, 120Hz hay 144Hz.
- [ ] Tắt render các HTML Marker (`<Html>`) khi đối tượng nằm quá xa hoặc khuất sau camera để tiết kiệm DOM rendering.

