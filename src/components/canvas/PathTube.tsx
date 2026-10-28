'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3Tuple } from '@/types/navigation';

interface PathTubeProps {
  points: Vector3Tuple[];
  color?: string;
  glowColor?: string;
  radius?: number;
  showWaypointBeacons?: boolean;
}

export function PathTube({
  points,
  color = '#00f3ff',
  glowColor = '#00e1ff',
  radius = 0.16,
  showWaypointBeacons = true,
}: PathTubeProps) {
  const pulseMeshRef = useRef<THREE.Mesh>(null);
  const pulseProgressRef = useRef<number>(0);

  // Build 3D Curve from points
  const curve = useMemo(() => {
    if (!points || points.length < 2) return null;

    const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    // If only 2 points, use simple curve or CatmullRom with tension
    return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.15);
  }, [points]);

  // Tube geometry
  const tubeGeometry = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 64, radius, 12, false);
  }, [curve, radius]);

  // Animate pulse marker travelling along the tube
  useFrame((_, delta) => {
    if (!curve || !pulseMeshRef.current) return;

    pulseProgressRef.current = (pulseProgressRef.current + delta * 0.45) % 1;
    const currentPoint = curve.getPointAt(pulseProgressRef.current);
    pulseMeshRef.current.position.copy(currentPoint);
  });

  if (!curve || !tubeGeometry) return null;

  return (
    <group>
      {/* Main Glowing Tube */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={2.5}
          roughness={0.15}
          metalness={0.8}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Outer Cyan Halo */}
      <mesh geometry={tubeGeometry} scale={[1.18, 1.18, 1.18]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Travelling Pulse Bead */}
      <mesh ref={pulseMeshRef}>
        <sphereGeometry args={[radius * 2.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color={color} intensity={2} distance={3} />
      </mesh>

      {/* Waypoint Nodes along the path */}
      {showWaypointBeacons &&
        points.map((pt, idx) => (
          <group key={`waypoint-${idx}`} position={[pt[0], pt[1], pt[2]]}>
            <mesh>
              <sphereGeometry args={[radius * 1.5, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={color}
                emissiveIntensity={2}
              />
            </mesh>
            {/* Ground indicator disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pt[1] + 0.05, 0]}>
              <ringGeometry args={[0.2, 0.45, 24]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
    </group>
  );
}
