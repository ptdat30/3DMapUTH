---
name: glsl-shader-wizard
description: "TỰ ĐỘNG KÍCH HOẠT khi làm hiệu ứng hình ảnh đặc biệt, mặt nước, lửa, khói, phát sáng (Bloom), hạt (Particles), biến dạng bề mặt, viết code GLSL, Vertex/Fragment Shader hoặc Post-processing."
---

# GLSL Shader Wizard Skill

## 1. Tích hợp `shaderMaterial` của Drei vào R3F (Custom Shaders)

Sử dụng hàm `shaderMaterial` kết hợp với `extend` để định nghĩa Shader Component có thể dùng trực tiếp như một thẻ JSX.

```tsx
// src/components/shaders/HologramMaterial.tsx
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import React, { useRef } from 'react';

// Khởi tạo ShaderMaterial với Uniforms, Vertex & Fragment Shader
export const CustomHologramMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#00f2fe'),
    uResolution: new THREE.Vector2(1920, 1080),
  },
  // Vertex Shader
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Biến dạng sóng bề mặt (Wave displacement)
      vec3 pos = position;
      pos.y += sin(pos.x * 4.0 + uTime * 2.0) * 0.05;
      vPosition = pos;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Hàm tính Fresnel Rim Light
    float getFresnel(vec3 normal, vec3 viewDirection, float power) {
      return pow(1.0 - clamp(dot(normalize(normal), normalize(viewDirection)), 0.0, 1.0), power);
    }

    void main() {
      // 1. Tạo hiệu ứng quét Scanline
      float scanline = sin(vPosition.y * 30.0 - uTime * 6.0) * 0.5 + 0.5;
      scanline = smoothstep(0.2, 0.8, scanline);

      // 2. Hiệu ứng viền phát sáng Fresnel
      vec3 viewDirection = normalize(-vPosition);
      float fresnel = getFresnel(vNormal, viewDirection, 2.5);

      // 3. Phối trộn màu cuối
      vec3 finalColor = uColor * (scanline * 0.6 + fresnel * 1.4);
      float alpha = clamp(fresnel + scanline * 0.4, 0.2, 0.95);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

// Mở rộng JSX catalog của React Three Fiber
extend({ CustomHologramMaterial });

// Định nghĩa kiểu TypeScript cho thẻ JSX
declare global {
  namespace ReactThreeFiber {
    interface IntrinsicElements {
      customHologramMaterial: any;
    }
  }
}

// Component sử dụng trong Scene
export function HologramMesh() {
  const materialRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
  });

  return (
    <mesh position={[0, 1, 0]}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <customHologramMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

## 2. Các hàm thuật toán GLSL phổ biến (Essential Math Functions)

### A. Simplex Noise (2D/3D Procedural Noise)
```glsl
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
```

## 3. Cấu hình Post-processing (Bloom & Selective Glow) Tối ưu GPU

Để tạo hiệu ứng phát sáng neon / cyberpunk cho các đường path chỉ đường:

```tsx
// src/components/canvas/PostProcessingPipeline.tsx
'use client';

import React from 'react';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function OptimizedPostProcessing() {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.85} // Chỉ vật thể có emissive > 0.85 mới phát sáng
        luminanceSmoothing={0.3}
        mipmapBlur // Tối ưu GPU: làm mờ đa cấp độ, tránh giật lag
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
```

