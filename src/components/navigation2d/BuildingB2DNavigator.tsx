'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  BuildingFloor,
  BuildingPart,
  RoomCategory,
  RoomBInfo,
  TOA_B_COLORS,
  TOA_B_ROOMS,
  PART_INFO,
  FLOOR_INFO,
  PART_IMAGE_MAP,
  MASTER_FLOOR_IMAGE,
  searchRooms,
} from '@/data/buildingB2dData';
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Play,
  Pause,
  Footprints,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Compass,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface BuildingB2DNavigatorProps {
  onClose?: () => void;
  initialRoomCode?: string;
}

type ViewMode = 'vector' | 'image';
type ActivePartSelection = BuildingPart | 'master';
type StartPointOption = 'nearest_stairs' | 'ground_gate';

interface Point {
  x: number;
  y: number;
}

interface SegmentArrow {
  x: number;
  y: number;
  angle: number;
}

export function BuildingB2DNavigator({
  onClose,
  initialRoomCode = 'B.301',
}: BuildingB2DNavigatorProps) {
  // Find initial room
  const initialRoom = useMemo(() => {
    const found = Object.values(TOA_B_ROOMS).find(
      (r) => r.code.toLowerCase() === initialRoomCode.toLowerCase()
    );
    return found || TOA_B_ROOMS['b_301'];
  }, [initialRoomCode]);

  // Main state
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoom.id);
  const [currentFloor, setCurrentFloor] = useState<BuildingFloor>(initialRoom.floor);
  const [activePart, setActivePart] = useState<ActivePartSelection>(initialRoom.part);
  const [viewMode, setViewMode] = useState<ViewMode>('vector');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<StartPointOption>('nearest_stairs');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RoomCategory>('all');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });

  // Route animation simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(1); // 0 (start) to 1 (at destination door)
  const animFrameRef = useRef<number | null>(null);

  // Get currently selected room
  const selectedRoom: RoomBInfo = useMemo(() => {
    return TOA_B_ROOMS[selectedRoomId] || initialRoom;
  }, [selectedRoomId, initialRoom]);

  // When room is selected, keep floor and part in sync
  const handleSelectRoom = useCallback((room: RoomBInfo) => {
    setSelectedRoomId(room.id);
    setCurrentFloor(room.floor);
    setActivePart(room.part);
    setSearchQuery('');
    setIsSearchFocused(false);
    setSimProgress(1);
    setIsPlaying(false);
  }, []);

  // Rooms list on current floor and part
  const currentPartRooms = useMemo(() => {
    return Object.values(TOA_B_ROOMS).filter((room) => {
      const matchFloor = room.floor === currentFloor;
      const matchPart = activePart === 'master' ? true : room.part === activePart;
      const matchCategory =
        categoryFilter === 'all' ? true : room.category === categoryFilter;
      return matchFloor && matchPart && matchCategory;
    });
  }, [currentFloor, activePart, categoryFilter]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchRooms(searchQuery).slice(0, 8);
  }, [searchQuery]);

  // Waypoints for the active part
  const routeWaypoints: Point[] = useMemo(() => {
    if (activePart === 'master') {
      // In master view: route from CT to target room in masterCoords
      const door = selectedRoom.masterCoords.door;
      const startX = selectedRoom.part === 'part1' ? 220 : selectedRoom.part === 'part2' ? 495 : 865;
      const startY = selectedRoom.part === 'part3' ? 200 : 220;
      return [
        { x: startX, y: startY },
        { x: (startX + door.x) / 2, y: (startY + door.y) / 2 },
        { x: door.x, y: door.y },
      ];
    }

    const door = selectedRoom.partCoords.door;
    const corridorY = 270;

    if (activePart === 'part1') {
      const startX = 435; // Cửa Cầu Thang 1
      return [
        { x: startX, y: 220 },
        { x: startX, y: corridorY },
        { x: door.x, y: corridorY },
        { x: door.x, y: door.y },
      ];
    }

    if (activePart === 'part2') {
      const startX = 140; // Cửa Cầu Thang 2
      if (selectedRoom.category === 'restroom') {
        return [
          { x: startX, y: 220 },
          { x: startX, y: 160 },
          { x: door.x, y: door.y },
        ];
      }
      return [
        { x: startX, y: 220 },
        { x: startX, y: corridorY },
        { x: door.x, y: corridorY },
        { x: door.x, y: door.y },
      ];
    }

    // part3
    const startX = selectedRoom.nearestStairs === 'CT4' ? 990 : 110;
    return [
      { x: startX, y: 220 },
      { x: startX, y: corridorY },
      { x: door.x, y: corridorY },
      { x: door.x, y: door.y },
    ];
  }, [activePart, selectedRoom]);

  // SVG route path string
  const routeSvgPath = useMemo(() => {
    if (routeWaypoints.length === 0) return '';
    return routeWaypoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [routeWaypoints]);

  // Directional arrows along route segments (Matching Image 1)
  const routeArrows: SegmentArrow[] = useMemo(() => {
    const arrows: SegmentArrow[] = [];
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const p1 = routeWaypoints[i];
      const p2 = routeWaypoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 30) {
        // Place arrow at 60% of segment
        const arrowX = p1.x + dx * 0.6;
        const arrowY = p1.y + dy * 0.6;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        arrows.push({ x: arrowX, y: arrowY, angle });
      }
    }
    return arrows;
  }, [routeWaypoints]);

  // Current position of walking avatar along route
  const avatarPosition: Point = useMemo(() => {
    if (routeWaypoints.length === 0) return { x: 0, y: 0 };
    if (routeWaypoints.length === 1) return routeWaypoints[0];

    // Compute segment lengths
    const lengths: number[] = [];
    let totalLength = 0;
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const p1 = routeWaypoints[i];
      const p2 = routeWaypoints[i + 1];
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      lengths.push(len);
      totalLength += len;
    }

    if (totalLength === 0) return routeWaypoints[0];

    const targetDistance = simProgress * totalLength;
    let accumulated = 0;

    for (let i = 0; i < lengths.length; i++) {
      const segLen = lengths[i];
      if (accumulated + segLen >= targetDistance || i === lengths.length - 1) {
        const segProgress = segLen > 0 ? (targetDistance - accumulated) / segLen : 0;
        const clampedProg = Math.max(0, Math.min(1, segProgress));
        const p1 = routeWaypoints[i];
        const p2 = routeWaypoints[i + 1];
        return {
          x: p1.x + (p2.x - p1.x) * clampedProg,
          y: p1.y + (p2.y - p1.y) * clampedProg,
        };
      }
      accumulated += segLen;
    }

    return routeWaypoints[routeWaypoints.length - 1];
  }, [routeWaypoints, simProgress]);

  // Simulation Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const duration = 4000; // 4 seconds full traversal

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setSimProgress((prev) => {
        const next = prev + deltaTime / duration;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSimProgress(1);
    setIsPlaying(false);
  };

  // ViewBox per active part
  const currentViewBox = useMemo(() => {
    if (activePart === 'master') return '0 0 1024 586';
    if (activePart === 'part1') return '0 0 1020 320';
    if (activePart === 'part2') return '0 0 1060 330';
    return '0 0 1110 330'; // part3
  }, [activePart]);

  // Current original image
  const currentOriginalImage = useMemo(() => {
    if (activePart === 'master') return MASTER_FLOOR_IMAGE;
    return PART_IMAGE_MAP[currentFloor][activePart];
  }, [activePart, currentFloor]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#EDE8DF] text-[#1A1817] overflow-hidden select-none font-sans">
      {/* =====================================================================
          1. HEADER BAR - UTH BRANDED NAVIGATION
          ===================================================================== */}
      <header className="bg-[#FAF7F2] border-b border-[#D8CFC4] px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-30 flex-shrink-0">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0E434F] text-white px-2.5 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
            <span>UTH • TÒA B</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#2C2926] tracking-tight leading-tight">
              Bản Đồ Dẫn Đường 2D Tòa B
            </h1>
            <p className="text-[11px] text-[#7A736B] hidden sm:block">
              Hệ thống tìm phòng & chỉ dẫn đường đi tối giản UTH
            </p>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 w-4 h-4 text-[#7A736B] pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm số phòng (VD: B.301, B.105, B.2, Thư viện, WC...)"
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-[#D8CFC4] rounded-lg text-xs text-[#1A1817] placeholder-[#9E968D] focus:outline-none focus:ring-2 focus:ring-[#0E434F] focus:border-transparent transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#9E968D] hover:text-[#1A1817]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D8CFC4] rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-72 overflow-y-auto">
              <div className="p-1.5 bg-[#FAF7F2] text-[10px] font-bold text-[#7A736B] uppercase tracking-wider">
                Gợi ý tìm kiếm ({searchResults.length} phòng)
              </div>
              {searchResults.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className="w-full px-3 py-2 text-left hover:bg-[#F3EFEA] flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-[#0E434F] text-white text-[10px] font-bold rounded">
                      {room.code}
                    </span>
                    <span className="text-xs font-semibold text-[#1A1817]">
                      {room.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#7A736B]">
                    <span>{room.floorLabel}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{room.partLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="hidden lg:flex items-center bg-[#E5DFD5] p-0.5 rounded-lg text-[11px] font-semibold border border-[#D8CFC4]">
            <button
              onClick={() => setViewMode('vector')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'vector'
                  ? 'bg-white text-[#0E434F] shadow-sm font-bold'
                  : 'text-[#5A544E] hover:text-[#1A1817]'
              }`}
            >
              Vector Chuẩn Tòa K
            </button>
            <button
              onClick={() => setViewMode('image')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'image'
                  ? 'bg-white text-[#0E434F] shadow-sm font-bold'
                  : 'text-[#5A544E] hover:text-[#1A1817]'
              }`}
            >
              Bản Vẽ Gốc TOAB_2D
            </button>
          </div>

          {/* Close Modal Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-[#5A544E] hover:text-[#1A1817] border border-[#D8CFC4] transition shadow-sm"
              title="Đóng bản đồ"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. SECONDARY CONTROLS: FLOORS & PARTS SELECTOR
          ===================================================================== */}
      <div className="bg-[#FAF7F2] border-b border-[#D8CFC4] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-20 flex-shrink-0">
        {/* Floor Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#7A736B] mr-1 hidden sm:inline">
            TẦNG:
          </span>
          {(['ground', 'floor1', 'floor2', 'floor3'] as BuildingFloor[]).map(
            (floorKey) => {
              const info = FLOOR_INFO[floorKey];
              const isActive = currentFloor === floorKey;
              return (
                <button
                  key={floorKey}
                  onClick={() => {
                    setCurrentFloor(floorKey);
                    // Automatically re-target room on this floor if available
                    const roomOnNewFloor = Object.values(TOA_B_ROOMS).find(
                      (r) =>
                        r.floor === floorKey &&
                        (activePart === 'master' || r.part === activePart)
                    );
                    if (roomOnNewFloor) {
                      setSelectedRoomId(roomOnNewFloor.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-md font-bold transition text-xs ${
                    isActive
                      ? 'bg-[#0E434F] text-white shadow-sm'
                      : 'bg-white text-[#5A544E] hover:bg-[#F3EFEA] border border-[#D8CFC4]'
                  }`}
                >
                  {info.label}
                </button>
              );
            }
          )}
        </div>

        {/* Architectural Parts Selector (3 Parts + Master) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#7A736B] mr-1 hidden sm:inline">
            KHỐI:
          </span>
          <button
            onClick={() => setActivePart('part1')}
            className={`px-2.5 py-1 rounded-md font-semibold transition text-xs ${
              activePart === 'part1'
                ? 'bg-[#0E434F] text-white shadow-sm font-bold'
                : 'bg-white text-[#5A544E] hover:bg-[#F3EFEA] border border-[#D8CFC4]'
            }`}
          >
            Phần 1 (Khối Nam)
          </button>
          <button
            onClick={() => setActivePart('part2')}
            className={`px-2.5 py-1 rounded-md font-semibold transition text-xs ${
              activePart === 'part2'
                ? 'bg-[#0E434F] text-white shadow-sm font-bold'
                : 'bg-white text-[#5A544E] hover:bg-[#F3EFEA] border border-[#D8CFC4]'
            }`}
          >
            Phần 2 (Khối Bắc)
          </button>
          <button
            onClick={() => setActivePart('part3')}
            className={`px-2.5 py-1 rounded-md font-semibold transition text-xs ${
              activePart === 'part3'
                ? 'bg-[#0E434F] text-white shadow-sm font-bold'
                : 'bg-white text-[#5A544E] hover:bg-[#F3EFEA] border border-[#D8CFC4]'
            }`}
          >
            Phần 3 (Cánh Đông)
          </button>
          <button
            onClick={() => setActivePart('master')}
            className={`px-2.5 py-1 rounded-md font-semibold transition text-xs flex items-center gap-1 ${
              activePart === 'master'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'bg-white text-[#5A544E] hover:bg-[#F3EFEA] border border-[#D8CFC4]'
            }`}
          >
            <Layers className="w-3 h-3" strokeWidth={1.5} />
            Toàn Cảnh 3 Phần
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN WORKSPACE (SIDEBAR + INTERACTIVE MAP CANVAS)
          ===================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* -------------------------------------------------------------------
            3.1. LEFT SIDEBAR: "CHỌN NHANH ĐIỂM ĐẾN:" (Matching Image 2)
            ------------------------------------------------------------------- */}
        <aside className="w-72 bg-[#FAF7F2] border-r border-[#D8CFC4] flex flex-col z-10 flex-shrink-0 shadow-sm hidden md:flex">
          {/* Header */}
          <div className="p-3 border-b border-[#D8CFC4]">
            <div className="text-[11px] font-black tracking-wider uppercase text-[#5A544E] flex items-center justify-between">
              <span>CHỌN NHANH ĐIỂM ĐẾN:</span>
              <span className="text-[10px] bg-[#E8E2D9] px-1.5 py-0.5 rounded text-[#7A736B]">
                {currentPartRooms.length} điểm
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1 text-[10px]">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  categoryFilter === 'all'
                    ? 'bg-[#0E434F] text-white font-bold'
                    : 'bg-white text-[#7A736B] hover:bg-gray-100 border border-[#D8CFC4]'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setCategoryFilter('classroom')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  categoryFilter === 'classroom'
                    ? 'bg-[#0E434F] text-white font-bold'
                    : 'bg-white text-[#7A736B] hover:bg-gray-100 border border-[#D8CFC4]'
                }`}
              >
                Phòng học
              </button>
              <button
                onClick={() => setCategoryFilter('office')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  categoryFilter === 'office'
                    ? 'bg-[#0E434F] text-white font-bold'
                    : 'bg-white text-[#7A736B] hover:bg-gray-100 border border-[#D8CFC4]'
                }`}
              >
                Văn phòng
              </button>
              <button
                onClick={() => setCategoryFilter('stairs')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  categoryFilter === 'stairs'
                    ? 'bg-[#0E434F] text-white font-bold'
                    : 'bg-white text-[#7A736B] hover:bg-gray-100 border border-[#D8CFC4]'
                }`}
              >
                Cầu thang
              </button>
              <button
                onClick={() => setCategoryFilter('restroom')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  categoryFilter === 'restroom'
                    ? 'bg-[#0E434F] text-white font-bold'
                    : 'bg-white text-[#7A736B] hover:bg-gray-100 border border-[#D8CFC4]'
                }`}
              >
                WC
              </button>
            </div>
          </div>

          {/* Room Pills List (Exact Style Matching Reference Image 2) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
            {currentPartRooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-all duration-150 shadow-sm ${
                    isSelected
                      ? 'bg-[#0E434F] text-white shadow-md ring-2 ring-[#0E434F]/30 translate-x-1'
                      : 'bg-white hover:bg-[#F3EFEA] text-[#1A1817] border border-[#E5E0D8]'
                  }`}
                >
                  <span
                    className={`text-xs font-bold truncate pr-2 ${
                      isSelected ? 'text-white' : 'text-[#2C2926]'
                    }`}
                  >
                    {room.name}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0 font-mono tracking-tight ${
                      isSelected
                        ? 'bg-[#185360] text-emerald-100 border border-[#236877]'
                        : 'bg-[#F0ECE1] text-[#7A736B] border border-[#DDD5C7]'
                    }`}
                  >
                    {room.shortBadge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Context Summary */}
          <div className="p-3 bg-[#F3EFEA] border-t border-[#D8CFC4] text-[11px] text-[#7A736B] space-y-1">
            <div className="flex items-center gap-1 font-semibold text-[#2C2926]">
              <Info className="w-3.5 h-3.5 text-[#0E434F]" strokeWidth={1.5} />
              <span>Ghi chú vị trí:</span>
            </div>
            <p className="leading-relaxed">
              {activePart === 'master'
                ? 'Toàn cảnh 3 khối kiến trúc Tòa B kết nối theo hình chữ L.'
                : PART_INFO[activePart].description}
            </p>
          </div>
        </aside>

        {/* -------------------------------------------------------------------
            3.2. INTERACTIVE MAP CANVAS (SVG OR ORIGINAL DRAWING)
            ------------------------------------------------------------------- */}
        <main
          className="flex-1 relative bg-[#4A4540] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom & Navigation Floating Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#FAF7F2]/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-[#D8CFC4]">
            <button
              onClick={() => handleZoom(0.2)}
              className="p-2 rounded-lg bg-white hover:bg-[#F3EFEA] text-[#2C2926] shadow-sm transition"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-2 rounded-lg bg-white hover:bg-[#F3EFEA] text-[#2C2926] shadow-sm transition"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 rounded-lg bg-white hover:bg-[#F3EFEA] text-[#2C2926] shadow-sm transition"
              title="Đặt lại góc nhìn"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Top-Left Mode & Part Indicator */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#FAF7F2]/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[#D8CFC4]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#2C2926]">
              {FLOOR_INFO[currentFloor].label} •{' '}
              {activePart === 'master'
                ? 'Toàn Cảnh 3 Khối'
                : PART_INFO[activePart].label}
            </span>
          </div>

          {/* Map Graphic Container with Zoom & Pan */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-full h-full flex items-center justify-center p-6"
          >
            {/* A. VECTOR MODE (High aesthetic Warm Minimalist fidelity matching Image 1) */}
            {viewMode === 'vector' ? (
              <svg
                viewBox={currentViewBox}
                className="max-w-full max-h-[85vh] drop-shadow-2xl overflow-visible transition-all"
                style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.35))' }}
              >
                <defs>
                  {/* Pattern for Stair Treads */}
                  <pattern
                    id="stairStripes"
                    width="12"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="12" height="12" fill={TOA_B_COLORS.stairBg} />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="12"
                      stroke={TOA_B_COLORS.stairStripe}
                      strokeWidth="3.5"
                    />
                  </pattern>

                  {/* Marker Arrow for Wayfinding Line */}
                  <marker
                    id="routeArrowHead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 7 3.5, 0 7"
                      fill={TOA_B_COLORS.routeTeal}
                    />
                  </marker>
                </defs>

                {/* Background Board for Part Map */}
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill={TOA_B_COLORS.bgCanvas}
                  rx="16"
                  stroke={TOA_B_COLORS.borderWall}
                  strokeWidth="3"
                />

                {/* -------------------------------------------------------------
                    RENDER SPECIFIC PART VECTOR GRAPHICS
                    ------------------------------------------------------------- */}
                {activePart !== 'master' ? (
                  <g id="partVectorGroup">
                    {/* Corridor Path Foundation */}
                    <rect
                      x="20"
                      y="230"
                      width={
                        activePart === 'part1'
                          ? 980
                          : activePart === 'part2'
                          ? 1020
                          : 1070
                      }
                      height="80"
                      fill={TOA_B_COLORS.bgCorridor}
                      stroke={TOA_B_COLORS.borderWall}
                      strokeWidth="2.5"
                      rx="4"
                    />
                    <text
                      x="500"
                      y="275"
                      fill="#A39C93"
                      fontSize="12"
                      fontWeight="bold"
                      letterSpacing="4"
                      textAnchor="middle"
                    >
                      HÀNH LANG {PART_INFO[activePart].label.toUpperCase()}
                    </text>

                    {/* Rooms on this Part */}
                    {currentPartRooms.map((room) => {
                      const isSelected = room.id === selectedRoomId;
                      const { x, y, width, height, door } = room.partCoords;

                      return (
                        <g
                          key={room.id}
                          className="cursor-pointer group"
                          onClick={() => handleSelectRoom(room)}
                        >
                          {/* Room Body Box */}
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={
                              room.category === 'stairs'
                                ? 'url(#stairStripes)'
                                : isSelected
                                ? '#FFF7ED'
                                : room.fillColor
                            }
                            stroke={
                              isSelected
                                ? TOA_B_COLORS.routeActive
                                : TOA_B_COLORS.borderWall
                            }
                            strokeWidth={isSelected ? 4 : 2.5}
                            rx="6"
                            className="transition-all duration-200"
                          />

                          {/* Selected Room Beacon Effect */}
                          {isSelected && (
                            <rect
                              x={x - 4}
                              y={y - 4}
                              width={width + 8}
                              height={height + 8}
                              fill="none"
                              stroke={TOA_B_COLORS.routeActive}
                              strokeWidth="2"
                              strokeDasharray="6 4"
                              rx="8"
                              className="animate-pulse"
                            />
                          )}

                          {/* Door Cutout Gap & Swing Arc */}
                          <g id={`door_${room.id}`}>
                            {/* White door threshold gap (36px) */}
                            <line
                              x1={door.x - 18}
                              y1={door.y}
                              x2={door.x + 18}
                              y2={door.y}
                              stroke="#FFFFFF"
                              strokeWidth="6"
                            />
                            {/* Door swing arc */}
                            <path
                              d={`M ${door.x - 18} ${door.y} A 36 36 0 0 1 ${
                                door.x + 18
                              } ${door.y + 15}`}
                              fill="none"
                              stroke={TOA_B_COLORS.doorArc}
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          </g>

                          {/* Room Content / Typography */}
                          {room.category === 'stairs' ? (
                            <g>
                              {/* Stair Zigzag Graphic */}
                              <path
                                d={`M ${x + 20} ${y + 50} L ${x + 35} ${
                                  y + 50
                                } L ${x + 35} ${y + 70} L ${x + 50} ${
                                  y + 70
                                } L ${x + 50} ${y + 90} L ${x + 65} ${y + 90}`}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <text
                                x={x + width / 2}
                                y={y + height / 2 + 30}
                                fill="#FFFFFF"
                                fontSize="14"
                                fontWeight="800"
                                textAnchor="middle"
                              >
                                {room.name}
                              </text>
                            </g>
                          ) : room.category === 'restroom' ? (
                            <g>
                              <text
                                x={x + width / 2}
                                y={y + height / 2 + 5}
                                fill="#2C2926"
                                fontSize="13"
                                fontWeight="800"
                                textAnchor="middle"
                              >
                                {room.name}
                              </text>
                            </g>
                          ) : (
                            <g>
                              <text
                                x={x + width / 2}
                                y={y + height / 2 - 8}
                                fill={TOA_B_COLORS.textDark}
                                fontSize={width > 220 ? '16' : '14'}
                                fontWeight="800"
                                textAnchor="middle"
                              >
                                {room.code}
                              </text>
                              <text
                                x={x + width / 2}
                                y={y + height / 2 + 15}
                                fill="#4A4540"
                                fontSize={width > 220 ? '12' : '10'}
                                fontWeight="600"
                                textAnchor="middle"
                              >
                                {room.name.replace(`Phòng Học ${room.code}`, '') ||
                                  room.name}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* ---------------------------------------------------------
                        WAYFINDING NAVIGATION ROUTE (Matching Image 1)
                        --------------------------------------------------------- */}
                    <g id="wayfindingRouteLayer">
                      {/* Base route glow */}
                      <path
                        d={routeSvgPath}
                        fill="none"
                        stroke="#0E434F"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.9"
                      />

                      {/* Directional Arrowheads along segments */}
                      {routeArrows.map((arrow, idx) => (
                        <polygon
                          key={idx}
                          points="-5,-4 5,0 -5,4"
                          fill="#0E434F"
                          transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}
                        />
                      ))}

                      {/* Destination Door Pulse Marker */}
                      <circle
                        cx={selectedRoom.partCoords.door.x}
                        cy={selectedRoom.partCoords.door.y}
                        r="7"
                        fill={TOA_B_COLORS.routeActive}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="animate-ping"
                      />
                      <circle
                        cx={selectedRoom.partCoords.door.x}
                        cy={selectedRoom.partCoords.door.y}
                        r="5"
                        fill={TOA_B_COLORS.routeActive}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />

                      {/* Walking User Avatar Pin (Teardrop pin matching Image 1) */}
                      <g
                        transform={`translate(${avatarPosition.x}, ${avatarPosition.y})`}
                        className="transition-transform duration-75"
                      >
                        <circle
                          r="14"
                          fill="#0E434F"
                          opacity="0.2"
                          className="animate-ping"
                        />
                        {/* Teardrop outer badge */}
                        <circle
                          r="10"
                          fill="#0E434F"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          className="drop-shadow-md"
                        />
                        {/* Person inside icon */}
                        <circle cx="0" cy="-2.5" r="2.5" fill="#FFFFFF" />
                        <path
                          d="M -4 6 C -4 3, 4 3, 4 6 Z"
                          fill="#FFFFFF"
                        />
                      </g>
                    </g>
                  </g>
                ) : (
                  /* -------------------------------------------------------------
                      RENDER MASTER VIEW (All 3 Parts Connected in True Architecture)
                      ------------------------------------------------------------- */
                  <g id="masterVectorGroup">
                    {/* Part 1 Box Outline (Matching satellite red box 1) */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setActivePart('part1')}
                    >
                      <rect
                        x="10"
                        y="90"
                        width="480"
                        height="150"
                        fill="#FAF2E6"
                        stroke="#DC2626"
                        strokeWidth="3.5"
                        rx="8"
                      />
                      <rect
                        x="15"
                        y="95"
                        width="40"
                        height="40"
                        fill="#DC2626"
                        rx="6"
                      />
                      <text
                        x="35"
                        y="122"
                        fill="#FFFFFF"
                        fontSize="22"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        1
                      </text>
                      <text
                        x="120"
                        y="120"
                        fill="#DC2626"
                        fontSize="14"
                        fontWeight="800"
                      >
                        PHẦN 1 (KHỐI NAM)
                      </text>
                      <text
                        x="120"
                        y="138"
                        fill="#7A736B"
                        fontSize="11"
                        fontWeight="600"
                      >
                        B.2 / B.101A.. • Cầu Thang 1 • B.001 - B.003
                      </text>
                    </g>

                    {/* Part 2 Box Outline (Matching satellite red box 2) */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setActivePart('part2')}
                    >
                      <rect
                        x="400"
                        y="30"
                        width="440"
                        height="190"
                        fill="#FAF2E6"
                        stroke="#DC2626"
                        strokeWidth="3.5"
                        rx="8"
                      />
                      <rect
                        x="405"
                        y="35"
                        width="40"
                        height="40"
                        fill="#DC2626"
                        rx="6"
                      />
                      <text
                        x="425"
                        y="62"
                        fill="#FFFFFF"
                        fontSize="22"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        2
                      </text>
                      <text
                        x="490"
                        y="60"
                        fill="#DC2626"
                        fontSize="14"
                        fontWeight="800"
                      >
                        PHẦN 2 (KHỐI BẮC)
                      </text>
                      <text
                        x="490"
                        y="78"
                        fill="#7A736B"
                        fontSize="11"
                        fontWeight="600"
                      >
                        WC Nam/Nữ • Cầu Thang 2 • B.004 - B.007
                      </text>
                    </g>

                    {/* Part 3 Box Outline (Matching satellite red box 3) */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setActivePart('part3')}
                    >
                      <rect
                        x="830"
                        y="30"
                        width="180"
                        height="540"
                        fill="#FAF2E6"
                        stroke="#DC2626"
                        strokeWidth="3.5"
                        rx="8"
                      />
                      <rect
                        x="835"
                        y="35"
                        width="40"
                        height="40"
                        fill="#DC2626"
                        rx="6"
                      />
                      <text
                        x="855"
                        y="62"
                        fill="#FFFFFF"
                        fontSize="22"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        3
                      </text>
                      <text
                        x="925"
                        y="60"
                        fill="#DC2626"
                        fontSize="13"
                        fontWeight="800"
                      >
                        PHẦN 3
                      </text>
                      <text
                        x="925"
                        y="76"
                        fill="#7A736B"
                        fontSize="10"
                        fontWeight="600"
                      >
                        Cánh Đông
                      </text>
                    </g>

                    {/* Target Room Beacon in Master View */}
                    <g
                      transform={`translate(${selectedRoom.masterCoords.door.x}, ${selectedRoom.masterCoords.door.y})`}
                    >
                      <circle
                        r="18"
                        fill={TOA_B_COLORS.routeActive}
                        opacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        r="9"
                        fill={TOA_B_COLORS.routeActive}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="-45"
                        y="-35"
                        width="90"
                        height="22"
                        fill="#1A1817"
                        rx="6"
                      />
                      <text
                        x="0"
                        y="-20"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {selectedRoom.code}
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            ) : (
              /* B. ORIGINAL DRAWING MODE (Real JPGs from TOAB_2D) */
              <div className="relative max-w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#2C2926] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentOriginalImage}
                  alt={`Bản vẽ ${activePart}`}
                  className="max-h-[80vh] w-auto object-contain block"
                />

                {/* Interactive Hotspot & Room Indicator Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                    <span>
                      Bản vẽ gốc: {currentOriginalImage.split('/').pop()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================================
          4. BOTTOM WAYFINDING GUIDANCE SHEET ("DẪN ĐƯỜNG DỄ HIỂU NHẤT")
          ===================================================================== */}
      <footer className="bg-[#FAF7F2] border-t border-[#D8CFC4] z-30 shadow-2xl transition-all duration-200">
        {/* Toggle Bar / Header */}
        <div
          onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#F3EFEA] transition border-b border-[#E8E2D9]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E434F] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Navigation className="w-4 h-4 text-amber-300" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0E434F] uppercase tracking-wider">
                  Chỉ Dẫn Đến Phòng:
                </span>
                <span className="text-xs font-extrabold text-[#1A1817] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {selectedRoom.code} • {selectedRoom.name}
                </span>
              </div>
              <p className="text-[11px] text-[#7A736B]">
                {selectedRoom.floorLabel} • {selectedRoom.partLabel} • Cầu thang
                gần nhất: <strong>{selectedRoom.nearestStairs}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (simProgress >= 1) setSimProgress(0);
                setIsPlaying(!isPlaying);
              }}
              className="px-3 py-1 rounded-lg bg-[#0E434F] text-white hover:bg-[#135969] text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-300" strokeWidth={1.5} />
                  <span>Mô phỏng bước đi</span>
                </>
              )}
            </button>

            <button className="text-[#7A736B] hover:text-[#1A1817] p-1">
              {isDrawerCollapsed ? (
                <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Step-by-Step Directions Content */}
        {!isDrawerCollapsed && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-56 overflow-y-auto">
            {/* Column 1: Origin & Stats */}
            <div className="bg-white p-3 rounded-xl border border-[#D8CFC4] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#7A736B] tracking-wider">
                  ĐIỂM XUẤT PHÁT:
                </span>
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => setStartPoint('nearest_stairs')}
                    className={`flex-1 py-1 px-2 text-[11px] rounded-lg font-bold transition ${
                      startPoint === 'nearest_stairs'
                        ? 'bg-[#0E434F] text-white shadow-sm'
                        : 'bg-[#F3EFEA] text-[#5A544E] hover:bg-gray-200'
                    }`}
                  >
                    {selectedRoom.nearestStairs}
                  </button>
                  <button
                    onClick={() => setStartPoint('ground_gate')}
                    className={`flex-1 py-1 px-2 text-[11px] rounded-lg font-bold transition ${
                      startPoint === 'ground_gate'
                        ? 'bg-[#0E434F] text-white shadow-sm'
                        : 'bg-[#F3EFEA] text-[#5A544E] hover:bg-gray-200'
                    }`}
                  >
                    Cổng Sảnh Tòa B
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[#7A736B]">Cự ly ước tính:</span>
                <span className="font-extrabold text-[#0E434F]">
                  ~{selectedRoom.estimatedDistanceMeters}m (
                  {selectedRoom.walkingSeconds}s đi bộ)
                </span>
              </div>
            </div>

            {/* Column 2 & 3: Concrete Step-by-Step Wayfinding */}
            <div className="md:col-span-2 bg-white p-3 rounded-xl border border-[#D8CFC4] space-y-2">
              <span className="text-[10px] font-black uppercase text-[#7A736B] tracking-wider flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#0E434F]" strokeWidth={1.5} />
                LỘ TRÌNH DI CHUYỂN DỄ HIỂU NHẤT:
              </span>

              <div className="space-y-1.5 text-xs text-[#2C2926]">
                {(startPoint === 'ground_gate'
                  ? selectedRoom.directions.fromGroundGate
                  : selectedRoom.directions.fromNearestStairs
                ).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0E434F] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
