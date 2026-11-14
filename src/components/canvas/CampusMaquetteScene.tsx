'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, useGLTF } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useNavigationStore } from '@/store/useNavigationStore';
import { GlowingArrowPath } from './GlowingArrowPath';
import { CameraRig } from './CameraRig';
import { CADBuildingModel } from './CADBuildingModel';
import {
  CS1_BUILDINGS_LAYOUT,
  CS1_PARKINGS_LAYOUT,
  CS1BuildingConfig,
} from '@/data/cs1Layout';

// Preload 3D models for instant, stutter-free display
useGLTF.preload('/models/cs1/toa_b.glb');
useGLTF.preload('/models/cs1/toa_c.glb');
useGLTF.preload('/models/cs1/toa_d.glb');
useGLTF.preload('/models/cs1/toa_f.glb');

// ============================================================================
// SHARED MATERIALS (Clay Maquette Style - Pure Performance & Elegance)
// ============================================================================
function useMaquetteMaterials() {
  return useMemo(() => {
    return {
      clayWhite: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.72,
        metalness: 0.05,
      }),
      clayDarker: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.8,
        metalness: 0.05,
      }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.35,
        metalness: 0.15,
      }),
      parkingRed: new THREE.MeshStandardMaterial({
        color: '#818183',
        roughness: 0.6,
        metalness: 0.05,
      }),
      parkingMarking: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.5,
      }),
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.85,
      }),
      walkwayPavement: new THREE.MeshStandardMaterial({
        color: '#f1f5f9',
        roughness: 0.75,
      }),
    };
  }, []);
}

// ============================================================================
// 1. TÒA A (KHỐI DUY NHẤT - TRUNG TÂM HIỆU BỘ & ĐÀO TẠO MẶT TIỀN)
// ============================================================================
function BuildingA({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  const width = config.plotSize[0]; // 35.6m
  const depth = config.plotSize[1]; // 8.3m
  const height = config.height; // 8.5m

  return (
    <group position={config.position}>
      {/* Khối nhà chính Tòa A liền lạc duy nhất (35.6m x 8.5m x 8.3m) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={materials.clayWhite}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Mái che viền (Roof Parapet) bao quanh toàn bộ khối Tòa A */}
      <mesh position={[0, height / 2 + 0.12, 0]} material={materials.clayDarker}>
        <boxGeometry args={[width + 0.4, 0.25, depth + 0.4]} />
      </mesh>

      {/* Dãy cửa sổ mặt trước & mặt sau chạy dài toàn diện */}
      {[-2.0, 0.5, 2.8].map((y, idx) => (
        <group key={`win-a-${idx}`}>
          <mesh position={[0, y, -depth / 2 - 0.04]} material={materials.windowGlass}>
            <boxGeometry args={[width - 3.0, 1.1, 0.08]} />
          </mesh>
          <mesh position={[0, y, depth / 2 + 0.04]} material={materials.windowGlass}>
            <boxGeometry args={[width - 3.0, 1.1, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Sảnh chính đón khách bề thế ở trung tâm mặt trước */}
      <group position={[0, -2.6, depth / 2 + 0.8]}>
        <mesh position={[0, 1.5, 0]} castShadow material={materials.clayDarker}>
          <boxGeometry args={[7.2, 0.25, 2.2]} />
        </mesh>
        {[-3.0, -1.0, 1.0, 3.0].map((cx) => (
          <mesh key={`col-a-${cx}`} position={[cx, 0.75, 0.8]} material={materials.clayWhite}>
            <cylinderGeometry args={[0.09, 0.09, 1.5, 8]} />
          </mesh>
        ))}
      </group>

      {/* Nhãn 3D Tòa A */}
      <Html position={[0, config.heightOffset - 4.25, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
        <div className="px-4 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-lg border border-slate-200/90 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer">
          {config.shortName}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 2. TÒA B (MODEL 3D .GLB THỰC TẾ)
// ============================================================================
function BuildingB({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  const proceduralFallback = (
    <group>
      <mesh position={[-17.8, 4.75, -8.7]} material={materials.clayWhite}>
        <boxGeometry args={[24.7, 9.5, 8.4]} />
      </mesh>
      <mesh position={[-26.0, 4.75, 8.1]} material={materials.clayWhite}>
        <boxGeometry args={[8.3, 9.5, 42.0]} />
      </mesh>
    </group>
  );

  return (
    <CADBuildingModel
      modelUrl={config.modelUrl || '/models/cs1/toa_b.glb'}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
      buildingCode={config.code}
      buildingName={config.name}
      heightOffset={config.heightOffset}
      fallback={proceduralFallback}
    />
  );
}

// ============================================================================
// 3. TÒA C (MODEL 3D .GLB THỰC TẾ)
// ============================================================================
function BuildingC({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  const proceduralFallback = (
    <group>
      <mesh position={[8.7, 4.25, -8.7]} material={materials.clayWhite}>
        <boxGeometry args={[22.3, 8.5, 8.4]} />
      </mesh>
      <mesh position={[15.7, 4.25, 2.3]} material={materials.clayWhite}>
        <boxGeometry args={[8.3, 8.5, 13.8]} />
      </mesh>
    </group>
  );

  return (
    <CADBuildingModel
      modelUrl={config.modelUrl || '/models/cs1/toa_c.glb'}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
      buildingCode={config.code}
      buildingName={config.name}
      heightOffset={config.heightOffset}
      fallback={proceduralFallback}
    />
  );
}

// ============================================================================
// 4. TÒA F (MODEL 3D .GLB THỰC TẾ)
// ============================================================================
function BuildingF({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  const proceduralFallback = (
    <mesh position={config.position} material={materials.clayWhite}>
      <boxGeometry args={[20.5, 7.0, 8.3]} />
    </mesh>
  );

  return (
    <CADBuildingModel
      modelUrl={config.modelUrl || '/models/cs1/toa_f.glb'}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
      buildingCode={config.code}
      buildingName={config.name}
      heightOffset={config.heightOffset}
      fallback={proceduralFallback}
    />
  );
}

// ============================================================================
// 5. TÒA D (MODEL 3D .GLB THỰC TẾ)
// ============================================================================
function BuildingD({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  const proceduralFallback = (
    <group position={config.position}>
      <mesh castShadow receiveShadow material={materials.clayWhite}>
        <boxGeometry args={[9.6, 8.0, 15.3]} />
      </mesh>
      <mesh position={[0, 4.1, 0]} material={materials.clayDarker}>
        <boxGeometry args={[9.9, 0.25, 15.6]} />
      </mesh>
    </group>
  );

  return (
    <CADBuildingModel
      modelUrl={config.modelUrl || '/models/cs1/toa_d.glb'}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
      buildingCode={config.code}
      buildingName={config.name}
      heightOffset={config.heightOffset}
      fallback={proceduralFallback}
    />
  );
}

// ============================================================================
// 6. TÒA E (KHỐI NHÀ DỌC PHÍA ĐÔNG - PROCEDURAL)
// ============================================================================
function BuildingE({
  config,
  materials,
}: {
  config: CS1BuildingConfig;
  materials: ReturnType<typeof useMaquetteMaterials>;
}) {
  return (
    <group position={config.position}>
      <mesh castShadow receiveShadow material={materials.clayWhite}>
        <boxGeometry args={[8.3, 8.5, 28.9]} />
      </mesh>
      <mesh position={[0, 4.35, 0]} material={materials.clayDarker}>
        <boxGeometry args={[8.6, 0.25, 29.2]} />
      </mesh>
      {[-1.8, 0.8, 2.8].map((y, idx) => (
        <mesh key={`win-e-${idx}`} position={[-4.2, y, 0]} material={materials.windowGlass}>
          <boxGeometry args={[0.08, 1.0, 26.0]} />
        </mesh>
      ))}

      {/* Nhãn 3D Tòa E */}
      <Html position={[0, config.heightOffset - 4.25, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div className="px-3.5 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-md border border-slate-200/90 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer">
          {config.shortName}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 7. CÁC KHU VỰC BÃI ĐỖ XE (BÃI XE TRUNG TÂM, MẶT TIỀN & NHÀ XE)
// ============================================================================
function ParkingZones({ materials }: { materials: ReturnType<typeof useMaquetteMaterials> }) {
  const central = CS1_PARKINGS_LAYOUT[0];
  const front = CS1_PARKINGS_LAYOUT[1];
  const southwest = CS1_PARKINGS_LAYOUT[2];

  return (
    <group>
      {/* 1. Bãi xe trung tâm lớn (Sân trường chính) */}
      <group position={central.position}>
        <mesh receiveShadow material={materials.parkingRed}>
          <boxGeometry args={[central.size[0], 0.08, central.size[1]]} />
        </mesh>
        {/* 1. Comment khối này để mất khung viền ngoài & 2 đường chéo */}
        {/*<mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[central.size[0] + 0.3, 0.02, central.size[1] + 0.3]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>*/}
        {/* 2. Comment vòng lặp này để mất 5 vạch kẻ dọc */}
        {/*{[-10, -5, 0, 5, 10].map((x) => (
          <mesh key={`pk-line-${x}`} position={[x, 0.05, 0]} material={materials.parkingMarking}>
            <boxGeometry args={[0.15, 0.02, central.size[1] - 4]} />
          </mesh>
        ))}*/}

        {/* Nhãn BÃI XE trung tâm */}
        <Html position={[0, 0.2, 0]} center distanceFactor={26} zIndexRange={[90, 0]}>
          <div className="px-3 py-1 rounded-md bg-red-600/90 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-md pointer-events-none select-none">
            BÃI XE
          </div>
        </Html>
      </group>

      {/* 2. Bãi xe mặt tiền cổng chính */}
      <group position={front.position}>
        <mesh receiveShadow material={materials.parkingRed}>
          <boxGeometry args={[front.size[0], 0.08, front.size[1]]} />
        </mesh>
        <Html position={[0, 0.2, 0]} center distanceFactor={26} zIndexRange={[90, 0]}>
          <div className="px-2.5 py-0.5 rounded bg-red-600/90 text-white font-bold text-[10px] tracking-wider uppercase shadow pointer-events-none select-none">
            BÃI XE
          </div>
        </Html>
      </group>

      {/* 3. Nhà xe cán bộ góc Tây Nam */}
      <group position={southwest.position}>
        <mesh receiveShadow material={materials.parkingRed}>
          <boxGeometry args={[southwest.size[0], 0.08, southwest.size[1]]} />
        </mesh>
        <mesh position={[0, 1.8, 0]} material={materials.clayDarker}>
          <boxGeometry args={[southwest.size[0] + 0.4, 0.15, southwest.size[1] + 0.4]} />
        </mesh>
        <Html position={[0, 2.2, 0]} center distanceFactor={26} zIndexRange={[90, 0]}>
          <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-bold text-[9px] uppercase shadow pointer-events-none select-none">
            NHÀ XE
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// 8. CỔNG CHÍNH VÕ OANH, TƯỜNG RÀO & ĐƯỜNG NỘI BỘ
// ============================================================================
function PerimeterAndGate({ materials }: { materials: ReturnType<typeof useMaquetteMaterials> }) {
  return (
    <group>
      {/* Tường rào mặt tiền phía Nam (Z = 28.5) */}
      <mesh position={[-16, 1.0, 28.5]} castShadow material={materials.clayWhite}>
        <boxGeometry args={[26, 2.0, 0.3]} />
      </mesh>
      <mesh position={[18, 1.0, 28.5]} castShadow material={materials.clayWhite}>
        <boxGeometry args={[22, 2.0, 0.3]} />
      </mesh>

      {/* Cột Cổng Chính (Lối vào rộng 6m tại X = 0, Z = 28.5) */}
      <mesh position={[-3.2, 1.6, 28.5]} castShadow material={materials.clayDarker}>
        <boxGeometry args={[0.7, 3.2, 0.7]} />
      </mesh>
      <mesh position={[3.2, 1.6, 28.5]} castShadow material={materials.clayDarker}>
        <boxGeometry args={[0.7, 3.2, 0.7]} />
      </mesh>

      {/* Bảng tên trường trên cổng */}
      <mesh position={[0, 3.3, 28.5]} material={materials.clayDarker}>
        <boxGeometry args={[7.2, 0.5, 0.35]} />
      </mesh>

      {/* Trục đường nhựa đi từ Cổng chính vào sân trường */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 21.0]} receiveShadow material={materials.roadAsphalt}>
        <planeGeometry args={[6.5, 16.0]} />
      </mesh>

      {/* Hành lang thông giữa Tòa B và Tòa C dẫn ra Tòa D (X = -0.5, Z = -13.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.02, -13.0]} receiveShadow material={materials.walkwayPavement}>
        <planeGeometry args={[4.5, 12.0]} />
      </mesh>

      {/* Hành lang Đông giữa Tòa C / Tòa A và Tòa E (X = 21.0, Z = 14.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[21.0, 0.02, 14.0]} receiveShadow material={materials.walkwayPavement}>
        <planeGeometry args={[2.5, 26.0]} />
      </mesh>
    </group>
  );
}

// ============================================================================
// MAIN CAMPUS MAQUETTE SCENE (CƠ SỞ 1)
// ============================================================================
export function CampusMaquetteScene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const materials = useMaquetteMaterials();

  const activeSteps = useNavigationStore((state) => state.activeSteps);
  const currentStepIndex = useNavigationStore((state) => state.currentStepIndex);
  const currentStep = activeSteps[currentStepIndex];

  // Tuyến đường mặc định từ QR Cổng Chính [0, 0.2, 28.0] đến Sảnh Tòa B [-17.8, 0.2, -4.5]
  const arrowStart: [number, number, number] = [0, 0.2, 28.0];
  const arrowEnd: [number, number, number] = [-17.8, 0.2, -4.5];

  // Ánh xạ 6 tòa nhà từ cs1Layout.ts
  const bldA = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_a')!;
  const bldB = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_b')!;
  const bldC = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_c')!;
  const bldD = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_d')!;
  const bldF = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_f')!;
  const bldE = CS1_BUILDINGS_LAYOUT.find((b) => b.code === 'toa_e')!;

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        camera={{
          position: [32, 42, 38],
          fov: 34,
          near: 0.1,
          far: 250,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        {/* Màu nền trời dịu mắt */}
        <color attach="background" args={['#eef2f6']} />

        {/* Hệ thống chiếu sáng Maquette Chuẩn */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <hemisphereLight args={['#ffffff', '#cbd5e1', 0.65]} />
        <directionalLight
          position={[40, 55, 35]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={160}
          shadow-camera-left={-38}
          shadow-camera-right={38}
          shadow-camera-top={38}
          shadow-camera-bottom={-38}
        />

        {/* GSAP Camera Rig */}
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={12}
          maxDistance={90}
          target={[0, 2, 4]}
        />

        {/* Nền khuôn viên tổng thể */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[140, 140]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>

        {/* Sân nền chính của cơ sở 1 (Rộng 68m x Sâu 64m) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 3.0]} receiveShadow>
          <planeGeometry args={[68, 64]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>

        {/* ================================================================ */}
        {/* 6 TÒA NHÀ KIẾN TRÚC CS1 (TÒA B, C, F LÀ MODEL 3D THỰC TẾ)        */}
        {/* ================================================================ */}
        <BuildingA config={bldA} materials={materials} />
        <BuildingB config={bldB} materials={materials} />
        <BuildingC config={bldC} materials={materials} />
        <BuildingD config={bldD} materials={materials} />
        <BuildingF config={bldF} materials={materials} />
        <BuildingE config={bldE} materials={materials} />

        {/* 3 KHU VỰC BÃI XE & NHÀ XE */}
        <ParkingZones materials={materials} />

        {/* CỔNG CHÍNH VÕ OANH, TƯỜNG RÀO & ĐƯỜNG NỘI BỘ */}
        <PerimeterAndGate materials={materials} />

        {/* ================================================================ */}
        {/* ĐƯỜNG ĐỊNH TUYẾN DẪN ĐƯỜNG 3D & GHIM QR CỔNG CHÍNH               */}
        {/* ================================================================ */}
        <GlowingArrowPath
          start={arrowStart}
          end={arrowEnd}
          points={currentStep?.pathPoints}
        />

        {/* QR Cổng Chính 3D Pin (Tại mặt tiền đường Võ Oanh) */}
        <group position={[0, 0.2, 28.0]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.36, 0.7, 16]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 1.4, 0.3]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          <Html position={[0, 0.1, 1.4]} center distanceFactor={28} zIndexRange={[100, 0]}>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-lg border border-slate-200/90 whitespace-nowrap">
              <span className="text-emerald-500 font-extrabold">QR</span>
              <span>Cổng Chính (Số 2 Võ Oanh)</span>
            </div>
          </Html>
        </group>

        {/* Đổ bóng tiếp xúc mặt sàn mượt mà */}
        <ContactShadows
          position={[0, 0.02, 3]}
          opacity={0.45}
          scale={65}
          blur={1.6}
          far={14}
          resolution={512}
          color="#334155"
        />
      </Canvas>
    </div>
  );
}
