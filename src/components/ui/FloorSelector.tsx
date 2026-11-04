'use client';

import React from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';

export function FloorSelector() {
  const currentCampusCode = useNavigationStore((state) => state.currentCampusCode);
  const viewMode = useNavigationStore((state) => state.viewMode);
  const activeBuildingCode = useNavigationStore((state) => state.activeBuildingCode);
  const activeFloorLevel = useNavigationStore((state) => state.activeFloorLevel);
  const setViewMode = useNavigationStore((state) => state.setViewMode);
  const setCameraTransform = useNavigationStore((state) => state.setCameraTransform);

  const isCs3 = currentCampusCode === 'cs3';
  const isOverall = viewMode === 'OVERALL_CAMPUS';

  const isBuildingActive = isCs3
    ? activeBuildingCode === 'toa_h' || isOverall
    : activeBuildingCode === 'toa_b' || isOverall;

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
      setViewMode('BUILDING_FLOOR', 'toa_h', 1);
      setCameraTransform([-4.5, 18, 24], [-11.5, 6, 7]);
    } else {
      setViewMode('BUILDING_FLOOR', 'toa_b', 3);
      setCameraTransform([17, 18, 8], [7.5, 6, -6]);
    }
  };

  const handleSelectFloor = (level: number) => {
    if (isCs3) {
      setViewMode('BUILDING_FLOOR', 'toa_h', level);
      const targetY = (level - 1) * 2.4 + 2;
      setCameraTransform([-4.5, targetY + 14, targetY + 16], [-11.5, targetY, 7]);
    } else {
      setViewMode('BUILDING_FLOOR', 'toa_b', level);
      const targetY = (level - 1) * 2.8 + 3;
      setCameraTransform([15, targetY + 12, targetY + 4], [7.5, targetY, -6]);
    }
  };

  const availableFloors = isCs3 ? [1, 2, 3, 4, 5] : [1, 2, 3];

  return (
    <aside className="absolute right-3.5 top-20 md:top-24 z-20 pointer-events-auto">
      {/* Vertical Pill Selector Exactly as Reference Image */}
      <div className="bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-1.5 w-[54px] items-center">
        {/* Button 1: Toàn cảnh */}
        <button
          type="button"
          onClick={handleSelectOverall}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-center leading-[1.1] transition-all ${
            isOverall
              ? 'bg-[#2563eb] text-white text-[10px] font-bold shadow-md shadow-blue-500/30'
              : 'text-slate-800 text-[10px] font-semibold hover:bg-slate-100'
          }`}
          title="Toàn cảnh sân trường"
        >
          <span>Toàn<br />cảnh</span>
        </button>

        {/* Button 2: Tòa B (CS1) or Tòa H (CS3) */}
        <button
          type="button"
          onClick={handleSelectBuilding}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isBuildingActive
              ? 'bg-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/30'
              : 'text-slate-800 text-xs font-semibold hover:bg-slate-100'
          }`}
          title={isCs3 ? 'Tòa H' : 'Tòa B'}
        >
          <span>{isCs3 ? 'Tòa H' : 'Tòa B'}</span>
        </button>

        {/* Buttons: T1..T5 */}
        {availableFloors.map((lvl) => {
          const isFloorActive = !isOverall && activeFloorLevel === lvl;
          return (
            <button
              key={`pill-lvl-${lvl}`}
              type="button"
              onClick={() => handleSelectFloor(lvl)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isFloorActive
                  ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/30'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              T{lvl}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
