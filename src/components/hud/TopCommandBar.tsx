'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { ScenarioId } from '@/types/wifiTwin';
import {
  RotateCcw,
  Split,
  ChevronRight,
  Activity,
  Wifi,
  Users,
  Gauge,
  Zap,
  PowerOff,
} from 'lucide-react';
import { getStatusColorToken } from '@/simulation/healthMath';

const SCENARIOS: { id: ScenarioId; label: string; desc: string }[] = [
  { id: 'NORMAL_DAY', label: 'Bình thường', desc: 'Tải 40-50%, phân bổ đều' },
  { id: 'PEAK_SHIFT_CHANGE', label: 'Cao điểm chuyển ca', desc: 'Nghẽn Tòa B & Tòa C (09:30)' },
  { id: 'ONLINE_EXAM_SURGE', label: 'Thi trực tuyến', desc: 'Quá tải đồng loạt phòng máy C4' },
  { id: 'COURTYARD_FESTIVAL', label: 'Lễ hội sân trường', desc: 'Sân trung tâm F quá tải 600+' },
  { id: 'AP_POWER_OUTAGE', label: 'Mất điện AP tầng 4', desc: 'AP-C4-02 mất PoE, rớt vùng phủ' },
];

export function TopCommandBar() {
  const simulationData = useTwinStore((state) => state.simulationData);
  const scenario = useTwinStore((state) => state.scenario);
  const setScenario = useTwinStore((state) => state.setScenario);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectedFloorNumber = useTwinStore((state) => state.selectedFloorNumber);
  const selectedApId = useTwinStore((state) => state.selectedApId);
  const isCompareMode = useTwinStore((state) => state.isCompareMode);
  const toggleCompareMode = useTwinStore((state) => state.toggleCompareMode);
  const resetView = useTwinStore((state) => state.resetView);
  const toggleTwinMode = useTwinStore((state) => state.toggleTwinMode);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const selectFloor = useTwinStore((state) => state.selectFloor);

  const { kpis } = simulationData;
  const selectedBuilding = simulationData.buildings.find((b) => b.id === selectedBuildingId);
  const selectedAp = simulationData.accessPoints.find((a) => a.id === selectedApId);
  const healthColor = getStatusColorToken(kpis.campusHealthScore >= 75 ? 'GOOD' : 'FAIR');

  return (
    <header className="w-full h-14 sm:h-16 px-2.5 sm:px-4 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex items-center justify-between pointer-events-auto select-none z-30 shadow-lg text-slate-100">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-slate-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-950/50 shrink-0">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                <span className="sm:hidden">TWIN NOC</span>
                <span className="hidden sm:inline">UTH DIGITAL TWIN</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 hidden sm:inline">NOC COMMAND CENTER</span>
          </div>

          {/* Quick prominent toggle button directly at top-left */}
          <button
            type="button"
            onClick={() => toggleTwinMode(false)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] sm:text-[11px] font-black shadow-sm transition-all cursor-pointer ml-1 active:scale-95"
            title="Nhấn để TẮT chế độ Digital Twin và quay lại sa bàn"
          >
            <PowerOff className="w-3 h-3" />
            <span className="hidden sm:inline">ĐANG BẬT</span>
            <span>TẮT ✕</span>
          </button>
        </div>

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={resetView}
            className={`hover:text-cyan-400 transition-colors cursor-pointer ${
              !selectedBuildingId ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Toàn trường
          </button>

          {selectedBuilding && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <button
                type="button"
                onClick={() => selectFloor(null)}
                className={`hover:text-cyan-400 transition-colors cursor-pointer ${
                  selectedFloorNumber === null ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                {selectedBuilding.name}
              </button>
            </>
          )}

          {selectedFloorNumber !== null && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className={selectedApId ? 'text-slate-400' : 'text-cyan-400 font-bold'}>
                Tầng {selectedFloorNumber}
              </span>
            </>
          )}

          {selectedAp && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-cyan-400 font-mono font-bold">{selectedAp.name}</span>
            </>
          )}
        </nav>
      </div>

      {/* Center: 5 Key Performance Indicators (KPIs) */}
      <div className="hidden md:flex items-center gap-2 xl:gap-3">
        {/* KPI 1: Campus Health */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Sức khỏe SLA</span>
            <span className="text-xs font-mono font-black" style={{ color: healthColor }}>
              {Math.round(kpis.campusHealthScore)} / 100
            </span>
          </div>
        </div>

        {/* KPI 2: Online APs */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">AP Online</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {kpis.onlineAps} <span className="text-[10px] text-slate-500 font-normal">/ {kpis.totalAps}</span>
            </span>
          </div>
        </div>

        {/* KPI 3: Active Clients */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Users className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Client Hoạt động</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {kpis.activeClients.toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 4: Avg Latency */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Gauge className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Độ trễ TB</span>
            <span className="text-xs font-mono font-bold text-slate-200">{kpis.avgLatencyMs} ms</span>
          </div>
        </div>

        {/* KPI 5: Total Throughput */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Zap className="w-4 h-4 text-teal-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Tổng Lưu lượng</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {kpis.totalThroughputGbps.toFixed(2)} Gbps
            </span>
          </div>
        </div>
      </div>

      {/* Right: Scenario Selector + Compare Mode + Reset View + Exit NOC */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Scenario Switcher */}
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ScenarioId)}
          className="max-w-[120px] sm:max-w-none px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] sm:text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer truncate"
        >
          {SCENARIOS.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.label}
            </option>
          ))}
        </select>

        {/* Compare Mode Toggle */}
        <button
          type="button"
          onClick={toggleCompareMode}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCompareMode
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-900/40 ring-1 ring-cyan-300'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
          }`}
          title="So sánh đối chiếu trực tiếp 2 tòa nhà"
        >
          <Split className="w-3.5 h-3.5" />
          <span>So sánh</span>
        </button>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={resetView}
          className="p-1 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title="Đặt lại góc nhìn toàn cảnh"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Close NOC Mode / Return to Normal Navigation - Prominently visible on desktop */}
        <button
          type="button"
          onClick={() => toggleTwinMode(false)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-950/70 ring-2 ring-rose-400/60 hover:scale-105 ml-1 whitespace-nowrap"
          title="Tắt Digital Twin NOC & quay lại sa bàn tìm đường bình thường"
        >
          <PowerOff className="w-3.5 h-3.5" />
          <span>TẮT DIGITAL TWIN</span>
        </button>
      </div>
    </header>
  );
}
