'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  TOA_B_COLORS,
  TOA_B_ROOMS,
  RoomBInfo,
} from '@/data/buildingB2dData';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Layers,
  MapPin,
  ChevronDown,
  ChevronUp,
  Footprints,
  Info,
  CheckCircle2,
} from 'lucide-react';

export interface BuildingB2DNavigatorProps {
  onClose?: () => void;
}

type ViewMode = 'unified' | 'tabbed' | 'split';
type ActiveTab = 'part1' | 'part2' | 'part3';

export function BuildingB2DNavigator({ onClose }: BuildingB2DNavigatorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [activeTab, setActiveTab] = useState<ActiveTab>('part1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('b_001');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.3); // 0 to 1
  const animFrameRef = useRef<number | null>(null);

  // Selected room details
  const selectedRoom: RoomBInfo | null = useMemo(() => {
    if (!selectedRoomId) return null;
    return TOA_B_ROOMS[selectedRoomId] || null;
  }, [selectedRoomId]);

  // Filtered rooms for search
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(TOA_B_ROOMS).filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Pan handlers
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
    const room = TOA_B_ROOMS[roomId];
    if (room && viewMode === 'tabbed') {
      if (room.section === 'part1') setActiveTab('part1');
      else if (room.section === 'part2') setActiveTab('part2');
      else if (room.section === 'part3') setActiveTab('part3');
    }
  }, [viewMode]);

  // Toggle Simulation Play/Pause
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
          const next = prev + delta * 0.2; // 5s full loop
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
      <header className="shrink-0 z-20 px-3 sm:px-6 py-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        {/* Title & Close */}
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#4A4540] transition cursor-pointer shrink-0"
              title="Đóng bản đồ Tòa B"
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
              Hệ thống dẫn đường tối giản tông ấm • 3 Phần theo mặt bằng thực tế
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills (3 Tab / 3 Khung / Bản đồ Liền Mạch) */}
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

        {/* Right Tools: Zoom, Reset */}
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
      {/* 2. SUB-BAR: Search Box & Tab Selector (if tabbed mode)               */}
      {/* =================================================================== */}
      <div className="shrink-0 z-10 px-3 sm:px-6 py-2 bg-[#FAF7F2]/80 backdrop-blur-xs border-b border-[#D8CFC4] flex flex-wrap items-center justify-between gap-2">
        {/* Quick Search Input */}
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-[#7A736B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm phòng: B.2, B.001, B.104, B.008, WC..."
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
      {/* 3. MAIN CANVAS VIEWPORT: 3 VIEW MODES                                */}
      {/* =================================================================== */}
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
          {/* Svg Definitions: Stair Stripes pattern and markers */}
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

          {/* ================================================================= */}
          {/* MODE 1: BẢN ĐỒ LIỀN MẠCH HÌNH CHỮ L (UNIFIED L-SHAPE MASTERPLAN)  */}
          {/* ================================================================= */}
          {viewMode === 'unified' && (
            <div className="bg-[#4A4540] p-1.5 sm:p-2 rounded-xl shadow-2xl">
              <svg
                viewBox="0 0 1120 780"
                className="w-[92vw] max-w-[980px] h-auto bg-[#F3EFEA] block"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
              >
                {/* Corridor background fill */}
                <rect x="0" y="0" width="1120" height="780" fill="#F3EFEA" />

                {/* --- KHỐI PHẦN 1 (CÁNH TÂY) --- */}
                {/* B.2 Tạp chí */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_002_mag')}>
                  <rect x="20" y="40" width="220" height="200" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="130" y="125" textAnchor="middle" fill="#1A1817" fontSize="18" fontWeight="800">B.2</text>
                  <text x="130" y="148" textAnchor="middle" fill="#1A1817" fontSize="11" fontWeight="700">TẠP CHÍ KHOA HỌC CÔNG NGHỆ</text>
                  <text x="130" y="165" textAnchor="middle" fill="#1A1817" fontSize="11" fontWeight="700">GIAO THÔNG VẬN TẢI</text>
                  {/* Cung cửa mở quay */}
                  <path d="M 215 240 A 25 25 0 0 1 240 215" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="215" y1="240" x2="240" y2="240" stroke="#7A736B" strokeWidth="1.5" />
                </g>

                {/* Cầu thang 1 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_1')}>
                  <rect x="240" y="40" width="70" height="150" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <rect x="240" y="80" width="70" height="110" fill="url(#stairPatternH)" />
                  <path d="M 252 52 L 260 52 L 260 60 L 268 60 L 268 68 L 276 68 L 276 76" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <text x="275" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">CT1</text>
                </g>

                {/* B.001 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_001')}>
                  <rect x="310" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="357" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.001</text>
                  <path d="M 310 190 A 20 20 0 0 1 330 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                </g>

                {/* B.002 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_002')}>
                  <rect x="405" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="452" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.002</text>
                  <path d="M 405 190 A 20 20 0 0 1 425 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                </g>

                {/* B.003 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_003')}>
                  <rect x="500" y="40" width="95" height="150" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="547" y="125" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.003</text>
                  <path d="M 500 190 A 20 20 0 0 1 520 170" fill="none" stroke="#7A736B" strokeWidth="1.5" strokeDasharray="2,2" />
                </g>

                {/* Hành lang Phần 1 */}
                <line x1="240" y1="240" x2="595" y2="240" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                <line x1="20" y1="240" x2="240" y2="240" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" strokeDasharray="40,25" />

                {/* --- KHU VỰC TRUNG TÂM: WC & CẦU THANG 2 --- */}
                {/* WC */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_wc')}>
                  <rect x="490" y="10" width="90" height="30" fill={TOA_B_COLORS.restroomSteel} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3" />
                  <text x="535" y="30" textAnchor="middle" fill="#1A1817" fontSize="13" fontWeight="800">WC</text>
                </g>
                {/* Cầu thang 2 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_2')}>
                  <rect x="580" y="10" width="55" height="100" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <rect x="580" y="40" width="55" height="70" fill="url(#stairPatternH)" />
                  <path d="M 590 20 L 598 20 L 598 28 L 606 28 L 606 36 L 614 36" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="607" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">CT2</text>
                </g>
                <rect x="580" y="110" width="55" height="70" fill="#EAE4DC" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3" />

                {/* --- KHỐI PHẦN 2 (CÁNH BẮC) --- */}
                {/* B.104 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_104')}>
                  <rect x="635" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="680" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.104</text>
                  {/* 2 Khe cửa trắng */}
                  <rect x="645" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  <rect x="695" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.105 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_105')}>
                  <rect x="725" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="770" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.105</text>
                  <rect x="735" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                  <rect x="785" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.106 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_106')}>
                  <rect x="815" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="860" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.106</text>
                  <rect x="850" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.107 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_107')}>
                  <rect x="905" y="40" width="90" height="140" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="950" y="120" textAnchor="middle" fill="#1A1817" fontSize="16" fontWeight="700">B.107</text>
                  <rect x="920" y="177" width="22" height="6" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* Hành lang Phần 2 */}
                <line x1="635" y1="210" x2="995" y2="210" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                {/* --- PHÒNG GÓC (CORNER) --- */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_corner')}>
                  <rect x="995" y="40" width="105" height="140" fill={TOA_B_COLORS.officeMustard} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="1047" y="120" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="800">B.GÓC</text>
                </g>

                {/* --- KHỐI PHẦN 3 (CÁNH ĐÔNG CHẠY XUỐNG PHÍA NAM) --- */}
                {/* Cầu thang 3 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_3')}>
                  <rect x="1035" y="180" width="65" height="60" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <path d="M 1045 190 L 1053 190 L 1053 198 L 1061 198 L 1061 206 L 1069 206" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="1067" y="228" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">CT3</text>
                </g>

                {/* B.008 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_008')}>
                  <rect x="1035" y="240" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="1067" y="300" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="700">B.008</text>
                  <rect x="1032" y="255" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.009 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_009')}>
                  <rect x="1035" y="350" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="1067" y="410" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="700">B.009</text>
                  <rect x="1032" y="365" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.010 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_010')}>
                  <rect x="1035" y="460" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="1067" y="520" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="700">B.010</text>
                  <rect x="1032" y="475" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* B.011 */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_011')}>
                  <rect x="1035" y="570" width="65" height="110" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <text x="1067" y="630" textAnchor="middle" fill="#1A1817" fontSize="14" fontWeight="700">B.011</text>
                  <rect x="1032" y="585" width="6" height="20" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1" />
                </g>

                {/* Hành lang dọc Phần 3 */}
                <line x1="995" y1="180" x2="995" y2="680" stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />

                {/* Cầu thang 4 ở góc đáy */}
                <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_4')}>
                  <rect x="995" y="680" width="45" height="55" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="3.5" />
                  <path d="M 1003 690 L 1011 690 L 1011 698 L 1019 698 L 1019 706 L 1027 706" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="1017" y="725" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">CT4</text>
                </g>

                {/* Highlight outline cho phòng đang chọn */}
                {selectedRoom && (
                  <circle
                    cx={selectedRoom.doorCoords.x}
                    cy={selectedRoom.doorCoords.y}
                    r="8"
                    fill="#0F4C5C"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Mẫu Tuyến đường dẫn lối (Route Path) từ Cổng Tòa B qua B.001 đến B.105 */}
                <path
                  d="M 230 230 L 357 230 L 680 200 L 770 200"
                  fill="none"
                  stroke="#0F4C5C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="6,4"
                />

                {/* Avatar Pin */}
                <g transform="translate(357, 230)">
                  <circle cx="0" cy="0" r="12" fill="#0F4C5C" opacity="0.2" />
                  <path d="M 0 6 C -6 0, -8 -4, -8 -8 C -8 -13, -4 -17, 0 -17 C 4 -17, 8 -13, 8 -8 C 8 -4, 6 0, 0 6 Z" fill="#0F4C5C" stroke="#FFFFFF" strokeWidth="1.2" />
                  <circle cx="0" cy="-10" r="2" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODE 2: 3 TAB PHÂN ĐOẠN CHI TIẾT (TABBED VIEW)                     */}
          {/* ================================================================= */}
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
                    <path d="M 395 60 L 410 60 L 410 75 L 425 75 L 425 90 L 440 90 L 440 105 L 455 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                    <text x="430" y="300" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 1</text>
                    <path d="M 390 320 A 25 25 0 0 1 415 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                  </g>
                  {/* B.001 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_001')}>
                    <rect x="480" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="555" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.001</text>
                    <path d="M 485 320 A 25 25 0 0 1 510 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                  </g>
                  {/* B.002 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_002')}>
                    <rect x="630" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="705" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.002</text>
                    <path d="M 635 320 A 25 25 0 0 1 660 295" fill="none" stroke="#7A736B" strokeWidth="2" strokeDasharray="3,3" />
                  </g>
                  {/* B.003 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_003')}>
                    <rect x="780" y="40" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="855" y="185" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.003</text>
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
                    <path d="M 35 60 L 50 60 L 50 75 L 65 75 L 65 90 L 80 90 L 80 105 L 95 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                    <text x="80" y="260" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 2</text>
                  </g>
                  <rect x="20" y="280" width="120" height="160" fill="#EAE4DC" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  {/* B.104 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_104')}>
                    <rect x="140" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="245" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.104</text>
                    <rect x="160" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    <rect x="260" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.105 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_105')}>
                    <rect x="350" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="455" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.105</text>
                    <rect x="370" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    <rect x="470" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.106 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_106')}>
                    <rect x="560" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="665" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.106</text>
                    <rect x="580" y="356" width="40" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.107 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_107')}>
                    <rect x="770" y="40" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="875" y="200" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.107</text>
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
                    <path d="M 35 60 L 50 60 L 50 75 L 65 75 L 65 90 L 80 90 L 80 105 L 95 105" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                    <text x="75" y="300" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">Cầu Thang 3</text>
                  </g>
                  {/* B.008 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_008')}>
                    <rect x="130" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="230" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.008</text>
                    <rect x="145" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    <rect x="245" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.009 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_009')}>
                    <rect x="330" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="430" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.009</text>
                    <rect x="345" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                    <rect x="445" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.010 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_010')}>
                    <rect x="530" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="630" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.010</text>
                    <rect x="545" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* B.011 */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_011')}>
                    <rect x="730" y="40" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <text x="830" y="185" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.011</text>
                    <rect x="745" y="316" width="35" height="8" fill="#FFFFFF" stroke={TOA_B_COLORS.wallBorder} strokeWidth="1.5" />
                  </g>
                  {/* Hành lang dưới */}
                  <line x1="20" y1="440" x2="930" y2="440" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  {/* Cầu thang 4 ở góc đáy */}
                  <g className="cursor-pointer" onClick={() => handleSelectRoom('b_stair_4')}>
                    <rect x="930" y="320" width="90" height="120" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                    <path d="M 945 340 L 955 340 L 955 350 L 965 350 L 965 360 L 975 360 L 975 370 L 985 370" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                    <text x="975" y="415" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">CT4</text>
                  </g>
                </svg>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* MODE 3: 3 KHUNG RIÊNG BIỆT XẾP CHỒNG (SPLIT / MULTI-FRAME VIEW)   */}
          {/* ================================================================= */}
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
                  <text x="430" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">CT1</text>
                  <rect x="480" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="555" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.001</text>
                  <rect x="630" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="705" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.002</text>
                  <rect x="780" y="30" width="150" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="855" y="170" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">B.003</text>
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
                  <text x="80" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">CT2</text>
                  <rect x="140" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="245" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.104</text>
                  <rect x="350" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="455" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.105</text>
                  <rect x="560" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="665" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.106</text>
                  <rect x="770" y="30" width="210" height="320" fill={TOA_B_COLORS.classroomIvory} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="875" y="190" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.107</text>
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
                  <text x="75" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">CT3</text>
                  <rect x="130" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="230" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.008</text>
                  <rect x="330" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="430" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.009</text>
                  <rect x="530" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="630" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.010</text>
                  <rect x="730" y="30" width="200" height="280" fill={TOA_B_COLORS.classroomTaupe} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="830" y="170" textAnchor="middle" fill="#1A1817" fontSize="24" fontWeight="700">B.011</text>
                  <rect x="930" y="310" width="90" height="110" fill={TOA_B_COLORS.stairsCharcoal} stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                  <text x="975" y="370" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">CT4</text>
                  <line x1="20" y1="420" x2="930" y2="420" stroke={TOA_B_COLORS.wallBorder} strokeWidth="4" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =================================================================== */}
      {/* 4. BOTTOM SHEET CARD: Selected Room Info & Quick Controls           */}
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
              {selectedRoom ? `Thông tin: ${selectedRoom.name} (${selectedRoom.code})` : 'Chọn phòng để xem chi tiết'}
            </span>
            {isDrawerCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </div>
        </button>

        {/* Detailed Drawer Body */}
        {!isDrawerCollapsed && selectedRoom && (
          <div className="px-4 pb-3.5 pt-1 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-[#EAE4DC] shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                  style={{ backgroundColor: selectedRoom.fillColor }}
                >
                  <span className="text-[#1A1817] drop-shadow-xs">{selectedRoom.code}</span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1A1817] leading-tight">
                    {selectedRoom.name}
                  </h3>
                  <p className="text-[11px] text-[#7A736B]">{selectedRoom.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
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
                      <span>Mô phỏng đường đi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#7A736B] pt-2">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#0F4C5C]" strokeWidth={1.5} />
                <span>Vị trí: {selectedRoom.sectionName} • Tầng trệt Tòa B</span>
              </div>
              <span className="font-semibold text-[#0F4C5C]">
                ✓ Chuẩn kiến trúc tối giản tông ấm UTH
              </span>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
