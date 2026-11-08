'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { Navigation, Compass, Layers, X } from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';

interface BuildingTooltipProps {
  position: [number, number, number];
  buildingCode: string;
  buildingName: string;
  subTitle?: string;
  heightOffset?: number;
}

/**
 * 3D Floating Building Tooltip (HTML Annotation in WebGL)
 * Displays building info, floor count, and action button to start navigation.
 */
export function BuildingTooltip({
  position,
  buildingCode,
  buildingName,
  subTitle,
  heightOffset = 5.0,
}: BuildingTooltipProps) {
  const selectedBuildingCode = useNavigationStore((state) => state.selectedBuildingCode);
  const setSelectedBuilding = useNavigationStore((state) => state.setSelectedBuilding);
  const startRouteBetweenBuildings = useNavigationStore(
    (state) => state.startRouteBetweenBuildings
  );
  const setViewMode = useNavigationStore((state) => state.setViewMode);

  const isSelected = selectedBuildingCode === buildingCode;

  const handleStartRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buildingCode === 'toa_h') {
      startRouteBetweenBuildings('toa_h', 'toa_j');
    } else {
      startRouteBetweenBuildings('toa_h', buildingCode);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(null);
  };

  const handleViewFloors = (e: React.MouseEvent) => {
    e.stopPropagation();
    const initialFloor = buildingCode === 'toa_j' ? 1 : 0;
    setViewMode('BUILDING_FLOOR', buildingCode, initialFloor);
  };

  return (
    <Html
      position={[position[0], position[1] + heightOffset, position[2]]}
      center
      distanceFactor={32}
      zIndexRange={[150, 0]}
      style={{
        display: isSelected ? 'block' : 'none',
        pointerEvents: isSelected ? 'auto' : 'none',
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-sky-500/40 min-w-[220px] max-w-[260px] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-400 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Khu Vực Đào Tạo
            </span>
            <h4 className="font-bold text-sm text-slate-50 leading-tight">
              {buildingName}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {subTitle && (
          <p className="text-xs text-slate-300 mb-2.5 leading-snug">
            {subTitle}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-md shadow-sky-900/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            {buildingCode === 'toa_h' ? 'Chỉ đường đến Tòa J' : 'Chỉ đường từ Tòa H'}
          </button>

          <button
            type="button"
            onClick={handleViewFloors}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Xem sơ đồ các tầng
          </button>
        </div>
      </div>
    </Html>
  );
}
