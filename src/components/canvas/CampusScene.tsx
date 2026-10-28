'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MOCK_BUILDINGS } from '@/data/mockNavigationData';
import { CameraRig } from './CameraRig';
import { PathTube } from './PathTube';
import { BuildingModel } from './BuildingModel';
import { LandmarkPin } from './LandmarkPin';

export function CampusScene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const currentQr = useNavigationStore((state) => state.currentQr);
  const targetRoom = useNavigationStore((state) => state.targetRoom);
  const activeSteps = useNavigationStore((state) => state.activeSteps);
  const currentStepIndex = useNavigationStore((state) => state.currentStepIndex);

  const activeStep = activeSteps[currentStepIndex];

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{
          position: currentQr?.initialCameraPos ?? [0, 24, 42],
          fov: 45,
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 50, 140]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#bae6fd', '#0f172a', 0.6]} />
        <directionalLight
          position={[30, 45, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* Camera Rig (GSAP Tweening) */}
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.05} // Don't allow camera under ground
          minDistance={5}
          maxDistance={120}
        />

        <Suspense fallback={null}>
          {/* Ground Grid & Courtyard Surface */}
          <group position={[0, -0.01, 0]}>
            <Grid
              renderOrder={-1}
              position={[0, 0.01, 0]}
              infiniteGrid
              cellSize={2}
              cellThickness={0.8}
              cellColor="#334155"
              sectionSize={10}
              sectionThickness={1.2}
              sectionColor="#475569"
              fadeDistance={90}
            />
            {/* Campus Plaza Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
              <planeGeometry args={[140, 140]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.1} />
            </mesh>
          </group>

          {/* Campus Buildings */}
          {/* Building A */}
          <BuildingModel
            building={MOCK_BUILDINGS[0]}
            position={[-15, 0, 5]}
            size={[12, 10, 14]}
            floorsCount={3}
          />

          {/* Building B (Target building with Room B302) */}
          <BuildingModel
            building={MOCK_BUILDINGS[1]}
            position={[12, 0, -8]}
            size={[14, 11, 14]}
            floorsCount={3}
          />

          {/* Building C */}
          <BuildingModel
            building={MOCK_BUILDINGS[2]}
            position={[0, 0, -25]}
            size={[16, 9, 12]}
            floorsCount={2}
          />

          {/* Glowing 3D Navigation Path */}
          {activeStep && activeStep.pathPoints && activeStep.pathPoints.length >= 2 && (
            <PathTube points={activeStep.pathPoints} />
          )}

          {/* QR Origin Pin ("Bạn đang ở đây") */}
          {currentQr && (
            <LandmarkPin
              type="ORIGIN_QR"
              position={currentQr.coordinates}
              title="Bạn đang ở đây"
              subtitle={currentQr.name}
            />
          )}

          {/* Target Room Pin */}
          {targetRoom && (
            <LandmarkPin
              type="TARGET_ROOM"
              position={targetRoom.doorCoordinates}
              title={`Phòng ${targetRoom.code}`}
              subtitle={targetRoom.name}
            />
          )}

          {/* Active Step Photo Landmark Pin */}
          {activeStep?.landmarkPhotoUrl && activeStep.pathPoints.length > 0 && (
            <LandmarkPin
              type="PHOTO_LANDMARK"
              position={
                activeStep.pathPoints[
                  Math.floor(activeStep.pathPoints.length / 2)
                ]
              }
              title="Ảnh vị trí thực tế"
              photoUrl={activeStep.landmarkPhotoUrl}
            />
          )}

          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.65}
            scale={70}
            blur={2}
            far={10}
            resolution={512}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
