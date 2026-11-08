'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useNavigationStore } from '@/store/useNavigationStore';
import { GlowingArrowPath } from './GlowingArrowPath';
import { CameraRig } from './CameraRig';

// --- Low-poly Tree Component ---
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {/* Foliage (Clusters of soft green spheres) */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#648f76" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.9, 0.1]} castShadow>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#739e82" roughness={0.7} />
      </mesh>
      <mesh position={[-0.18, 1.25, -0.1]} castShadow>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshStandardMaterial color="#557c66" roughness={0.7} />
      </mesh>
    </group>
  );
}

// --- Building A (Left Building) ---
function BuildingA() {
  const clayMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.75,
        metalness: 0.05,
      }),
    []
  );

  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.4,
        metalness: 0.1,
      }),
    []
  );

  return (
    <group position={[-12, 0, 3]}>
      {/* Main Block */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow material={clayMaterial}>
        <boxGeometry args={[8, 8, 16]} />
      </mesh>

      {/* Roof Parapet */}
      <mesh position={[0, 8.1, 0]} material={clayMaterial}>
        <boxGeometry args={[8.15, 0.25, 16.15]} />
      </mesh>

      {/* Recessed Window Strips (Facing Courtyard) */}
      {[2, 4.2, 6.4].map((y, idx) => (
        <mesh key={`win-a-${idx}`} position={[4.05, y, 0]} material={windowMaterial}>
          <boxGeometry args={[0.12, 1.1, 13.5]} />
        </mesh>
      ))}

      {/* Floating Pill Label */}
      <Html key="label-toa-a" position={[0, 9.2, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div className="px-3.5 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-md border border-slate-200/80 whitespace-nowrap">
          Tòa A
        </div>
      </Html>
    </group>
  );
}

// --- Skybridge Connecting Building A & Building B ---
function Skybridge() {
  return (
    <group position={[-3, 5.5, -9]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6.5, 2.2, 2.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0, 1.24]}>
        <boxGeometry args={[5.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
      </mesh>
    </group>
  );
}

// --- Building B (Top-Right Destination with Roof Cutaway & Glowing Aura) ---
function BuildingB() {
  const activeFloorLevel = useNavigationStore((state) => state.activeFloorLevel);
  const viewMode = useNavigationStore((state) => state.viewMode);

  const isT3Active = viewMode === 'BUILDING_FLOOR' && activeFloorLevel === 3;

  return (
    <group position={[7.5, 0, -6]}>
      {/* Blue Glowing Aura Volume around Building B */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[14.2, 10.6, 11.2]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Cyan-Blue Edge Glow Outline Box */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[13.9, 10.3, 10.9]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.65}
          transparent
          opacity={0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Base & Lower Floors (Tầng 1 & Tầng 2) */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 6, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Lower Floor Windows (Facing Courtyard) */}
      {[-2, 1].map((xOffset, idx) => (
        <group key={`win-b-group-${idx}`} position={[xOffset * 2.2, 0, 0]}>
          <mesh position={[0, 2, 5.04]}>
            <boxGeometry args={[2.8, 1.2, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
          <mesh position={[0, 4.2, 5.04]}>
            <boxGeometry args={[2.8, 1.2, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Entrance Canopy / Porch at Ground Floor */}
      <group position={[0, 0, 5.5]}>
        {/* Canopy Roof */}
        <mesh position={[0, 2.8, 0.6]} castShadow>
          <boxGeometry args={[4.8, 0.25, 2.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Pillars */}
        <mesh position={[-2, 1.4, 1.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[2, 1.4, 1.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* Entrance Steps */}
        <mesh position={[0, 0.15, 0.8]} receiveShadow>
          <boxGeometry args={[4.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* --- CUTAWAY TOP FLOOR (TẦNG 3 - INTERIOR ROOM PARTITIONS) --- */}
      <group position={[0, 6, 0]}>
        {/* Floor Slab for Tầng 3 */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[12.8, 0.2, 9.8]} />
          <meshStandardMaterial
            color={isT3Active ? '#eff6ff' : '#f1f5f9'}
            roughness={0.6}
          />
        </mesh>

        {/* Outer Perimeter Walls (Without Roof) */}
        {/* Back wall */}
        <mesh position={[0, 1.6, -4.8]} castShadow>
          <boxGeometry args={[12.8, 3, 0.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Front wall with door cutout */}
        <mesh position={[-3.5, 1.6, 4.8]} castShadow>
          <boxGeometry args={[5.8, 3, 0.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        <mesh position={[3.5, 1.6, 4.8]} castShadow>
          <boxGeometry args={[5.8, 3, 0.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Left wall */}
        <mesh position={[-6.3, 1.6, 0]} castShadow>
          <boxGeometry args={[0.2, 3, 9.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Right wall */}
        <mesh position={[6.3, 1.6, 0]} castShadow>
          <boxGeometry args={[0.2, 3, 9.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>

        {/* --- Interior Classroom Partition Walls (5 rooms + central corridor) --- */}
        {/* Central L-shaped hallway partition wall */}
        <mesh position={[0.5, 1.5, 0.5]} castShadow>
          <boxGeometry args={[11.2, 2.8, 0.18]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
        {/* Vertical divider 1 (Room B301 & Room B302) */}
        <mesh position={[-2.5, 1.5, -2.1]} castShadow>
          <boxGeometry args={[0.18, 2.8, 5.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
        {/* Vertical divider 2 (Lab AI B302) */}
        <mesh position={[2, 1.5, -2.1]} castShadow>
          <boxGeometry args={[0.18, 2.8, 5.2]} />
          <meshStandardMaterial
            color={isT3Active ? '#dbeafe' : '#f1f5f9'}
            roughness={0.7}
          />
        </mesh>
        {/* Vertical divider 3 */}
        <mesh position={[-1.5, 1.5, 2.7]} castShadow>
          <boxGeometry args={[0.18, 2.8, 4.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>

        {/* 3D Staircase Model in East wing */}
        <group position={[4.6, 0, 2.2]}>
          {[0, 1, 2, 3, 4].map((step) => (
            <mesh key={`stair-${step}`} position={[0, step * 0.25, step * 0.4]}>
              <boxGeometry args={[1.4, 0.25, 0.42]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
          ))}
          {/* Stairwell Railing */}
          <mesh position={[0.75, 1.2, 1]}>
            <boxGeometry args={[0.06, 1.2, 2.2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </group>

        {/* Classroom Desks / Interior accents */}
        <mesh position={[-0.2, 0.5, -2.4]} castShadow>
          <boxGeometry args={[2.2, 0.6, 1.6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* Floating Pill Label for Tòa B */}
      <Html key="label-toa-b" position={[0, 9.8, 1.2]} center distanceFactor={28} zIndexRange={[100, 0]}>
        <div className="px-4 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-lg border border-blue-200/80 ring-2 ring-blue-400/40 whitespace-nowrap">
          Tòa B
        </div>
      </Html>
    </group>
  );
}

// --- Building C (Bottom-Right Building) ---
function BuildingC() {
  const clayMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.75,
        metalness: 0.05,
      }),
    []
  );

  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.4,
        metalness: 0.1,
      }),
    []
  );

  return (
    <group position={[9, 0, 11]}>
      {/* Main Block */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow material={clayMaterial}>
        <boxGeometry args={[9, 7, 13]} />
      </mesh>

      {/* Windows facing courtyard */}
      {[2, 4.2].map((y, idx) => (
        <mesh key={`win-c-${idx}`} position={[-4.54, y, 0]} material={windowMaterial}>
          <boxGeometry args={[0.1, 1.1, 10.5]} />
        </mesh>
      ))}

      {/* Floating Pill Label */}
      <Html key="label-toa-c" position={[0, 7.8, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div className="px-3.5 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-md border border-slate-200/80 whitespace-nowrap">
          Tòa C
        </div>
      </Html>
    </group>
  );
}

// --- Perimeter Fence & Gate at Bottom Left ---
function PerimeterFence() {
  return (
    <group position={[-6, 0, 14]}>
      {/* Front-left white perimeter wall */}
      <mesh position={[-6, 1, 0]} castShadow>
        <boxGeometry args={[8, 2, 0.3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Gate Pillars */}
      <mesh position={[-1.8, 1.3, 0]} castShadow>
        <boxGeometry args={[0.5, 2.6, 0.5]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[1.8, 1.3, 0]} castShadow>
        <boxGeometry args={[0.5, 2.6, 0.5]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Gate Opening Ground Accent */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

// --- Main 3D Maquette Canvas Scene ---
export function CampusMaquetteScene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const activeSteps = useNavigationStore((state) => state.activeSteps);
  const currentStepIndex = useNavigationStore((state) => state.currentStepIndex);
  const currentStep = activeSteps[currentStepIndex];

  // Coordinates from QR Cổng Chính [-6, 0.15, 14] to Sảnh Tòa B [7.5, 0.15, -0.5]
  const arrowStart: [number, number, number] = [-6, 0.15, 14];
  const arrowEnd: [number, number, number] = [7.5, 0.15, -0.5];

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        camera={{
          position: [24, 26, 24],
          fov: 32,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        {/* Soft, clean daylight background */}
        <color attach="background" args={['#e9eef4']} />

        {/* Ambient & Directional Daylight Lighting */}
        <ambientLight intensity={0.92} color="#ffffff" />
        <hemisphereLight args={['#ffffff', '#dfe5ec', 0.65]} />
        <directionalLight
          position={[32, 45, 28]}
          intensity={1.15}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={28}
          shadow-camera-bottom={-28}
        />

        {/* Camera Rig (GSAP Tweening) */}
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={10}
          maxDistance={70}
        />

        {/* --- Ground Courtyard Surface --- */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color="#dfe5ec" roughness={0.9} />
        </mesh>

        {/* Central Courtyard Pavement */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow>
          <planeGeometry args={[44, 44]} />
          <meshStandardMaterial color="#e9edf2" roughness={0.8} />
        </mesh>

        {/* --- Campus Buildings --- */}
        <BuildingA />
        <Skybridge />
        <BuildingB />
        <BuildingC />

        {/* Perimeter Fence & Gate */}
        <PerimeterFence />

        {/* --- Trees Around Campus --- */}
        <Tree position={[-11, 0, 13]} scale={1.2} />
        <Tree position={[-8.5, 0, 14]} scale={0.95} />
        <Tree position={[-16, 0, 4]} scale={1.1} />
        <Tree position={[-16, 0, -2]} scale={1.0} />
        <Tree position={[2.5, 0, 15]} scale={1.05} />
        <Tree position={[3.8, 0, 16]} scale={0.85} />
        <Tree position={[15, 0, 8]} scale={1.1} />
        <Tree position={[15, 0, -2]} scale={1.2} />
        <Tree position={[2, 0, -11]} scale={1.0} />

        {/* --- 3D Glowing Cyan Arrow Path --- */}
        <GlowingArrowPath
          start={arrowStart}
          end={arrowEnd}
          points={currentStep?.pathPoints}
        />

        {/* --- QR Cổng Chính 3D Pin --- */}
        <group position={[-6, 0.2, 14]}>
          {/* Green Droplet Map Pin Mesh */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.36, 0.7, 16]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          {/* Inner White Dot */}
          <mesh position={[0, 1.4, 0.3]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Floating Pill Badge: "QR Cổng Chính" */}
          <Html key="label-qr-cong-chinh" position={[0, 0.1, 1.4]} center distanceFactor={28} zIndexRange={[100, 0]}>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-lg border border-slate-200/90 whitespace-nowrap">
              <span className="text-emerald-500 font-extrabold">QR</span>
              <span>Cổng Chính</span>
            </div>
          </Html>
        </group>

        {/* Soft Contact Shadows on Ground */}
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.5}
          scale={50}
          blur={1.8}
          far={12}
          resolution={512}
          color="#1e293b"
        />
      </Canvas>
    </div>
  );
}
