'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function BuildingRankChart() {
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);

  // Sort buildings descending by Health Score
  const sortedBuildings = [...simulationData.buildings].sort(
    (a, b) => b.metrics.healthScore - a.metrics.healthScore
  );

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      <div className="flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          Xếp hạng Sức khỏe 6 Phân khu
        </span>
        <span className="text-[10px] text-slate-400 font-mono font-semibold">Mục tiêu SLA: 80</span>
      </div>

      <div className="flex flex-col gap-2 mt-1 relative z-10">
        {sortedBuildings.map((bldg, idx) => {
          const isSelected = selectedBuildingId === bldg.id;
          const score = Math.round(bldg.metrics.healthScore);
          const color = getStatusColorToken(bldg.metrics.status);

          return (
            <div
              key={bldg.id}
              onClick={() => selectBuilding(isSelected ? null : bldg.id)}
              className={`group/row flex flex-col gap-1 p-2 rounded-xl cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'bg-slate-800/90 ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'hover:bg-slate-800/60 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-bold text-slate-200 group-hover/row:text-white transition-colors">
                    {bldg.name}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    ({bldg.metrics.clientCount} clients)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold" style={{ color }}>
                  <span>{score}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase shadow-sm"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {bldg.metrics.status}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar track */}
              <div className="relative w-full h-2.5 bg-slate-950/90 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                {/* 80 SLA Marker line */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-slate-400/80 z-20"
                  style={{ left: '80%' }}
                  title="Ngưỡng SLA (80)"
                />

                {/* Fill bar with high-tech animated shimmer beam */}
                <div
                  className="relative h-full rounded-full transition-all duration-700 ease-out overflow-hidden"
                  style={{
                    width: `${Math.max(5, score)}%`,
                    backgroundColor: color,
                    boxShadow: isSelected ? `0 0 10px ${color}` : undefined,
                  }}
                >
                  {/* Sliding light shimmer line */}
                  <div
                    className="absolute inset-0 w-full h-full opacity-60 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
