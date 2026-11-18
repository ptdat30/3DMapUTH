'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  COLORS,
  FLOOR_META,
  FLOOR_GEOMETRY,
  GRAPH_NODES,
  calculateRoute,
  CalculatedRoute,
  GraphNode,
} from '@/data/buildingK2dData';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Grid,
  Tag,
  ArrowRight,
  Compass,
  X,
  Footprints,
} from 'lucide-react';

interface Building2DNavigatorProps {
  onClose?: () => void;
  initialStartId?: string;
  initialEndId?: string;
}

export function Building2DNavigator({
  onClose,
  initialStartId = 'g_ent_south',
  initialEndId = 'f3_p301',
}: Building2DNavigatorProps) {
  const [currentFloor, setCurrentFloor] = useState<number>(0);
  const [startId, setStartId] = useState<string>(initialStartId);
  const [endId, setEndId] = useState<string>(initialEndId);
  const [highlightedStepIdx, setHighlightedStepIdx] = useState<number>(-1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation
  const [simPlaying, setSimPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0); // 0 to 1
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const simAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // POI Popover
  const [popoverPoi, setPopoverPoi] = useState<GraphNode | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  // Sidebar mobile collapse
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Calculate shortest path route
  const route: CalculatedRoute | null = useMemo(() => {
    return calculateRoute(startId, endId);
  }, [startId, endId]);

  // When route changes, auto switch to start floor
  useEffect(() => {
    if (GRAPH_NODES[startId]) {
      setCurrentFloor(GRAPH_NODES[startId].floor);
    }
    setSimProgress(0);
    setSimPlaying(false);
  }, [startId]);

  // Simulation Loop
  useEffect(() => {
    if (!simPlaying || !route) return;

    lastTimeRef.current = performance.now();
    const update = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setSimProgress((prev) => {
        // speed: total meters per second base = 12m/s scaled by simSpeed
        const speedMps = 14 * simSpeed;
        const progressIncrement = (speedMps * dt) / route.totalTimelineDist;
        const next = prev + progressIncrement;

        if (next >= 1) {
          setSimPlaying(false);
          return 1;
        }

        // Auto floor follow along simulation avatar
        const currentDist = next * route.totalTimelineDist;
        const seg = route.simTimeline.find(
          (s) => currentDist >= s.startDist && currentDist <= s.endDist
        );
        if (seg && seg.floor !== currentFloor) {
          setCurrentFloor(seg.floor);
        }

        return next;
      });

      simAnimRef.current = requestAnimationFrame(update);
    };

    simAnimRef.current = requestAnimationFrame(update);
    return () => {
      if (simAnimRef.current) cancelAnimationFrame(simAnimRef.current);
    };
  }, [simPlaying, simSpeed, route, currentFloor]);

  // Interpolate simulation avatar position
  const simAvatar = useMemo(() => {
    if (!route || route.simTimeline.length === 0) return null;
    const currentDist = simProgress * route.totalTimelineDist;
    const seg = route.simTimeline.find(
      (s) => currentDist >= s.startDist && currentDist <= s.endDist
    ) || route.simTimeline[route.simTimeline.length - 1];

    if (!seg || seg.floor !== currentFloor) return null;

    const segLen = Math.max(0.001, seg.endDist - seg.startDist);
    const segRatio = Math.max(0, Math.min(1, (currentDist - seg.startDist) / segLen));

    const x = seg.from.x + (seg.to.x - seg.from.x) * segRatio;
    const y = seg.from.y + (seg.to.y - seg.from.y) * segRatio;

    return { x, y, label: seg.label };
  }, [route, simProgress, currentFloor]);

  // Handle Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-clickable')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const swapLocations = () => {
    const temp = startId;
    setStartId(endId);
    setEndId(temp);
  };

  const handlePoiClick = (poiId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = GRAPH_NODES[poiId];
    if (!node) return;
    setPopoverPoi(node);
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    setPopoverPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const closePopover = () => {
    setPopoverPoi(null);
    setPopoverPos(null);
  };

  // Find Nearest Utility
  const routeToNearest = (category: 'restroom' | 'entrance') => {
    const currentNode = GRAPH_NODES[startId] || GRAPH_NODES['g_ent_south'];
    const candidates = Object.values(GRAPH_NODES).filter((n) => n.category === category);
    if (candidates.length === 0) return;

    // Prefer candidate on current floor first
    const sameFloor = candidates.find((c) => c.floor === currentNode.floor);
    if (sameFloor) {
      setEndId(sameFloor.id);
    } else {
      setEndId(candidates[0].id);
    }
  };

  // Stair transition detection on current floor
  const stairTransition = useMemo(() => {
    if (!route) return null;
    const f = currentFloor;
    for (let i = 0; i < route.steps.length; i++) {
      const step = route.steps[i];
      if (step.floor === f && step.targetFloor !== undefined) {
        return {
          targetFloor: step.targetFloor,
          title: step.title,
        };
      }
    }
    return null;
  }, [route, currentFloor]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-slate-100 text-slate-800 relative overflow-hidden select-none">
      {/* =================================================================== */}
      {/* LEFT SIDEBAR: WAYFINDING CONTROLS, DIRECTIONS & LEGEND              */}
      {/* =================================================================== */}
      <aside
        className={`w-full lg:w-[410px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col z-20 shadow-md shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'max-h-[55vh] lg:max-h-screen' : 'max-h-14 lg:max-h-screen'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Compass className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-tight flex items-center gap-1.5">
                Dẫn đường 2D Tòa K (CS3)
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                  4 TẦNG
                </span>
              </h1>
              <p className="text-[11px] text-slate-300">Mặt bằng chi tiết • Tầng trệt – Tầng 3</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title={isSidebarOpen ? 'Thu gọn bảng điều khiển để xem bản đồ' : 'Mở rộng bảng điều khiển'}
            >
              {isSidebarOpen ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Bản đồ</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Chỉ dẫn</span>
                </>
              )}
            </button>

            {/* Close Button if opened as overlay */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Đóng bản đồ 2D và quay lại Sa bàn 3D"
              >
                <X className="w-4 h-4" />
                <span className="text-[10px] hidden sm:inline">Quay lại 3D</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Start & End Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
            {/* Origin Select */}
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Điểm xuất phát
                </label>
                <select
                  value={startId}
                  onChange={(e) => setStartId(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-indigo-400 focus:border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                >
                  {[0, 1, 2, 3].map((f) => (
                    <optgroup key={`start-f-${f}`} label={`━━ ${FLOOR_META[f].name} ━━`}>
                      {Object.values(GRAPH_NODES)
                        .filter((n) => n.poi && n.floor === f)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.category === 'entrance' ? '🚪' : n.category === 'classroom' ? '🏫' : n.category === 'restroom' ? '🚻' : '🪜'} {n.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Reverse Button */}
            <div className="flex items-center justify-between pl-3 pr-1 -my-1">
              <div className="w-0.5 h-4 bg-slate-300 ml-0.5 rounded-full" />
              <button
                type="button"
                onClick={swapLocations}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 text-xs font-semibold shadow-xs transition active:scale-95"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Đảo chiều</span>
              </button>
            </div>

            {/* Destination Select */}
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Điểm đến
                </label>
                <select
                  value={endId}
                  onChange={(e) => setEndId(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-indigo-400 focus:border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                >
                  {[0, 1, 2, 3].map((f) => (
                    <optgroup key={`end-f-${f}`} label={`━━ ${FLOOR_META[f].name} ━━`}>
                      {Object.values(GRAPH_NODES)
                        .filter((n) => n.poi && n.floor === f)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.category === 'entrance' ? '🚪' : n.category === 'classroom' ? '🏫' : n.category === 'restroom' ? '🚻' : '🪜'} {n.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tiện ích nhanh:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => routeToNearest('restroom')}
                  className="px-2.5 py-1 rounded-xl bg-lime-100 hover:bg-lime-200 text-lime-900 border border-lime-300 text-xs font-bold transition active:scale-95 flex items-center gap-1"
                >
                  <span>🚻</span> <span>WC gần nhất</span>
                </button>
                <button
                  type="button"
                  onClick={() => routeToNearest('entrance')}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 text-xs font-bold transition active:scale-95 flex items-center gap-1"
                >
                  <span>🚪</span> <span>Lối ra</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartId('g_ent_south');
                    setEndId('f3_p301');
                  }}
                  className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition active:scale-95"
                >
                  Cổng Nam → P.301
                </button>
              </div>
            </div>
          </div>

          {/* Route Metrics Card */}
          {route && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Khoảng cách</div>
                  <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
                    {route.totalMeters} m
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Thời gian</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                    ~{route.walkMinutes} phút
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold">Chuyển tầng</div>
                  <div className="text-sm font-extrabold text-sky-600 mt-0.5">
                    {route.floorChanges} tầng
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimPlaying(!simPlaying)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
                >
                  {simPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{simPlaying ? 'Tạm dừng mô phỏng' : 'Mô phỏng bước đi'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimProgress(0);
                    setSimPlaying(false);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95 cursor-pointer"
                  title="Đặt lại mô phỏng"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 3 : 1)}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition cursor-pointer"
                  title="Tốc độ mô phỏng"
                >
                  {simSpeed}x
                </button>
              </div>

              {/* Scrubber Range */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="text-indigo-600 font-bold truncate">
                    {simAvatar?.label || 'Tiến trình di chuyển'}
                  </span>
                  <span>{Math.round(simProgress * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={Math.round(simProgress * 1000)}
                  onChange={(e) => {
                    setSimProgress(Number(e.target.value) / 1000);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Turn-by-turn Step List */}
          {route && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                  Chỉ dẫn từng bước
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {route.steps.length} bước
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {route.steps.map((step, idx) => {
                  const isActive = highlightedStepIdx === idx;
                  return (
                    <div
                      key={`step-${idx}`}
                      onClick={() => {
                        setHighlightedStepIdx(idx);
                        setCurrentFloor(step.targetFloor !== undefined ? step.targetFloor : step.floor);
                      }}
                      className={`p-2 rounded-xl border transition cursor-pointer flex items-start gap-2 ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400/50'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-snug">
                          {step.title}
                        </div>
                        <div className="text-[10px] text-slate-500">{step.detail}</div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                        {FLOOR_META[step.floor]?.short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map Color Legend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Chú thích màu bản đồ
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-slate-300" style={{ backgroundColor: COLORS.corridor }} />
                <span className="text-[11px] font-semibold text-slate-700">Hành lang</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-slate-400" style={{ backgroundColor: COLORS.wall }} />
                <span className="text-[11px] font-semibold text-slate-700">Tường bê tông</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-dashed border-slate-800" style={{ backgroundColor: COLORS.classroom }} />
                <span className="text-[11px] font-semibold text-slate-700">Phòng học</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-dashed border-slate-800" style={{ backgroundColor: COLORS.restroom }} />
                <span className="text-[11px] font-semibold text-slate-700">Nhà vệ sinh</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-sky-600" style={{ backgroundColor: COLORS.stairs }} />
                <span className="text-[11px] font-semibold text-slate-700">Cầu thang bộ</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50">
                <span className="w-3.5 h-3.5 rounded shrink-0 border border-slate-600" style={{ backgroundColor: COLORS.steps }} />
                <span className="text-[11px] font-semibold text-slate-700">Bậc thang</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* RIGHT VIEWPORT: 2D ARCHITECTURAL SVG FLOOR PLAN                     */}
      {/* =================================================================== */}
      <main
        className="flex-1 flex flex-col relative bg-slate-200/80 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Top Floating Floor Switcher & Toggles */}
        <div className="p-2 sm:p-4 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 z-10 pointer-events-none">
          {/* Floor Switcher Pills */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
            {[0, 1, 2, 3].map((f) => {
              const hasRoute = Boolean(route && (route.segmentsByFloor[f]?.length ?? 0) > 0);
              return (
                <button
                  key={`floor-tab-${f}`}
                  type="button"
                  onClick={() => setCurrentFloor(f)}
                  className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    currentFloor === f
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{FLOOR_META[f].name}</span>
                  {hasRoute && (
                    <span className={`w-2 h-2 rounded-full ${currentFloor === f ? 'bg-amber-300' : 'bg-indigo-600'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Map Display Toggles */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                showLabels
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Nhãn phòng</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                showGrid
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Lưới</span>
            </button>
          </div>
        </div>

        {/* Floating Staircase Transition Notification */}
        {stairTransition && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => setCurrentFloor(stairTransition.targetFloor)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-2xl shadow-xl border border-sky-400/50 flex items-center gap-2 text-xs sm:text-sm font-bold transition hover:scale-105 active:scale-95 cursor-pointer animate-bounce"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
              <span>{stairTransition.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Transformed Map Layer */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          <div
            className="transition-transform duration-75 ease-out will-change-transform pointer-events-auto"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <div className="bg-white p-3 sm:p-5 rounded-3xl shadow-2xl border border-slate-300/80">
              {/* Floor Title Banner inside Card */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                    {FLOOR_META[currentFloor]?.name}
                  </span>
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                    {FLOOR_META[currentFloor]?.subtitle}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Nhấp vào phòng / bậc thang để chọn điểm
                </span>
              </div>

              {/* 2D Architectural SVG (1000 x 400) */}
              <svg
                viewBox="0 0 1000 400"
                className="w-[85vw] max-w-[960px] h-auto rounded-xl overflow-hidden shadow-inner border border-slate-300 bg-[#c5cdd4]"
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="archGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15, 23, 42, 0.08)" strokeWidth="0.75" />
                  </pattern>

                  {/* Marker Arrow */}
                  <marker id="routeMarkerArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#1d4ed8" />
                  </marker>
                </defs>

                {/* 1. Concrete Outer Wall */}
                <rect x="0" y="0" width="1000" height="400" fill={COLORS.wall} />

                {/* Optional Grid */}
                {showGrid && <rect x="0" y="0" width="1000" height="400" fill="url(#archGridPattern)" />}

                {/* 2. Pink Walkable Corridors */}
                {FLOOR_GEOMETRY[currentFloor]?.corridors.map((c, i) => (
                  <rect key={`corridor-${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={COLORS.corridor} />
                ))}

                {/* 3. Black Entrance Steps */}
                {FLOOR_GEOMETRY[currentFloor]?.steps.map((st) => (
                  <g
                    key={st.id}
                    className="interactive-clickable cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => handlePoiClick(st.id, e)}
                  >
                    <rect x={st.x} y={st.y} width={st.w} height={st.h} fill={COLORS.steps} />
                    {showLabels && (
                      <text
                        x={st.labelX}
                        y={st.labelY}
                        fill="#ffffff"
                        fontSize={st.orientation === 'vertical' ? '10' : '11'}
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={st.orientation === 'vertical' ? `rotate(-90 ${st.labelX} ${st.labelY})` : undefined}
                      >
                        {st.label}
                      </text>
                    )}
                  </g>
                ))}

                {/* 4. Green Restrooms */}
                {FLOOR_GEOMETRY[currentFloor]?.restrooms.map((wc) => (
                  <g
                    key={wc.id}
                    className="interactive-clickable cursor-pointer hover:opacity-95"
                    onClick={(e) => handlePoiClick(wc.id, e)}
                  >
                    <rect
                      x={wc.x}
                      y={wc.y}
                      width={wc.w}
                      height={wc.h}
                      fill={COLORS.restroom}
                      stroke={COLORS.borderDash}
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />
                    {wc.door && (
                      <rect x={wc.door.x} y={wc.door.y} width={wc.door.w} height={wc.door.h} fill={COLORS.corridor} />
                    )}
                    {showLabels && (
                      <>
                        <text
                          x={wc.x + wc.w / 2}
                          y={wc.y + wc.h / 2 - 4}
                          fill="#1a2e05"
                          fontSize="12"
                          fontWeight="800"
                          textAnchor="middle"
                        >
                          {wc.label}
                        </text>
                        <text
                          x={wc.x + wc.w / 2}
                          y={wc.y + wc.h / 2 + 10}
                          fill="#365314"
                          fontSize="10"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {wc.sublabel}
                        </text>
                      </>
                    )}
                  </g>
                ))}

                {/* 5. Blue Staircases */}
                {FLOOR_GEOMETRY[currentFloor]?.stairs.map((st) => (
                  <g
                    key={st.id}
                    className="interactive-clickable cursor-pointer hover:opacity-95"
                    onClick={(e) => handlePoiClick(st.id, e)}
                  >
                    <rect x={st.x} y={st.y} width={st.w} height={st.h} fill={COLORS.stairs} />
                    {/* Stair steps inside */}
                    {[1, 2, 3, 4, 5].map((s) => (
                      <line
                        key={`step-line-${s}`}
                        x1={st.x + 8}
                        y1={st.y + 10 + ((st.h - 20) / 6) * s}
                        x2={st.x + st.w - 8}
                        y2={st.y + 10 + ((st.h - 20) / 6) * s}
                        stroke="rgba(255,255,255,0.55)"
                        strokeWidth="1.5"
                      />
                    ))}
                    {showLabels && (
                      <g>
                        <rect
                          x={st.x + st.w / 2 - 32}
                          y={st.y + st.h / 2 - 9}
                          width="64"
                          height="18"
                          rx="4"
                          fill="rgba(12, 74, 110, 0.85)"
                        />
                        <text
                          x={st.x + st.w / 2}
                          y={st.y + st.h / 2 + 3.5}
                          fill="#ffffff"
                          fontSize={st.w < 55 ? '8' : '9.5'}
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {st.shortLabel}
                        </text>
                      </g>
                    )}
                  </g>
                ))}

                {/* 6. Yellow Classrooms */}
                {FLOOR_GEOMETRY[currentFloor]?.classrooms.map((rm) => (
                  <g
                    key={rm.id}
                    className="interactive-clickable cursor-pointer hover:brightness-95 transition-all"
                    onClick={(e) => handlePoiClick(rm.id, e)}
                  >
                    {rm.shape === 'polygon' ? (
                      <polygon
                        points={rm.points}
                        fill={COLORS.classroom}
                        stroke={COLORS.borderDash}
                        strokeWidth="2.2"
                        strokeDasharray="7,4"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <rect
                        x={rm.x}
                        y={rm.y}
                        width={rm.w}
                        height={rm.h}
                        fill={COLORS.classroom}
                        stroke={COLORS.borderDash}
                        strokeWidth="2.2"
                        strokeDasharray="7,4"
                      />
                    )}

                    {/* Door openings */}
                    {(rm.doors || (rm.door ? [rm.door] : [])).map((d, dIdx) => (
                      <rect
                        key={`door-${dIdx}`}
                        x={d.x}
                        y={d.y}
                        width={d.w}
                        height={d.h}
                        fill={COLORS.corridor}
                      />
                    ))}

                    {/* Labels */}
                    {showLabels && (
                      <g>
                        <text
                          x={rm.centerX !== undefined ? rm.centerX : (rm.x || 0) + (rm.w || 0) / 2}
                          y={(rm.centerY !== undefined ? rm.centerY : (rm.y || 0) + (rm.h || 0) / 2) - 3}
                          fill="#1e293b"
                          fontSize={(rm.w || 0) > 400 || rm.shape === 'polygon' ? '20' : '15'}
                          fontWeight="800"
                          textAnchor="middle"
                        >
                          {rm.label}
                        </text>
                        {rm.sublabel && (
                          <text
                            x={rm.centerX !== undefined ? rm.centerX : (rm.x || 0) + (rm.w || 0) / 2}
                            y={(rm.centerY !== undefined ? rm.centerY : (rm.y || 0) + (rm.h || 0) / 2) + 16}
                            fill="#475569"
                            fontSize={(rm.w || 0) > 400 || rm.shape === 'polygon' ? '12' : '11'}
                            fontWeight="600"
                            textAnchor="middle"
                          >
                            {rm.sublabel}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                ))}

                {/* 7. Route Polyline Segments on this floor */}
                {route?.segmentsByFloor[currentFloor]?.map((seg, sIdx) => {
                  if (seg.length < 2) return null;
                  const ptsStr = seg.map((n) => `${n.x},${n.y}`).join(' ');

                  return (
                    <g key={`route-seg-${sIdx}`}>
                      {/* Outer soft halo */}
                      <polyline
                        points={ptsStr}
                        fill="none"
                        stroke="rgba(37, 99, 235, 0.25)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Solid base line */}
                      <polyline
                        points={ptsStr}
                        fill="none"
                        stroke="#1d4ed8"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Animated dashed line */}
                      <polyline
                        points={ptsStr}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeDasharray="9 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-[dash_1.1s_linear_infinite]"
                        style={{
                          animation: 'routeDash 1.1s linear infinite',
                        }}
                      />
                    </g>
                  );
                })}

                {/* 8. Start Pin (if on current floor) */}
                {GRAPH_NODES[startId]?.floor === currentFloor && (
                  <g transform={`translate(${GRAPH_NODES[startId].x}, ${GRAPH_NODES[startId].y})`}>
                    <circle r="14" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />
                    <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                    <text y="3.5" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
                      A
                    </text>
                  </g>
                )}

                {/* 9. Destination Pin (if on current floor) */}
                {GRAPH_NODES[endId]?.floor === currentFloor && (
                  <g transform={`translate(${GRAPH_NODES[endId].x}, ${GRAPH_NODES[endId].y})`}>
                    <circle r="15" fill="rgba(244, 63, 94, 0.25)" className="animate-ping" />
                    <circle r="9.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                    <text y="3.5" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
                      B
                    </text>
                  </g>
                )}

                {/* 10. Simulation Avatar Marker */}
                {simAvatar && (
                  <g transform={`translate(${simAvatar.x}, ${simAvatar.y})`}>
                    <circle r="16" fill="rgba(99, 102, 241, 0.35)" className="animate-ping" />
                    <circle r="10" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
                    <circle r="4" fill="#ffffff" />
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* POI Popover */}
        {popoverPoi && popoverPos && (
          <div
            className="fixed z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 w-60 pointer-events-auto"
            style={{
              left: `${Math.min(window.innerWidth - 260, Math.max(20, popoverPos.x - 120))}px`,
              top: `${Math.max(20, popoverPos.y - 100)}px`,
            }}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{popoverPoi.name}</h4>
                <p className="text-[10px] text-slate-500">{FLOOR_META[popoverPoi.floor]?.name}</p>
              </div>
              <button
                type="button"
                onClick={closePopover}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStartId(popoverPoi.id);
                  closePopover();
                }}
                className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <span>●</span> <span>Điểm đi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEndId(popoverPoi.id);
                  closePopover();
                }}
                className="py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <MapPin className="w-3 h-3" /> <span>Điểm đến</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom-Right Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 overflow-hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            title="Phóng to"
            className="p-2.5 hover:bg-slate-100 text-slate-700 border-b border-slate-200 transition active:bg-slate-200 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Vừa màn hình"
            className="px-2 py-2 hover:bg-slate-100 text-[10px] font-bold text-slate-700 border-b border-slate-200 transition active:bg-slate-200 cursor-pointer text-center"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            title="Thu nhỏ"
            className="p-2.5 hover:bg-slate-100 text-slate-700 transition active:bg-slate-200 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
