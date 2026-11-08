'use client';

import React from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';

export function FloorSelector() {
  const currentCampusCode = useNavigationStore((state) => state.currentCampusCode);
  const viewMode = useNavigationStore((state) => state.viewMode);
  const activeBuildingCode = useNavigationStore((state) => state.activeBuildingCode);
  const selectedBuildingCode = useNavigationStore((state) => state.selectedBuildingCode);
  const activeFloorLevel = useNavigationStore((state) => state.activeFloorLevel);
  const setViewMode = useNavigationStore((state) => state.setViewMode);
  const setCameraTransform = useNavigationStore((state) => state.setCameraTransform);

  const isCs3 = currentCampusCode === 'cs3';
  const isOverall = viewMode === 'OVERALL_CAMPUS';

  const activeBuilding = selectedBuildingCode || activeBuildingCode || 'toa_h';

  let currentBuildingLabel = 'Tòa B';
  let availableFloors: number[] = [1, 2, 3];

  if (isCs3) {
    if (activeBuilding === 'toa_i_lon') {
      currentBuildingLabel = 'Tòa I';
      availableFloors = [0, 1, 2, 3, 4];
    } else if (activeBuilding === 'toa_k') {
      currentBuildingLabel = 'Tòa K';
      availableFloors = [0, 1, 2, 3];
    } else if (activeBuilding === 'xuong_oto') {
      currentBuildingLabel = 'Xưởng';
      availableFloors = [0];
    } else if (activeBuilding === 'toa_j') {
      currentBuildingLabel = 'Tòa J';
      availableFloors = [1, 2, 3, 4, 5, 6];
    } else {
      currentBuildingLabel = 'Tòa H';
      availableFloors = [0, 1, 2, 3, 4, 5, 6];
    }
  }

  const isBuildingActive = isCs3
    ? activeBuilding === 'toa_h' ||
      activeBuilding === 'toa_i_lon' ||
      activeBuilding === 'toa_k' ||
      activeBuilding === 'xuong_oto' ||
      activeBuilding === 'toa_j' ||
      isOverall
    : activeBuilding === 'toa_b' || isOverall;

  const handleSelectOverall = () => {
    setViewMode('OVERALL_CAMPUS');
    if (isCs3) {
      setCameraTransform([34, 44, 40], [0, 4, 0]);
    } else {
      setCameraTransform([24, 26, 24], [0, 2, 0]);
    }
  };

  const handleSelectBuilding = () => {
    if (isCs3) {
      const bld = activeBuilding;
      setViewMode('BUILDING_FLOOR', bld, availableFloors[0]);
      if (bld === 'toa_j') {
        setCameraTransform([20, 16, -6], [13.5, 3, -15.4]);
      } else if (bld === 'toa_i_lon') {
        setCameraTransform([-13.5 + 8, 16, -15.4 + 10], [-13.5, 3, -15.4]);
      } else if (bld === 'toa_k') {
        setCameraTransform([15.0 + 10, 18, 4.2 + 10], [15.0, 4, 4.2]);
      } else if (bld === 'xuong_oto') {
        setCameraTransform([-24.0 + 8, 14, 3.5 + 10], [-24.0, 2, 3.5]);
      } else {
        setCameraTransform([-4.5, 18, 24], [-11.5, 6, 7]);
      }
    } else {
      setViewMode('BUILDING_FLOOR', 'toa_b', 3);
      setCameraTransform([17, 18, 8], [7.5, 6, -6]);
    }
  };

  const handleSelectFloor = (level: number) => {
    if (isCs3) {
      const bld = activeBuilding;
      setViewMode('BUILDING_FLOOR', bld, level);
      const targetY = level * 2.4 + 2;
      if (bld === 'toa_j') {
        setCameraTransform([13.5 + 8, targetY + 14, -15.4 + 10], [13.5, targetY, -15.4]);
      } else if (bld === 'toa_i_lon') {
        setCameraTransform([-13.5 + 8, targetY + 14, -15.4 + 10], [-13.5, targetY, -15.4]);
      } else if (bld === 'toa_k') {
        setCameraTransform([15.0 + 10, targetY + 14, 4.2 + 10], [15.0, targetY, 4.2]);
      } else if (bld === 'xuong_oto') {
        setCameraTransform([-24.0 + 8, 14, 3.5 + 10], [-24.0, 2, 3.5]);
      } else {
        setCameraTransform([-4.5, targetY + 14, targetY + 16], [-11.5, targetY, 7]);
      }
    } else {
      setViewMode('BUILDING_FLOOR', 'toa_b', level);
      const targetY = (level - 1) * 2.8 + 3;
      setCameraTransform([15, targetY + 12, targetY + 4], [7.5, targetY, -6]);
    }
  };

  return (
    <aside className="absolute right-3.5 top-20 md:top-24 z-20 pointer-events-auto">
      {/* Vertical Pill Selector Exactly as Reference Image */}
      <div className="bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-1.5 w-[54px] items-center">
        {/* Button 1: Toàn cảnh */}
        <button
          type="button"
          onClick={handleSelectOverall}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-center leading-[1.1] transition-all cursor-pointer ${
            isOverall
              ? 'bg-[#2563eb] text-white text-[10px] font-bold shadow-md shadow-blue-500/30'
              : 'text-slate-800 text-[10px] font-semibold hover:bg-slate-100'
          }`}
          title="Toàn cảnh sân trường"
        >
          <span>Toàn<br />cảnh</span>
        </button>

        {/* Button 2: Tên Tòa Nhà */}
        <button
          type="button"
          onClick={handleSelectBuilding}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isBuildingActive
              ? 'bg-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/30'
              : 'text-slate-800 text-xs font-semibold hover:bg-slate-100'
          }`}
          title={currentBuildingLabel}
        >
          <span>{currentBuildingLabel}</span>
        </button>

        {/* Buttons: Trệt, T1, T2... */}
        {availableFloors.map((lvl) => {
          const isFloorActive = !isOverall && activeFloorLevel === lvl;
          return (
            <button
              key={`pill-lvl-${lvl}`}
              type="button"
              onClick={() => handleSelectFloor(lvl)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                isFloorActive
                  ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/30'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              {lvl === 0 ? 'Trệt' : `T${lvl}`}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
