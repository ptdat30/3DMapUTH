'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function ApNodesLayer() {
  const activeLayers = useTwinStore((state) => state.activeLayers);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectedFloorNumber = useTwinStore((state) => state.selectedFloorNumber);
  const selectedApId = useTwinStore((state) => state.selectedApId);
  const selectAp = useTwinStore((state) => state.selectAp);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const searchQuery = useTwinStore((state) => state.searchQuery.toLowerCase());

  const rippleGroupRef = useRef<THREE.Group>(null);

  // Ripple animation for critical/poor APs
  useFrame(({ clock }) => {
    if (!rippleGroupRef.current) return;
    const t = clock.getElapsedTime();
    rippleGroupRef.current.children.forEach((mesh, idx) => {
      const phase = (t * 1.5 + idx * 0.4) % 1;
      mesh.scale.set(1 + phase * 2.2, 1 + phase * 2.2, 1);
      if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = (1 - phase) * 0.7;
      }
    });
  });

  if (!activeLayers.apBeacons) return null;

  // Filter APs
  const visibleAps = simulationData.accessPoints.filter((ap) => {
    // If a building is selected, only show APs for that building
    if (selectedBuildingId && ap.buildingId !== selectedBuildingId) return false;
    // If a floor is selected, only show APs for that floor
    if (selectedFloorNumber !== null && ap.floorNumber !== selectedFloorNumber) return false;
    // Status filter
    if (statusFilter !== 'ALL' && ap.metrics.status !== statusFilter) return false;
    // Search query filter
    if (searchQuery && !ap.name.toLowerCase().includes(searchQuery) && !ap.id.toLowerCase().includes(searchQuery)) {
      return false;
    }
    return true;
  });

  return (
    <group>
      {/* Ripple Rings */}
      <group ref={rippleGroupRef}>
        {visibleAps
          .filter((ap) => ap.metrics.status === 'CRITICAL' || ap.metrics.status === 'POOR')
          .map((ap) => (
            <mesh
              key={`ripple-${ap.id}`}
              position={[ap.position3D[0], ap.position3D[1] + 0.05, ap.position3D[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.3, 0.45, 16]} />
              <meshBasicMaterial
                color={getStatusColorToken(ap.metrics.status)}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
      </group>

      {/* AP Spheres */}
      {visibleAps.map((ap) => {
        const isSelected = selectedApId === ap.id;
        const color = getStatusColorToken(ap.metrics.status);

        return (
          <group
            key={ap.id}
            position={ap.position3D}
            onClick={(e) => {
              e.stopPropagation();
              selectAp(isSelected ? null : ap.id);
            }}
          >
            {/* Glowing AP Sphere */}
            <mesh scale={isSelected ? [1.5, 1.5, 1.5] : [1, 1, 1]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 1.0 : 0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Selection Aura */}
            {isSelected && (
              <mesh scale={[2.2, 2.2, 2.2]}>
                <sphereGeometry args={[0.26, 16, 16]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.35}
                  wireframe
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
