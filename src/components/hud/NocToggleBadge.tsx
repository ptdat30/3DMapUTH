'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { Activity, Power, Wifi } from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';

export function NocToggleBadge() {
  const isTwinMode = useTwinStore((state) => state.isTwinMode);
  const toggleTwinMode = useTwinStore((state) => state.toggleTwinMode);
  const setCampus = useNavigationStore((state) => state.setCampus);

  const handleToggle = () => {
    if (!isTwinMode) {
      // Digital Twin is mapped to CS1 6 buildings
      setCampus('cs1');
      toggleTwinMode(true);
    } else {
      toggleTwinMode(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md transition-all duration-300 cursor-pointer select-none border shrink-0 ${
        isTwinMode
          ? 'bg-slate-950/90 border-cyan-500/80 text-cyan-300 ring-2 ring-cyan-500/30 shadow-cyan-950/50'
          : 'bg-white/95 hover:bg-slate-900 border-slate-200/90 hover:border-slate-800 text-slate-800 hover:text-cyan-300 shadow-slate-300/40'
      }`}
      title="Bật / Tắt Chế độ 3D Campus WiFi Digital Twin NOC (Giám sát thời gian thực)"
    >
      <div
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
          isTwinMode
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
            : 'bg-slate-100 group-hover:bg-cyan-500 group-hover:text-white text-slate-700'
        }`}
      >
        <Activity className={`w-3.5 h-3.5 ${isTwinMode ? 'animate-pulse' : ''}`} />
      </div>

      <div className="flex items-center gap-1 text-left">
        <span className="text-xs font-bold whitespace-nowrap">
          WiFi Twin
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isTwinMode ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
          }`}
        />
      </div>

      <div
        className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-colors shrink-0 ${
          isTwinMode
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'bg-slate-100 group-hover:bg-slate-800 text-slate-600 group-hover:text-cyan-300'
        }`}
      >
        {isTwinMode ? 'BẬT' : 'TẮT'}
      </div>
    </button>
  );
}
