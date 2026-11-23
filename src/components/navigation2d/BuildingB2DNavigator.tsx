'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  TOA_B_COLORS,
  TOA_B_ROOMS,
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
  Compass,
  Layers,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';

export interface BuildingB2DNavigatorProps {
  onClose?: () => void;
}

type ViewMode = 'unified' | 'tabbed' | 'split';
type ActiveTab = 'part1' | 'part2' | 'part3';
type StartPoint = 'gate' | 'ct1' | 'ct2';

interface Waypoint {
  x: number;
  y: number;
}

interface ArrowMarker {
  x: number;
  y: number;
  angle: number;
}

interface QuickDestination {
  id: string;
  code: string;
  name: string;
  category: 'classroom' | 'office' | 'restroom' | 'stairs';
  section: 'part1' | 'part2' | 'part3' | 'transition';
}

const QUICK_DESTINATIONS: QuickDestination[] = [
  { id: 'b_002_mag', code: 'B.2', name: 'Tạp chí KHCN GTVT', category: 'office', section: 'part1' },
  { id: 'b_001', code: 'B.001', name: 'Phòng Học B.001', category: 'classroom', section: 'part1' },
  { id: 'b_002', code: 'B.002', name: 'Phòng Học B.002', category: 'classroom', section: 'part1' },
  { id: 'b_003', code: 'B.003', name: 'Phòng Học B.003', category: 'classroom', section: 'part1' },
  { id: 'b_wc', code: 'WC', name: 'Khu Vệ Sinh (WC)', category: 'restroom', section: 'transition' },
  { id: 'b_104', code: 'B.104', name: 'Phòng Học B.104', category: 'classroom', section: 'part2' },
  { id: 'b_105', code: 'B.105', name: 'Phòng Học B.105', category: 'classroom', section: 'part2' },
  { id: 'b_106', code: 'B.106', name: 'Phòng Học B.106', category: 'classroom', section: 'part2' },
  { id: 'b_107', code: 'B.107', name: 'Phòng Học B.107', category: 'classroom', section: 'part2' },
  { id: 'b_008', code: 'B.008', name: 'Phòng Học B.008', category: 'classroom', section: 'part3' },
  { id: 'b_009', code: 'B.009', name: 'Phòng Học B.009', category: 'classroom', section: 'part3' },
  { id: 'b_010', code: 'B.010', name: 'Phòng Học B.010', category: 'classroom', section: 'part3' },
  { id: 'b_011', code: 'B.011', name: 'Phòng Học B.011', category: 'classroom', section: 'part3' },
  { id: 'b_stair_1', code: 'CT1', name: 'Cầu Thang 1', category: 'stairs', section: 'part1' },
  { id: 'b_stair_2', code: 'CT2', name: 'Cầu Thang 2', category: 'stairs', section: 'part2' },
  { id: 'b_stair_3', code: 'CT3', name: 'Cầu Thang 3', category: 'stairs', section: 'part3' },
  { id: 'b_stair_4', code: 'CT4', name: 'Cầu Thang 4', category: 'stairs', section: 'part3' },
];

export function BuildingB2DNavigator({ onClose }: BuildingB2DNavigatorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [activeTab, setActiveTab] = useState<ActiveTab>('part1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('b_001');
  const [startPoint, setStartPoint] = useState<StartPoint>('ct2');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);
  const [showQuickPanel, setShowQuickPanel] = useState<boolean>(true);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.5); // 0 to 1
  const animFrameRef = useRef<number | null>(null);

  // Selected room details
  const selectedRoom: RoomBInfo = useMemo(() => {
    return TOA_B_ROOMS[selectedRoomId] || TOA_B_ROOMS.b_001;
  }, [selectedRoomId]);

  // Compute Start Waypoint
  const startWaypoint: Waypoint = useMemo(() => {
    if (startPoint === 'ct1') return { x: 275, y: 230 };
    if (startPoint === 'ct2') return { x: 607, y: 200 };
    return { x: 230, y: 230 }; // Cổng chính Tây
  }, [startPoint]);

  // Compute Dynamic Navigation Route in Unified View (L-Shape)
  const routeWaypoints: Waypoint[] = useMemo(() => {
    const start = startWaypoint;
    const targetDoor = selectedRoom.doorCoords;

    if (selectedRoom.id === 'b_002_mag') {
      return [start, { x: 230, y: 230 }, { x: 230, y: 240 }];
    }
    if (selectedRoom.id === 'b_stair_1') {
      return [start, { x: 275, y: 230 }, { x: 275, y: 190 }];
    }
    if (selectedRoom.id === 'b_001') {
      return [start, { x: 357, y: 230 }, { x: 357, y: 190 }];
    }
    if (selectedRoom.id === 'b_002') {
      return [start, { x: 452, y: 230 }, { x: 452, y: 190 }];
    }
    if (selectedRoom.id === 'b_003') {
      return [start, { x: 547, y: 230 }, { x: 547, y: 190 }];
    }
    if (selectedRoom.id === 'b_wc') {
      return [start, { x: 535, y: 200 }, { x: 535, y: 40 }];
    }
    if (selectedRoom.id === 'b_stair_2') {
      return [start, { x: 607, y: 200 }, { x: 607, y: 110 }];
    }
    if (selectedRoom.id === 'b_104') {
      return [start, { x: 680, y: 200 }, { x: 680, y: 180 }];
    }
    if (selectedRoom.id === 'b_105') {
      return [start, { x: 770, y: 200 }, { x: 770, y: 180 }];
    }
    if (selectedRoom.id === 'b_106') {
      return [start, { x: 860, y: 200 }, { x: 860, y: 180 }];
    }
    if (selectedRoom.id === 'b_107') {
      return [start, { x: 950, y: 200 }, { x: 950, y: 180 }];
    }
    if (selectedRoom.id === 'b_corner') {
      return [start, { x: 1047, y: 200 }, { x: 1047, y: 180 }];
    }
    if (selectedRoom.id === 'b_stair_3') {
      return [start, { x: 1005, y: 200 }, { x: 1035, y: 210 }];
    }
    if (selectedRoom.id === 'b_008') {
      return [start, { x: 1005, y: 200 }, { x: 1005, y: 295 }, { x: 1035, y: 295 }];
    }
    if (selectedRoom.id === 'b_009') {
      return [start, { x: 1005, y: 200 }, { x: 1005, y: 405 }, { x: 1035, y: 405 }];
    }
    if (selectedRoom.id === 'b_010') {
      return [start, { x: 1005, y: 200 }, { x: 1005, y: 515 }, { x: 1035, y: 515 }];
    }
    if (selectedRoom.id === 'b_011') {
      return [start, { x: 1005, y: 200 }, { x: 1005, y: 625 }, { x: 1035, y: 625 }];
    }
    if (selectedRoom.id === 'b_stair_4') {
      return [start, { x: 1005, y: 200 }, { x: 1005, y: 705 }];
    }

    // Default fallback
    return [start, { x: targetDoor.x, y: 230 }, { x: targetDoor.x, y: targetDoor.y }];
  }, [startWaypoint, selectedRoom]);

  // SVG path string for route
  const routeSvgPath = useMemo(() => {
    if (routeWaypoints.length === 0) return '';
    return routeWaypoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [routeWaypoints]);

  // Compute Direction Arrows along Segments (Matching Image 1)
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

      // Intermediate chevrons on longer segments
      if (dist > 90) {
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
      } else if (dist > 40) {
        arrows.push({
          x: p1.x + dx * 0.5,
          y: p1.y + dy * 0.5,
          angle,
        });
      }

      // Final arrow near turning point into door
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

  // Dynamic Avatar Pin Position based on simProgress
  const currentPinPos: Waypoint = useMemo(() => {
    if (routeWaypoints.length < 2) return routeWaypoints[0] || { x: 230, y: 230 };

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

  // Turn-by-turn steps description
  const turnSteps = useMemo(() => {
    const startName =
      startPoint === 'ct1'
        ? 'Cầu Thang 1'
        : startPoint === 'ct2'
        ? 'Cầu Thang 2'
        : 'Cổng Tòa B (Cánh Tây)';

    return [
      {
        id: 's1',
        instruction: `Từ ${startName}, bước ra sảnh hành lang chính`,
        detail: 'Lối đi lát gạch sáng, thông thoáng hướng về trục giao thông',
        distance: 6,
      },
      {
        id: 's2',
        instruction: `Di chuyển dọc theo hành lang đến ${selectedRoom.sectionName}`,
        detail: `Theo dõi vệt dẫn đường màu Deep Teal có mũi tên chỉ dẫn`,
        distance: Math.max(12, Math.round(routeWaypoints.length * 6)),
      },
      {
        id: 's3',
        instruction: `Rẽ qua cửa để bước vào ${selectedRoom.name}`,
        detail: `Điểm đến (${selectedRoom.code}) nằm ngay trước mặt`,
        distance: 2,
      },
    ];
  }, [startPoint, selectedRoom, routeWaypoints]);

  // Filtered rooms for live search
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(TOA_B_ROOMS).filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Drag handlers
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
    const room = TOA_B_ROOMS[roomId];
    if (room && viewMode === 'tabbed') {
      if (room.section === 'part1') setActiveTab('part1');
      else if (room.section === 'part2') setActiveTab('part2');
      else if (room.section === 'part3') setActiveTab('part3');
    }
  }, [viewMode]);

  // Simulation player loop
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
          const next = prev + delta * 0.22; // ~4.5 seconds per run
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

  return (
    <div className="relative w-full h-full bg-[#E8E2D9] flex flex-col overflow-hidden select-none font-sans text-slate-800">
      {/* =================================================================== */}
      {/* 1. TOP HEADER & NAVIGATION BAR                                      */}
      {/* =================================================================== */}
      <header className="shrink-0 z-30 px-3 sm:px-6 py-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        {/* Title & Close */}
        <div className="flex items-center gap-2 min-w-0">
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
              <span className="text-xs sm:text-sm font-black text-[#4A4540] tracking-wide uppercase">
                Tòa B • Tầng Trệt (CS1)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F4C5C] text-white">
                Bản vẽ kiến trúc 2D
              </span>
            </div>
            <p className="text-[11px] text-[#7A736B] truncate hidden sm:block">
              Hệ thống dẫn đường tối giản tông ấm • Đồng bộ 100% chuẩn nhận diện Tòa K
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills (Bản đồ Liền mạch / 3 Tab / 3 Khung) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#EAE4DC] border border-[#D8CFC4] text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('unified')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'unified'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            <span>Bản đồ Liền mạch</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tabbed')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'tabbed'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            <span>3 Tab Phân Đoạn</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-[#4A4540] hover:text-black'
            }`}
          >
            <span>3 Khung Riêng</span>
          </button>
        </div>

        {/* Right Tools: Toggle Quick Panel, Zoom, Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowQuickPanel(!showQuickPanel)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
              showQuickPanel
                ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                : 'bg-white text-[#4A4540] border-[#D8CFC4] hover:bg-[#F3EFEA]'
            }`}
            title="Bật/Tắt bảng chọn nhanh điểm đến"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Điểm đến</span>
          </button>

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
      {/* 2. SUB-BAR: Search Box, Start Point Selector & Tab Selector        */}
      {/* =================================================================== */}
      <div className="shrink-0 z-20 px-3 sm:px-6 py-2 bg-[#FAF7F2]/90 backdrop-blur-xs border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#7A736B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phòng: B.2, B.001, B.104, WC..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#D8CFC4] text-xs text-[#1A1817] placeholder:text-[#9A9188] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30 focus:border-[#0F4C5C]"
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

            {/* Search Dropdown Results */}
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

          {/* Start Point Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#7A736B] font-bold text-[11px] hidden sm:inline">Xuất phát từ:</span>
            <div className="flex items-center bg-[#EAE4DC] p-0.5 rounded-xl border border-[#D8CFC4]">
              <button
                type="button"
                onClick={() => setStartPoint('ct2')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'ct2' ? 'bg-[#0F4C5C] text-white' : 'text-[#4A4540] hover:text-black'
                }`}
              >
                Cầu Thang 2
              </button>
              <button
                type="button"
                onClick={() => setStartPoint('ct1')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'ct1' ? 'bg-[#0F4C5C] text-white' : 'text-[#4A4540] hover:text-black'
                }`}
              >
                Cầu Thang 1
              </button>
              <button
                type="button"
                onClick={() => setStartPoint('gate')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  startPoint === 'gate' ? 'bg-[#0F4C5C] text-white' : 'text-[#4A4540] hover:text-black'
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
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 1: B.2 • CT1 • B.001 - B.003
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('part2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'part2'
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 2: CT2 • B.104 - B.107
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('part3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'part3'
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'bg-white text-[#4A4540] border border-[#D8CFC4] hover:bg-[#F3EFEA]'
              }`}
            >
              Phần 3: CT3 • B.008 - B.011 • CT4
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN WORKSPACE: FLOATING QUICK SELECTOR + CANVAS VIEWPORT        */}
      {/* =================================================================== */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* ================================================================= */}
        {/* FLOATING QUICK DESTINATION SELECTOR (MATCHING IMAGE 2 EXACTLY)    */}
        {/* ================================================================= */}
        {showQuickPanel && (
          <aside className="absolute left-3 top-3 z-20 flex flex-col gap-2 w-64 max-h-[calc(100vh-230px)] bg-[#FAF7F2]/95 backdrop-blur-md p-3 rounded-2xl border border-[#D8CFC4] shadow-xl overflow-hidden transition-all duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold text-[#7A736B] tracking-wider uppercase">
                CHỌN NHANH ĐIỂM ĐẾN:
              </span>
              <button
                type="button"
                onClick={() => setShowQuickPanel(false)}
                className="text-[#7A736B] hover:text-black p-0.5 rounded-md hover:bg-[#EAE4DC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-0.5">
              {QUICK_DESTINATIONS.map((dest) => {
                const isActive = selectedRoomId === dest.id;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleSelectRoom(dest.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#0F4C5C] text-white shadow-md'
                        : 'bg-white text-[#2D2823] border border-[#E8E2D9] hover:bg-[#F7F4EE] shadow-xs'
                    }`}
                  >
                    <span className="text-xs font-bold truncate pr-2">{dest.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-[#1D687A] text-white'
                          : 'bg-[#EAE4DC] text-[#7A736B]'
                      }`}
                    >
                      {dest.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

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
            {/* SVG Hatching Patterns & Markers */}
            <svg className="w-0 h-0 absolute">
              <defs>
                <pattern id="stairPatternB" width="6" height="30" patternUnits="userSpaceOnUse">
                  <line x1="3" y1="0" x2="3" y2="30" stroke="#48443F" strokeWidth="2.5" />
                </pattern>
                <pattern id="stairPatternH" width="30" height="6" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="3" x2="30" y2="3" stroke="#48443F" strokeWidth="2.5" />
                </pattern>
              </defs>
            </svg>

            {/* =============================================================== */}
            {/* MODE 1: BẢN ĐỒ LIỀN MẠCH HÌNH CHỮ L (UNIFIED L-SHAPE MASTERPLAN)*/}
            {/* =============================================================== */}
            {viewMode === 'unified' && (
              <div className="bg-[#4A4540] p-1.5 sm:p-2 rounded-xl shadow-2xl">
                <svg
                  viewBox="0 0 1120 780"
                  className="w-[92vw] max-w-[980px] h-auto bg-[#F3EFEA] block"
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  {/* Nền Hành lang */}
                  <rect x="0" y="0" width="1120" height="780" fill="#F3EFEA" />

                  {/* --- KHỐI PHẦN 1 (CÁNH TÂY) --- */}
                  {/* B.2 Tạp chí KHCN GTVT */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_002_mag')}>
                    <rect x="20" y="40" width="220" height="200" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="130" y="125" textAnchor="middle" fill="#1A1817" fontSize="18" fontWeight="800">B.2</text>
                    <text x="130" y="148" textAnchor="middle" fill="#1A1817" fontSize="11" fontWeight="700">TẠP CHÍ KHOA HỌC CÔNG NGHỆ</text>
                    <text x="130" y="165" textAnchor="middle" fill="#1A1817" fontSize="11" fontWeight="700">GIAO THÔNG VẬN TẢI</text>
                    {/* Cung cửa mở quay */}
                    <path d="M 215 240 A 25 25 0 0 1 240 215" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="215" y1="240" x2="240" y2="240" stroke="#7A736B" strokeWidth="1.5" />
                  </g>

                  {/* Cầu thang 1 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_stair_1')}>
                    <rect x="240" y="40" width="70" height="150" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="240" y="80" width="70" height="110" fill="url(#stairPatternH)" />
                    {/* Stepped zigzag line */}
                    <path d="M 250 50 L 258 50 L 258 58 L 266 58 L 266 66 L 274 66 L 274 74" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="275" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">Cầu Thang 1</text>
                    <path d="M 245 190 A 20 20 0 0 1 265 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                  </g>

                  {/* B.001 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_001')}>
                    <rect x="310" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="357" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.001</text>
                    <path d="M 310 190 A 20 20 0 0 1 330 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                  </g>

                  {/* B.002 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_002')}>
                    <rect x="405" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="452" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.002</text>
                    <path d="M 405 190 A 20 20 0 0 1 425 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                  </g>

                  {/* B.003 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_003')}>
                    <rect x="500" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="547" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.003</text>
                    <path d="M 500 190 A 20 20 0 0 1 520 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                  </g>

                  {/* Tường bao hành lang Phần 1 */}
                  <line x1="240" y1="240" x2="595" y2="240" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <line x1="20" y1="240" x2="240" y2="240" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" strokeDasharray="40,25" />

                  {/* --- KHU VỰC TRUNG TÂM: WC & CẦU THANG 2 --- */}
                  {/* WC (Xanh xám thép với biểu tượng Nam / Nữ y hệt Ảnh 1) */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_wc')}>
                    <rect x="490" y="5" width="90" height="35" fill={TOA_B_COLORS.restroomSteel} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3" />
                    {/* Nam icon */}
                    <circle cx="505" cy="16" r="2.5" fill="#FFFFFF" />
                    <path d="M 502 20 L 508 20 L 507 28 L 505 28 L 505 32 L 504 32 L 503 28 L 502 28 Z" fill="#FFFFFF" />
                    <text x="522" y="26" textAnchor="middle" fill="#1A1817" fontSize="9" fontWeight="800">WC Nam</text>
                    {/* Nữ icon */}
                    <circle cx="548" cy="16" r="2.5" fill="#FFFFFF" />
                    <path d="M 545 20 L 551 20 L 553 27 L 550 27 L 550 32 L 549 32 L 548 32 L 548 27 L 544 27 Z" fill="#FFFFFF" />
                    <text x="566" y="26" textAnchor="middle" fill="#1A1817" fontSize="9" fontWeight="800">WC Nữ</text>
                  </g>

                  {/* Cầu thang 2 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_stair_2')}>
                    <rect x="580" y="10" width="55" height="100" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <rect x="580" y="40" width="55" height="70" fill="url(#stairPatternH)" />
                    <path d="M 588 20 L 596 20 L 596 28 L 604 28 L 604 36 L 612 36" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="607" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">Cầu Thang 2</text>
                  </g>
                  <rect x="580" y="110" width="55" height="70" fill="#EAE4DC" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3" />

                  {/* --- KHỐI PHẦN 2 (CÁNH BẮC) --- */}
                  {/* B.104 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_104')}>
                    <rect x="635" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="680" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.104</text>
                    <rect x="645" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                    <rect x="695" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.105 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_105')}>
                    <rect x="725" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="770" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.105</text>
                    <rect x="735" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                    <rect x="785" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.106 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_106')}>
                    <rect x="815" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="860" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.106</text>
                    <rect x="850" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.107 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_107')}>
                    <rect x="905" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="950" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">Phòng B.107</text>
                    <rect x="920" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* Hành lang Phần 2 */}
                  <line x1="635" y1="210" x2="995" y2="210" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* --- PHÒNG GÓC (CORNER) --- */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_corner')}>
                    <rect x="995" y="40" width="105" height="140" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1047" y="120" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="800">B.GÓC</text>
                  </g>

                  {/* --- KHỐI PHẦN 3 (CÁNH ĐÔNG CHẠY XUỐNG PHÍA NAM) --- */}
                  {/* Cầu thang 3 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_stair_3')}>
                    <rect x="1035" y="180" width="65" height="60" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <path d="M 1045 190 L 1053 190 L 1053 198 L 1061 198 L 1061 206 L 1069 206" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="1067" y="228" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">Cầu Thang 3</text>
                  </g>

                  {/* B.008 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_008')}>
                    <rect x="1035" y="240" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1067" y="300" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">Phòng B.008</text>
                    <rect x="1032" y="255" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.009 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_009')}>
                    <rect x="1035" y="350" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1067" y="410" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">Phòng B.009</text>
                    <rect x="1032" y="365" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.010 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_010')}>
                    <rect x="1035" y="460" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1067" y="520" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">Phòng B.010</text>
                    <rect x="1032" y="475" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* B.011 */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_011')}>
                    <rect x="1035" y="570" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <text x="1067" y="630" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">Phòng B.011</text>
                    <rect x="1032" y="585" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  </g>

                  {/* Hành lang dọc Phần 3 */}
                  <line x1="995" y1="180" x2="995" y2="680" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                  {/* Cầu thang 4 ở góc đáy */}
                  <g className="cursor-pointer transition-opacity hover:opacity-95" onClick={() => handleSelectRoom('b_stair_4')}>
                    <rect x="995" y="680" width="45" height="55" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                    <path d="M 1003 690 L 1011 690 L 1011 698 L 1019 698 L 1019 706 L 1027 706" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="1017" y="725" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">Cầu Thang 4</text>
                  </g>

                  {/* ========================================================= */}
                  {/* TUYẾN DẪN ĐƯỜNG ĐỘNG (WAYFINDING ROUTE - EXACT TOA K)     */}
                  {/* ========================================================= */}
                  {/* Đường line Deep Teal nét liền */}
                  <path
                    d={routeSvgPath}
                    fill="none"
                    stroke="#0F4C5C"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Các mũi tên chỉ hướng (Direction Arrows matching Image 1) */}
                  {routeArrows.map((ar, idx) => (
                    <polygon
                      key={`route-arrow-${idx}`}
                      points="-7,-4.5 3,0 -7,4.5 -4.5,0"
                      fill="#0F4C5C"
                      transform={`translate(${ar.x}, ${ar.y}) rotate(${ar.angle})`}
                    />
                  ))}

                  {/* Highlight cửa phòng đích */}
                  <circle
                    cx={selectedRoom.doorCoords.x}
                    cy={selectedRoom.doorCoords.y}
                    r="6"
                    fill="#0F4C5C"
                    className="animate-ping opacity-75"
                  />

                  {/* ========================================================= */}
                  {/* AVATAR TEARDROP LOCATION PIN (EXACT MATCHING IMAGE 1)     */}
                  {/* ========================================================= */}
                  <g
                    transform={`translate(${currentPinPos.x}, ${currentPinPos.y})`}
                    className="transition-transform duration-75 ease-linear pointer-events-none"
                  >
                    {/* Hào quang nhịp đập */}
                    <circle cx="0" cy="-14" r="16" fill="#0F4C5C" opacity="0.18" className="animate-pulse" />

                    {/* Vỏ giọt nước Deep Teal viền trắng */}
                    <path
                      d="M 0 0 C -9 -8, -12 -13, -12 -18 C -12 -25, -6.6 -30, 0 -30 C 6.6 -30, 12 -25, 12 -18 C 12 -13, 9 -8, 0 0 Z"
                      fill="#0F4C5C"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    {/* Hình người màu trắng (Person pictogram) */}
                    <circle cx="0" cy="-20" r="3" fill="#FFFFFF" />
                    <path
                      d="M -5 -12.5 C -5 -15.5, 5 -15.5, 5 -12.5 L 4.2 -9 L -4.2 -9 Z"
                      fill="#FFFFFF"
                    />
                  </g>
                </svg>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 2: 3 TAB PHÂN ĐOẠN CHI TIẾT (TABBED VIEW)                   */}
            {/* =============================================================== */}
            {viewMode === 'tabbed' && (
              <div className="bg-[#4A4540] p-1.5 sm:p-2 rounded-xl shadow-2xl">
                {activeTab === 'part1' && (
                  <svg viewBox="0 0 960 480" className="w-[88vw] max-w-[860px] h-auto bg-[#F3EFEA] block" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <rect x="0" y="0" width="960" height="480" fill="#F3EFEA" />
                    {/* B.2 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_002_mag')}>
                      <rect x="20" y="40" width="360" height="380" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="200" y="210" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="800">B.2</text>
                      <text x="200" y="240" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">TẠP CHÍ KHOA HỌC CÔNG NGHỆ</text>
                      <text x="200" y="260" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">GIAO THÔNG VẬN TẢI</text>
                      <path d="M 350 420 A 30 30 0 0 1 380 390" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="4,4" />
                      <line x1="350" y1="420" x2="380" y2="420" stroke="#7A736B" strokeWidth="2" />
                    </g>
                    {/* Cầu thang 1 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_1')}>
                      <rect x="380" y="40" width="100" height="280" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <rect x="380" y="120" width="100" height="200" fill="url(#stairPatternH)" />
                      <path d="M 395 60 L 410 60 L 410 75 L 425 75 L 425 90 L 440 90 L 440 105 L 455 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="430" y="300" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 1</text>
                      <path d="M 390 320 A 25 25 0 0 1 415 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                    </g>
                    {/* B.001 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_001')}>
                      <rect x="480" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="555" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.001</text>
                      <path d="M 485 320 A 25 25 0 0 1 510 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                    </g>
                    {/* B.002 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_002')}>
                      <rect x="630" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="705" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.002</text>
                      <path d="M 635 320 A 25 25 0 0 1 660 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                    </g>
                    {/* B.003 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_003')}>
                      <rect x="780" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="855" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.003</text>
                      <path d="M 785 320 A 25 25 0 0 1 810 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                    </g>
                    {/* Hành lang dưới */}
                    <line x1="380" y1="420" x2="930" y2="420" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <line x1="930" y1="40" x2="930" y2="420" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  </svg>
                )}

                {activeTab === 'part2' && (
                  <svg viewBox="0 0 1000 480" className="w-[88vw] max-w-[860px] h-auto bg-[#F3EFEA] block" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <rect x="0" y="0" width="1000" height="480" fill="#F3EFEA" />
                    {/* Cầu thang 2 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_2')}>
                      <rect x="20" y="40" width="120" height="240" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <rect x="20" y="100" width="120" height="180" fill="url(#stairPatternH)" />
                      <path d="M 35 60 L 50 60 L 50 75 L 65 75 L 65 90 L 80 90 L 80 105 L 95 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="80" y="260" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 2</text>
                    </g>
                    <rect x="20" y="280" width="120" height="160" fill="#EAE4DC" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    {/* B.104 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_104')}>
                      <rect x="140" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="245" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.104</text>
                      <rect x="160" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                      <rect x="260" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.105 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_105')}>
                      <rect x="350" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="455" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.105</text>
                      <rect x="370" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                      <rect x="470" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.106 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_106')}>
                      <rect x="560" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="665" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.106</text>
                      <rect x="580" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.107 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_107')}>
                      <rect x="770" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="875" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.107</text>
                      <rect x="790" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* Hành lang dưới */}
                    <line x1="140" y1="440" x2="980" y2="440" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <line x1="980" y1="40" x2="980" y2="440" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  </svg>
                )}

                {activeTab === 'part3' && (
                  <svg viewBox="0 0 1000 480" className="w-[88vw] max-w-[860px] h-auto bg-[#F3EFEA] block" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <rect x="0" y="0" width="1000" height="480" fill="#F3EFEA" />
                    {/* Cầu thang 3 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_3')}>
                      <rect x="20" y="40" width="110" height="280" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <rect x="20" y="100" width="110" height="220" fill="url(#stairPatternH)" />
                      <path d="M 35 60 L 50 60 L 50 75 L 65 75 L 65 90 L 80 90 L 80 105 L 95 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="75" y="300" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 3</text>
                    </g>
                    {/* B.008 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_008')}>
                      <rect x="130" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="230" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.008</text>
                      <rect x="145" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                      <rect x="245" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.009 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_009')}>
                      <rect x="330" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="430" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.009</text>
                      <rect x="345" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                      <rect x="445" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.010 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_010')}>
                      <rect x="530" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="630" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.010</text>
                      <rect x="545" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* B.011 */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_011')}>
                      <rect x="730" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <text x="830" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng B.011</text>
                      <rect x="745" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    </g>
                    {/* Hành lang dưới */}
                    <line x1="20" y1="440" x2="930" y2="440" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    {/* Cầu thang 4 ở góc đáy */}
                    <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_4')}>
                      <rect x="930" y="320" width="90" height="120" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                      <path d="M 945 340 L 955 340 L 955 350 L 965 350 L 965 360 L 975 360 L 975 370 L 985 370" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="975" y="415" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">Cầu Thang 4</text>
                    </g>
                  </svg>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODE 3: 3 KHUNG RIÊNG BIỆT XẾP CHỒNG (SPLIT / MULTI-FRAME VIEW) */}
            {/* =============================================================== */}
            {viewMode === 'split' && (
              <div className="flex flex-col gap-3 max-w-[920px] w-[92vw] overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
                {/* Khung 1 */}
                <div className="bg-[#4A4540] p-1.5 rounded-xl shadow-md">
                  <div className="text-[11px] font-bold text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 1: Cánh Tây (B.2 • Cầu Thang 1 • B.001 - B.003)</span>
                    <span className="text-[10px] text-amber-300">Khung 1</span>
                  </div>
                  <svg viewBox="0 0 960 460" className="w-full h-auto bg-[#F3EFEA] rounded-lg">
                    <rect x="20" y="30" width="360" height="380" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="200" y="220" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="800">B.2</text>
                    <text x="200" y="250" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="700">TẠP CHÍ KHCN GTVT</text>
                    <rect x="380" y="30" width="100" height="280" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="430" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 1</text>
                    <rect x="480" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="555" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.001</text>
                    <rect x="630" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="705" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.002</text>
                    <rect x="780" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="855" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học B.003</text>
                    <line x1="380" y1="410" x2="930" y2="410" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  </svg>
                </div>

                {/* Khung 2 */}
                <div className="bg-[#4A4540] p-1.5 rounded-xl shadow-md">
                  <div className="text-[11px] font-bold text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 2: Cánh Bắc (Cầu Thang 2 • B.104 - B.107)</span>
                    <span className="text-[10px] text-amber-300">Khung 2</span>
                  </div>
                  <svg viewBox="0 0 1000 460" className="w-full h-auto bg-[#F3EFEA] rounded-lg">
                    <rect x="20" y="30" width="120" height="240" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="80" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 2</text>
                    <rect x="140" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="245" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.104</text>
                    <rect x="350" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="455" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.105</text>
                    <rect x="560" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="665" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.106</text>
                    <rect x="770" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="875" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.107</text>
                    <line x1="140" y1="420" x2="980" y2="420" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  </svg>
                </div>

                {/* Khung 3 */}
                <div className="bg-[#4A4540] p-1.5 rounded-xl shadow-md">
                  <div className="text-[11px] font-bold text-white px-2 py-0.5 mb-1 flex items-center justify-between">
                    <span>Phần 3: Cánh Đông (Cầu Thang 3 • B.008 - B.011 • Cầu Thang 4)</span>
                    <span className="text-[10px] text-amber-300">Khung 3</span>
                  </div>
                  <svg viewBox="0 0 1000 460" className="w-full h-auto bg-[#F3EFEA] rounded-lg">
                    <rect x="20" y="30" width="110" height="280" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="75" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 3</text>
                    <rect x="130" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="230" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.008</text>
                    <rect x="330" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="430" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.009</text>
                    <rect x="530" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="630" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.010</text>
                    <rect x="730" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="830" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">Phòng Học B.011</text>
                    <rect x="930" y="310" width="90" height="110" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="975" y="370" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">Cầu Thang 4</text>
                    <line x1="20" y1="420" x2="930" y2="420" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
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
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#7A736B]">
            <span>
              {isDrawerCollapsed
                ? `Lộ trình: ${startPoint === 'ct2' ? 'Cầu Thang 2' : startPoint === 'ct1' ? 'Cầu Thang 1' : 'Cổng Tòa B'} → ${selectedRoom.name} (${selectedRoom.code})`
                : `Đang xem: ${selectedRoom.name} • ${selectedRoom.sectionName}`}
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
            {/* Room Info Header */}
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
                    : 'bg-[#0F4C5C] text-white hover:bg-[#135d70]'
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
                  <span className="w-4 h-4 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
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
                <Footprints className="w-3.5 h-3.5 text-[#0F4C5C]" strokeWidth={1.5} />
                <span>Tổng lộ trình: ~24 mét • Tầng trệt Tòa B (CS1)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId('b_001');
                  setSimProgress(0);
                }}
                className="flex items-center gap-1 text-[#0F4C5C] hover:underline font-bold cursor-pointer"
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
