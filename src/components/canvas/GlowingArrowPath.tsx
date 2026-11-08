'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3Tuple } from '@/types/navigation';

interface GlowingArrowPathProps {
  start?: Vector3Tuple;
  end?: Vector3Tuple;
  points?: Vector3Tuple[];
  color?: string;
  emissive?: string;
}

export function GlowingArrowPath({
  start = [-8, 0.15, 12],
  end = [6, 0.15, -4],
  points,
  color = '#00d4ff',
  emissive = '#00a8ff',
}: GlowingArrowPathProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // If points are provided, use start and end from points or calculate segments
  const pStart = points && points.length >= 2 ? points[0] : start;
  const pEnd = points && points.length >= 2 ? points[points.length - 1] : end;

  // Calculate length and direction vector
  const { angle, center, segments } = useMemo(() => {
    const vStart = new THREE.Vector3(pStart[0], pStart[1], pStart[2]);
    const vEnd = new THREE.Vector3(pEnd[0], pEnd[1], pEnd[2]);

    const dir = new THREE.Vector3().subVectors(vEnd, vStart);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);

    // Angle on XZ plane
    const yaw = Math.atan2(dir.x, dir.z);

    // Create 2 chevron segments like in the reference image
    const segCount = 2;
    const segLength = (len - 1.2) / segCount;

    return {
      angle: yaw,
      center: mid,
      segments: Array.from({ length: segCount }).map((_, i) => ({
        offsetZ: (i - (segCount - 1) / 2) * (segLength + 0.4),
        length: segLength,
      })),
    };
  }, [pStart, pEnd]);

  // Create chevron 3D Shape
  const createChevronShape = (segLen: number, width: number = 0.8) => {
    const shape = new THREE.Shape();
    const halfW = width / 2;
    const arrowHeadLen = Math.min(1.2, segLen * 0.4);

    shape.moveTo(-halfW, -segLen / 2);
    shape.lineTo(halfW, -segLen / 2);
    shape.lineTo(halfW, segLen / 2 - arrowHeadLen);
    shape.lineTo(halfW * 1.5, segLen / 2 - arrowHeadLen);
    shape.lineTo(0, segLen / 2);
    shape.lineTo(-halfW * 1.5, segLen / 2 - arrowHeadLen);
    shape.lineTo(-halfW, segLen / 2 - arrowHeadLen);
    shape.closePath();

    return shape;
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowMatRef.current) {
      glowMatRef.current.emissiveIntensity = 0.85 + Math.sin(t * 3) * 0.2;
    }
    if (groupRef.current) {
      groupRef.current.position.y = 0.15 + Math.sin(t * 2) * 0.03;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[center.x, 0.15, center.z]}
      rotation={[-Math.PI / 2, 0, -angle + Math.PI]}
    >
      {segments.map((seg, idx) => {
        const shape = createChevronShape(seg.length, 0.7);
        const extrudeSettings = {
          depth: 0.18,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.03,
          bevelThickness: 0.03,
        };

        return (
          <group key={`chevron-${idx}`} position={[0, seg.offsetZ, 0]}>
            {/* Main Glowing Arrow Mesh */}
            <mesh castShadow>
              <extrudeGeometry args={[shape, extrudeSettings]} />
              <meshStandardMaterial
                ref={idx === 0 ? glowMatRef : undefined}
                color={color}
                emissive={emissive}
                emissiveIntensity={0.9}
                roughness={0.15}
                metalness={0.2}
                transparent
                opacity={0.88}
              />
            </mesh>

            {/* Cyan Soft Glow Underlay */}
            <mesh position={[0, 0, -0.05]}>
              <extrudeGeometry
                args={[
                  shape,
                  {
                    depth: 0.05,
                    bevelEnabled: true,
                    bevelSegments: 1,
                    bevelSize: 0.12,
                    bevelThickness: 0.02,
                  },
                ]}
              />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
