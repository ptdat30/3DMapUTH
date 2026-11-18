'use client';

import React, { useState, useEffect } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { BuildingRankChart } from '@/components/charts/BuildingRankChart';
import { IssueTreemapChart } from '@/components/charts/IssueTreemapChart';
import { Search, ChevronLeft, ChevronRight, Filter, BarChart3, X } from 'lucide-react';
import { HealthStatus } from '@/types/wifiTwin';

export function LeftAnalyticsDock() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto-expand on desktop screens (>= 1024px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsCollapsed(false);
    }
  }, []);

  const searchQuery = useTwinStore((state) => state.searchQuery);
  const setSearchQuery = useTwinStore((state) => state.setSearchQuery);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const setStatusFilter = useTwinStore((state) => state.setStatusFilter);
  const selectBuilding = useTwinStore((state) => state.selectBuilding);
  const simulationData = useTwinStore((state) => state.simulationData);

  return (
    <>
      {/* Mobile Floating Pill Button to open Analytics */}
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="lg:hidden fixed bottom-24 left-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-200 shadow-xl font-bold text-xs active:scale-95 cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Xếp hạng Tòa</span>
        </button>
      )}

      {/* Mobile Backdrop Overlay when Drawer is Open */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="lg:hidden fixed inset-0 z-35 bg-black/60 backdrop-blur-xs pointer-events-auto"
        />
      )}

      <aside
        className={`fixed z-40 pointer-events-auto transition-all duration-300 ease-in-out select-none flex ${
          isCollapsed
            ? '-translate-x-[120%] lg:-translate-x-[355px]'
            : 'translate-x-0'
        } inset-x-3 top-16 bottom-20 sm:top-20 sm:bottom-28 max-w-md mx-auto lg:inset-x-auto lg:top-20 lg:left-4 lg:bottom-32 lg:max-w-none`}
      >
        {/* Dock Content */}
        <div className="w-full lg:w-[340px] h-full flex flex-col gap-3 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl overflow-y-auto">
          {/* Mobile Header with Close Button */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Xếp hạng & Sự cố Tòa nhà</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đóng</span>
            </button>
          </div>

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

        {/* Desktop Collapse Toggle Handle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex self-center ml-1 p-1.5 rounded-r-xl bg-slate-900/90 border border-l-0 border-slate-700 text-slate-300 hover:text-cyan-400 shadow-lg cursor-pointer"
          title={isCollapsed ? 'Mở thanh phân tích' : 'Thu gọn thanh phân tích'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
