'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function FloorXRaySlice() {
  const activeLayers = useTwinStore((state) => state.activeLayers);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectedFloorNumber = useTwinStore((state) => state.selectedFloorNumber);

  const selectedBuilding = simulationData.buildings.find((b) => b.id === selectedBuildingId);

  // Generate dynamic Heatmap texture on HTML Canvas
  const heatmapTexture = useMemo(() => {
    if (!selectedBuilding || selectedFloorNumber === null) return null;

    const floorAps = simulationData.accessPoints.filter(
      (ap) => ap.buildingId === selectedBuilding.id && ap.floorNumber === selectedFloorNumber
    );

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill dark navy base
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, 256, 256);

    // Draw radial gradients for each AP
    floorAps.forEach((ap, idx) => {
      // Relative offset within building bounds
      const relX = 128 + ((ap.position3D[0] - selectedBuilding.center3D[0]) / (selectedBuilding.dimensions3D[0] / 2)) * 100;
      const relY = 128 + ((ap.position3D[2] - selectedBuilding.center3D[2]) / (selectedBuilding.dimensions3D[2] / 2)) * 100;

      const grad = ctx.createRadialGradient(relX, relY, 5, relX, relY, 70);
      const color = getStatusColorToken(ap.metrics.status);

      grad.addColorStop(0, color);
      grad.addColorStop(0.5, `${color}66`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(relX, relY, 70, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [selectedBuilding, selectedFloorNumber, simulationData.accessPoints]);

  if (!activeLayers.xraySlices || !selectedBuilding || selectedFloorNumber === null) {
    return null;
  }

  // Calculate slice elevation Y
  const floorNode = selectedBuilding.floors.find((f) => f.floorNumber === selectedFloorNumber);
  const elevationY = floorNode ? floorNode.elevationY : selectedBuilding.center3D[1];

  const [w, , d] = selectedBuilding.dimensions3D;

  return (
    <group position={[selectedBuilding.center3D[0], elevationY, selectedBuilding.center3D[2]]}>
      {/* 2.5D Hologram Floor Plane with Heatmap */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial
          map={heatmapTexture || undefined}
          color={heatmapTexture ? '#ffffff' : '#38bdf8'}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe Outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.1, d + 0.1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}
