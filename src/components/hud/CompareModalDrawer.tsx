'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { X, Split, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getStatusColorToken } from '@/simulation/healthMath';

export function CompareModalDrawer() {
  const isCompareMode = useTwinStore((state) => state.isCompareMode);
  const toggleCompareMode = useTwinStore((state) => state.toggleCompareMode);
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedBuildingId = useTwinStore((state) => state.selectedBuildingId);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const compareBuildingId = useTwinStore((state) => state.compareBuildingId);
  const setCompareBuilding = useTwinStore((state) => state.setCompareBuilding);

  if (!isCompareMode) return null;

  const buildings = simulationData.buildings;
  const bldg1 = buildings.find((b) => b.id === (selectedBuildingId || 'bldg-C')) || buildings[0];
  const bldg2 = buildings.find((b) => b.id === (compareBuildingId || 'bldg-B')) || buildings[1];

  const renderMetricRow = (
    label: string,
    val1: string | number,
    val2: string | number,
    unit = '',
    better: 'HIGH' | 'LOW' = 'HIGH'
  ) => {
    const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1);
    const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2);
    const isNum = !isNaN(num1) && !isNaN(num2);

    let win1 = false;
    let win2 = false;
    if (isNum && num1 !== num2) {
      if (better === 'HIGH') {
        win1 = num1 > num2;
        win2 = num2 > num1;
      } else {
        win1 = num1 < num2;
        win2 = num2 < num1;
      }
    }

    return (
      <div className="flex items-center justify-between py-1.5 px-3 border-b border-slate-800 text-xs">
        <span
          className={`font-mono font-bold ${
            win1 ? 'text-emerald-400' : 'text-slate-300'
          }`}
        >
          {val1} {unit}
        </span>
        <span className="text-slate-400 text-[11px] font-medium">{label}</span>
        <span
          className={`font-mono font-bold ${
            win2 ? 'text-emerald-400' : 'text-slate-300'
          }`}
        >
          {val2} {unit}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Split className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Bảng Đối chiếu Trực tiếp 2 Phân khu (Compare Mode)
            </h2>
          </div>
          <button
            type="button"
            onClick={toggleCompareMode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Building Selectors */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/40 border-b border-slate-800">
          {/* Building 1 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Tòa nhà 1</label>
            <select
              value={bldg1.id}
              onChange={(e) => selectBuilding(e.target.value)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.metrics.healthScore}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Building 2 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Tòa nhà 2</label>
            <select
              value={bldg2.id}
              onChange={(e) => setCompareBuilding(e.target.value)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.metrics.healthScore}đ)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Comparison Table */}
        <div className="flex flex-col p-2">
          {renderMetricRow('Điểm Sức khỏe SLA', Math.round(bldg1.metrics.healthScore), Math.round(bldg2.metrics.healthScore), 'đ', 'HIGH')}
          {renderMetricRow('Độ phủ sóng (Coverage)', bldg1.metrics.coveragePercent, bldg2.metrics.coveragePercent, '%', 'HIGH')}
          {renderMetricRow('Số lượng Client', bldg1.metrics.clientCount, bldg2.metrics.clientCount, 'clients', 'LOW')}
          {renderMetricRow('Độ trễ trung bình', bldg1.metrics.latencyMs, bldg2.metrics.latencyMs, 'ms', 'LOW')}
          {renderMetricRow('Băng thông tổng', bldg1.metrics.throughputMbps, bldg2.metrics.throughputMbps, 'Mbps', 'HIGH')}
          {renderMetricRow('Mức độ nhiễu kênh', bldg1.metrics.interferencePercent, bldg2.metrics.interferencePercent, '%', 'LOW')}
          {renderMetricRow('Chất lượng Chuyển vùng', bldg1.metrics.roamingQualityPercent, bldg2.metrics.roamingQualityPercent, '%', 'HIGH')}
        </div>

        {/* Issues & Recommendations */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 border-t border-slate-800 text-[11px]">
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-rose-400">Vấn đề chính:</span>
            <span className="text-slate-300">{bldg1.primaryIssue}</span>
            <span className="font-bold text-cyan-400 mt-1">Đề xuất:</span>
            <span className="text-slate-300">{bldg1.recommendation}</span>
          </div>

          <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-rose-400">Vấn đề chính:</span>
            <span className="text-slate-300">{bldg2.primaryIssue}</span>
            <span className="font-bold text-cyan-400 mt-1">Đề xuất:</span>
            <span className="text-slate-300">{bldg2.recommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
