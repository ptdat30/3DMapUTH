'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import * as THREE from 'three';
import { useNavigationStore } from '@/store/useNavigationStore';

interface CameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraRig({ controlsRef }: CameraRigProps) {
  const { camera } = useThree();
  const cameraPosition = useNavigationStore((state) => state.cameraPosition);
  const cameraTarget = useNavigationStore((state) => state.cameraTarget);
  const setCameraAnimating = useNavigationStore((state) => state.setCameraAnimating);
  
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    // Cancel existing animations
    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    setCameraAnimating(true);

    const controls = controlsRef.current;
    const targetObj = {
      px: camera.position.x,
      py: camera.position.y,
      pz: camera.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        camera.position.set(targetObj.px, targetObj.py, targetObj.pz);
        controls.target.set(targetObj.tx, targetObj.ty, targetObj.tz);
        controls.update();
      },
      onComplete: () => {
        setCameraAnimating(false);
      },
    });

    tl.to(targetObj, {
      px: cameraPosition[0],
      py: cameraPosition[1],
      pz: cameraPosition[2],
      tx: cameraTarget[0],
      ty: cameraTarget[1],
      tz: cameraTarget[2],
      duration: 1.25,
      ease: 'power2.inOut',
    });

    tweenRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [camera, cameraPosition, cameraTarget, controlsRef, setCameraAnimating]);

  return null;
}
