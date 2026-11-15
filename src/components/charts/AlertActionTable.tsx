'use client';

import React from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { Eye, Wrench, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export function AlertActionTable() {
  const simulationData = useTwinStore((state) => state.simulationData);
  const resolvedAlertIds = useTwinStore((state) => state.resolvedAlertIds);
  const selectAp = useTwinStore((state) => state.selectAp);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const flyTo = useTwinStore((state) => state.flyTo);
  const autoFixAlert = useTwinStore((state) => state.autoFixAlert);

  const alerts = simulationData.alerts;

  const handleFlyTo = (alert: (typeof alerts)[0]) => {
    if (alert.apId) {
      selectAp(alert.apId);
    } else if (alert.buildingId) {
      selectBuilding(alert.buildingId);
      const bldg = simulationData.buildings.find((b) => b.id === alert.buildingId);
      if (bldg) flyTo(bldg.center3D);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          Bảng Cảnh báo Ưu tiên (NOC Incident Table)
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {alerts.filter((a) => !resolvedAlertIds.includes(a.id)).length} sự cố đang mở
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const isResolved = resolvedAlertIds.includes(alert.id);
          const isCritical = alert.severity === 'CRITICAL';

          return (
            <div
              key={alert.id}
              className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                isResolved
                  ? 'bg-emerald-950/20 border-emerald-800/40 opacity-75'
                  : isCritical
                  ? 'bg-rose-950/30 border-rose-600/50 shadow-sm shadow-rose-950/30'
                  : 'bg-amber-950/20 border-amber-600/40'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {isResolved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCritical ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      isResolved
                        ? 'text-emerald-300 line-through'
                        : isCritical
                        ? 'text-rose-300'
                        : 'text-amber-300'
                    }`}
                  >
                    {alert.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
              </div>

              {/* Metric trigger & recommendation */}
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400 font-mono">{alert.metricTrigger}</span> —{' '}
                <span className="text-slate-300 italic">{alert.recommendation}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 mt-1 pt-1.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleFlyTo(alert)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Định vị 3D
                </button>

                {!isResolved && (
                  <button
                    type="button"
                    onClick={() => autoFixAlert(alert.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                    title="Tự động tối ưu kênh, cân bằng tải & khôi phục kết nối"
                  >
                    <Wrench className="w-3 h-3" />
                    Tự động tối ưu
                  </button>
                )}
                {isResolved && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã khắc phục
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
