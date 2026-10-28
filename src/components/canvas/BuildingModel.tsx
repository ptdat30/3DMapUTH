'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingData, ViewMode } from '@/types/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';

interface BuildingModelProps {
  building: BuildingData;
  position?: [number, number, number];
  size?: [number, number, number];
  floorsCount?: number;
}

export function BuildingModel({
  building,
  position = [0, 0, 0],
  size = [12, 10, 10],
  floorsCount = 3,
}: BuildingModelProps) {
  const viewMode = useNavigationStore((state) => state.viewMode);
  const activeBuildingCode = useNavigationStore((state) => state.activeBuildingCode);
  const activeFloorLevel = useNavigationStore((state) => state.activeFloorLevel);
  const setViewMode = useNavigationStore((state) => state.setViewMode);

  const isSelectedBuilding = activeBuildingCode === building.code;
  const isFloorMode = viewMode === 'BUILDING_FLOOR' && isSelectedBuilding;

  const floorHeight = size[1] / floorsCount;

  // Handle clicking a building in overall view to zoom in
  const handleBuildingClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setViewMode('BUILDING_FLOOR', building.code, 1);
  };

  return (
    <group position={position}>
      {/* Building Name Tag in Overall View */}
      {viewMode === 'OVERALL_CAMPUS' && (
        <Html position={[0, size[1] + 1.8, 0]} center distanceFactor={26}>
          <button
            type="button"
            onClick={handleBuildingClick}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-600/90 text-white text-[11px] font-semibold tracking-wide backdrop-blur-md border border-white/20 shadow-md transition-all hover:scale-105"
          >
            {building.name}
          </button>
        </Html>
      )}

      {/* Building Base / Slabs for each floor */}
      {Array.from({ length: floorsCount }).map((_, index) => {
        const floorLevel = index + 1;
        const isCurrentActiveFloor = isFloorMode && activeFloorLevel === floorLevel;
        const floorY = (index + 0.5) * floorHeight;

        // Clay white styling
        const materialColor = isCurrentActiveFloor
          ? '#60a5fa' // Highlight active floor with bright cyan/blue
          : isFloorMode
          ? '#e2e8f0'
          : '#f8fafc';

        const opacity = isFloorMode
          ? isCurrentActiveFloor
            ? 0.95
            : 0.35 // Dim inactive floors in floor mode
          : 0.9;

        return (
          <group key={`bld-${building.code}-floor-${floorLevel}`} position={[0, floorY, 0]}>
            {/* Floor Slab Mesh */}
            <mesh
              castShadow
              receiveShadow
              onClick={handleBuildingClick}
            >
              <boxGeometry args={[size[0], floorHeight * 0.92, size[2]]} />
              <meshStandardMaterial
                color={materialColor}
                roughness={0.25}
                metalness={0.1}
                transparent={isFloorMode}
                opacity={opacity}
              />
            </mesh>

            {/* Floor edge accent line */}
            <mesh position={[0, -floorHeight * 0.44, 0]}>
              <boxGeometry args={[size[0] * 1.02, 0.08, size[2] * 1.02]} />
              <meshStandardMaterial
                color={isCurrentActiveFloor ? '#3b82f6' : '#cbd5e1'}
                emissive={isCurrentActiveFloor ? '#2563eb' : '#000000'}
                emissiveIntensity={isCurrentActiveFloor ? 0.6 : 0}
              />
            </mesh>

            {/* Floor Level Label when in Floor Mode */}
            {isFloorMode && (
              <Html
                position={[-size[0] / 2 - 0.8, 0, 0]}
                center
                distanceFactor={18}
              >
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCurrentActiveFloor
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                      : 'bg-slate-800/70 text-slate-300'
                  }`}
                >
                  T{floorLevel}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Building Main Entrance / Hub Indicator */}
      <group position={[0, 0.2, size[2] / 2 + 0.3]}>
        <mesh>
          <boxGeometry args={[2.8, 0.4, 0.8]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
