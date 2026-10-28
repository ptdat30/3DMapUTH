'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { MapPin, Navigation, Camera, CheckCircle2 } from 'lucide-react';
import { Vector3Tuple } from '@/types/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';

interface LandmarkPinProps {
  type: 'ORIGIN_QR' | 'TARGET_ROOM' | 'PHOTO_LANDMARK' | 'WAYPOINT';
  position: Vector3Tuple;
  title: string;
  subtitle?: string;
  photoUrl?: string;
}

export function LandmarkPin({
  type,
  position,
  title,
  subtitle,
  photoUrl,
}: LandmarkPinProps) {
  const setSelectedLandmarkPhoto = useNavigationStore(
    (state) => state.setSelectedLandmarkPhoto
  );

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* 3D Vertical stem */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial
          color={
            type === 'ORIGIN_QR'
              ? '#3b82f6'
              : type === 'TARGET_ROOM'
              ? '#10b981'
              : '#f59e0b'
          }
          emissive={
            type === 'ORIGIN_QR'
              ? '#1d4ed8'
              : type === 'TARGET_ROOM'
              ? '#047857'
              : '#b45309'
          }
          emissiveIntensity={1}
        />
      </mesh>

      {/* Ground ripple ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.3, 0.7, 32]} />
        <meshBasicMaterial
          color={
            type === 'ORIGIN_QR'
              ? '#38bdf8'
              : type === 'TARGET_ROOM'
              ? '#34d399'
              : '#fbbf24'
          }
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 2D HTML Floating Overlay Pin */}
      <Html
        position={[0, 1.8, 0]}
        center
        distanceFactor={22}
        className="pointer-events-auto select-none"
      >
        {type === 'ORIGIN_QR' && (
          <div className="flex flex-col items-center group cursor-pointer animate-bounce-subtle">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/95 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 backdrop-blur-md border border-blue-400/50 whitespace-nowrap">
              <Navigation className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span>{title}</span>
            </div>
            <div className="w-2 h-2 rotate-45 bg-blue-600 -mt-1 shadow" />
          </div>
        )}

        {type === 'TARGET_ROOM' && (
          <div className="flex flex-col items-center group cursor-pointer animate-pulse-subtle">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-semibold shadow-lg shadow-emerald-500/30 backdrop-blur-md border border-emerald-400/50 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span>{title}</span>
            </div>
            <div className="w-2 h-2 rotate-45 bg-emerald-600 -mt-1 shadow" />
          </div>
        )}

        {type === 'PHOTO_LANDMARK' && (
          <button
            type="button"
            onClick={() => photoUrl && setSelectedLandmarkPhoto(photoUrl)}
            className="flex flex-col items-center group cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-500/90 hover:bg-amber-500 text-white text-[11px] font-medium shadow-md backdrop-blur-md border border-amber-300/40">
              <Camera className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              <span>Xem ảnh thực tế</span>
            </div>
            <div className="w-1.5 h-1.5 rotate-45 bg-amber-500 -mt-1 shadow" />
          </button>
        )}
      </Html>
    </group>
  );
}
