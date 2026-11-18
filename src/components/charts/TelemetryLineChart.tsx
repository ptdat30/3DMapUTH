'use client';

import React, { useRef } from 'react';
import { useTwinStore } from '@/store/useTwinStore';

export function TelemetryLineChart() {
  const simulationData = useTwinStore((state) => state.simulationData);
  const currentHour = useTwinStore((state) => state.currentHour);
  const setCurrentHour = useTwinStore((state) => state.setCurrentHour);

  const points = simulationData.timeSeries;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 680;
  const height = 90;
  const padL = 35;
  const padR = 45;
  const padT = 8;
  const padB = 18;

  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Max values
  const maxLatency = 160; // ms
  const maxThroughput = 800; // Mbps

  // Handle click/drag to scrub time
  const handleScrub = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clickX - padL) / chartW));
    const targetHour = Math.round(ratio * 47) * 0.5;
    setCurrentHour(targetHour);
  };

  // Build SVG Paths
  const throughputPath: string[] = [];
  const latencyPath: string[] = [];
  const jitterPath: string[] = [];

  points.forEach((pt, i) => {
    const x = padL + (i / (points.length - 1)) * chartW;
    const yTp = padT + chartH - (Math.min(maxThroughput, pt.throughputMbps) / maxThroughput) * chartH;
    const yLat = padT + chartH - (Math.min(maxLatency, pt.latencyMs) / maxLatency) * chartH;
    const yJit = padT + chartH - (Math.min(maxLatency, pt.jitterMs * 2) / maxLatency) * chartH;

    throughputPath.push(`${x.toFixed(1)},${yTp.toFixed(1)}`);
    latencyPath.push(`${x.toFixed(1)},${yLat.toFixed(1)}`);
    jitterPath.push(`${x.toFixed(1)},${yJit.toFixed(1)}`);
  });

  // Area path for Throughput
  const areaThroughput = `M ${padL},${padT + chartH} L ${throughputPath.join(' L ')} L ${padL + chartW},${padT + chartH} Z`;

  // Cursor X for currentHour
  const cursorIndex = Math.min(points.length - 1, Math.round(currentHour * 2));
  const cursorX = padL + (cursorIndex / (points.length - 1)) * chartW;
  const currentPt = points[cursorIndex] || points[0];

  return (
    <div className="w-full flex flex-col gap-1 select-none">
      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] px-1 font-mono">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-cyan-400 font-bold whitespace-nowrap">
            <span className="w-2 h-1.5 rounded-sm bg-cyan-400/50 border border-cyan-400" />
            {currentPt.throughputMbps} Mbps
          </span>
          <span className="flex items-center gap-1 text-orange-400 font-bold whitespace-nowrap">
            <span className="w-2 h-0.5 bg-orange-400" />
            {currentPt.latencyMs} ms
          </span>
          <span className="flex items-center gap-1 text-amber-300 whitespace-nowrap hidden sm:inline-flex">
            <span className="w-2 h-0.5 bg-amber-300 border-dashed border-b" />
            Jitter: {currentPt.jitterMs} ms
          </span>
        </div>
        <span className="text-slate-400 text-[9px] sm:text-[10px] whitespace-nowrap">Kéo để tua 24h</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg bg-slate-950/70 border border-slate-800 cursor-crosshair">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-22"
          onClick={handleScrub}
        >
          {/* Baseline */}
          <line
            x1={padL}
            y1={padT + chartH}
            x2={padL + chartW}
            y2={padT + chartH}
            className="stroke-slate-800"
            strokeWidth="1"
          />

          {/* Time ticks */}
          {[0, 6, 12, 18, 24].map((hour) => {
            const x = padL + (hour / 24) * chartW;
            return (
              <g key={`hour-tick-${hour}`}>
                <line
                  x1={x}
                  y1={padT}
                  x2={x}
                  y2={padT + chartH}
                  className="stroke-slate-800/60"
                  strokeWidth="0.8"
                />
                <text
                  x={x}
                  y={padT + chartH + 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[8px] font-mono"
                >
                  {String(hour % 24).padStart(2, '0')}:00
                </text>
              </g>
            );
          })}

          {/* Throughput Area */}
          <path d={areaThroughput} fill="url(#tpGradient)" opacity="0.45" />
          <path d={`M ${throughputPath.join(' L ')}`} fill="none" stroke="#06b6d4" strokeWidth="1.5" />

          {/* Latency Line */}
          <path d={`M ${latencyPath.join(' L ')}`} fill="none" stroke="#f97316" strokeWidth="1.8" />

          {/* Jitter Line */}
          <path
            d={`M ${jitterPath.join(' L ')}`}
            fill="none"
            stroke="#fcd34d"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />

          {/* Synchronized Vertical Scrubber Line & Pulsing Indicator */}
          <line
            x1={cursorX}
            y1={padT - 2}
            x2={cursorX}
            y2={padT + chartH + 2}
            className="stroke-cyan-400"
            strokeWidth="2"
          />
          {/* Pulsing Scrubber Head */}
          <circle cx={cursorX} cy={padT + 3} r="5" fill="#22d3ee" opacity="0.35" className="animate-ping" />
          <circle cx={cursorX} cy={padT + 3} r="3" fill="#22d3ee" />

          {/* Gradients */}
          <defs>
            <linearGradient id="tpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
