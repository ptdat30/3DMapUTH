'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function BuildingHealthBadges() {
  const activeLayers = useTwinStore((state) => state.activeLayers);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);

  if (!activeLayers.buildingLabels) return null;

  return (
    <group>
      {simulationData.buildings.map((bldg) => {
        const isSelected = selectedBuildingId === bldg.id;
        const score = Math.round(bldg.metrics.healthScore);
        const color = getStatusColorToken(bldg.metrics.status);

        // Position slightly above roof center
        const badgeY = bldg.center3D[1] + bldg.dimensions3D[1] / 2 + 1.8;

        return (
          <group
            key={`badge-${bldg.id}`}
            position={[bldg.center3D[0], badgeY, bldg.center3D[2]]}
          >
            <Html center distanceFactor={34} zIndexRange={[80, 0]}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  selectBuilding(isSelected ? null : bldg.id);
                }}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md transition-all cursor-pointer whitespace-nowrap select-none shadow-xl border ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-400/40 scale-110'
                    : 'bg-slate-950/85 hover:bg-slate-900 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-xs text-white">
                  <span>{bldg.name}</span>
                </div>

                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg font-mono text-xs font-black shadow-inner"
                  style={{ backgroundColor: `${color}25`, color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{score}</span>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
