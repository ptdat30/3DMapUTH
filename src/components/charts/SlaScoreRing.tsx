'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';
import { HealthStatus } from '@/types/wifiTwin';

export function SlaScoreRing() {
  const [animAngle, setAnimAngle] = useState(0);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const setStatusFilter = useTwinStore((state) => state.setStatusFilter);

  // Rotation ticker for orbit ring
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    let lastTime = performance.now();
    const update = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setAnimAngle((prev) => (prev + dt * 25) % 360);
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Target building metrics or campus average
  const targetBuilding = selectedBuildingId
    ? simulationData.buildings.find((b) => b.id === selectedBuildingId)
    : null;

  const score = targetBuilding
    ? Math.round(targetBuilding.metrics.healthScore)
    : Math.round(simulationData.kpis.campusHealthScore);

  const status = targetBuilding
    ? targetBuilding.metrics.status
    : score >= 90
    ? 'EXCELLENT'
    : score >= 75
    ? 'GOOD'
    : score >= 60
    ? 'FAIR'
    : score >= 40
    ? 'POOR'
    : 'CRITICAL';

  const color = getStatusColorToken(status);

  // Status breakdown of 75 APs
  const apBreakdown = React.useMemo(() => {
    const counts: Record<HealthStatus, number> = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
      POOR: 0,
      CRITICAL: 0,
    };
    simulationData.accessPoints.forEach((ap) => {
      counts[ap.metrics.status] += 1;
    });
    return counts;
  }, [simulationData.accessPoints]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      {/* Background ambient radial glow */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />

      <div className="w-full flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: color }}
            />
          </span>
          {targetBuilding ? `Chỉ số SLA — ${targetBuilding.name}` : 'Chỉ số SLA Toàn trường'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {simulationData.kpis.onlineAps}/{simulationData.kpis.totalAps} AP Online
        </span>
      </div>

      <div className="relative flex items-center justify-center my-1">
        <svg className="w-34 h-34" viewBox="0 0 100 100">
          <defs>
            <filter id="slaGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Rotating Dashed Orbit Ring */}
          <circle
            cx="50"
            cy="50"
            r="47"
            className="stroke-slate-700/60"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            fill="transparent"
            transform={`rotate(${animAngle}, 50, 50)`}
          />

          {/* Orbit satellite beacon */}
          <circle
            cx={50 + 47 * Math.cos((animAngle * Math.PI) / 180)}
            cy={50 + 47 * Math.sin((animAngle * Math.PI) / 180)}
            r="1.8"
            fill={color}
            filter="url(#slaGlow)"
          />

          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Active Score Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out -rotate-90 origin-center"
            filter="url(#slaGlow)"
          />
        </svg>

        {/* Center Score Display with subtle pulse */}
        <div className="absolute flex flex-col items-center justify-center select-none">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight drop-shadow-md">
            {score}
          </span>
          <span
            className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 transition-colors shadow-sm"
            style={{
              backgroundColor: `${color}25`,
              color,
              boxShadow: `0 0 8px ${color}30`,
            }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* AP Status Segment Badges with hover & active animations */}
      <div className="w-full grid grid-cols-5 gap-1 text-center relative z-10">
        {(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] as HealthStatus[]).map((st) => {
          const stColor = getStatusColorToken(st);
          const count = apBreakdown[st];
          const isFilterActive = statusFilter === st;

          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(isFilterActive ? 'ALL' : st)}
              className={`p-1 rounded flex flex-col items-center transition-all cursor-pointer ${
                isFilterActive
                  ? 'bg-slate-800 ring-2 shadow-md scale-105'
                  : 'bg-slate-950/60 hover:bg-slate-800/60 hover:scale-102'
              }`}
              style={{
                borderColor: isFilterActive ? stColor : undefined,
                boxShadow: isFilterActive ? `0 0 8px ${stColor}40` : undefined,
              }}
            >
              <span className="text-[9px] font-bold truncate max-w-full" style={{ color: stColor }}>
                {st === 'EXCELLENT' ? 'Xuất sắc' : st === 'GOOD' ? 'Tốt' : st === 'FAIR' ? 'T.Bình' : st === 'POOR' ? 'Kém' : 'Cấp bách'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
