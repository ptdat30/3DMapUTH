'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Footprints,
  Info,
} from 'lucide-react';

export interface WarmMinimalist2DNavigatorProps {
  onClose?: () => void;
  onSwitchToTechnical?: () => void;
}

interface MapPOI {
  id: string;
  name: string;
  code: string;
  type: 'classroom' | 'stairs' | 'restroom';
  x: number;
  y: number;
  doorX: number;
  doorY: number;
}

const POI_LOCATIONS: Record<string, MapPOI> = {
  p301: {
    id: 'p301',
    name: 'Phòng Học 301',
    code: 'P.301',
    type: 'classroom',
    x: 198,
    y: 190,
    doorX: 380,
    doorY: 195,
  },
  p302: {
    id: 'p302',
    name: 'Phòng Học 302',
    code: 'P.302',
    type: 'classroom',
    x: 198,
    y: 370,
    doorX: 380,
    doorY: 375,
  },
  stair1: {
    id: 'stair1',
    name: 'Cầu Thang 1',
    code: 'CT1',
    type: 'stairs',
    x: 135,
    y: 58,
    doorX: 230,
    doorY: 58,
  },
  stair2: {
    id: 'stair2',
    name: 'Cầu Thang 2',
    code: 'CT2',
    type: 'stairs',
    x: 145,
    y: 502,
    doorX: 245,
    doorY: 502,
  },
  wc_nam: {
    id: 'wc_nam',
    name: 'WC Nam',
    code: 'WC-M',
    type: 'restroom',
    x: 110,
    y: 580,
    doorX: 380,
    doorY: 580,
  },
  wc_nu: {
    id: 'wc_nu',
    name: 'WC Nữ',
    code: 'WC-F',
    type: 'restroom',
    x: 280,
    y: 580,
    doorX: 380,
    doorY: 580,
  },
};

interface RouteStep {
  id: string;
  instruction: string;
  detail: string;
  distanceMeters: number;
}

export function WarmMinimalist2DNavigator({
  onClose,
  onSwitchToTechnical,
}: WarmMinimalist2DNavigatorProps) {
  const [startPoint, setStartPoint] = useState<string>('stair2');
  const [endPoint, setEndPoint] = useState<string>('p301');
  const [selectedRoom, setSelectedRoom] = useState<string | null>('p301');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.65); // Default to pin position from image (approx 65%)

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation frame
  const animFrameRef = useRef<number | null>(null);

  // Compute Route Coordinates
  const routePath = useMemo(() => {
    const start = POI_LOCATIONS[startPoint] || POI_LOCATIONS.stair2;
    const end = POI_LOCATIONS[endPoint] || POI_LOCATIONS.p301;

    // Corridor main line is at X = 425
    const corridorX = 425;

    // Path points:
    // 1. From start door to corridor
    // 2. Along corridor
    // 3. From corridor to end door & into room
    const p1 = `${start.doorX} ${start.doorY}`;
    const p2 = `${corridorX} ${start.doorY}`;
    const p3 = `${corridorX} ${end.doorY}`;
    const p4 = `${end.doorX} ${end.doorY}`;

    // SVG d attribute
    return `M ${p1} L ${p2} L ${p3} L ${p4}`;
  }, [startPoint, endPoint]);

  // Route steps
  const steps: RouteStep[] = useMemo(() => {
    const start = POI_LOCATIONS[startPoint] || POI_LOCATIONS.stair2;
    const end = POI_LOCATIONS[endPoint] || POI_LOCATIONS.p301;

    const res: RouteStep[] = [
      {
        id: 'step-1',
        instruction: `Từ ${start.name}, bước ra hành lang chính`,
        detail: 'Rẽ phải hướng về trục hành lang Đông',
        distanceMeters: 5,
      },
    ];

    if (start.doorY > end.doorY) {
      res.push({
        id: 'step-2',
        instruction: 'Đi thẳng về hướng Bắc dọc theo hành lang',
        detail: `Đi ngang qua ${startPoint === 'stair2' && endPoint === 'p301' ? 'Phòng Học 302' : 'các phòng lân cận'}`,
        distanceMeters: Math.round(Math.abs(start.doorY - end.doorY) * 0.1),
      });
      res.push({
        id: 'step-3',
        instruction: `Rẽ trái qua cửa để vào ${end.name}`,
        detail: 'Bạn đã đến đúng vị trí phòng học cần tìm',
        distanceMeters: 4,
      });
    } else {
      res.push({
        id: 'step-2',
        instruction: 'Đi thẳng về hướng Nam dọc theo hành lang',
        detail: 'Đi xuôi theo trục hành lang Đông',
        distanceMeters: Math.round(Math.abs(start.doorY - end.doorY) * 0.1),
      });
      res.push({
        id: 'step-3',
        instruction: `Rẽ phải qua cửa để vào ${end.name}`,
        detail: 'Bạn đã đến đúng vị trí phòng học cần tìm',
        distanceMeters: 4,
      });
    }

    return res;
  }, [startPoint, endPoint]);

  // Current Pin position along the route based on simProgress
  const currentPinPos = useMemo(() => {
    const start = POI_LOCATIONS[startPoint] || POI_LOCATIONS.stair2;
    const end = POI_LOCATIONS[endPoint] || POI_LOCATIONS.p301;
    const corridorX = 425;

    // Segment lengths approx
    const len1 = Math.abs(corridorX - start.doorX);
    const len2 = Math.abs(end.doorY - start.doorY);
    const len3 = Math.abs(corridorX - end.doorX);
    const total = len1 + len2 + len3 || 1;

    const currentDist = simProgress * total;

    if (currentDist <= len1) {
      const t = currentDist / (len1 || 1);
      return {
        x: start.doorX + (corridorX - start.doorX) * t,
        y: start.doorY,
      };
    }
    if (currentDist <= len1 + len2) {
      const t = (currentDist - len1) / (len2 || 1);
      return {
        x: corridorX,
        y: start.doorY + (end.doorY - start.doorY) * t,
      };
    }
    const t = (currentDist - len1 - len2) / (len3 || 1);
    return {
      x: corridorX + (end.doorX - corridorX) * t,
      y: end.doorY,
    };
  }, [simProgress, startPoint, endPoint]);

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
          const next = prev + delta * 0.25; // 4 seconds full trip
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

  const handleRoomSelect = useCallback((poiId: string) => {
    setSelectedRoom(poiId);
    setEndPoint(poiId);
    setSimProgress(0);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#E8E2D9] flex flex-col overflow-hidden select-none font-sans">
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR: Sleek, Mobile-First Minimalist Header             */}
      {/* =================================================================== */}
      <header className="shrink-0 z-20 px-3 sm:px-6 py-2.5 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#D8CFC4] flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#4A4540] transition cursor-pointer shrink-0"
              title="Đóng bản đồ"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[#4A4540] tracking-wide uppercase">
                Tòa K • Tầng 3
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F4C5C] text-white">
                Bản vẽ kiến trúc
              </span>
            </div>
            <p className="text-[11px] text-[#7A736B] truncate hidden sm:block">
              Hệ thống dẫn đường tối giản tông ấm • Cơ sở 3 UTH
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onSwitchToTechnical && (
            <button
              type="button"
              onClick={onSwitchToTechnical}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#4A4540] hover:bg-[#F3EFEA] transition shadow-xs"
              title="Chuyển sang bản đồ kỹ thuật phân tầng (Trệt - Tầng 3)"
            >
              <span>Kỹ thuật</span>
            </button>
          )}

          <div className="flex items-center bg-white rounded-xl border border-[#D8CFC4] p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 text-[#4A4540] hover:bg-[#F3EFEA] rounded-lg transition"
              title="Đặt lại góc nhìn"
            >
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. SVG VIEWPORT CANVAS: Warm Minimalist Architectural Map            */}
      {/* =================================================================== */}
      <main
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="transition-transform duration-75 ease-out will-change-transform flex items-center justify-center p-4"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Main Architectural Card matching the reference image */}
          <div className="bg-[#4A4540] p-1.5 sm:p-2 rounded-lg shadow-2xl">
            <svg
              viewBox="0 0 480 640"
              className="w-[88vw] max-w-[420px] sm:max-w-[460px] h-auto bg-[#F3EFEA] block"
              style={{ maxHeight: 'calc(100vh - 210px)' }}
            >
              {/* Sọc bậc thang Cầu Thang 1 pattern */}
              <defs>
                <pattern
                  id="stairStripes"
                  width="8"
                  height="80"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="4"
                    y1="0"
                    x2="4"
                    y2="80"
                    stroke="#48443F"
                    strokeWidth="3.5"
                  />
                </pattern>
                {/* Arrowhead marker for Teal route */}
                <marker
                  id="tealArrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0F4C5C" />
                </marker>
              </defs>

              {/* Corridor Background (Already #F3EFEA on SVG) */}
              <rect x="0" y="0" width="480" height="640" fill="#F3EFEA" />

              {/* ------------------------------------------------------------- */}
              {/* KHỐI A: CẦU THANG 1 (Đỉnh phía Bắc)                            */}
              {/* ------------------------------------------------------------- */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleRoomSelect('stair1')}
              >
                {/* Nền xám than */}
                <rect x="16" y="16" width="230" height="84" fill="#605B55" />
                {/* Dải vân bậc thang bên phải */}
                <rect x="100" y="16" width="130" height="84" fill="url(#stairStripes)" />
                {/* Icon bậc thang gấp khúc trắng bên trái */}
                <path
                  d="M 32 30 L 46 30 L 46 44 L 60 44 L 60 58 L 74 58 L 74 72 L 84 72"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Chữ Cầu Thang 1 */}
                <text
                  x="142"
                  y="63"
                  fill="#FFFFFF"
                  fontSize="17"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.2px"
                >
                  Cầu Thang 1
                </text>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* KHỐI B: PHÒNG HỌC 301                                         */}
              {/* ------------------------------------------------------------- */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-95"
                onClick={() => handleRoomSelect('p301')}
              >
                {/* Nền Warm Ivory */}
                <rect
                  x="16"
                  y="100"
                  width="364"
                  height="180"
                  fill="#FAF2E6"
                />
                {/* Viền tường xung quanh có khe mở cửa ở mép phải (Y: 175 -> 215) */}
                {/* Tường trên */}
                <line x1="16" y1="100" x2="380" y2="100" stroke="#4A4540" strokeWidth="4" />
                {/* Tường trái */}
                <line x1="16" y1="100" x2="16" y2="280" stroke="#4A4540" strokeWidth="4" />
                {/* Tường dưới (ngăn với P.302) */}
                <line x1="16" y1="280" x2="380" y2="280" stroke="#4A4540" strokeWidth="4" />
                {/* Tường phải đoạn 1 (từ 100 đến 175) */}
                <line x1="380" y1="100" x2="380" y2="175" stroke="#4A4540" strokeWidth="4" />
                {/* Khe cửa hở: Y 175 -> 215 */}
                {/* Tường phải đoạn 2 (từ 215 đến 280) */}
                <line x1="380" y1="215" x2="380" y2="280" stroke="#4A4540" strokeWidth="4" />

                {/* Chữ Phòng Học 301 */}
                <text
                  x="198"
                  y="198"
                  textAnchor="middle"
                  fill="#1A1817"
                  fontSize="22"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  Phòng Học 301
                </text>

                {/* Highlight outline if selected */}
                {selectedRoom === 'p301' && (
                  <rect
                    x="20"
                    y="104"
                    width="356"
                    height="172"
                    fill="none"
                    stroke="#0F4C5C"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    rx="4"
                  />
                )}
              </g>

              {/* ------------------------------------------------------------- */}
              {/* KHỐI C: PHÒNG HỌC 302                                         */}
              {/* ------------------------------------------------------------- */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-95"
                onClick={() => handleRoomSelect('p302')}
              >
                {/* Nền Muted Warm Taupe */}
                <rect
                  x="16"
                  y="280"
                  width="364"
                  height="180"
                  fill="#C8BEB3"
                />
                {/* Tường trái */}
                <line x1="16" y1="280" x2="16" y2="460" stroke="#4A4540" strokeWidth="4" />
                {/* Tường dưới */}
                <line x1="16" y1="460" x2="380" y2="460" stroke="#4A4540" strokeWidth="4" />
                {/* Tường phải đoạn 1 (từ 280 đến 355) */}
                <line x1="380" y1="280" x2="380" y2="355" stroke="#4A4540" strokeWidth="4" />
                {/* Khe cửa hở: Y 355 -> 395 */}
                {/* Tường phải đoạn 2 (từ 395 đến 460) */}
                <line x1="380" y1="395" x2="380" y2="460" stroke="#4A4540" strokeWidth="4" />

                {/* Chữ Phòng Học 302 */}
                <text
                  x="198"
                  y="378"
                  textAnchor="middle"
                  fill="#1A1817"
                  fontSize="22"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  Phòng Học 302
                </text>

                {/* Highlight outline if selected */}
                {selectedRoom === 'p302' && (
                  <rect
                    x="20"
                    y="284"
                    width="356"
                    height="172"
                    fill="none"
                    stroke="#0F4C5C"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    rx="4"
                  />
                )}
              </g>

              {/* ------------------------------------------------------------- */}
              {/* KHỐI D: CẦU THANG 2                                           */}
              {/* ------------------------------------------------------------- */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleRoomSelect('stair2')}
              >
                {/* Nền xám than */}
                <rect x="16" y="460" width="245" height="80" fill="#605B55" />
                {/* Dải vân bậc thang bên phải */}
                <rect x="105" y="460" width="140" height="80" fill="url(#stairStripes)" />
                {/* Icon bậc thang gấp khúc trắng */}
                <path
                  d="M 32 474 L 46 474 L 46 488 L 60 488 L 60 502 L 74 502 L 74 516 L 84 516"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Chữ Cầu Thang 2 */}
                <text
                  x="145"
                  y="507"
                  fill="#FFFFFF"
                  fontSize="17"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.2px"
                >
                  Cầu Thang 2
                </text>

                {/* Mép tường dưới của Cầu Thang 2 */}
                <line x1="16" y1="540" x2="245" y2="540" stroke="#4A4540" strokeWidth="4" />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* KHỐI E: KHU VỰC NHÀ VỆ SINH (WC NAM & WC NỮ)                   */}
              {/* ------------------------------------------------------------- */}
              <g
                className="cursor-pointer transition-opacity hover:opacity-95"
                onClick={() => handleRoomSelect('wc_nam')}
              >
                {/* Nền Muted Steel Blue */}
                <rect
                  x="16"
                  y="540"
                  width="364"
                  height="84"
                  fill="#B5C2C9"
                />
                {/* Tường bao quanh */}
                <line x1="16" y1="540" x2="16" y2="624" stroke="#4A4540" strokeWidth="4" />
                <line x1="16" y1="624" x2="380" y2="624" stroke="#4A4540" strokeWidth="4" />
                {/* Khe cửa hở ở mép phải (Y: 560 -> 595) */}
                <line x1="380" y1="540" x2="380" y2="560" stroke="#4A4540" strokeWidth="4" />
                <line x1="380" y1="595" x2="380" y2="624" stroke="#4A4540" strokeWidth="4" />

                {/* WC NAM: Icon & Chữ */}
                {/* Icon Nam (Pictogram trắng) */}
                <g transform="translate(48, 560) scale(1.1)">
                  {/* Đầu */}
                  <circle cx="8" cy="4" r="3" fill="#FFFFFF" />
                  {/* Thân & Chân */}
                  <path
                    d="M 4 8 L 12 8 L 11 19 L 9 19 L 9 26 L 7 26 L 7 19 L 5 19 Z"
                    fill="#FFFFFF"
                  />
                </g>
                <text
                  x="115"
                  y="589"
                  fill="#1A1817"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  WC Nam
                </text>

                {/* WC NỮ: Icon & Chữ */}
                <text
                  x="262"
                  y="589"
                  fill="#1A1817"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  WC Nữ
                </text>
                {/* Icon Nữ (Pictogram trắng) */}
                <g transform="translate(325, 560) scale(1.1)">
                  {/* Đầu */}
                  <circle cx="8" cy="4" r="3" fill="#FFFFFF" />
                  {/* Váy & Chân */}
                  <path
                    d="M 5 8 L 11 8 L 13 18 L 10 18 L 10 26 L 8 26 L 8 18 L 5 18 Z"
                    fill="#FFFFFF"
                  />
                </g>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* KHUNG BAO NGOÀI BẢN VẼ (OUTER ARCHITECTURAL BOUNDARY)         */}
              {/* ------------------------------------------------------------- */}
              <line x1="16" y1="16" x2="464" y2="16" stroke="#4A4540" strokeWidth="4" />
              <line x1="464" y1="16" x2="464" y2="624" stroke="#4A4540" strokeWidth="4" />
              <line x1="16" y1="624" x2="464" y2="624" stroke="#4A4540" strokeWidth="4" />
              <line x1="16" y1="16" x2="16" y2="624" stroke="#4A4540" strokeWidth="4" />

              {/* ------------------------------------------------------------- */}
              {/* TUYẾN ĐƯỜNG DẪN LỐI CHUẨN XÁC (DEEP TEAL ROUTE PATH)           */}
              {/* ------------------------------------------------------------- */}
              {/* Tuyến đường chính nét liền */}
              <path
                d={routePath}
                fill="none"
                stroke="#0F4C5C"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Mũi tên định hướng cố định theo mẫu hình */}
              {startPoint === 'stair2' && endPoint === 'p301' && (
                <>
                  {/* Mũi tên 1: Rẽ từ Cầu thang 2 ra hành lang (Hướng Đông ►) */}
                  <polygon
                    points="340,497 352,502 340,507"
                    fill="#0F4C5C"
                  />

                  {/* Mũi tên 2: Đi dọc hành lang hướng Bắc (Hướng Bắc ▲) */}
                  <polygon
                    points="420,440 425,428 430,440"
                    fill="#0F4C5C"
                  />

                  {/* Mũi tên 3: Đi dọc tiếp qua P.301 (Hướng Bắc ▲) */}
                  <polygon
                    points="420,270 425,258 430,270"
                    fill="#0F4C5C"
                  />

                  {/* Mũi tên 4: Rẽ trái vào cửa Phòng Học 301 (Hướng Tây ◄) */}
                  <polygon
                    points="398,190 386,195 398,200"
                    fill="#0F4C5C"
                  />
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PIN VỊ TRÍ NGƯỜI DÙNG (TEARDROP AVATAR PIN)                  */}
              {/* ------------------------------------------------------------- */}
              <g
                transform={`translate(${currentPinPos.x}, ${currentPinPos.y})`}
                className="transition-transform duration-100 ease-linear pointer-events-none"
              >
                {/* Vòng hào quang nhẹ */}
                <circle cx="0" cy="0" r="14" fill="#0F4C5C" opacity="0.15" />

                {/* Biểu tượng Giọt Nước Teardrop ngược (đỉnh nhọn ở dưới) */}
                <path
                  d="M 0 8 C -8 0, -10 -6, -10 -10 C -10 -16, -5.5 -21, 0 -21 C 5.5 -21, 10 -16, 10 -10 C 10 -6, 8 0, 0 8 Z"
                  fill="#0F4C5C"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Icon hình nhân màu trắng bên trong Pin */}
                <circle cx="0" cy="-13" r="2.5" fill="#FFFFFF" />
                <path
                  d="M -4 -8 C -4 -10, 4 -10, 4 -8 L 3.5 -5 L -3.5 -5 Z"
                  fill="#FFFFFF"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Quick Room Floating Selector (Left side pills for easy room selection) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A736B] px-1">
            Chọn nhanh điểm đến:
          </span>
          <div className="flex flex-wrap sm:flex-col gap-1 max-w-[220px]">
            {Object.values(POI_LOCATIONS)
              .filter((p) => p.type === 'classroom' || p.type === 'restroom')
              .map((poi) => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => handleRoomSelect(poi.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 shadow-xs cursor-pointer ${
                    endPoint === poi.id
                      ? 'bg-[#0F4C5C] text-white shadow-md'
                      : 'bg-[#FAF7F2]/90 hover:bg-white text-[#4A4540] border border-[#D8CFC4]'
                  }`}
                >
                  <span className="truncate">{poi.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      endPoint === poi.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EAE4DC] text-[#7A736B]'
                    }`}
                  >
                    {poi.code}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Floating Simulation Play/Pause Button on Right */}
        <div className="absolute top-3 right-3 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-lg border text-xs font-bold transition active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-[#0F4C5C] border-[#0A3642] text-white hover:bg-[#135d70]'
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
      </main>

      {/* =================================================================== */}
      {/* 3. BOTTOM SHEET CARD: Collapsible Step Guidance Drawer              */}
      {/* =================================================================== */}
      <footer className="shrink-0 z-20 bg-[#FAF7F2] border-t border-[#D8CFC4] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
        {/* Drag Handle & Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          className="w-full py-1.5 flex flex-col items-center justify-center hover:bg-[#F3EFEA] transition cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-[#C8BEB3] mb-1" />
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#7A736B]">
            <span>
              {isDrawerCollapsed
                ? `Lộ trình: ${POI_LOCATIONS[startPoint]?.name} → ${POI_LOCATIONS[endPoint]?.name}`
                : 'Thu gọn chi tiết dẫn đường'}
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
          <div className="px-4 pb-4 pt-1 max-w-lg mx-auto">
            {/* Step List */}
            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
              {steps.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-[#EAE4DC] shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1A1817] leading-snug">
                      {st.instruction}
                    </p>
                    <p className="text-[11px] text-[#7A736B]">{st.detail}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0F4C5C] shrink-0 bg-[#E8F2F4] px-1.5 py-0.5 rounded">
                    ~{st.distanceMeters}m
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Action Footer */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE4DC]">
              <div className="flex items-center gap-1.5 text-[#7A736B]">
                <Footprints className="w-4 h-4 text-[#0F4C5C]" strokeWidth={1.5} />
                <span>Tổng quãng đường: ~24 mét (khoảng 35 bước)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStartPoint('stair2');
                  setEndPoint('p301');
                  setSimProgress(0.65);
                }}
                className="flex items-center gap-1 text-[#0F4C5C] hover:underline font-bold"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                <span>Đặt lại lộ trình gốc</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
