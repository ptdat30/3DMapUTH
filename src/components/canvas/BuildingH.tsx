'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useNavigationStore } from '@/store/useNavigationStore';

interface BuildingHProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Procedural 3D Architectural Scale Model of TÒA H (Cơ sở 3 - UTH)
 * Based strictly on reference image:
 * - 5 Floors (Ground Floor T1 + 4 Upper Floors T2-T5)
 * - U-shaped layout open to the front/east
 * - Flexible Structural Grid:
 *    + Tầng trệt (Ground): Cánh trái 7 phòng nhỏ (P.101-P.107), Cánh phải 4 phòng lớn (P.108-P.111)
 *    + Tầng 2-5 (Upper): 4 phòng học lớn đối xứng trên cả 2 cánh (P.X01-P.X08)
 * - Protruding central staircase tower extending above the roofline with grid breeze block screen
 * - Right wing front gable open emergency staircase with black railings
 * - Left wing front gable with 3 vertical ventilation block bands
 * - 4 vertical light-blue corner pilasters
 * - Continuous concrete square columns along courtyard balconies
 * - Parapet walls with roof mechanical housings
 */
export function BuildingH({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BuildingHProps) {
  const activeFloorLevel = useNavigationStore((state) => state.activeFloorLevel);
  const activeBuildingCode = useNavigationStore((state) => state.activeBuildingCode);
  const viewMode = useNavigationStore((state) => state.viewMode);

  const isBuildingHActive = activeBuildingCode === 'toa_h';

  // Architectural Grid Dimensions (in scaled meters)
  const FLOORS = 5;
  const FLOOR_HEIGHT = 2.4;
  const TOTAL_HEIGHT = FLOORS * FLOOR_HEIGHT; // 12.0

  // Wing & Room Geometry
  const WING_LENGTH = 15.0; // ~25.2m real scale
  const ROOM_DEPTH = 4.2;   // ~7.2m real depth
  const CORRIDOR_WIDTH = 1.3; // ~2.2m real corridor
  const WING_TOTAL_WIDTH = ROOM_DEPTH + CORRIDOR_WIDTH; // 5.5

  // Courtyard & Center Block
  const COURTYARD_WIDTH = 10.5; // ~18.0m real scale
  const BASE_DEPTH = 2.6;       // ~4.0m real scale

  // Bays
  const LEFT_SMALL_BAYS = 7;
  const LEFT_SMALL_BAY_LEN = WING_LENGTH / LEFT_SMALL_BAYS; // ~2.14
  const LARGE_BAYS = 4;
  const LARGE_BAY_LEN = WING_LENGTH / LARGE_BAYS; // 3.75

  const PILLAR_SIZE = 0.28;

  // Materials
  const materials = useMemo(() => {
    return {
      wallStucco: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.72,
        metalness: 0.04,
      }),
      concretePillar: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.65,
        metalness: 0.08,
      }),
      bluePilaster: new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.5,
        metalness: 0.15,
      }),
      dwarfBalustrade: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.8,
        metalness: 0.02,
      }),
      blackGuardrail: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.35,
        metalness: 0.7,
      }),
      breezeBlock: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.85,
      }),
      darkDoor: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.45,
      }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.2,
        metalness: 0.3,
      }),
      slabConcrete: new THREE.MeshStandardMaterial({
        color: '#f1f5f9',
        roughness: 0.7,
      }),
      roofGravel: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.9,
      }),
      stairStep: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.7,
      }),
      activeHighlight: new THREE.MeshStandardMaterial({
        color: '#3b82f6',
        emissive: '#1d4ed8',
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85,
      }),
    };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* 3D Floating Pill Label */}
      <Html position={[0, TOTAL_HEIGHT + 2.4, 0]} center distanceFactor={34} zIndexRange={[100, 0]}>
        <div className="px-3.5 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Tòa H (Cơ sở 3 - 5 Tầng)</span>
        </div>
      </Html>

      {/* --- BASE FOUNDATION SLAB & COURTYARD PAVING --- */}
      <mesh
        position={[0, 0.08, -WING_LENGTH / 2 + BASE_DEPTH / 2 + 0.4]}
        receiveShadow
        material={materials.slabConcrete}
      >
        <boxGeometry
          args={[
            COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH + 1.6,
            0.16,
            WING_LENGTH + BASE_DEPTH + 1.8,
          ]}
        />
      </mesh>

      {/* --- 5 FLOORS: SLABS, WALLS, DOORS, WINDOWS, BALUSTRADES --- */}
      {Array.from({ length: FLOORS }).map((_, fIdx) => {
        const floorY = fIdx * FLOOR_HEIGHT;
        const floorLevel = fIdx + 1;
        const isCurrentActive = isBuildingHActive && activeFloorLevel === floorLevel;
        const floorMat = isCurrentActive ? materials.activeHighlight : materials.slabConcrete;

        return (
          <group key={`floor-level-${floorLevel}`} position={[0, floorY, 0]}>
            {/* --- FLOOR SLABS --- */}
            {/* Left Wing Slab */}
            <mesh
              position={[
                -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2),
                0.08,
                -WING_LENGTH / 2,
              ]}
              receiveShadow
              material={floorMat}
            >
              <boxGeometry args={[WING_TOTAL_WIDTH, 0.16, WING_LENGTH]} />
            </mesh>

            {/* Right Wing Slab */}
            <mesh
              position={[
                COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2,
                0.08,
                -WING_LENGTH / 2,
              ]}
              receiveShadow
              material={floorMat}
            >
              <boxGeometry args={[WING_TOTAL_WIDTH, 0.16, WING_LENGTH]} />
            </mesh>

            {/* Central Connecting Block Slab */}
            <mesh
              position={[0, 0.08, -WING_LENGTH - BASE_DEPTH / 2]}
              receiveShadow
              material={floorMat}
            >
              <boxGeometry
                args={[
                  COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH,
                  0.16,
                  BASE_DEPTH,
                ]}
              />
            </mesh>

            {/* --- EXTERIOR FAÇADE WINDOW BANDS (Facing Outward) --- */}
            {/* Left Wing Outer Windows (West) */}
            <mesh
              position={[
                -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH + 0.02),
                FLOOR_HEIGHT / 2,
                -WING_LENGTH / 2,
              ]}
              material={materials.windowGlass}
            >
              <boxGeometry args={[0.04, 1.1, WING_LENGTH - 0.8]} />
            </mesh>

            {/* Right Wing Outer Windows (East) */}
            <mesh
              position={[
                COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH + 0.02,
                FLOOR_HEIGHT / 2,
                -WING_LENGTH / 2,
              ]}
              material={materials.windowGlass}
            >
              <boxGeometry args={[0.04, 1.1, WING_LENGTH - 0.8]} />
            </mesh>

            {/* Central Block Back Windows (North) */}
            <mesh
              position={[0, FLOOR_HEIGHT / 2, -WING_LENGTH - BASE_DEPTH - 0.02]}
              material={materials.windowGlass}
            >
              <boxGeometry args={[COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH - 2, 1.1, 0.04]} />
            </mesh>

            {/* Central Block Outer Back Wall */}
            <mesh
              position={[0, FLOOR_HEIGHT / 2, -WING_LENGTH - BASE_DEPTH]}
              castShadow
              material={materials.wallStucco}
            >
              <boxGeometry
                args={[
                  COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH,
                  FLOOR_HEIGHT,
                  0.2,
                ]}
              />
            </mesh>

            {/* --- INNER BALCONY BALUSTRADES & GUARDRAILS (Courtyard-Facing) --- */}
            {/* Left Wing Balustrade (Facing East into Courtyard) */}
            <group position={[-COURTYARD_WIDTH / 2, 0, -WING_LENGTH / 2]}>
              {/* White Concrete Parapet */}
              <mesh position={[0, 0.4, 0]} castShadow material={materials.dwarfBalustrade}>
                <boxGeometry args={[0.12, 0.75, WING_LENGTH]} />
              </mesh>
              {/* Black Handrail */}
              <mesh position={[0, 0.82, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.06, 0.05, WING_LENGTH]} />
              </mesh>
              {/* Intermediate safety rail */}
              <mesh position={[0, 0.95, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.06, 0.04, WING_LENGTH]} />
              </mesh>
            </group>

            {/* Right Wing Balustrade (Facing West into Courtyard) */}
            <group position={[COURTYARD_WIDTH / 2, 0, -WING_LENGTH / 2]}>
              <mesh position={[0, 0.4, 0]} castShadow material={materials.dwarfBalustrade}>
                <boxGeometry args={[0.12, 0.75, WING_LENGTH]} />
              </mesh>
              <mesh position={[0, 0.82, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.06, 0.05, WING_LENGTH]} />
              </mesh>
              <mesh position={[0, 0.95, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.06, 0.04, WING_LENGTH]} />
              </mesh>
            </group>

            {/* Central Connecting Corridor Balustrades */}
            <group position={[0, 0, -WING_LENGTH]}>
              {/* Left half */}
              <mesh position={[-COURTYARD_WIDTH / 4 - 0.4, 0.4, 0]} castShadow material={materials.dwarfBalustrade}>
                <boxGeometry args={[COURTYARD_WIDTH / 2 - 1.2, 0.75, 0.12]} />
              </mesh>
              <mesh position={[-COURTYARD_WIDTH / 4 - 0.4, 0.88, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[COURTYARD_WIDTH / 2 - 1.2, 0.06, 0.06]} />
              </mesh>
              {/* Right half */}
              <mesh position={[COURTYARD_WIDTH / 4 + 0.4, 0.4, 0]} castShadow material={materials.dwarfBalustrade}>
                <boxGeometry args={[COURTYARD_WIDTH / 2 - 1.2, 0.75, 0.12]} />
              </mesh>
              <mesh position={[COURTYARD_WIDTH / 4 + 0.4, 0.88, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[COURTYARD_WIDTH / 2 - 1.2, 0.06, 0.06]} />
              </mesh>
            </group>

            {/* --- LEFT WING ROOM PARTITIONS & DOORS --- */}
            {/* Tầng trệt (fIdx === 0): 7 phòng nhỏ (P.101 - P.107) */}
            {/* Tầng lầu (fIdx >= 1): 4 phòng lớn (P.X01 - P.X04) */}
            {fIdx === 0 ? (
              // 7 phòng nhỏ tầng trệt
              Array.from({ length: LEFT_SMALL_BAYS }).map((_, bayIdx) => {
                const bayZ = -WING_LENGTH + (bayIdx + 0.5) * LEFT_SMALL_BAY_LEN;
                return (
                  <group key={`left-room-g-${bayIdx}`}>
                    {/* Outer Wall (West) */}
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH),
                        FLOOR_HEIGHT / 2,
                        bayZ,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[0.18, FLOOR_HEIGHT, LEFT_SMALL_BAY_LEN]} />
                    </mesh>
                    {/* Corridor Wall */}
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH),
                        FLOOR_HEIGHT / 2,
                        bayZ,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[0.18, FLOOR_HEIGHT, LEFT_SMALL_BAY_LEN]} />
                    </mesh>
                    {/* Door (0.9m) */}
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH - 0.05),
                        1.0,
                        bayZ,
                      ]}
                      material={materials.darkDoor}
                    >
                      <boxGeometry args={[0.04, 2.0, 0.75]} />
                    </mesh>
                    {/* Divider Wall */}
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH + ROOM_DEPTH / 2),
                        FLOOR_HEIGHT / 2,
                        -WING_LENGTH + bayIdx * LEFT_SMALL_BAY_LEN,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[ROOM_DEPTH, FLOOR_HEIGHT, 0.16]} />
                    </mesh>
                  </group>
                );
              })
            ) : (
              // 4 phòng lớn tầng 2-5
              Array.from({ length: LARGE_BAYS }).map((_, bayIdx) => {
                const bayZ = -WING_LENGTH + (bayIdx + 0.5) * LARGE_BAY_LEN;
                return (
                  <group key={`left-room-u-${bayIdx}`}>
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH),
                        FLOOR_HEIGHT / 2,
                        bayZ,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[0.18, FLOOR_HEIGHT, LARGE_BAY_LEN]} />
                    </mesh>
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH),
                        FLOOR_HEIGHT / 2,
                        bayZ,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[0.18, FLOOR_HEIGHT, LARGE_BAY_LEN]} />
                    </mesh>
                    {/* Double Doors */}
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH - 0.05),
                        1.0,
                        bayZ - 0.9,
                      ]}
                      material={materials.darkDoor}
                    >
                      <boxGeometry args={[0.04, 2.0, 1.1]} />
                    </mesh>
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH - 0.05),
                        1.0,
                        bayZ + 0.9,
                      ]}
                      material={materials.darkDoor}
                    >
                      <boxGeometry args={[0.04, 2.0, 1.1]} />
                    </mesh>
                    <mesh
                      position={[
                        -(COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH + ROOM_DEPTH / 2),
                        FLOOR_HEIGHT / 2,
                        -WING_LENGTH + bayIdx * LARGE_BAY_LEN,
                      ]}
                      castShadow
                      material={materials.wallStucco}
                    >
                      <boxGeometry args={[ROOM_DEPTH, FLOOR_HEIGHT, 0.16]} />
                    </mesh>
                  </group>
                );
              })
            )}

            {/* --- RIGHT WING: 4 LARGE ROOMS (ON ALL 5 FLOORS) --- */}
            {Array.from({ length: LARGE_BAYS }).map((_, bayIdx) => {
              const bayZ = -WING_LENGTH + (bayIdx + 0.5) * LARGE_BAY_LEN;
              return (
                <group key={`right-room-${bayIdx}`}>
                  {/* Outer Wall (East) */}
                  <mesh
                    position={[
                      COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH,
                      FLOOR_HEIGHT / 2,
                      bayZ,
                    ]}
                    castShadow
                    material={materials.wallStucco}
                  >
                    <boxGeometry args={[0.18, FLOOR_HEIGHT, LARGE_BAY_LEN]} />
                  </mesh>
                  {/* Corridor Wall */}
                  <mesh
                    position={[
                      COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH,
                      FLOOR_HEIGHT / 2,
                      bayZ,
                    ]}
                    castShadow
                    material={materials.wallStucco}
                  >
                    <boxGeometry args={[0.18, FLOOR_HEIGHT, LARGE_BAY_LEN]} />
                  </mesh>
                  {/* Double Doors */}
                  <mesh
                    position={[
                      COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH - 0.05,
                      1.0,
                      bayZ - 0.9,
                    ]}
                    material={materials.darkDoor}
                  >
                    <boxGeometry args={[0.04, 2.0, 1.1]} />
                  </mesh>
                  <mesh
                    position={[
                      COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH - 0.05,
                      1.0,
                      bayZ + 0.9,
                    ]}
                    material={materials.darkDoor}
                  >
                    <boxGeometry args={[0.04, 2.0, 1.1]} />
                  </mesh>
                  {/* Divider Wall */}
                  <mesh
                    position={[
                      COURTYARD_WIDTH / 2 + CORRIDOR_WIDTH + ROOM_DEPTH / 2,
                      FLOOR_HEIGHT / 2,
                      -WING_LENGTH + bayIdx * LARGE_BAY_LEN,
                    ]}
                    castShadow
                    material={materials.wallStucco}
                  >
                    <boxGeometry args={[ROOM_DEPTH, FLOOR_HEIGHT, 0.16]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* --- VERTICAL CONCRETE SQUARE PILLARS (Along Courtyard Facades) --- */}
      {/* Left Wing Pillars (at every bay division) */}
      {Array.from({ length: LARGE_BAYS + 1 }).map((_, i) => (
        <mesh
          key={`col-left-${i}`}
          position={[-COURTYARD_WIDTH / 2, TOTAL_HEIGHT / 2, -WING_LENGTH + i * LARGE_BAY_LEN]}
          castShadow
          material={materials.concretePillar}
        >
          <boxGeometry args={[PILLAR_SIZE, TOTAL_HEIGHT, PILLAR_SIZE]} />
        </mesh>
      ))}

      {/* Right Wing Pillars (at every bay division) */}
      {Array.from({ length: LARGE_BAYS + 1 }).map((_, i) => (
        <mesh
          key={`col-right-${i}`}
          position={[COURTYARD_WIDTH / 2, TOTAL_HEIGHT / 2, -WING_LENGTH + i * LARGE_BAY_LEN]}
          castShadow
          material={materials.concretePillar}
        >
          <boxGeometry args={[PILLAR_SIZE, TOTAL_HEIGHT, PILLAR_SIZE]} />
        </mesh>
      ))}

      {/* --- PROTRUDING CENTRAL STAIRCASE TOWER --- */}
      {/* Extends into the courtyard and above roofline as in reference photo */}
      <group position={[0, 0, -WING_LENGTH + 1.2]}>
        {/* Main Tower Mass */}
        <mesh position={[0, TOTAL_HEIGHT / 2 + 0.6, 0]} castShadow material={materials.wallStucco}>
          <boxGeometry args={[3.6, TOTAL_HEIGHT + 1.2, 2.6]} />
        </mesh>

        {/* Front & Side Window / Breeze Grids across all floors */}
        {Array.from({ length: FLOORS }).map((_, fIdx) => (
          <group key={`tower-front-${fIdx}`} position={[0, (fIdx + 0.5) * FLOOR_HEIGHT, 1.32]}>
            {/* Ventilation Louvre Panel */}
            <mesh material={materials.breezeBlock}>
              <boxGeometry args={[2.8, 1.8, 0.05]} />
            </mesh>
            {/* Concrete Framing */}
            <mesh material={materials.concretePillar}>
              <boxGeometry args={[0.08, 1.8, 0.08]} />
            </mesh>
            <mesh material={materials.concretePillar}>
              <boxGeometry args={[2.8, 0.08, 0.08]} />
            </mesh>
          </group>
        ))}

        {/* Parapet on top of Staircase Tower */}
        <mesh position={[0, TOTAL_HEIGHT + 1.3, 0]} material={materials.wallStucco}>
          <boxGeometry args={[3.8, 0.3, 2.8]} />
        </mesh>
      </group>

      {/* --- RIGHT WING FRONT GABLE END: OPEN EMERGENCY EXIT STAIRCASE --- */}
      {/* As clearly shown in reference photo: steel zigzag staircase with black railings */}
      <group position={[COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2, 0, 0.8]}>
        {Array.from({ length: FLOORS }).map((_, fIdx) => {
          const stepY = fIdx * FLOOR_HEIGHT;
          return (
            <group key={`ext-stair-${fIdx}`} position={[0, stepY, 0]}>
              {/* Landing Slab */}
              <mesh position={[0, 0.08, 0]} castShadow material={materials.stairStep}>
                <boxGeometry args={[2.4, 0.16, 1.6]} />
              </mesh>
              {/* Black Metal Handrails */}
              <mesh position={[-1.25, 0.55, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.04, 0.9, 1.6]} />
              </mesh>
              <mesh position={[1.25, 0.55, 0]} material={materials.blackGuardrail}>
                <boxGeometry args={[0.04, 0.9, 1.6]} />
              </mesh>
              <mesh position={[0, 0.55, 0.82]} material={materials.blackGuardrail}>
                <boxGeometry args={[2.4, 0.9, 0.04]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* --- GABLE OUTER END WALLS: 3 VERTICAL VENTILATION BANDS PER FLOOR --- */}
      {/* Left Wing Gable (Front) */}
      <group position={[-(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2), 0, 0.08]}>
        <mesh position={[0, TOTAL_HEIGHT / 2, 0]} castShadow material={materials.wallStucco}>
          <boxGeometry args={[WING_TOTAL_WIDTH, TOTAL_HEIGHT, 0.2]} />
        </mesh>
        {Array.from({ length: FLOORS }).map((_, fIdx) => (
          <group key={`vent-l-${fIdx}`} position={[0, (fIdx + 0.5) * FLOOR_HEIGHT, 0.12]}>
            {[-1.3, 0, 1.3].map((xOffset, vIdx) => (
              <mesh key={`v-l-${vIdx}`} position={[xOffset, 0, 0]} material={materials.breezeBlock}>
                <boxGeometry args={[0.6, 1.2, 0.04]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Right Wing Gable (Front) */}
      <group position={[COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2, 0, 0.08]}>
        <mesh position={[0, TOTAL_HEIGHT / 2, 0]} castShadow material={materials.wallStucco}>
          <boxGeometry args={[WING_TOTAL_WIDTH, TOTAL_HEIGHT, 0.2]} />
        </mesh>
        {Array.from({ length: FLOORS }).map((_, fIdx) => (
          <group key={`vent-r-${fIdx}`} position={[0, (fIdx + 0.5) * FLOOR_HEIGHT, 0.12]}>
            {[-1.3, 0, 1.3].map((xOffset, vIdx) => (
              <mesh key={`v-r-${vIdx}`} position={[xOffset, 0, 0]} material={materials.breezeBlock}>
                <boxGeometry args={[0.6, 1.2, 0.04]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* --- SUBTLE BLUE CORNER PILASTERS (4 Outer Corners as in reference photo) --- */}
      {[
        [-(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH), 0],
        [-(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH), -WING_LENGTH - BASE_DEPTH],
        [COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH, 0],
        [COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH, -WING_LENGTH - BASE_DEPTH],
      ].map(([x, z], idx) => (
        <mesh
          key={`corner-pilaster-${idx}`}
          position={[x, TOTAL_HEIGHT / 2, z]}
          castShadow
          material={materials.bluePilaster}
        >
          <boxGeometry args={[0.38, TOTAL_HEIGHT + 0.4, 0.38]} />
        </mesh>
      ))}

      {/* --- ROOF SLAB & PARAPET WALLS --- */}
      {/* Left Wing Roof */}
      <mesh
        position={[
          -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2),
          TOTAL_HEIGHT + 0.08,
          -WING_LENGTH / 2,
        ]}
        material={materials.roofGravel}
      >
        <boxGeometry args={[WING_TOTAL_WIDTH, 0.16, WING_LENGTH]} />
      </mesh>
      {/* Left Wing Roof Parapet */}
      <mesh
        position={[
          -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2),
          TOTAL_HEIGHT + 0.35,
          -WING_LENGTH / 2,
        ]}
        material={materials.wallStucco}
      >
        <boxGeometry args={[WING_TOTAL_WIDTH + 0.15, 0.5, WING_LENGTH + 0.15]} />
      </mesh>

      {/* Right Wing Roof */}
      <mesh
        position={[
          COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2,
          TOTAL_HEIGHT + 0.08,
          -WING_LENGTH / 2,
        ]}
        material={materials.roofGravel}
      >
        <boxGeometry args={[WING_TOTAL_WIDTH, 0.16, WING_LENGTH]} />
      </mesh>
      {/* Right Wing Roof Parapet */}
      <mesh
        position={[
          COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2,
          TOTAL_HEIGHT + 0.35,
          -WING_LENGTH / 2,
        ]}
        material={materials.wallStucco}
      >
        <boxGeometry args={[WING_TOTAL_WIDTH + 0.15, 0.5, WING_LENGTH + 0.15]} />
      </mesh>

      {/* Central Block Roof */}
      <mesh
        position={[0, TOTAL_HEIGHT + 0.08, -WING_LENGTH - BASE_DEPTH / 2]}
        material={materials.roofGravel}
      >
        <boxGeometry args={[COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH, 0.16, BASE_DEPTH]} />
      </mesh>
      {/* Central Block Roof Parapet */}
      <mesh
        position={[0, TOTAL_HEIGHT + 0.35, -WING_LENGTH - BASE_DEPTH / 2]}
        material={materials.wallStucco}
      >
        <boxGeometry args={[COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH + 0.15, 0.5, BASE_DEPTH + 0.15]} />
      </mesh>

      {/* Small Roof Mechanical Boxes / Access Enclosures */}
      <mesh
        position={[
          -(COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2),
          TOTAL_HEIGHT + 0.9,
          -1.5,
        ]}
        material={materials.concretePillar}
      >
        <boxGeometry args={[1.6, 0.8, 1.8]} />
      </mesh>
      <mesh
        position={[
          COURTYARD_WIDTH / 2 + WING_TOTAL_WIDTH / 2,
          TOTAL_HEIGHT + 0.9,
          -1.5,
        ]}
        material={materials.concretePillar}
      >
        <boxGeometry args={[1.6, 0.8, 1.8]} />
      </mesh>
    </group>
  );
}
