'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { useTwinStore } from '@/store/useTwinStore';

interface TwinCameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function TwinCameraRig({ controlsRef }: TwinCameraRigProps) {
  const { camera } = useThree();
  const isTwinMode = useTwinStore((state) => state.isTwinMode);
  const cameraFocusTarget = useTwinStore((state) => state.cameraFocusTarget);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!isTwinMode || !controlsRef.current || !cameraFocusTarget) return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const controls = controlsRef.current;
    const targetObj = {
      px: camera.position.x,
      py: camera.position.y,
      pz: camera.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };

    // Calculate nice camera position offset
    const [tx, ty, tz] = cameraFocusTarget;
    const isCampusOverview = tx === 0 && ty === 2 && tz === 4;

    const endPx = isCampusOverview ? 0 : tx + 14;
    const endPy = isCampusOverview ? 38 : ty + 16;
    const endPz = isCampusOverview ? 48 : tz + 18;

    const tl = gsap.timeline({
      onUpdate: () => {
        camera.position.set(targetObj.px, targetObj.py, targetObj.pz);
        controls.target.set(targetObj.tx, targetObj.ty, targetObj.tz);
        controls.update();
      },
    });

    tl.to(targetObj, {
      px: endPx,
      py: endPy,
      pz: endPz,
      tx,
      ty,
      tz,
      duration: 0.8,
      ease: 'power2.out',
    });

    tweenRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [isTwinMode, cameraFocusTarget, camera, controlsRef]);

  return null;
}
