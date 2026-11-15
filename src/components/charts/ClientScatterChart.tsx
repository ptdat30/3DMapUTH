'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { getStatusColorToken } from '@/simulation/healthMath';

export function ClientScatterChart() {
  const [animTime, setAnimTime] = useState(0);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedApId = useTwinStore((state) => state.selectedApId);
  const selectAp = useTwinStore((state) => state.selectAp);

  // Animation ticker for hovering bubbles and radar sweep
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

  const aps = simulationData.accessPoints;

  const width = 280;
  const height = 150;
  const padL = 36;
  const padB = 25;
  const padT = 12;
  const padR = 15;

  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Max bounds
  const maxClients = 60;
  const maxLatency = 200;

  // 50ms SLA horizontal line Y
  const slaLatency = 50;
  const slaY = padT + chartH - (slaLatency / maxLatency) * chartH;

  // Radar sweep line X (loops every 4 seconds)
  const sweepProgress = (animTime % 4) / 4;
  const sweepX = padL + sweepProgress * chartW;

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      {/* Background ambient pulse */}
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-rose-600/10 blur-xl pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          Tương quan Tải & Độ trễ (Scatter)
        </span>
        <span className="text-[10px] text-rose-400 font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/40">
          SLA: 50ms
        </span>
      </div>

      <div className="relative flex justify-center">
        <svg className="w-full h-38" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="scatterSweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
              <stop offset="90%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.45" />
            </linearGradient>
            <filter id="scatterGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* SLA Danger Zone Background (Above 50ms) */}
          <rect
            x={padL}
            y={padT}
            width={chartW}
            height={slaY - padT}
            fill="#f43f5e"
            fillOpacity="0.04"
          />

          {/* Axis lines */}
          <line
            x1={padL}
            y1={padT + chartH}
            x2={padL + chartW}
            y2={padT + chartH}
            className="stroke-slate-700"
            strokeWidth="1.5"
          />
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + chartH}
            className="stroke-slate-700"
            strokeWidth="1.5"
          />

          {/* SLA Guideline (50ms) with pulse animation */}
          <line
            x1={padL}
            y1={slaY}
            x2={padL + chartW}
            y2={slaY}
            className="stroke-rose-500"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeOpacity={0.7 + Math.sin(animTime * 4) * 0.25}
          />
          <text
            x={padL + chartW - 2}
            y={slaY - 3}
            textAnchor="end"
            className="fill-rose-400 text-[8px] font-mono font-bold"
          >
            SLA 50ms
          </text>

          {/* Grid lines */}
          {[100, 150].map((lat) => {
            const y = padT + chartH - (lat / maxLatency) * chartH;
            return (
              <g key={`grid-lat-${lat}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + chartW}
                  y2={y}
                  className="stroke-slate-800/60"
                  strokeWidth="0.8"
                />
                <text
                  x={padL - 4}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[8px] font-mono"
                >
                  {lat}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {[20, 40].map((cl) => {
            const x = padL + (cl / maxClients) * chartW;
            return (
              <text
                key={`x-label-${cl}`}
                x={x}
                y={padT + chartH + 14}
                textAnchor="middle"
                className="fill-slate-500 text-[8px] font-mono"
              >
                {cl}
              </text>
            );
          })}
          <text
            x={padL + chartW / 2}
            y={height - 2}
            textAnchor="middle"
            className="fill-slate-400 text-[8px]"
          >
            Số thiết bị / AP
          </text>

          {/* Radar scanline */}
          <line
            x1={sweepX}
            y1={padT}
            x2={sweepX}
            y2={padT + chartH}
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeOpacity="0.75"
          />

          {/* Animated AP Bubbles with organic breathing & floating */}
          {aps.map((ap, idx) => {
            const isSelected = selectedApId === ap.id;
            const isOutlier = ap.metrics.latencyMs > 50 || ap.metrics.status === 'CRITICAL';

            // Subtle harmonic floating motion
            const floatY = Math.sin(animTime * 2.5 + idx * 0.7) * 1.8;
            const floatX = Math.cos(animTime * 1.8 + idx * 0.5) * 1.2;

            const baseX = padL + (Math.min(maxClients, ap.metrics.clientCount) / maxClients) * chartW;
            const baseY = padT + chartH - (Math.min(maxLatency, ap.metrics.latencyMs) / maxLatency) * chartH;
            const cx = baseX + floatX;
            const cy = baseY + floatY;

            const baseR = Math.max(3, Math.min(7.5, (ap.metrics.channelUtilizationPercent / 100) * 7.5));
            const r = isSelected ? baseR + 2.5 : baseR;
            const color = getStatusColorToken(ap.metrics.status);

            // Pulsing ripple for outliers
            const rippleR = baseR + ((animTime * 14 + idx * 5) % 9);
            const rippleOpacity = Math.max(0, 1 - (rippleR - baseR) / 9);

            return (
              <g key={ap.id}>
                {/* Outlier Ripple Ring */}
                {isOutlier && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={rippleR}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity={rippleOpacity * 0.8}
                  />
                )}

                {/* Selected AP Rotating Reticle */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 4}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="origin-center"
                    transform={`rotate(${(animTime * 60) % 360}, ${cx}, ${cy})`}
                  />
                )}

                {/* Main AP Bubble */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={color}
                  opacity={isSelected ? 1 : 0.82}
                  stroke={isSelected ? '#ffffff' : color}
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => selectAp(isSelected ? null : ap.id)}
                >
                  <title>{`${ap.name}: ${ap.metrics.clientCount} clients, ${ap.metrics.latencyMs}ms, ${ap.metrics.channelUtilizationPercent}% load`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
