'use client';

import React, { Suspense, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigationStore } from '@/store/useNavigationStore';

interface CADBuildingModelProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  buildingCode?: string;
  buildingName?: string;
  fallback?: ReactNode;
  heightOffset?: number;
  onClick?: () => void;
}

// Error Boundary to safely catch missing .glb models and render fallback
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('CAD Model failed to load, switching to procedural fallback:', error.message, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

// Cache tuned scenes to prevent garbage collection spikes on component re-renders
const tunedSceneCache = new WeakMap<THREE.Group, THREE.Group>();

// Static reusable objects for zero-allocation bounding-box raycasting
const _inverseMatrix = new THREE.Matrix4();
const _ray = new THREE.Ray();
const _hitPoint = new THREE.Vector3();

// Internal GLTF Loader Mesh
function LoadedGLTFMesh({
  modelUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  buildingCode,
  buildingName,
  heightOffset = 12.0,
  onClick,
}: CADBuildingModelProps) {
  const { scene } = useGLTF(modelUrl);
  const viewMode = useNavigationStore((state) => state.viewMode);
  const activeBuildingCode = useNavigationStore((state) => state.activeBuildingCode);
  const selectedBuildingCode = useNavigationStore((state) => state.selectedBuildingCode);
  const setSelectedBuilding = useNavigationStore((state) => state.setSelectedBuilding);

  const isSelected = selectedBuildingCode === buildingCode || activeBuildingCode === buildingCode;

  // Retrieve cached tuned scene or clone once
  const clonedScene = useMemo(() => {
    const cached = tunedSceneCache.get(scene);
    if (cached) return cached;

    const clone = scene.clone(true);

    clone.traverse((child) => {
      child.frustumCulled = true;
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = true;
        mesh.castShadow = true;
        mesh.receiveShadow = false;

        // CRITICAL PERFORMANCE: Bypass per-triangle raycasting on heavy CAD meshes
        // Test only the bounding box instead of 600,000+ triangles per frame on mouse move
        mesh.raycast = function (raycaster, intersects) {
          if (!this.geometry.boundingBox) this.geometry.computeBoundingBox();
          const box = this.geometry.boundingBox;
          if (!box) return;

          _inverseMatrix.copy(this.matrixWorld).invert();
          _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

          if (_ray.intersectsBox(box)) {
            if (_ray.intersectBox(box, _hitPoint)) {
              const worldPoint = _hitPoint.clone().applyMatrix4(this.matrixWorld);
              const distance = raycaster.ray.origin.distanceTo(worldPoint);
              if (distance >= raycaster.near && distance <= raycaster.far) {
                intersects.push({
                  distance,
                  point: worldPoint,
                  object: this,
                });
              }
            }
          }
        };

        if (mesh.material) {
          const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (origMat instanceof THREE.MeshStandardMaterial) {
            origMat.roughness = Math.max(origMat.roughness ?? 0.65, 0.45);
            origMat.metalness = Math.min(origMat.metalness ?? 0.1, 0.15);
            if (origMat.color.r === 1 && origMat.color.g === 1 && origMat.color.b === 1) {
              origMat.color.set('#f8fafc');
            }
          }
        }
      }
    });

    tunedSceneCache.set(scene, clone);
    return clone;
  }, [scene]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (buildingCode) {
      setSelectedBuilding(buildingCode);
    }
  };

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  const scaleVec: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scaleVec}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 3D CAD Mesh */}
      <primitive object={clonedScene} frustumCulled={true} />

      {/* Building Name Tag in Overall View */}
      {buildingName && (
        <Html
          position={[0, heightOffset + 1.8, 0]}
          center
          distanceFactor={36}
          zIndexRange={[100, 0]}
          style={{
            display: viewMode === 'OVERALL_CAMPUS' ? 'block' : 'none',
            pointerEvents: viewMode === 'OVERALL_CAMPUS' ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            onClick={handleClick}
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap cursor-pointer border ${
              isSelected
                ? 'bg-sky-500 text-white border-white/50 ring-2 ring-sky-300'
                : 'bg-slate-900/90 hover:bg-sky-600 text-white border-white/20'
            }`}
          >
            {buildingName}
          </button>
        </Html>
      )}
    </group>
  );
}

/**
 * Universal CAD Building Model Loader
 * Connects the Python `text-to-cad` / `cadgen` skill exports directly to React Three Fiber.
 *
 * Supports:
 * - Direct `.glb` loading from `/public/models/...`
 * - Automatic shadows and clay maquette material tuning
 * - Seamless fallback to procedural 3D React component if `.glb` has not been generated yet
 */
export function CADBuildingModel({
  modelUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  buildingCode,
  buildingName,
  fallback,
  heightOffset = 12.0,
  onClick,
}: CADBuildingModelProps) {
  return (
    <ModelErrorBoundary fallback={fallback ?? null}>
      <Suspense fallback={fallback ?? null}>
        <LoadedGLTFMesh
          modelUrl={modelUrl}
          position={position}
          rotation={rotation}
          scale={scale}
          buildingCode={buildingCode}
          buildingName={buildingName}
          heightOffset={heightOffset}
          onClick={onClick}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

