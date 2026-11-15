'use client';

import React, { useMemo } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { IssueCategory } from '@/types/wifiTwin';

const CATEGORY_META: Record<IssueCategory, { label: string; color: string; desc: string }> = {
  CHANNEL_CONGESTION: { label: 'Nghẽn kênh', color: '#f59e0b', desc: 'Nhiễu đồng kênh & giao thoa' },
  SIGNAL_DEADZONE: { label: 'Vùng lõm sóng', color: '#f97316', desc: 'Suy hao tường/vật cản' },
  CLIENT_OVERLOAD: { label: 'Quá tải Client', color: '#ef4444', desc: '> 45 thiết bị / AP' },
  POE_POWER_LOSS: { label: 'Mất nguồn PoE', color: '#dc2626', desc: 'AP ngoại tuyến / sụt áp switch' },
  ROAMING_FAILURE: { label: 'Lỗi Chuyển vùng', color: '#8b5cf6', desc: 'Rớt gói khi di chuyển' },
};

export function IssueTreemapChart() {
  const simulationData = useTwinStore((state) => state.simulationData);
  const selectedApId = useTwinStore((state) => state.selectedApId);
  const selectAp = useTwinStore((state) => state.selectAp);

  // Compute breakdown by category based on APs in POOR or CRITICAL states or with alerts
  const breakdown = useMemo(() => {
    const counts: Record<IssueCategory, { count: number; apIds: string[] }> = {
      CHANNEL_CONGESTION: { count: 0, apIds: [] },
      SIGNAL_DEADZONE: { count: 0, apIds: [] },
      CLIENT_OVERLOAD: { count: 0, apIds: [] },
      POE_POWER_LOSS: { count: 0, apIds: [] },
      ROAMING_FAILURE: { count: 0, apIds: [] },
    };

    simulationData.accessPoints.forEach((ap) => {
      if (!ap.isOnline) {
        counts.POE_POWER_LOSS.count += 1;
        counts.POE_POWER_LOSS.apIds.push(ap.id);
      } else if (ap.metrics.clientCount > 40) {
        counts.CLIENT_OVERLOAD.count += 1;
        counts.CLIENT_OVERLOAD.apIds.push(ap.id);
      } else if (ap.metrics.interferencePercent > 35) {
        counts.CHANNEL_CONGESTION.count += 1;
        counts.CHANNEL_CONGESTION.apIds.push(ap.id);
      } else if (ap.metrics.rssiDbm < -78) {
        counts.SIGNAL_DEADZONE.count += 1;
        counts.SIGNAL_DEADZONE.apIds.push(ap.id);
      } else if (ap.metrics.roamingQualityPercent < 70) {
        counts.ROAMING_FAILURE.count += 1;
        counts.ROAMING_FAILURE.apIds.push(ap.id);
      }
    });

    const total = Object.values(counts).reduce((acc, c) => acc + c.count, 0) || 1;
    return { counts, total };
  }, [simulationData.accessPoints]);

  const categories = Object.keys(CATEGORY_META) as IssueCategory[];

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md relative overflow-hidden group">
      <div className="flex items-center justify-between text-xs relative z-10">
        <span className="font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Tỷ trọng Nguyên nhân Sự cố (Treemap)
        </span>
        <span className="text-[10px] text-slate-400 font-mono font-semibold">
          Tổng: {breakdown.total} điểm cảnh báo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1 relative z-10">
        {categories.map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const data = breakdown.counts[catKey];
          const percent = Math.round((data.count / breakdown.total) * 100);
          const isCritical = catKey === 'POE_POWER_LOSS' || catKey === 'CLIENT_OVERLOAD';

          return (
            <div
              key={catKey}
              onClick={() => {
                if (data.apIds.length > 0) {
                  selectAp(data.apIds[0]);
                }
              }}
              className={`p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-600 transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:scale-[1.03] hover:shadow-lg ${
                isCritical && data.count > 0 ? 'ring-1 ring-rose-500/30' : ''
              }`}
              style={{
                borderLeftWidth: '3.5px',
                borderLeftColor: meta.color,
                boxShadow: isCritical && data.count > 0 ? `0 0 10px ${meta.color}20` : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate">
                  {meta.label}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-300">
                  {percent}%
                </span>
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[9px] text-slate-400 truncate max-w-[90px]">
                  {meta.desc}
                </span>
                <span className="text-xs font-mono font-black text-slate-100 flex items-center gap-0.5">
                  {data.count > 0 && isCritical && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block mr-0.5" />
                  )}
                  {data.count} <span className="text-[9px] font-normal text-slate-400">AP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
