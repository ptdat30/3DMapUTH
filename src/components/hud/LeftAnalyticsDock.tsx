'use client';

import React, { useState } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { BuildingRankChart } from '@/components/charts/BuildingRankChart';
import { IssueTreemapChart } from '@/components/charts/IssueTreemapChart';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { HealthStatus } from '@/types/wifiTwin';

export function LeftAnalyticsDock() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchQuery = useTwinStore((state) => state.searchQuery);
  const setSearchQuery = useTwinStore((state) => state.setSearchQuery);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const setStatusFilter = useTwinStore((state) => state.setStatusFilter);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const simulationData = useTwinStore((state) => state.simulationData);

  return (
    <aside
      className={`fixed top-20 left-4 bottom-32 z-20 pointer-events-auto transition-transform duration-300 ease-in-out select-none flex ${
        isCollapsed ? '-translate-x-[355px]' : 'translate-x-0'
      }`}
    >
      {/* Dock Content */}
      <div className="w-[340px] h-full flex flex-col gap-3 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl overflow-y-auto">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm Tòa nhà, Tầng, Mã AP (vd: AP-C4)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
          <span className="text-slate-400 flex items-center gap-1 font-semibold pr-1">
            <Filter className="w-3 h-3" />
          </span>
          {(['ALL', 'CRITICAL', 'POOR', 'FAIR', 'GOOD', 'EXCELLENT'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded-full cursor-pointer transition-all whitespace-nowrap font-medium ${
                statusFilter === st
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>

        {/* Chart 4: Building Health Ranking */}
        <BuildingRankChart />

        {/* Chart 6: Issue Root-Cause Treemap */}
        <IssueTreemapChart />
      </div>

      {/* Collapse Toggle Handle */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="self-center ml-1 p-1.5 rounded-r-xl bg-slate-900/90 border border-l-0 border-slate-700 text-slate-300 hover:text-cyan-400 shadow-lg cursor-pointer"
        title={isCollapsed ? 'Mở thanh phân tích' : 'Thu gọn thanh phân tích'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
