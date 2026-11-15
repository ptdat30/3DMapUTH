'use client';

import React, { useState } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { SlaScoreRing } from '@/components/charts/SlaScoreRing';
import { AlertActionTable } from '@/components/charts/AlertActionTable';
import { QualityRadarChart } from '@/components/charts/QualityRadarChart';
import { ClientScatterChart } from '@/components/charts/ClientScatterChart';
import { RfSpectrumChart } from '@/components/charts/RfSpectrumChart';
import { ChevronLeft, ChevronRight, Cpu, X, Signal, Radio, Layers } from 'lucide-react';
import { getStatusColorToken } from '@/simulation/healthMath';

export function RightInspectorDock() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'ANALYTICS'>('ALERTS');

  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedApId = useTwinStore((state) => state.selectedApId);
  const selectAp = useTwinStore((state) => state.selectAp);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const selectedFloorNumber = useTwinStore((state) => state.selectedFloorNumber);
  const selectFloor = useTwinStore((state) => state.selectFloor);

  const selectedAp = selectedApId
    ? simulationData.accessPoints.find((a) => a.id === selectedApId)
    : null;

  const selectedBuilding = selectedBuildingId
    ? simulationData.buildings.find((b) => b.id === selectedBuildingId)
    : null;

  return (
    <aside
      className={`fixed top-20 right-4 bottom-32 z-20 pointer-events-auto transition-transform duration-300 ease-in-out select-none flex ${
        isCollapsed ? 'translate-x-[395px]' : 'translate-x-0'
      }`}
    >
      {/* Collapse Toggle Handle */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="self-center mr-1 p-1.5 rounded-l-xl bg-slate-900/90 border border-r-0 border-slate-700 text-slate-300 hover:text-cyan-400 shadow-lg cursor-pointer"
        title={isCollapsed ? 'Mở thanh thanh tra' : 'Thu gọn thanh thanh tra'}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Dock Content */}
      <div className="w-[380px] h-full flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl overflow-y-auto">
        {/* Floor Selection Pills if a building is selected */}
        {selectedBuilding && (
          <div className="flex flex-col gap-1 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Mặt cắt Tầng — {selectedBuilding.name}
              </span>
              <button
                type="button"
                onClick={() => selectBuilding(null)}
                className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Bỏ chọn
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => selectFloor(null)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                  selectedFloorNumber === null ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả tầng
              </button>
              {selectedBuilding.floors.map((fl) => (
                <button
                  key={fl.id}
                  type="button"
                  onClick={() => selectFloor(fl.floorNumber)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                    selectedFloorNumber === fl.floorNumber
                      ? 'bg-cyan-500 text-white font-bold ring-1 ring-cyan-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tầng {fl.floorNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected AP Hardware Card (Level 4 Drill-down) */}
        {selectedAp && (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 shadow-md flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white font-mono">{selectedAp.name}</span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase"
                  style={{
                    backgroundColor: `${getStatusColorToken(selectedAp.metrics.status)}25`,
                    color: getStatusColorToken(selectedAp.metrics.status),
                  }}
                >
                  {selectedAp.metrics.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => selectAp(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono mt-1">
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Băng tần</span>
                <span className="text-slate-200 font-bold">{selectedAp.band}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Kênh 2.4/5</span>
                <span className="text-cyan-400 font-bold">
                  {selectedAp.channel24} / {selectedAp.channel5}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Tx Power</span>
                <span className="text-slate-200 font-bold">{selectedAp.txPowerDbm} dBm</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Clients</span>
                <span className="text-indigo-400 font-bold">{selectedAp.metrics.clientCount} thiết bị</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Độ trễ</span>
                <span className="text-amber-400 font-bold">{selectedAp.metrics.latencyMs} ms</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[8px]">Tín hiệu RSSI</span>
                <span className="text-emerald-400 font-bold">{selectedAp.metrics.rssiDbm} dBm</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ALERTS')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ALERTS' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chỉ số SLA & Cảnh báo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ANALYTICS' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Phân tích RF & Tải
          </button>
        </div>

        {/* Tab 1: SLA Score Ring + Priority Alert Action Table */}
        {activeTab === 'ALERTS' && (
          <div className="flex flex-col gap-2.5">
            <SlaScoreRing />
            <AlertActionTable />
          </div>
        )}

        {/* Tab 2: Quality Radar + Scatter + RF Spectrum */}
        {activeTab === 'ANALYTICS' && (
          <div className="flex flex-col gap-2.5">
            <QualityRadarChart />
            <ClientScatterChart />
            <RfSpectrumChart />
          </div>
        )}
      </div>
    </aside>
  );
}
