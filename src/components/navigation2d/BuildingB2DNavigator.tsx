'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  TOA_B_COLORS,
  TOA_B_FLOORS,
  BuildingFloor,
  RoomBInfo,
} from '@/data/buildingB2dData';
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Footprints,
  SlidersHorizontal,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

export interface BuildingB2DNavigatorProps {
  onClose?: () => void;
}

type ViewMode = 'unified' | 'tabbed' | 'split';
type ActiveTab = 'part1' | 'part2' | 'part3';
type StartPoint = 'ct1' | 'ct2' | 'gate';

interface Waypoint {
  x: number;
  y: number;
}

interface ArrowMarker {
  x: number;
  y: number;
  angle: number;
}

export function BuildingB2DNavigator({ onClose }: BuildingB2DNavigatorProps) {
  // Floor state (Tầng Trệt, Tầng 1, Tầng 2, Tầng 3)
  const [currentFloor, setCurrentFloor] = useState<BuildingFloor>('ground');
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [activeTab, setActiveTab] = useState<ActiveTab>('part1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('b_001');
  const [startPoint, setStartPoint] = useState<StartPoint>('ct2');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.5); // 0 to 1
  const animFrameRef = useRef<number | null>(null);

  // Current floor data
  const floorData = useMemo(() => {
    return TOA_B_FLOORS[currentFloor] || TOA_B_FLOORS.ground;
  }, [currentFloor]);

  // Current selected room info
  const selectedRoom: RoomBInfo = useMemo(() => {
    return (
      floorData.rooms[selectedRoomId] ||
      Object.values(floorData.rooms)[0]
    );
  }, [floorData, selectedRoomId]);

  // Start waypoint coords
  const startWaypoint: Waypoint = useMemo(() => {
    if (startPoint === 'ct1') return { x: 285, y: 232 };
    if (startPoint === 'ct2') return { x: 692, y: 195 };
    return { x: 250, y: 232 }; // Cổng Cánh Tây
  }, [startPoint]);

  // Dynamic Navigation Route in Unified View (L-Shape)
  const routeWaypoints: Waypoint[] = useMemo(() => {
    const start = startWaypoint;
    const targetDoor = selectedRoom.doorCoords;

    // Part 1 (Cánh Tây: Y corridor = 232)
    if (selectedRoom.section === 'part1') {
      return [
        start,
        { x: targetDoor.x, y: 232 },
        { x: targetDoor.x, y: targetDoor.y },
      ];
    }

    // Transition (WC)
    if (selectedRoom.id.includes('wc')) {
      return [
        start,
        { x: 625, y: 232 },
        { x: 625, y: 195 },
        { x: targetDoor.x, y: targetDoor.y },
      ];
    }

    // Part 2 (Cánh Bắc: Y corridor = 195)
    if (selectedRoom.section === 'part2') {
      return [
        start,
        { x: 685, y: 232 },
        { x: 685, y: 195 },
        { x: targetDoor.x, y: 195 },
        { x: targetDoor.x, y: targetDoor.y },
      ];
    }

    // Part 3 (Cánh Đông: X corridor = 1077, runs down along Y)
    return [
      start,
      { x: 685, y: 232 },
      { x: 685, y: 195 },
      { x: 1077, y: 195 },
      { x: 1077, y: targetDoor.y },
      { x: targetDoor.x, y: targetDoor.y },
    ];
  }, [startWaypoint, selectedRoom]);

  // SVG route path
  const routeSvgPath = useMemo(() => {
    if (routeWaypoints.length === 0) return '';
    return routeWaypoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [routeWaypoints]);

  // Route arrows along segments (Matching Image 1)
  const routeArrows: ArrowMarker[] = useMemo(() => {
    const arrows: ArrowMarker[] = [];
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const p1 = routeWaypoints[i];
      const p2 = routeWaypoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 15) continue;

      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Intermediate chevrons
      if (dist > 80) {
        arrows.push({
          x: p1.x + dx * 0.35,
          y: p1.y + dy * 0.35,
          angle,
        });
        arrows.push({
          x: p1.x + dx * 0.7,
          y: p1.y + dy * 0.7,
          angle,
        });
      } else if (dist > 35) {
        arrows.push({
          x: p1.x + dx * 0.5,
          y: p1.y + dy * 0.5,
          angle,
        });
      }

      // End arrow turning into room
      if (i === routeWaypoints.length - 2) {
        arrows.push({
          x: p1.x + dx * 0.88,
          y: p1.y + dy * 0.88,
          angle,
        });
      }
    }
    return arrows;
  }, [routeWaypoints]);

  // Current avatar pin position
  const currentPinPos: Waypoint = useMemo(() => {
    if (routeWaypoints.length < 2) return routeWaypoints[0] || { x: 250, y: 232 };

    let totalLen = 0;
    const segLens: number[] = [];
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const dx = routeWaypoints[i + 1].x - routeWaypoints[i].x;
      const dy = routeWaypoints[i + 1].y - routeWaypoints[i].y;
      const len = Math.hypot(dx, dy);
      segLens.push(len);
      totalLen += len;
    }

    if (totalLen === 0) return routeWaypoints[0];
    const targetDist = simProgress * totalLen;

    let accum = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (accum + segLens[i] >= targetDist) {
        const segDist = targetDist - accum;
        const t = segDist / (segLens[i] || 1);
        return {
          x: routeWaypoints[i].x + (routeWaypoints[i + 1].x - routeWaypoints[i].x) * t,
          y: routeWaypoints[i].y + (routeWaypoints[i + 1].y - routeWaypoints[i].y) * t,
        };
      }
      accum += segLens[i];
    }

    return routeWaypoints[routeWaypoints.length - 1];
  }, [simProgress, routeWaypoints]);

  // Turn-by-turn guidance
  const turnSteps = useMemo(() => {
    const startName =
      startPoint === 'ct1'
        ? 'Cầu Thang 1'
        : startPoint === 'ct2'
        ? 'Cầu Thang 2'
        : 'Cổng Cánh Tây';

    return [
      {
        id: 's1',
        instruction: `Xuất phát từ ${startName}, bước ra hành lang chính`,
        detail: 'Hành lang rộng đón ánh sáng tự nhiên',
        distance: 6,
      },
      {
        id: 's2',
        instruction: `Di chuyển dọc theo hành lang đến ${selectedRoom.sectionName}`,
        detail: `Theo dõi vệt dẫn đường màu Deep Teal có mũi tên định hướng`,
        distance: Math.max(12, Math.round(routeWaypoints.length * 6)),
      },
      {
        id: 's3',
        instruction: `Rẽ qua cửa bước vào ${selectedRoom.name} (${selectedRoom.code})`,
        detail: `Điểm đến nằm ngay trước mắt`,
        distance: 2,
      },
    ];
  }, [startPoint, selectedRoom, routeWaypoints]);

  // Search filter
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(floorData.rooms).filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [searchQuery, floorData]);

  // Pan & Zoom events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleSelectRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setSearchQuery('');
    setSimProgress(0);
    const room = floorData.rooms[roomId];
    if (room && viewMode === 'tabbed') {
      if (room.section === 'part1') setActiveTab('part1');
      else if (room.section === 'part2') setActiveTab('part2');
      else if (room.section === 'part3') setActiveTab('part3');
    }
  }, [floorData, viewMode]);

  // Simulation player
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      setIsPlaying(true);
      let lastTime = performance.now();
      const stepAnim = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setSimProgress((prev) => {
          const next = prev + delta * 0.24;
          if (next >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
        animFrameRef.current = requestAnimationFrame(stepAnim);
      };
      animFrameRef.current = requestAnimationFrame(stepAnim);
    }
  }, [isPlaying]);

  // Quick destinations list
  const quickList = useMemo(() => {
    return Object.values(floorData.rooms);
  }, [floorData]);

  return (
    <div className="relative w-full h-full bg-[#E8E2D9] flex flex-col overflow-hidden select-none font-sans text-slate-800">
      {/* =================================================================== */}
      {/* 1. TOP HEADER & FLOOR SWITCHER                                      */}
      {/* =================================================================== */}
      <header className="shrink-0 z-30 px-3 sm:px-6 py-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        {/* Title & Close */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#4A4540] transition cursor-pointer shrink-0"
              title="Đóng bản đồ Tòa B và quay lại Sa bàn 3D"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[#2C2926] tracking-wide uppercase">
                TÒA B • BẢN ĐỒ DẪN ĐƯỜNG 2D (CS1)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0E434F] text-white">
                {floorData.floorLabel}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#7A736B] truncate">
              Kiến trúc tối giản tông ấm • Chuẩn nhận diện Tòa K • Tỷ lệ chính xác theo bản vẽ gốc
            </p>
          </div>
        </div>

        {/* Floor Switcher (Tầng Trệt / Tầng 1 / Tầng 2 / Tầng 3) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#EAE4DC] border border-[#D8CFC4] text-xs font-bold shrink-0">
          {(['ground', 'floor1', 'floor2', 'floor3'] as BuildingFloor[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setCurrentFloor(f);
                const firstRoom = Object.keys(TOA_B_FLOORS[f].rooms)[0];
                if (firstRoom) setSelectedRoomId(firstRoom);
                setSimProgress(0);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-bold ${
                currentFloor === f
                  ? 'bg-[#0E434F] text-white shadow-xs'
                  : 'text-[#4A4540] hover:text-black'
              }`}
            >
              {TOA_B_FLOORS[f].floorLabel}
            </button>
          ))}
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-[#EAE4DC] border border-[#D8CFC4] text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('unified')}
            className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'unified'
                ? 'bg-[#0E434F] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            Bản đồ Liền mạch
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tabbed')}
            className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'tabbed'
                ? 'bg-[#0E434F] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            3 Tab Phân Đoạn
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#0E434F] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            3 Khung Riêng
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-white rounded-xl border border-[#D8CFC4] p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition cursor-pointer"
              title="Đặt lại góc nhìn"
            >
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. SUB-BAR: Search Box, Start Point, Tab Selector                  */}
      {/* =================================================================== */}
      <div className="shrink-0 z-20 px-3 sm:px-6 py-2 bg-[#FAF7F2]/90 backdrop-blur-xs border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#7A736B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phòng theo số hoặc tên..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#D8CFC4] text-xs text-[#1A1817] placeholder:text-[#9A9188] focus:outline-none focus:ring-2 focus:ring-[#0E434F]/30 focus:border-[#0E434F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {filteredRooms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl shadow-xl border border-[#D8CFC4] z-50 p-1 space-y-1">
                {filteredRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRoom(r.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F3EFEA] flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1A1817]">{r.name}</span>
                      <span className="text-[10px] text-[#7A736B] block">{r.sectionName}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EAE4DC] text-[#4A4540]">
                      {r.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start Point */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#7A736B] font-bold text-[11px] hidden sm:inline">Điểm xuất phát:</span>
            <div className="flex items-center bg-[#EAE4DC] p-0.5 rounded-xl border border-[#D8CFC4]">
              <button
                type="button"
                onClick={() => setStartPoint('ct2')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'ct2' ? 'bg-[#0E434F] text-white' : 'text-[#4A4540] hover:text-black'
                }`}
              >
                Cầu Thang 2
              </button>
              <button
                type="button"
                onClick={() => setStartPoint('ct1')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'ct1' ? 'bg-[#0E434F] text-white' : 'text-[#4A4540] hover:text-black'
                }`}
              >
                Cầu Thang 1
              </button>
              <button
                type="button"
                onClick={() => setStartPoint('gate')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'gate' ? 'bg-[#0E434F] text-white' : 'text-[#4A4540] hover:text-black'
                }`}
              >
                Cổng Tòa B
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selector when in Tabbed Mode */}
        {viewMode === 'tabbed' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('part1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'part1'
                  ? 'bg-[#0E434F] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 1: Cánh Tây (B.2 • CT1 • B.001 - B.003)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('part2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'part2'
                  ? 'bg-[#0E434F] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 2: Cánh Bắc (WC • CT2 • B.004 - B.007)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('part3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'part3'
                  ? 'bg-[#0E434F] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 3: Cánh Đông (CT3 • B.008 - B.011 • CT4)
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN WORKSPACE: SIDEBAR + SVG VIEWPORT                           */}
      {/* =================================================================== */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* ================================================================= */}
        {/* SIDEBAR: CHỌN NHANH ĐIỂM ĐẾN (MATCHING IMAGE 2 EXACTLY)           */}
        {/* ================================================================= */}
        <aside
          className={`shrink-0 z-20 h-full bg-[#FAF7F2]/95 backdrop-blur-md border-r border-[#D8CFC4] flex flex-col transition-all duration-300 shadow-md ${
            isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
        >
          {isSidebarOpen && (
            <div className="p-3 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE4DC] mb-2 px-1">
                <span className="text-[11px] font-black text-[#7C7267] tracking-wider uppercase">
                  CHỌN NHANH ĐIỂM ĐẾN:
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAE4DC] text-[#4A4540]">
                  {quickList.length} phòng
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
                {quickList.map((room) => {
                  const isActive = selectedRoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#0E434F] text-white shadow-md'
                          : 'bg-white text-[#2B2825] border border-[#E8E2D9] hover:bg-[#F7F4EE] shadow-xs'
                      }`}
                    >
                      <span className="text-xs font-bold truncate pr-2">{room.name}</span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg shrink-0 ${
                          isActive
                            ? 'bg-[#185866] text-white'
                            : 'bg-[#EAE5DD] text-[#7A736B]'
                        }`}
                      >
                        {room.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-25 bg-[#FAF7F2] border border-[#D8CFC4] p-1 rounded-r-xl shadow-md text-[#4A4540] hover:text-black hover:bg-[#F3EFEA] cursor-pointer"
          title={isSidebarOpen ? 'Thu gọn danh sách phòng' : 'Mở danh sách phòng'}
          style={{ left: isSidebarOpen ? '256px' : '0px' }}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* ================================================================= */}
        {/* SVG CANVAS VIEWPORT                                               */}
        {/* ================================================================= */}
        <main
          className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-2 sm:p-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="transition-transform duration-75 ease-out will-change-transform flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Hatching Patterns */}
            <svg className="w-0 h-0 absolute">
              <defs>
                <pattern id="stairPatternB" width="30" height="6" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="3" x2="30" y2="3" stroke="#48443F" strokeWidth="2.5" />
                </pattern>
              </defs>
            </svg>

            {/* =============================================================== */}
            {/* MODE 1: BẢN ĐỒ LIỀN MẠCH HÌNH CHỮ L (ĐÚNG 100% TOAB_TONG_THE)   */}
            {/* =============================================================== */}
            {viewMode === 'unified' && (
              <div className="bg-[#282522] p-2 rounded-2xl shadow-2xl">
                <svg
                  viewBox="0 0 1240 820"
                  className="w-[90vw] max-w-[1080px] h-auto bg-[#EDE8DF] block rounded-xl"
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  {/* Nền khuôn viên bao quanh */}
                  <rect x="0" y="0" width="1240" height="820" fill="#EDE8DF" />

                  {/* ======================================================= */}
                  {/* CÁNH TÂY (PHẦN 1: B.2 • THANG 1 • B.001..B.003 • ĐỆM)   */}
                  {/* ======================================================= */}
                  {/* Hành lang Cánh Tây */}
                  <rect x="250" y="215" width="415" height="35" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* Phòng B.2 (hoặc B.101A/B.201A/B.301A) - Phòng lớn bao trọn chiều cao */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(Object.keys(floorData.rooms)[0])}>
                    <rect x="30" y="90" width="220" height="160" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="140" y="160" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="900">
                      {currentFloor === 'ground' ? 'B.2' : currentFloor === 'floor1' ? 'B.101A' : currentFloor === 'floor2' ? 'B.201A' : 'B.301A'}
                    </text>
                    <text x="140" y="185" textAnchor="middle" fill="#1A1817" fontSize="11" fontWeight="800">
                      {currentFloor === 'ground' ? 'TẠP CHÍ KHCN GTVT' : currentFloor === 'floor1' ? 'TT ĐÀO TẠO THƯỜNG XUYÊN' : currentFloor === 'floor2' ? 'PHÒNG CHUYÊN ĐỀ' : 'TT THÔNG TIN - THƯ VIỆN'}
                    </text>
                    {/* Cửa mở ra hành lang */}
                    <path d="M 230 250 A 25 25 0 0 1 250 225" fill="none" stroke={TOA_B_COLORS.doorSwing} strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="230" y1="250" x2="250" y2="250" stroke={TOA_B_COLORS.doorSwing} strokeWidth="1.5" />
                    <rect x="247" y="222" width="6" height="24" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Cầu Thang 1 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_stair_1')}>
                    <rect x="250" y="90" width="60" height="125" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="250" y="125" width="60" height="90" fill="url(#stairPatternB)" />
                    {/* Icon thang zigzag */}
                    <path d="M 260 100 L 268 100 L 268 108 L 276 108 L 276 116 L 284 116 L 284 124" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="280" y="195" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">CT1</text>
                    <rect x="268" y="212" width="24" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Phòng 1 (B.001 / B.101 / B.201 / B.301) */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_001' : currentFloor === 'floor1' ? 'b_101' : currentFloor === 'floor2' ? 'b_201' : 'b_301')}>
                    <rect x="310" y="90" width="85" height="125" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="352" y="160" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.001' : currentFloor === 'floor1' ? 'B.101' : currentFloor === 'floor2' ? 'B.201' : 'B.301'}
                    </text>
                    <path d="M 320 215 A 22 22 0 0 1 342 193" fill="none" stroke={TOA_B_COLORS.doorSwing} strokeWidth="1.5" strokeDasharray="3,3" />
                    <rect x="320" y="212" width="24" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Phòng 2 (B.002 / B.102 / B.202 / B.302) */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_002' : currentFloor === 'floor1' ? 'b_102' : currentFloor === 'floor2' ? 'b_202' : 'b_302')}>
                    <rect x="395" y="90" width="85" height="125" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="437" y="160" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.002' : currentFloor === 'floor1' ? 'B.102' : currentFloor === 'floor2' ? 'B.202' : 'B.302'}
                    </text>
                    <path d="M 405 215 A 22 22 0 0 1 427 193" fill="none" stroke={TOA_B_COLORS.doorSwing} strokeWidth="1.5" strokeDasharray="3,3" />
                    <rect x="405" y="212" width="24" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Phòng 3 (B.003 / B.103 / B.203 / B.303) */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_003' : currentFloor === 'floor1' ? 'b_103' : currentFloor === 'floor2' ? 'b_203' : 'b_303')}>
                    <rect x="480" y="90" width="85" height="125" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="522" y="160" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.003' : currentFloor === 'floor1' ? 'B.103' : currentFloor === 'floor2' ? 'B.203' : 'b_303'}
                    </text>
                    <path d="M 490 215 A 22 22 0 0 1 512 193" fill="none" stroke={TOA_B_COLORS.doorSwing} strokeWidth="1.5" strokeDasharray="3,3" />
                    <rect x="490" y="212" width="24" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Phòng đệm/kỹ thuật dưới WC (khớp 100% toab_tong_the) */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_wc')}>
                    <rect x="565" y="90" width="80" height="125" fill="#DDD5C8" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="605" y="160" textAnchor="middle" fill="#524D47" fontSize="11" fontWeight="700">KỸ THUẬT</text>
                    <rect x="575" y="212" width="24" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* ======================================================= */}
                  {/* CỤM TRUNG TÂM: WC & CẦU THANG 2                         */}
                  {/* ======================================================= */}
                  {/* Khối WC nhô lên trên */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_wc')}>
                    <rect x="565" y="45" width="80" height="45" fill={TOA_B_COLORS.restroomSteel} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="605" y="72" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="900">WC</text>
                  </g>

                  {/* Cầu Thang 2 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_stair_2')}>
                    <rect x="645" y="45" width="55" height="100" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="645" y="80" width="55" height="65" fill="url(#stairPatternB)" />
                    <path d="M 655 55 L 663 55 L 663 63 L 671 63 L 671 71 L 679 71 L 679 79" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="672" y="135" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">CT2</text>
                  </g>

                  {/* Sảnh đệm Cầu Thang 2 */}
                  <rect x="645" y="145" width="55" height="65" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* ======================================================= */}
                  {/* CÁNH BẮC (PHẦN 2: B.004..B.007 MỖI PHÒNG 2 CỬA SƠ ĐỒ GỐC)*/}
                  {/* ======================================================= */}
                  {/* Hành lang Cánh Bắc */}
                  <rect x="695" y="180" width="345" height="30" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* B.004 / B.104 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_004' : currentFloor === 'floor1' ? 'b_104' : currentFloor === 'floor2' ? 'b_204' : 'b_304')}>
                    <rect x="700" y="45" width="80" height="135" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="740" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.004' : currentFloor === 'floor1' ? 'B.104' : currentFloor === 'floor2' ? 'B.204' : 'B.304'}
                    </text>
                    {/* 2 Cửa mở ra hành lang theo đúng sơ đồ */}
                    <rect x="710" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                    <rect x="750" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.005 / B.105 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_005' : currentFloor === 'floor1' ? 'b_105' : currentFloor === 'floor2' ? 'b_205' : 'b_305')}>
                    <rect x="780" y="45" width="80" height="135" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="820" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.005' : currentFloor === 'floor1' ? 'B.105' : currentFloor === 'floor2' ? 'B.205' : 'B.305'}
                    </text>
                    <rect x="790" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                    <rect x="830" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.006 / B.106 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_006' : currentFloor === 'floor1' ? 'b_106' : currentFloor === 'floor2' ? 'b_206' : 'b_306')}>
                    <rect x="860" y="45" width="80" height="135" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="900" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.006' : currentFloor === 'floor1' ? 'B.106' : currentFloor === 'floor2' ? 'B.206' : 'B.306'}
                    </text>
                    <rect x="870" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                    <rect x="910" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.007 / B.107 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_007' : currentFloor === 'floor1' ? 'b_107' : currentFloor === 'floor2' ? 'b_207' : 'b_307')}>
                    <rect x="940" y="45" width="80" height="135" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="980" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.007' : currentFloor === 'floor1' ? 'B.107' : currentFloor === 'floor2' ? 'B.207' : 'B.307'}
                    </text>
                    <rect x="950" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                    <rect x="990" y="177" width="22" height="6" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* ======================================================= */}
                  {/* GÓC ĐÔNG BẮC: PHÒNG GÓC & CẦU THANG 3                   */}
                  {/* ======================================================= */}
                  {/* Phòng Góc */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_corner')}>
                    <rect x="1020" y="45" width="130" height="95" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1085" y="100" textAnchor="middle" fill="#1A1817" fontSize="15" fontWeight="900">B.GÓC</text>
                  </g>

                  {/* Cầu Thang 3 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_stair_3')}>
                    <rect x="1055" y="140" width="95" height="55" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <path d="M 1065 150 L 1073 150 L 1073 158 L 1081 158 L 1081 166 L 1089 166 L 1089 174" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="1105" y="175" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">CT3</text>
                  </g>

                  {/* ======================================================= */}
                  {/* CÁNH ĐÔNG (PHẦN 3: B.008..B.011 CHẠY DỌC TỪ BẮC XUỐNG)  */}
                  {/* ======================================================= */}
                  {/* Hành lang Cánh Đông bên trái dãy phòng */}
                  <rect x="1020" y="180" width="35" height="545" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* B.008 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_008' : currentFloor === 'floor1' ? 'b_108' : currentFloor === 'floor2' ? 'b_208' : 'b_308')}>
                    <rect x="1055" y="195" width="95" height="130" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1102" y="265" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.008' : currentFloor === 'floor1' ? 'B.108' : currentFloor === 'floor2' ? 'B.208' : 'B.308'}
                    </text>
                    <rect x="1052" y="210" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                    <rect x="1052" y="280" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.009 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_009' : currentFloor === 'floor1' ? 'b_109' : currentFloor === 'floor2' ? 'b_209' : 'b_309')}>
                    <rect x="1055" y="325" width="95" height="130" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1102" y="395" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.009' : currentFloor === 'floor1' ? 'B.109' : currentFloor === 'floor2' ? 'B.209' : 'B.309'}
                    </text>
                    <rect x="1052" y="340" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                    <rect x="1052" y="410" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.010 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_010' : currentFloor === 'floor1' ? 'b_110' : currentFloor === 'floor2' ? 'b_210' : 'b_310')}>
                    <rect x="1055" y="455" width="95" height="130" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1102" y="525" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.010' : currentFloor === 'floor1' ? 'B.110' : currentFloor === 'floor2' ? 'B.210' : 'B.310'}
                    </text>
                    <rect x="1052" y="475" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* B.011 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom(currentFloor === 'ground' ? 'b_011' : currentFloor === 'floor1' ? 'b_111' : currentFloor === 'floor2' ? 'b_211' : 'b_311')}>
                    <rect x="1055" y="585" width="95" height="130" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1102" y="655" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.011' : currentFloor === 'floor1' ? 'B.111' : currentFloor === 'floor2' ? 'B.211' : 'B.311'}
                    </text>
                    <rect x="1052" y="605" width="6" height="22" fill={TOA_B_COLORS.doorCut} />
                  </g>

                  {/* Cầu Thang 4 ở góc ngoài đáy */}
                  <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => handleSelectRoom('b_stair_4')}>
                    <rect x="1020" y="725" width="45" height="55" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <path d="M 1028 735 L 1036 735 L 1036 743 L 1044 743 L 1044 751 L 1052 751" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="1042" y="770" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">CT4</text>
                  </g>

                  {/* ======================================================= */}
                  {/* TUYẾN ĐƯỜNG DẪN LỐI DEEP TEAL (EXACT TOA K)              */}
                  {/* ======================================================= */}
                  <path
                    d={routeSvgPath}
                    fill="none"
                    stroke="#0E434F"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Mũi tên chỉ hướng */}
                  {routeArrows.map((ar, idx) => (
                    <polygon
                      key={`route-arrow-${idx}`}
                      points="-7,-4.5 3,0 -7,4.5 -4.5,0"
                      fill="#0E434F"
                      transform={`translate(${ar.x}, ${ar.y}) rotate(${ar.angle})`}
                    />
                  ))}

                  {/* Highlight cửa phòng đích */}
                  <circle
                    cx={selectedRoom.doorCoords.x}
                    cy={selectedRoom.doorCoords.y}
                    r="6.5"
                    fill="#0E434F"
                    className="animate-ping opacity-75"
                  />

                  {/* ======================================================= */}
                  {/* AVATAR PIN GIỌT NƯỚC (EXACT MATCHING IMAGE 1)           */}
                  {/* ======================================================= */}
                  <g
                    transform={`translate(${currentPinPos.x}, ${currentPinPos.y})`}
                    className="transition-transform duration-75 ease-linear pointer-events-none"
                  >
                    <circle cx="0" cy="-14" r="16" fill="#0E434F" opacity="0.2" className="animate-pulse" />
                    <path
                      d="M 0 0 C -9 -8, -12 -13, -12 -18 C -12 -25, -6.6 -30, 0 -30 C 6.6 -30, 12 -25, 12 -18 C 12 -13, 9 -8, 0 0 Z"
                      fill="#0E434F"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="-20" r="3.2" fill="#FFFFFF" />
                    <path
                      d="M -5 -12.5 C -5 -15.5, 5 -15.5, 5 -12.5 L 4.2 -9 L -4.2 -9 Z"
                      fill="#FFFFFF"
                    />
                  </g>
                </svg>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 2: 3 TAB PHÂN ĐOẠN CHI TIẾT                                 */}
            {/* =============================================================== */}
            {viewMode === 'tabbed' && (
              <div className="bg-[#282522] p-2 rounded-2xl shadow-2xl">
                {activeTab === 'part1' && (
                  <svg viewBox="0 0 980 440" className="w-[88vw] max-w-[880px] h-auto bg-[#EDE8DF] block rounded-xl">
                    <rect x="0" y="0" width="980" height="440" fill="#EDE8DF" />
                    <rect x="250" y="280" width="670" height="70" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    {/* B.2 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom(Object.keys(floorData.rooms)[0])}>
                      <rect x="30" y="40" width="220" height="310" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="140" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="900">
                        {currentFloor === 'ground' ? 'B.2' : currentFloor === 'floor1' ? 'B.101A' : currentFloor === 'floor2' ? 'B.201A' : 'B.301A'}
                      </text>
                      <text x="140" y="220" textAnchor="middle" fill="#1A1817" fontSize="12" fontWeight="800">
                        {currentFloor === 'ground' ? 'TẠP CHÍ KHCN GTVT' : currentFloor === 'floor1' ? 'TT ĐÀO TẠO THƯỜNG XUYÊN' : currentFloor === 'floor2' ? 'PHÒNG CHUYÊN ĐỀ' : 'TT THÔNG TIN - THƯ VIỆN'}
                      </text>
                    </g>
                    {/* CT1 */}
                    <rect x="250" y="40" width="100" height="240" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="300" y="240" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">CT1</text>
                    {/* B.001 */}
                    <rect x="350" y="40" width="190" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="445" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.001' : currentFloor === 'floor1' ? 'B.101' : currentFloor === 'floor2' ? 'B.201' : 'B.301'}
                    </text>
                    {/* B.002 */}
                    <rect x="540" y="40" width="190" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="635" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.002' : currentFloor === 'floor1' ? 'B.102' : currentFloor === 'floor2' ? 'B.202' : 'B.302'}
                    </text>
                    {/* B.003 */}
                    <rect x="730" y="40" width="190" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="825" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.003' : currentFloor === 'floor1' ? 'B.103' : currentFloor === 'floor2' ? 'B.203' : 'B.303'}
                    </text>
                  </svg>
                )}

                {activeTab === 'part2' && (
                  <svg viewBox="0 0 1020 440" className="w-[88vw] max-w-[880px] h-auto bg-[#EDE8DF] block rounded-xl">
                    <rect x="0" y="0" width="1020" height="440" fill="#EDE8DF" />
                    <rect x="30" y="280" width="950" height="70" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    {/* CT2 */}
                    <rect x="30" y="40" width="110" height="240" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="85" y="240" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">CT2</text>
                    {/* B.004 */}
                    <rect x="140" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="240" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.004' : currentFloor === 'floor1' ? 'B.104' : currentFloor === 'floor2' ? 'B.204' : 'B.304'}
                    </text>
                    {/* B.005 */}
                    <rect x="340" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="440" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.005' : currentFloor === 'floor1' ? 'B.105' : currentFloor === 'floor2' ? 'B.205' : 'B.305'}
                    </text>
                    {/* B.006 */}
                    <rect x="540" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="640" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.006' : currentFloor === 'floor1' ? 'B.106' : currentFloor === 'floor2' ? 'B.206' : 'B.306'}
                    </text>
                    {/* B.007 */}
                    <rect x="740" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="840" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.007' : currentFloor === 'floor1' ? 'B.107' : currentFloor === 'floor2' ? 'B.207' : 'B.307'}
                    </text>
                  </svg>
                )}

                {activeTab === 'part3' && (
                  <svg viewBox="0 0 1020 440" className="w-[88vw] max-w-[880px] h-auto bg-[#EDE8DF] block rounded-xl">
                    <rect x="0" y="0" width="1020" height="440" fill="#EDE8DF" />
                    <rect x="30" y="280" width="950" height="70" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    {/* CT3 */}
                    <rect x="30" y="40" width="110" height="240" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="85" y="240" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">CT3</text>
                    {/* B.008 */}
                    <rect x="140" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="240" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.008' : currentFloor === 'floor1' ? 'B.108' : currentFloor === 'floor2' ? 'B.208' : 'B.308'}
                    </text>
                    {/* B.009 */}
                    <rect x="340" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="440" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.009' : currentFloor === 'floor1' ? 'B.109' : currentFloor === 'floor2' ? 'B.209' : 'B.309'}
                    </text>
                    {/* B.010 */}
                    <rect x="540" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="640" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.010' : currentFloor === 'floor1' ? 'B.110' : currentFloor === 'floor2' ? 'B.210' : 'B.310'}
                    </text>
                    {/* B.011 */}
                    <rect x="740" y="40" width="200" height="240" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="840" y="160" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.011' : currentFloor === 'floor1' ? 'B.111' : currentFloor === 'floor2' ? 'B.211' : 'B.311'}
                    </text>
                    {/* CT4 */}
                    <rect x="940" y="240" width="40" height="110" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="960" y="300" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">CT4</text>
                  </svg>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 3: 3 KHUNG RIÊNG BIỆT XẾP CHỒNG                              */}
            {/* =============================================================== */}
            {viewMode === 'split' && (
              <div className="flex flex-col gap-3 max-w-[940px] w-[92vw] overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
                {/* Khung 1 */}
                <div className="bg-[#282522] p-2 rounded-xl shadow-md">
                  <div className="text-[11px] font-black text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 1: Cánh Tây ({currentFloor === 'ground' ? 'B.2' : currentFloor === 'floor1' ? 'B.101A' : currentFloor === 'floor2' ? 'B.201A' : 'B.301A'} • CT1 • Phòng 1 - 3)</span>
                    <span className="text-[10px] text-amber-300 font-bold">Khung 1</span>
                  </div>
                  <svg viewBox="0 0 980 360" className="w-full h-auto bg-[#EDE8DF] rounded-lg">
                    <rect x="250" y="240" width="670" height="60" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="30" y="30" width="220" height="270" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="140" y="165" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="900">
                      {currentFloor === 'ground' ? 'B.2' : currentFloor === 'floor1' ? 'B.101A' : currentFloor === 'floor2' ? 'B.201A' : 'B.301A'}
                    </text>
                    <rect x="250" y="30" width="100" height="210" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="300" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">CT1</text>
                    <rect x="350" y="30" width="190" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="445" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.001' : currentFloor === 'floor1' ? 'B.101' : currentFloor === 'floor2' ? 'B.201' : 'B.301'}
                    </text>
                    <rect x="540" y="30" width="190" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="635" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.002' : currentFloor === 'floor1' ? 'B.102' : currentFloor === 'floor2' ? 'B.202' : 'B.302'}
                    </text>
                    <rect x="730" y="30" width="190" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="825" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.003' : currentFloor === 'floor1' ? 'B.103' : currentFloor === 'floor2' ? 'B.203' : 'B.303'}
                    </text>
                  </svg>
                </div>

                {/* Khung 2 */}
                <div className="bg-[#282522] p-2 rounded-xl shadow-md">
                  <div className="text-[11px] font-black text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 2: Cánh Bắc (Cầu Thang 2 • Phòng 4 - 7)</span>
                    <span className="text-[10px] text-amber-300 font-bold">Khung 2</span>
                  </div>
                  <svg viewBox="0 0 1020 360" className="w-full h-auto bg-[#EDE8DF] rounded-lg">
                    <rect x="30" y="240" width="950" height="60" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="30" y="30" width="110" height="210" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="85" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">CT2</text>
                    <rect x="140" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="240" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.004' : currentFloor === 'floor1' ? 'B.104' : currentFloor === 'floor2' ? 'B.204' : 'B.304'}
                    </text>
                    <rect x="340" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="440" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.005' : currentFloor === 'floor1' ? 'B.105' : currentFloor === 'floor2' ? 'B.205' : 'B.305'}
                    </text>
                    <rect x="540" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="640" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.006' : currentFloor === 'floor1' ? 'B.106' : currentFloor === 'floor2' ? 'B.206' : 'B.306'}
                    </text>
                    <rect x="740" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="840" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.007' : currentFloor === 'floor1' ? 'B.107' : currentFloor === 'floor2' ? 'B.207' : 'B.307'}
                    </text>
                  </svg>
                </div>

                {/* Khung 3 */}
                <div className="bg-[#282522] p-2 rounded-xl shadow-md">
                  <div className="text-[11px] font-black text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 3: Cánh Đông (Cầu Thang 3 • Phòng 8 - 11 • Cầu Thang 4)</span>
                    <span className="text-[10px] text-amber-300 font-bold">Khung 3</span>
                  </div>
                  <svg viewBox="0 0 1020 360" className="w-full h-auto bg-[#EDE8DF] rounded-lg">
                    <rect x="30" y="240" width="950" height="60" fill={TOA_B_COLORS.bgCorridor} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="30" y="30" width="110" height="210" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="85" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">CT3</text>
                    <rect x="140" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="240" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.008' : currentFloor === 'floor1' ? 'B.108' : currentFloor === 'floor2' ? 'B.208' : 'B.308'}
                    </text>
                    <rect x="340" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="440" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.009' : currentFloor === 'floor1' ? 'B.109' : currentFloor === 'floor2' ? 'B.209' : 'B.309'}
                    </text>
                    <rect x="540" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="640" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.010' : currentFloor === 'floor1' ? 'B.110' : currentFloor === 'floor2' ? 'B.210' : 'B.310'}
                    </text>
                    <rect x="740" y="30" width="200" height="210" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="840" y="150" textAnchor="middle" fill="#1A1817" fontSize="20" fontWeight="800">
                      {currentFloor === 'ground' ? 'B.011' : currentFloor === 'floor1' ? 'B.111' : currentFloor === 'floor2' ? 'B.211' : 'B.311'}
                    </text>
                    <rect x="940" y="240" width="40" height="60" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="960" y="275" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">CT4</text>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =================================================================== */}
      {/* 4. BOTTOM SHEET CARD: Selected Room Info & Step Guidance            */}
      {/* =================================================================== */}
      <footer className="shrink-0 z-20 bg-[#FAF7F2] border-t border-[#D8CFC4] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          className="w-full py-1.5 flex flex-col items-center justify-center hover:bg-[#F3EFEA] transition cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-[#C8BEB3] mb-1" />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7A736B]">
            <span>
              {isDrawerCollapsed
                ? `Lộ trình: ${startPoint === 'ct2' ? 'Cầu Thang 2' : startPoint === 'ct1' ? 'Cầu Thang 1' : 'Cổng Tòa B'} → ${selectedRoom.name} (${selectedRoom.code})`
                : `Đang xem: ${selectedRoom.name} • ${floorData.floorLabel}`}
            </span>
            {isDrawerCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </div>
        </button>

        {/* Detailed Drawer Body */}
        {!isDrawerCollapsed && (
          <div className="px-4 pb-3 pt-1 max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-[#EAE4DC] shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedRoom.fillColor, color: '#1A1817' }}
                >
                  {selectedRoom.code}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#1A1817] truncate leading-tight">
                    {selectedRoom.name}
                  </h3>
                  <p className="text-[10px] text-[#7A736B] truncate">{selectedRoom.description}</p>
                </div>
              </div>

              {/* Simulation button */}
              <button
                type="button"
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${
                  isPlaying
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#0E434F] text-white hover:bg-[#135d70]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                    <span>Mô phỏng bước đi</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-step turns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
              {turnSteps.map((st, i) => (
                <div key={st.id} className="p-2 rounded-lg bg-white/80 border border-[#EAE4DC] flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0E434F] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#1A1817] leading-tight truncate">{st.instruction}</p>
                    <span className="text-[10px] text-[#7A736B]">~{st.distance} mét</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-footer notes */}
            <div className="flex items-center justify-between text-[10px] text-[#7A736B] pt-1 border-t border-[#EAE4DC]">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#0E434F]" strokeWidth={1.5} />
                <span>Tổng lộ trình: ~24 mét • {floorData.floorLabel} Tòa B (CS1)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId(Object.keys(floorData.rooms)[0]);
                  setSimProgress(0);
                }}
                className="flex items-center gap-1 text-[#0E434F] hover:underline font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                <span>Đặt lại lộ trình</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
