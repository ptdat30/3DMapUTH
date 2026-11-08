'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { FastForward, Dumbbell } from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useCinematicTour } from '@/hooks/useCinematicTour';

interface CinematicTourManagerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/**
 * Controller Component chạy bên trong <Canvas> của CampusCS3Scene
 * Tự động bắt sự kiện khi người dùng tìm kiếm "Phòng Gym" (L_FITNESS) và kích hoạt Cinematic Tour.
 */
const GYM_CAMERA_OFFSET: [number, number, number] = [8, 9, 8];
const USER_CAMERA_OFFSET: [number, number, number] = [18, 22, 18];

export function CinematicTourManager({ controlsRef }: CinematicTourManagerProps) {
  const targetRoom = useNavigationStore((state) => state.targetRoom);
  const currentCampusCode = useNavigationStore((state) => state.currentCampusCode);

  // Vị trí người dùng tại Cổng chính Cơ sở 3
  const userPosition = useMemo<[number, number, number]>(() => [8.0, 0.2, 25.5], []);
  
  // Tọa độ Phòng Gym UTH Fitness (Tòa L - CS3 sát Cổng 2)
  const gymPosition = useMemo<[number, number, number]>(() => [14.8, 1.3, 22.3], []);

  // Tuyến đường đi từ Cổng chính đến Phòng Gym Tòa L
  const pathWaypoints = useMemo<[number, number, number][]>(
    () => [
      [8.0, 0.2, 25.5],
      [11.0, 0.2, 22.3],
      [14.8, 0.2, 22.3],
    ],
    []
  );

  const {
    startTour,
    skipTour,
    isTouring,
    isHighlightingGym,
    pathDrawProgress,
    gymScale,
    gymEmissiveIntensity,
  } = useCinematicTour({
    controlsRef,
    userPosition,
    gymPosition,
    pathPoints: pathWaypoints,
    gymCameraOffset: GYM_CAMERA_OFFSET,
    userCameraOffset: USER_CAMERA_OFFSET,
  });

  // Ref lưu mã phòng đã chạy tour để đảm bảo chỉ chạy DUY NHẤT 1 LẦN cho mỗi lần chọn
  const hasTouredRoomRef = useRef<string | null>(null);

  // Tự động kích hoạt Tour đúng 1 lần khi người dùng tìm kiếm hoặc chọn "Phòng Gym" tại CS3
  useEffect(() => {
    if (currentCampusCode !== 'cs3' || !targetRoom) {
      hasTouredRoomRef.current = null;
      return;
    }

    const isGymSearch =
      targetRoom.code === 'L_FITNESS' ||
      targetRoom.searchKeywords?.toLowerCase().includes('gym') ||
      targetRoom.name?.toLowerCase().includes('gym');

    // Chỉ kích hoạt khi là phòng Gym và chưa từng chạy tour cho phòng này
    if (isGymSearch && hasTouredRoomRef.current !== targetRoom.code) {
      hasTouredRoomRef.current = targetRoom.code;
      startTour();
    }
  }, [targetRoom, currentCampusCode, startTour]);

  // Đường cong Catmull-Rom cho progressive path
  const splineCurve = useMemo(() => {
    const vectors = pathWaypoints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(vectors);
  }, [pathWaypoints]);

  return (
    <group name="cinematic-gym-tour">
      {/* 1. NÚT BỎ QUA (SKIP TOUR BUTTON) KHI TOUR ĐANG CHẠY */}
      {isTouring && (
        <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
          <div className="absolute top-20 right-6 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
            <button
              type="button"
              onClick={skipTour}
              className="flex items-center gap-2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl text-xs font-bold border border-sky-400/50 shadow-2xl hover:bg-sky-600 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <FastForward className="w-4 h-4 text-amber-300" />
              <span>Bỏ qua Cinematic Tour</span>
            </button>
          </div>
        </Html>
      )}

      {/* 2. HIGHLIGHT BILLBOARD & PULSE MESH TẠI PHÒNG GYM */}
      <group position={gymPosition} scale={[gymScale, gymScale, gymScale]}>
        {/* Vòng hào quang phát sáng quanh Tòa L khi Highlight */}
        {gymEmissiveIntensity > 0 && (
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4.2, 4.8, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
          </mesh>
        )}

        {/* Billboard thông báo "Phòng Gym UTH Fitness" */}
        {isHighlightingGym && (
          <Html position={[0, 4.2, 0]} center distanceFactor={30}>
            <div className="bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 whitespace-nowrap animate-bounce select-none">
              <Dumbbell className="w-5 h-5 text-slate-900" />
              <div>
                <div className="text-xs uppercase tracking-wider font-extrabold">Phòng Gym UTH Fitness</div>
                <div className="text-[10px] font-semibold text-slate-800">Tòa L • Cơ Sở 3 UTH</div>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* 3. ĐƯỜNG DẪN ĐƯỜNG VẼ DẦN (PROGRESSIVE ANIMATED PATH) */}
      {pathDrawProgress > 0 && (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <tubeGeometry args={[splineCurve, 48, 0.25, 8, false]} />
            <meshStandardMaterial
              color="#00f2fe"
              emissive="#38bdf8"
              emissiveIntensity={2.2}
              transparent
              opacity={pathDrawProgress}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
