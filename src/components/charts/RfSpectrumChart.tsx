'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTwinStore } from '@/store/useTwinStore';

interface BellCurve {
  channel: number;
  centerMhz: number;
  widthMhz: number;
  power: number; // 0 to 1
  color: string;
  name: string;
}

export function RfSpectrumChart() {
  const [band, setBand] = useState<'2.4GHz' | '5GHz'>('2.4GHz');
  const [animTime, setAnimTime] = useState(0);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedApId = useTwinStore((state) => state.selectedApId);

  // Smooth continuous animation ticker for live RF wave oscillation & laser sweep
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

  const selectedAp = selectedApId
    ? simulationData.accessPoints.find((a) => a.id === selectedApId)
    : null;

  // Active AP channel
  const activeCh24 = selectedAp?.channel24 || 6;
  const activeCh5 = selectedAp?.channel5 || 36;

  // Curves for 2.4GHz
  const curves24: BellCurve[] = [
    { channel: 1, centerMhz: 2412, widthMhz: 22, power: activeCh24 === 1 ? 0.95 : 0.65, color: '#06b6d4', name: 'Ch 1' },
    { channel: 6, centerMhz: 2437, widthMhz: 22, power: activeCh24 === 6 ? 0.95 : 0.7, color: '#f59e0b', name: 'Ch 6' },
    { channel: 11, centerMhz: 2462, widthMhz: 22, power: activeCh24 === 11 ? 0.95 : 0.6, color: '#10b981', name: 'Ch 11' },
    // Interfere curve (co-channel overlap example)
    { channel: 4, centerMhz: 2427, widthMhz: 22, power: 0.45, color: '#ef4444', name: 'Ch 4 (Nhiễu)' },
  ];

  // Curves for 5GHz
  const curves5: BellCurve[] = [
    { channel: 36, centerMhz: 5180, widthMhz: 20, power: activeCh5 === 36 ? 0.95 : 0.7, color: '#06b6d4', name: 'Ch 36' },
    { channel: 40, centerMhz: 5200, widthMhz: 20, power: activeCh5 === 40 ? 0.95 : 0.6, color: '#10b981', name: 'Ch 40' },
    { channel: 44, centerMhz: 5220, widthMhz: 20, power: activeCh5 === 44 ? 0.95 : 0.6, color: '#3b82f6', name: 'Ch 44' },
    { channel: 48, centerMhz: 5240, widthMhz: 20, power: activeCh5 === 48 ? 0.95 : 0.65, color: '#8b5cf6', name: 'Ch 48' },
  ];

  const activeCurves = band === '2.4GHz' ? curves24 : curves5;

  const width = 280;
  const height = 120;
  const padL = 20;
  const padR = 20;
  const padB = 22;
  const padT = 10;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Min/Max MHz
  const minMhz = band === '2.4GHz' ? 2400 : 5160;
  const maxMhz = band === '2.4GHz' ? 2484 : 5260;

  // Laser sweep line position (0 to 1 cycle every 3 seconds)
  const sweepCycle = (animTime % 3) / 3;
  const sweepX = padL + sweepCycle * chartW;

  // Generate smooth dynamic Gaussian bell curve path with subtle live wave jitter
  const generateBellPath = (curve: BellCurve, idx: number) => {
    const points: string[] = [];
    const steps = 40;
    const startMhz = curve.centerMhz - curve.widthMhz * 1.4;
    const endMhz = curve.centerMhz + curve.widthMhz * 1.4;

    // Organic wave modulation simulating real RF noise and packet burst fluctuation
    const liveMod = Math.sin(animTime * 3.5 + idx * 1.8) * 0.045 + Math.cos(animTime * 6 + idx * 2.2) * 0.02;
    const dynamicPower = Math.max(0.1, Math.min(1.0, curve.power + liveMod));

    for (let i = 0; i <= steps; i++) {
      const freq = startMhz + (i / steps) * (endMhz - startMhz);
      const x = padL + ((freq - minMhz) / (maxMhz - minMhz)) * chartW;
      const diff = freq - curve.centerMhz;
      const sigma = curve.widthMhz / 2.355;
      const gaussian = Math.exp(-(diff * diff) / (2 * sigma * sigma));
      const y = padT + chartH - gaussian * dynamicPower * chartH;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    const startX = padL + ((startMhz - minMhz) / (maxMhz - minMhz)) * chartW;
    const endX = padL + ((endMhz - minMhz) / (maxMhz - minMhz)) * chartW;
    const baseY = padT + chartH;

    return `M ${startX.toFixed(1)},${baseY} L ${points.join(' L ')} L ${endX.toFixed(1)},${baseY} Z`;
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      {/* Background ambient glow pulse */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-violet-600/15 blur-2xl pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Phổ Giao thoa Kênh RF (Live Spectrum)
        </span>
        <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setBand('2.4GHz')}
            className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${
              band === '2.4GHz' ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-900/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            2.4GHz
          </button>
          <button
            type="button"
            onClick={() => setBand('5GHz')}
            className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${
              band === '5GHz' ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-900/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            5GHz
          </button>
        </div>
      </div>

      <div className="relative flex justify-center">
        <svg className="w-full h-28" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="rfSweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="85%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
            </linearGradient>
            <filter id="rfGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((lvl) => {
            const y = padT + chartH * lvl;
            return (
              <line
                key={`grid-rf-${lvl}`}
                x1={padL}
                y1={y}
                x2={padL + chartW}
                y2={y}
                className="stroke-slate-800/50"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
            );
          })}

          {/* Baseline */}
          <line
            x1={padL}
            y1={padT + chartH}
            x2={padL + chartW}
            y2={padT + chartH}
            className="stroke-slate-700"
            strokeWidth="1.5"
          />

          {/* Oscillating Gaussian Bell Curves */}
          {activeCurves.map((curve, idx) => {
            const d = generateBellPath(curve, idx);
            const peakX = padL + ((curve.centerMhz - minMhz) / (maxMhz - minMhz)) * chartW;
            const isHighPower = curve.power > 0.8;

            return (
              <g key={curve.name}>
                <path
                  d={d}
                  fill={`${curve.color}30`}
                  stroke={curve.color}
                  strokeWidth={isHighPower ? '2' : '1.5'}
                  filter={isHighPower ? 'url(#rfGlow)' : undefined}
                />
                <text
                  x={peakX}
                  y={padT + chartH + 14}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono font-bold"
                >
                  {curve.name}
                </text>
              </g>
            );
          })}

          {/* Oscilloscope Laser Scanner Sweep Line */}
          <line
            x1={sweepX}
            y1={padT}
            x2={sweepX}
            y2={padT + chartH}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />
          <line
            x1={Math.max(padL, sweepX - 25)}
            y1={padT}
            x2={sweepX}
            y2={padT}
            stroke="url(#rfSweepGrad)"
            strokeWidth={chartH}
            transform={`translate(0, ${chartH / 2})`}
            opacity="0.15"
            pointerEvents="none"
          />
        </svg>
      </div>
    </div>
  );
}
