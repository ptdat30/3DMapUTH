'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigationStore } from '@/store/useNavigationStore';

/**
 * 3D Glowing Navigation Path (Glow Path)
 * Uses CatmullRomCurve3 with tubeGeometry and emissive cyan shader styling.
 * Elevated at Y = 0.2 to completely prevent Z-fighting with ground planes.
 */
export function NavigationPath3D() {
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const isNavigating = useNavigationStore((state) => state.isNavigating);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Generate smooth 3D spline curve from waypoints
  const { curve, startPoint, endPoint } = useMemo(() => {
    if (!activeRoute || !activeRoute.fullPathPoints || activeRoute.fullPathPoints.length < 2) {
      return { curve: null, startPoint: null, endPoint: null };
    }

    const vectors = activeRoute.fullPathPoints.map(
      ([x, y, z]) => new THREE.Vector3(x, y ?? 0.2, z)
    );

    const spline = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.2);
    return {
      curve: spline,
      startPoint: vectors[0],
      endPoint: vectors[vectors.length - 1],
    };
  }, [activeRoute]);

  // Subtle pulsing animation on the emissive tube
  useFrame(({ clock }) => {
    if (glowMaterialRef.current) {
      const t = clock.getElapsedTime();
      glowMaterialRef.current.emissiveIntensity = 2.0 + Math.sin(t * 3.5) * 0.8;
    }
  });

  if (!isNavigating || !curve || !startPoint || !endPoint) {
    return null;
  }

  return (
    <group name="navigation-path-3d">
      {/* 1. Main Glowing Tube */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <tubeGeometry args={[curve, 80, 0.28, 12, false]} />
        <meshStandardMaterial
          ref={glowMaterialRef}
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={2.2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 2. Soft Outer Aura Tube */}
      <mesh position={[0, 0, 0]}>
        <tubeGeometry args={[curve, 60, 0.55, 8, false]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Start Point Indicator (Cyan Beacon at Building H) */}
      <group position={[startPoint.x, startPoint.y + 0.1, startPoint.z]}>
        <mesh>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#38bdf8"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.6, 1.2, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 4. Destination Pin Indicator (Crimson/Amber Beacon at Building J) */}
      <group position={[endPoint.x, endPoint.y + 0.2, endPoint.z]}>
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.65, 1.8, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#f87171"
            emissiveIntensity={2.0}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.5, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

