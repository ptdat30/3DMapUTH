'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { Flame, Radio, Tag, Layers, AlertOctagon, PowerOff } from 'lucide-react';
import { TwinLayers } from '@/types/wifiTwin';

interface LayerMeta {
  key: keyof TwinLayers;
  label: string;
  icon: React.ElementType;
}

const LAYERS: LayerMeta[] = [
  { key: 'heatmap', label: 'Bản đồ nhiệt', icon: Flame },
  { key: 'apBeacons', label: 'Chùm sóng AP', icon: Radio },
  { key: 'buildingLabels', label: 'Nhãn Tòa nhà', icon: Tag },
  { key: 'xraySlices', label: 'Tách tầng X-Ray', icon: Layers },
  { key: 'alertPillars', label: 'Cột sáng Cảnh báo', icon: AlertOctagon },
];

export function LayerFloatingPills() {
  const activeLayers = useTwinStore((state) => state.activeLayers);
  const toggleLayer = useTwinStore((state) => state.toggleLayer);
  const toggleTwinMode = useTwinStore((state) => state.toggleTwinMode);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-xl select-none">
      {LAYERS.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayers[layer.key];

        return (
          <button
            key={layer.key}
            type="button"
            onClick={() => toggleLayer(layer.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{layer.label}</span>
          </button>
        );
      })}

      {/* Prominent Quick-Turn-Off Pill Button */}
      <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
      <button
        type="button"
        onClick={() => toggleTwinMode(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-200 hover:text-white bg-rose-950/80 hover:bg-rose-600 border border-rose-500/60 shadow-md shadow-rose-950/50 transition-all cursor-pointer hover:scale-105"
        title="Tắt chế độ Digital Twin và quay lại sa bàn tìm đường"
      >
        <PowerOff className="w-3.5 h-3.5 text-rose-400" />
        <span>TẮT DIGITAL TWIN</span>
      </button>
    </div>
  );
}
