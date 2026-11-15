'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function AlertPillars() {
  const activeLayers = useTwinStore((state) => state.activeLayers);
  const simulationData = useTwinStore((state) => state.simulationData);
  const resolvedAlertIds = useTwinStore((state) => state.resolvedAlertIds);
  const pillarGroupRef = useRef<THREE.Group>(null);

  // Animate pulse
  useFrame(({ clock }) => {
    if (!pillarGroupRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 3) * 0.15;
    const opacity = 0.55 + Math.sin(t * 3) * 0.25;

    pillarGroupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.scale.set(scale, 1, scale);
        child.material.opacity = opacity;
      }
    });
  });

  if (!activeLayers.alertPillars) return null;

  // Active alerts that are CRITICAL or WARNING and not resolved
  const activeAlerts = simulationData.alerts.filter(
    (a) => !resolvedAlertIds.includes(a.id)
  );

  return (
    <group ref={pillarGroupRef}>
      {activeAlerts.map((alert) => {
        // Find position from AP or building
        let pos: [number, number, number] = [0, 0, 0];
        if (alert.apId) {
          const ap = simulationData.accessPoints.find((a) => a.id === alert.apId);
          if (ap) pos = [ap.position3D[0], ap.position3D[1] + 6, ap.position3D[2]];
        } else {
          const bldg = simulationData.buildings.find((b) => b.id === alert.buildingId);
          if (bldg) pos = [bldg.center3D[0], bldg.center3D[1] + 6, bldg.center3D[2]];
        }

        const color = alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';

        return (
          <group key={`pillar-${alert.id}`} position={pos}>
            {/* Vertical Laser Cylinder */}
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.2, 0.45, 14, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Glowing Ground / Roof Base Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.9, 0]}>
              <ringGeometry args={[0.5, 1.8, 24]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
