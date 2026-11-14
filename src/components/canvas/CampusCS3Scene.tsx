'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { CADBuildingModel } from './CADBuildingModel';
import { NavigationPath3D } from './NavigationPath3D';
import { BuildingTooltip } from './BuildingTooltip';
import { CinematicTourManager } from './CinematicTourManager';
import { useNavigationStore } from '@/store/useNavigationStore';
import { CS3_BUILDINGS_LAYOUT } from '@/data/cs3Layout';

// ============================================================================
// 1. MATERIAL PALETTE (Zero Z-Fighting, Architectural Clean Maquette)
// ============================================================================
const CS3_MATS = {
  pavedGround: new THREE.MeshStandardMaterial({
    color: '#eaedf1',
    roughness: 0.9,
  }),
  plotBase: new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.85,
  }),
  darkAsphalt: new THREE.MeshStandardMaterial({
    color: '#28313d',
    roughness: 0.82,
    metalness: 0.08,
  }),
  whiteRoadLine: new THREE.MeshBasicMaterial({
    color: '#ffffff',
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  }),
  yellowRoadLine: new THREE.MeshBasicMaterial({
    color: '#fbbf24',
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  }),
  turfGreen: new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.9,
  }),
  turfStripe: new THREE.MeshStandardMaterial({
    color: '#16a34a',
    roughness: 0.9,
  }),
  pitchCurb: new THREE.MeshStandardMaterial({
    color: '#bbf7d0',
    roughness: 0.8,
  }),
  boundaryWall: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.75,
  }),
  gatePillar: new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.7,
  }),
};

// ============================================================================
// 2. SÂN BÓNG ĐÁ MINI CỎ NHÂN TẠO (TOP-CENTER NORTH PITCH)
// ============================================================================
function CS3FootballPitch() {
  const pitchX = 0.0;
  const pitchZ = -19.5;
  const w = 15.0;
  const d = 10.0;

  return (
    <group position={[pitchX, 0.1, pitchZ]}>
      {/* Raised Turf Border Curb (Nâng cao hơn nền đường chống Z-fighting) */}
      <mesh position={[0, 0.035, 0]} material={CS3_MATS.pitchCurb}>
        <boxGeometry args={[w + 1.2, 0.07, d + 1.2]} />
      </mesh>

      {/* Alternating Lawn Stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`pitch-stripe-${i}`}
          position={[-w / 2 + (i + 0.5) * (w / 10), 0.075, 0]}
          material={i % 2 === 0 ? CS3_MATS.turfGreen : CS3_MATS.turfStripe}
        >
          <boxGeometry args={[w / 10, 0.01, d]} />
        </mesh>
      ))}

      {/* Outer White Boundary Lines */}
      <mesh position={[0, 0.082, -d / 2 + 0.06]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[w - 0.2, 0.005, 0.1]} />
      </mesh>
      <mesh position={[0, 0.082, d / 2 - 0.06]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[w - 0.2, 0.005, 0.1]} />
      </mesh>
      <mesh position={[-w / 2 + 0.1, 0.082, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.1, 0.005, d - 0.1]} />
      </mesh>
      <mesh position={[w / 2 - 0.1, 0.082, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.1, 0.005, d - 0.1]} />
      </mesh>

      {/* Halfway Line */}
      <mesh position={[0, 0.082, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.1, 0.005, d - 0.1]} />
      </mesh>

      {/* Center Circle */}
      <mesh
        position={[0, 0.083, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={CS3_MATS.whiteRoadLine}
      >
        <ringGeometry args={[1.5, 1.62, 32]} />
      </mesh>

      {/* West Penalty Box */}
      <mesh position={[-w / 2 + 1.8, 0.082, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.1, 0.005, 5.0]} />
      </mesh>
      <mesh position={[-w / 2 + 0.95, 0.082, -2.5]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[1.8, 0.005, 0.1]} />
      </mesh>
      <mesh position={[-w / 2 + 0.95, 0.082, 2.5]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[1.8, 0.005, 0.1]} />
      </mesh>

      {/* East Penalty Box */}
      <mesh position={[w / 2 - 1.8, 0.082, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.1, 0.005, 5.0]} />
      </mesh>
      <mesh position={[w / 2 - 0.95, 0.082, -2.5]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[1.8, 0.005, 0.1]} />
      </mesh>
      <mesh position={[w / 2 - 0.95, 0.082, 2.5]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[1.8, 0.005, 0.1]} />
      </mesh>

      {/* Floating Badge */}
      <Html position={[0, 2.0, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
        <div className="px-3 py-1 rounded-full bg-emerald-700/95 text-white text-[10px] font-bold shadow-lg border border-emerald-400/50 whitespace-nowrap select-none">
          SÂN BÓNG ĐÁ
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 3. BÃI ĐỖ XE Ô TÔ & XE MÁY PHÍA ĐÔNG (GIANT EAST PARKING LOT)
// ============================================================================
function CS3EastParkingLot() {
  const lotCenter: [number, number, number] = [26.5, 0.03, -6.5];
  const lotWidth = 14.0;
  const lotDepth = 36.0;

  return (
    <group position={lotCenter}>
      {/* Asphalt Surface */}
      <mesh material={CS3_MATS.darkAsphalt}>
        <boxGeometry args={[lotWidth, 0.06, lotDepth]} />
      </mesh>

      {/* Perimeter White Boundary */}
      <mesh position={[0, 0.035, -lotDepth / 2 + 0.1]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[lotWidth, 0.005, 0.12]} />
      </mesh>
      <mesh position={[0, 0.035, lotDepth / 2 - 0.1]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[lotWidth, 0.005, 0.12]} />
      </mesh>
      <mesh position={[-lotWidth / 2 + 0.1, 0.035, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.12, 0.005, lotDepth]} />
      </mesh>
      <mesh position={[lotWidth / 2 - 0.1, 0.035, 0]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.12, 0.005, lotDepth]} />
      </mesh>

      {/* 4 Long Parking Bays with White Stall Markings */}
      {[-4.6, -1.6, 1.6, 4.6].map((bayX, bIdx) => (
        <group key={`parking-bay-${bIdx}`} position={[bayX, 0, 0]}>
          {/* Central Lane Line for this bay */}
          <mesh position={[0, 0.036, 0]} material={CS3_MATS.whiteRoadLine}>
            <boxGeometry args={[0.08, 0.005, lotDepth - 4.0]} />
          </mesh>
          {/* Individual Parking Stalls */}
          {Array.from({ length: 14 }).map((_, sIdx) => (
            <mesh
              key={`stall-${bIdx}-${sIdx}`}
              position={[0, 0.036, -lotDepth / 2 + 3.0 + sIdx * 2.3]}
              material={CS3_MATS.whiteRoadLine}
            >
              <boxGeometry args={[2.4, 0.005, 0.08]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Directional Traffic Flow Arrows (Up/Down) */}
      {[-3.1, 3.1].map((laneX, lIdx) => (
        <group key={`arrow-lane-${lIdx}`}>
          {[-12.0, 0.0, 12.0].map((arrowZ, aIdx) => (
            <group
              key={`arrow-${lIdx}-${aIdx}`}
              position={[laneX, 0.037, arrowZ]}
              rotation={[0, lIdx === 0 ? 0 : Math.PI, 0]}
            >
              <mesh material={CS3_MATS.whiteRoadLine}>
                <boxGeometry args={[0.12, 0.005, 0.9]} />
              </mesh>
              <mesh position={[0, 0, -0.55]} material={CS3_MATS.whiteRoadLine}>
                <coneGeometry args={[0.24, 0.4, 3]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Floating Parking Badge */}
      <Html position={[0, 2.5, 0]} center distanceFactor={36} zIndexRange={[100, 0]}>
        <div className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-bold shadow-lg border border-sky-400/50 whitespace-nowrap select-none">
          BÃI ĐỖ XE PHÍA ĐÔNG
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 4. HỆ THỐNG ĐƯỜNG GIAO THÔNG NỘI BỘ (MAIN ROAD CIRCULATION & ELBOW CURVE)
// ============================================================================
// Arc Curve parameters connecting Main Road (X=8.0) to Horizontal Road (Z=-11.0)
const ARC_CENTER: [number, number] = [-3.0, 0.0];
const ARC_RADIUS = 11.0;
const ROAD_W = 4.0;

function CS3RoadCirculationSystem() {
  const curveDashes = useMemo(() => {
    const dashes = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const angle = 0.12 + (i * (Math.PI / 2 - 0.24)) / (count - 1);
      const x = ARC_CENTER[0] + ARC_RADIUS * Math.cos(angle);
      const z = ARC_CENTER[1] - ARC_RADIUS * Math.sin(angle);
      dashes.push({ x, z, angle });
    }
    return dashes;
  }, []);

  return (
    <group name="cs3-roads">
      {/* 1. Trục đường chính Bắc - Nam (Chạy từ Cổng 1 lên vòng cua trước Sân bóng: Z từ 26.4 đến 0.0) */}
      <mesh position={[8.0, 0.03, 13.2]} material={CS3_MATS.darkAsphalt}>
        <boxGeometry args={[ROAD_W, 0.06, 26.4]} />
      </mesh>

      {/* Viền trắng mép đường chính */}
      <mesh position={[8.0 - ROAD_W / 2 + 0.1, 0.065, 13.2]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.12, 0.005, 26.4]} />
      </mesh>
      <mesh position={[8.0 + ROAD_W / 2 - 0.1, 0.065, 13.2]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[0.12, 0.005, 26.4]} />
      </mesh>

      {/* Vạch đứt trung tâm đường chính */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={`main-dash-${i}`}
          position={[8.0, 0.066, 2.5 + i * 3.6]}
          material={CS3_MATS.whiteRoadLine}
        >
          <boxGeometry args={[0.14, 0.005, 1.8]} />
        </mesh>
      ))}

      {/* 2. Khúc cua 90 độ mềm mại qua phía Tây (Curved Road Elbow) */}
      <group position={[ARC_CENTER[0], 0.031, ARC_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={CS3_MATS.darkAsphalt}>
          <ringGeometry args={[ARC_RADIUS - ROAD_W / 2, ARC_RADIUS + ROAD_W / 2, 48, 1, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Vạch đứt trên khúc cua */}
      {curveDashes.map((d, i) => (
        <mesh
          key={`curve-dash-${i}`}
          position={[d.x, 0.067, d.z]}
          rotation={[0, d.angle + Math.PI / 2, 0]}
          material={CS3_MATS.whiteRoadLine}
        >
          <boxGeometry args={[0.14, 0.005, 1.5]} />
        </mesh>
      ))}

      {/* 3. Trục đường ngang hướng Tây (Chạy giữa Tòa H và Sân bóng ra tường rào Tây: Z = -11.0, X từ -3.0 đến -34.4) */}
      <mesh position={[-18.7, 0.03, -11.0]} material={CS3_MATS.darkAsphalt}>
        <boxGeometry args={[31.4, 0.06, ROAD_W]} />
      </mesh>

      {/* Viền trắng trục đường ngang */}
      <mesh position={[-18.7, 0.065, -11.0 - ROAD_W / 2 + 0.1]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[31.4, 0.005, 0.12]} />
      </mesh>
      <mesh position={[-18.7, 0.065, -11.0 + ROAD_W / 2 - 0.1]} material={CS3_MATS.whiteRoadLine}>
        <boxGeometry args={[31.4, 0.005, 0.12]} />
      </mesh>

      {/* Vạch đứt trung tâm trục ngang */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={`horiz-dash-${i}`}
          position={[-4.5 - i * 3.3, 0.066, -11.0]}
          material={CS3_MATS.whiteRoadLine}
        >
          <boxGeometry args={[1.8, 0.005, 0.14]} />
        </mesh>
      ))}

      {/* 4. Đường nhánh kết nối sang Bãi đỗ xe phía Đông (giữa Tòa K và Tòa J: X từ 8.0 đến 19.5, Z = -7.0) */}
      <mesh position={[13.75, 0.03, -7.0]} material={CS3_MATS.darkAsphalt}>
        <boxGeometry args={[11.5, 0.06, 3.6]} />
      </mesh>

      {/* 5. Đường vào từ Cổng phụ 2 đến Bãi đỗ xe phía Đông (X = 22.0, Z từ 11.5 đến 26.4) */}
      <mesh position={[22.0, 0.03, 18.95]} material={CS3_MATS.darkAsphalt}>
        <boxGeometry args={[4.0, 0.06, 14.9]} />
      </mesh>
    </group>
  );
}

// ============================================================================
// 5. TƯỜNG RÀO KHUÔN VIÊN & 2 CỔNG RA VÀO (172.0M X 132.0M BOUNDARY & GATES)
// ============================================================================
function CS3CampusBoundaryAndGates() {
  const wallH = 1.3;
  const wallThick = 0.3;

  return (
    <group name="cs3-boundary">
      {/* Tường phía Bắc (Z = -26.4, Rộng 68.8m) */}
      <mesh position={[0, wallH / 2, -26.4]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[68.8, wallH, wallThick]} />
      </mesh>

      {/* Tường phía Tây (X = -34.4, Dài 52.8m) */}
      <mesh position={[-34.4, wallH / 2, 0]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[wallThick, wallH, 52.8]} />
      </mesh>

      {/* Tường phía Đông (X = 34.4, Dài 52.8m) */}
      <mesh position={[34.4, wallH / 2, 0]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[wallThick, wallH, 52.8]} />
      </mesh>

      {/* Tường phía Nam - Đoạn bên trái Cổng 1 (X: -34.4 đến 5.9 = 40.3m) */}
      <mesh position={[-14.25, wallH / 2, 26.4]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[40.3, wallH, wallThick]} />
      </mesh>

      {/* Tường phía Nam - Đoạn giữa Cổng 1 và Cổng 2 (X: 10.1 đến 19.9 = 9.8m) */}
      <mesh position={[15.0, wallH / 2, 26.4]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[9.8, wallH, wallThick]} />
      </mesh>

      {/* Tường phía Nam - Đoạn bên phải Cổng 2 (X: 24.1 đến 34.4 = 10.3m) */}
      <mesh position={[29.25, wallH / 2, 26.4]} material={CS3_MATS.boundaryWall}>
        <boxGeometry args={[10.3, wallH, wallThick]} />
      </mesh>

      {/* Trụ cổng Cổng 1 */}
      <mesh position={[5.8, wallH / 2 + 0.2, 26.4]} material={CS3_MATS.gatePillar}>
        <boxGeometry args={[0.6, wallH + 0.4, 0.6]} />
      </mesh>
      <mesh position={[10.2, wallH / 2 + 0.2, 26.4]} material={CS3_MATS.gatePillar}>
        <boxGeometry args={[0.6, wallH + 0.4, 0.6]} />
      </mesh>

      {/* Badge CỔNG RA VÀO 1 */}
      <Html position={[8.0, 1.4, 27.2]} center distanceFactor={34} zIndexRange={[120, 0]}>
        <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-xl border border-sky-400 whitespace-nowrap select-none">
          CỔNG RA VÀO 1
        </div>
      </Html>

      {/* Trụ cổng Cổng 2 */}
      <mesh position={[19.8, wallH / 2 + 0.2, 26.4]} material={CS3_MATS.gatePillar}>
        <boxGeometry args={[0.6, wallH + 0.4, 0.6]} />
      </mesh>
      <mesh position={[24.2, wallH / 2 + 0.2, 26.4]} material={CS3_MATS.gatePillar}>
        <boxGeometry args={[0.6, wallH + 0.4, 0.6]} />
      </mesh>

      {/* Badge CỔNG RA VÀO 2 */}
      <Html position={[22.0, 1.4, 27.2]} center distanceFactor={34} zIndexRange={[120, 0]}>
        <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-xl border border-sky-400 whitespace-nowrap select-none">
          CỔNG RA VÀO 2
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 6. MAIN COMPONENT: CAMPUS CS3 SCENE (Masterplan Blueprint Exact Rebuild)
// ============================================================================
export function CampusCS3Scene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const setSelectedBuilding = useNavigationStore((state) => state.setSelectedBuilding);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        camera={{
          position: [36, 46, 38],
          fov: 34,
          near: 0.5,
          far: 320,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        className="w-full h-full"
      >
        {/* Adaptive resolution and event throttling for sustained 60 FPS */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {/* Studio Clean Architectural Maquette Background */}
        <color attach="background" args={['#eef2f6']} />

        {/* Ambient & Daylight Sunlight matching architectural maquette */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <hemisphereLight args={['#ffffff', '#dbeafe', 0.65]} />
        <directionalLight
          position={[40, 56, 34]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={180}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
          shadow-bias={-0.0004}
        />

        {/* Smooth Orbit Camera Rig */}
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={15}
          maxDistance={150}
        />

        {/* ================================================================== */}
        {/* NỀN ĐẤT KHUÔN VIÊN DUY NHẤT (CLICK RA NGOÀI ĐỂ DESELECT)           */}
        {/* ================================================================== */}
        <mesh
          position={[0, -0.01, 0]}
          receiveShadow
          material={CS3_MATS.pavedGround}
          onPointerDown={(e) => {
            if (e.intersections.length > 0 && e.intersections[0].object === e.object) {
              setSelectedBuilding(null);
            }
          }}
        >
          <boxGeometry args={[150, 0.02, 150]} />
        </mesh>

        {/* 1. Tường rào biên giới & 2 Cổng ra vào */}
        <CS3CampusBoundaryAndGates />

        {/* 2. Hệ thống đường giao thông nội bộ */}
        <CS3RoadCirculationSystem />

        {/* 3. Sân bóng đá cỏ nhân tạo (Top-Center) */}
        <CS3FootballPitch />

        {/* 4. Bãi đỗ xe phía Đông với làn xe & vạch kẻ */}
        <CS3EastParkingLot />

        {/* 5. Đường dẫn đường ánh sáng 3D */}
        <NavigationPath3D />

        {/* 6. Trình quản lý Cinematic Tour (Tự động kích hoạt khi tìm Phòng Gym) */}
        <CinematicTourManager controlsRef={controlsRef} />

        {/* ================================================================== */}
        {/* 7. DUYỆT RENDER TẤT CẢ CÁC TÒA NHÀ QUA cs3Layout.ts                */}
        {/* ================================================================== */}
        {CS3_BUILDINGS_LAYOUT.map((bld) => (
          <group key={bld.id} position={bld.position}>
            {/* Khối đế móng bê tông maquette dưới từng tòa nhà */}
            <mesh
              position={[0, -bld.position[1] + 0.05, 0]}
              material={CS3_MATS.plotBase}
            >
              <boxGeometry args={[bld.plotSize[0], 0.1, bld.plotSize[1]]} />
            </mesh>

            {/* Model 3D tải từ file cấu hình */}
            <CADBuildingModel
              modelUrl={bld.modelUrl}
              position={[0, 0, 0]}
              rotation={bld.rotation}
              scale={bld.scale}
              buildingCode={bld.code}
              buildingName={bld.name}
              heightOffset={bld.heightOffset}
            />
          </group>
        ))}

        {/* ================================================================== */}
        {/* 8. TOOLTIP THÔNG TIN TƯƠNG TÁC CHO TỪNG TÒA NHÀ                   */}
        {/* ================================================================== */}
        {CS3_BUILDINGS_LAYOUT.map((bld) => (
          <BuildingTooltip
            key={`tooltip-${bld.id}`}
            position={bld.position}
            buildingCode={bld.code}
            buildingName={bld.name}
            subTitle={bld.subTitle}
            heightOffset={bld.heightOffset}
          />
        ))}
      </Canvas>
    </div>
  );
}
