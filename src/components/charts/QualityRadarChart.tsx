'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { WifiMetrics } from '@/types/wifiTwin';

const AXES = [
  { key: 'coverage', label: 'Phủ sóng', max: 100 },
  { key: 'throughput', label: 'Băng thông', max: 100 },
  { key: 'latencyScore', label: 'Độ trễ SLA', max: 100 },
  { key: 'snrQuality', label: 'Chất lượng SNR', max: 100 },
  { key: 'roaming', label: 'Chuyển vùng', max: 100 },
  { key: 'channelHealth', label: 'Sạch kênh', max: 100 },
];

function extractRadarScores(metrics: WifiMetrics) {
  const coverage = Math.min(100, Math.max(0, metrics.coveragePercent));
  const throughput = Math.min(100, Math.max(0, (metrics.throughputMbps / 750) * 100));
  const latencyScore = Math.min(100, Math.max(0, 100 - (metrics.latencyMs / 120) * 100));
  const snrQuality = Math.min(100, Math.max(0, (metrics.snrDb / 35) * 100));
  const roaming = Math.min(100, Math.max(0, metrics.roamingQualityPercent));
  const channelHealth = Math.min(100, Math.max(0, 100 - metrics.interferencePercent));

  return [coverage, throughput, latencyScore, snrQuality, roaming, channelHealth];
}

export function QualityRadarChart() {
  const [animTime, setAnimTime] = useState(0);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const isCompareMode = useTwinStore((state) => state.isCompareMode);
  const compareBuildingId = useTwinStore((state) => state.compareBuildingId);

  // Radar sweep animation ticker
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    let lastTime = performance.now();
    const update = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setAnimTime((prev) => prev + dt);
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Building 1 (selected or Tòa C default)
  const bldg1 =
    simulationData.buildings.find((b) => b.id === (selectedBuildingId || 'bldg-C')) ||
    simulationData.buildings[0];

  // Building 2 or Baseline
  const bldg2 = isCompareMode
    ? simulationData.buildings.find((b) => b.id === compareBuildingId) || simulationData.buildings[1]
    : null;

  // Campus Baseline metrics
  const campusBaselineMetrics: WifiMetrics = {
    healthScore: simulationData.kpis.campusHealthScore,
    status: 'GOOD',
    rssiDbm: -63,
    snrDb: 28,
    latencyMs: simulationData.kpis.avgLatencyMs,
    jitterMs: 6,
    packetLossPercent: 1.2,
    throughputMbps: 450,
    clientCount: 400,
    apLoadPercent: 55,
    channelUtilizationPercent: 48,
    interferencePercent: 22,
    coveragePercent: 88,
    roamingQualityPercent: 86,
  };

  const scores1 = extractRadarScores(bldg1.metrics);
  const scores2 = extractRadarScores(bldg2 ? bldg2.metrics : campusBaselineMetrics);

  const cx = 110;
  const cy = 100;
  const r = 68;
  const numAxes = AXES.length;

  // Calculate polygon points
  const getCoordinates = (scores: number[]) => {
    return scores.map((val, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const dist = (val / 100) * r;
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}` };
    });
  };

  const points1 = getCoordinates(scores1);
  const points2 = getCoordinates(scores2);
  const poly1 = points1.map((p) => p.str).join(' ');
  const poly2 = points2.map((p) => p.str).join(' ');

  // 360-degree radar sweep angle in radians
  const sweepAngleDeg = (animTime * 75) % 360;
  const sweepAngleRad = (sweepAngleDeg * Math.PI) / 180 - Math.PI / 2;
  const sweepRayX = cx + (r + 4) * Math.cos(sweepAngleRad);
  const sweepRayY = cy + (r + 4) * Math.sin(sweepAngleRad);

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      {/* Background ambient pulse */}
      <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-cyan-600/10 blur-xl pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          Đa giác Đối chiếu Chất lượng (Radar)
        </span>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <div className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{bldg1.name}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{bldg2 ? bldg2.name : 'Toàn trường'}</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-1">
        <svg className="w-56 h-52" viewBox="0 0 220 200">
          <defs>
            <filter id="radarDotGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Grid Rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={Array.from({ length: numAxes })
                .map((_, i) => {
                  const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
                  const dist = level * r;
                  return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
                })
                .join(' ')}
              className="stroke-slate-800"
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* Radial Axis Lines */}
          {AXES.map((axis, i) => {
            const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const labelX = cx + (r + 14) * Math.cos(angle);
            const labelY = cy + (r + 14) * Math.sin(angle);

            return (
              <g key={axis.key}>
                <line x1={cx} y1={cy} x2={x} y2={y} className="stroke-slate-700/60" strokeWidth="1" />
                <text
                  x={labelX}
                  y={labelY + 3}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-sans font-medium"
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          {/* Baseline or Building 2 Polygon */}
          <polygon
            points={poly2}
            className="fill-amber-400/20 stroke-amber-400"
            strokeWidth="1.5"
            strokeDasharray={bldg2 ? 'none' : '3 3'}
          />

          {/* Building 1 Main Polygon */}
          <polygon
            points={poly1}
            className="fill-cyan-400/25 stroke-cyan-400"
            strokeWidth="2"
          />

          {/* Rotating Tactical Radar Sweep Ray & Trail */}
          <g>
            <line
              x1={cx}
              y1={cy}
              x2={sweepRayX}
              y2={sweepRayY}
              stroke="#22d3ee"
              strokeWidth="1.8"
              strokeOpacity="0.85"
            />
            {/* Sweep tip glow dot */}
            <circle cx={sweepRayX} cy={sweepRayY} r="2.5" fill="#38bdf8" opacity="0.9" />
          </g>

          {/* Animated vertex dots on Building 1 polygon */}
          {points1.map((pt, idx) => {
            const pulseR = 3 + Math.sin(animTime * 4 + idx) * 0.8;
            return (
              <g key={`pt-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pulseR}
                  fill="#22d3ee"
                  filter="url(#radarDotGlow)"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pulseR + 2.5}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="0.8"
                  opacity={0.4}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
