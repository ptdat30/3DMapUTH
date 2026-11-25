'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, DoorOpen, AlertTriangle, Sparkles } from 'lucide-react';
import { RoomData } from '@/types/navigation';
import {
  BUILDING_B_GATES,
  BUILDING_B_GATE_LIST,
  BuildingBGateId,
  getRecommendedGateForPart,
  getRoomByCode,
} from '@/data/buildingB2dData';

export interface FloorClimbTransitionModalProps {
  isOpen: boolean;
  targetRoom: RoomData | null;
  onConfirmArrivedFloor: (entryGate: BuildingBGateId) => void;
  onCancel: () => void;
}

// Apple iOS signature spring & cubic-bezier curve
const IOS_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const IOS_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

/**
 * Modern Apple / Lottie-style vector animation of a student with a backpack
 * climbing 3D-shaded architectural stairs with true joint-pivot motion
 * and sequential step-glow highlights.
 */
function ClimbingStairsAnimation({ targetFloor }: { targetFloor: number }) {
  const cycle = 2.8;

  // 4 step positions (bottom-left -> top-right landing)
  const stepHighlights = [
    { x: 42, y: 126, w: 46, delay: 0.0 },
    { x: 88, y: 102, w: 46, delay: 0.65 },
    { x: 134, y: 78, w: 46, delay: 1.3 },
    { x: 180, y: 54, w: 86, delay: 1.95 },
  ];

  return (
    <div className="relative w-full h-48 rounded-[24px] overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#E8F2FF] to-[#DCEBFF] border border-blue-200/70 shadow-inner flex items-center justify-center">
      {/* Soft Apple-style ambient radial light */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-8 right-2 w-40 h-40 rounded-full bg-sky-300/40 blur-2xl pointer-events-none"
      />
      <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-indigo-300/25 blur-2xl pointer-events-none" />

      {/* Top-Right Destination Floor Pill */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, ...IOS_SPRING }}
        className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#1A63EB] text-white text-[11px] font-extrabold shadow-md shadow-blue-600/25 flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
        <span>Tầng {targetFloor}</span>
      </motion.div>

      {/* Bottom-Left Origin Pill */}
      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 text-[10px] font-bold border border-slate-200/80 shadow-xs">
        Tầng Trệt
      </div>

      {/* Layered Architectural Staircase & Student Character SVG */}
      <svg viewBox="0 0 300 165" className="w-full h-full max-w-[320px]" aria-hidden="true">
        <defs>
          {/* Side wall sleek gradient */}
          <linearGradient id="stairSideWall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="55%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          {/* Soft floor shadow under staircase */}
          <linearGradient id="floorShadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#64748B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.12" />
          </linearGradient>
          {/* Hoodie gradient */}
          <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>

        {/* Subtle floor shadow */}
        <ellipse cx="155" cy="151" rx="122" ry="7" fill="url(#floorShadow)" />

        {/* Sleek glass handrail behind stairs */}
        <path
          d="M 52 104 L 188 34 L 256 34"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="68" y1="96" x2="68" y2="126" stroke="#BFDBFE" strokeWidth="2.2" />
        <line x1="114" y1="72" x2="114" y2="102" stroke="#BFDBFE" strokeWidth="2.2" />
        <line x1="160" y1="48" x2="160" y2="78" stroke="#BFDBFE" strokeWidth="2.2" />
        <line x1="208" y1="34" x2="208" y2="54" stroke="#BFDBFE" strokeWidth="2.2" />

        {/* 3D Shaded Architectural Staircase Body */}
        {/* Side face */}
        <path
          d="M 42 150 L 42 126 L 88 126 L 88 102 L 134 102 L 134 78 L 180 78 L 180 54 L 266 54 L 266 150 Z"
          fill="url(#stairSideWall)"
        />
        {/* Crisp white top treads (3D depth edge) */}
        <rect x="42" y="124" width="48" height="5" rx="2.5" fill="#FFFFFF" />
        <rect x="88" y="100" width="48" height="5" rx="2.5" fill="#FFFFFF" />
        <rect x="134" y="76" width="48" height="5" rx="2.5" fill="#FFFFFF" />
        <rect x="180" y="52" width="88" height="5.5" rx="2.5" fill="#FFFFFF" />

        {/* Sequential Glowing Highlight Bar on Each Step */}
        {stepHighlights.map((st, idx) => (
          <motion.rect
            key={`step-glow-${idx}`}
            x={st.x}
            y={st.y - 2}
            width={st.w}
            height="5"
            rx="2.5"
            fill="#38BDF8"
            animate={{ opacity: [0, 0.95, 0] }}
            transition={{
              duration: 0.75,
              delay: st.delay,
              repeat: Infinity,
              repeatDelay: cycle - 0.75,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Destination Beacon Pin on Top Landing */}
        <motion.g
          transform="translate(242, 46)"
          animate={{ y: [0, -3.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="0" cy="6" rx="7" ry="2.2" fill="#1E3A8A" opacity="0.22" />
          <path
            d="M 0,4 C -6,-3 -9,-8 -9,-12 C -9,-17 -5,-21 0,-21 C 5,-21 9,-17 9,-12 C 9,-8 6,-3 0,4 Z"
            fill="#EF4444"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <circle cx="0" cy="-12" r="3" fill="#FFFFFF" />
        </motion.g>

        {/* Stylized Modern Student Character Climbing Smoothly (Joint-Pivoted!) */}
        <motion.g
          animate={{
            x: [56, 78, 102, 124, 148, 170, 198, 214],
            y: [124, 106, 100, 82, 76, 58, 52, 52],
            opacity: [0, 1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: cycle,
            times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.86, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Contact shadow beneath shoes */}
          <ellipse cx="0" cy="1" rx="11" ry="2.5" fill="#0F172A" opacity="0.2" />

          {/* Back Leg (pivots cleanly from hip at 0, -20) */}
          <motion.g
            style={{ originX: '0px', originY: '-20px' }}
            animate={{ rotate: [26, -28, 26, -28, 26] }}
            transition={{ duration: cycle, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="-3.5" y="-20" width="7" height="17" rx="3.5" fill="#1E293B" />
            {/* White sneaker */}
            <rect x="-3.5" y="-5" width="11" height="5" rx="2.5" fill="#FFFFFF" stroke="#334155" strokeWidth="1" />
          </motion.g>

          {/* Back Arm (pivots cleanly from shoulder at 2, -37) */}
          <motion.g
            style={{ originX: '2px', originY: '-37px' }}
            animate={{ rotate: [-28, 30, -28, 30, -28] }}
            transition={{ duration: cycle, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="-1" y="-37" width="6" height="15" rx="3" fill="#60A5FA" />
            <circle cx="2" cy="-21.5" r="2.8" fill="#FDBA74" />
          </motion.g>

          {/* White Student Backpack */}
          <rect
            x="-13.5"
            y="-40"
            width="10"
            height="17"
            rx="4.5"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
            transform="rotate(8 -8 -31)"
          />
          <rect
            x="-12"
            y="-35"
            width="6"
            height="4"
            rx="1.5"
            fill="#DBEAFE"
            transform="rotate(8 -8 -31)"
          />

          {/* Front Leg (pivots cleanly from hip at 1, -20) */}
          <motion.g
            style={{ originX: '1px', originY: '-20px' }}
            animate={{ rotate: [-30, 28, -30, 28, -30] }}
            transition={{ duration: cycle, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="-2.5" y="-20" width="7.2" height="17" rx="3.6" fill="#0F172A" />
            {/* White sneaker */}
            <rect x="-2.5" y="-5" width="11.5" height="5" rx="2.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
          </motion.g>

          {/* Stylish Rounded Torso / UTH Blue Hoodie */}
          <rect
            x="-6.5"
            y="-42"
            width="15"
            height="24"
            rx="7"
            fill="url(#hoodieGrad)"
            transform="rotate(10 1 -30)"
          />

          {/* Front Arm (pivots cleanly from shoulder at 2, -37) */}
          <motion.g
            style={{ originX: '2px', originY: '-37px' }}
            animate={{ rotate: [32, -26, 32, -26, 32] }}
            transition={{ duration: cycle, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="-1" y="-37" width="6.2" height="15" rx="3.1" fill="#3B82F6" />
            <circle cx="2.1" cy="-21.5" r="2.9" fill="#FDBA74" />
          </motion.g>

          {/* Head + Hair (subtle friendly head bob) */}
          <motion.g
            animate={{ y: [0, -1.5, 0, -1.5, 0] }}
            transition={{ duration: cycle, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Neck */}
            <rect x="1.5" y="-46" width="4" height="5" rx="2" fill="#FDBA74" />
            {/* Face */}
            <circle cx="4.5" cy="-52" r="7.5" fill="#FDBA74" />
            {/* Stylish dark hair cap */}
            <path
              d="M -3 -53 C -3 -59.5, 4 -61.5, 10.5 -58 C 12 -57, 12.5 -55, 11.5 -53.5 C 8.5 -55.5, 2.5 -55, -1 -51 Z"
              fill="#1E293B"
            />
            {/* Friendly eye dot */}
            <circle cx="8.2" cy="-51.5" r="1.1" fill="#0F172A" />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}

export function FloorClimbTransitionModal({
  isOpen,
  targetRoom,
  onConfirmArrivedFloor,
  onCancel,
}: FloorClimbTransitionModalProps) {
  const targetFloor = targetRoom?.floorLevel ?? 0;
  const isUpperFloor = targetFloor > 0;

  // Match room in Building B 2D dataset to determine exact wing & recommended gate
  const roomBInfo = useMemo(() => {
    if (!targetRoom?.code) return undefined;
    return getRoomByCode(targetRoom.code);
  }, [targetRoom]);

  const recommendedGateId: BuildingBGateId = useMemo(() => {
    if (!roomBInfo) return 'gate1_parking';
    return getRecommendedGateForPart(roomBInfo.part);
  }, [roomBInfo]);

  const [selectedGate, setSelectedGate] = useState<BuildingBGateId>(recommendedGateId);

  // Sync default gate whenever modal opens for a new room
  useEffect(() => {
    if (isOpen) {
      setSelectedGate(recommendedGateId);
    }
  }, [isOpen, recommendedGateId]);

  const selectedGateInfo = BUILDING_B_GATES[selectedGate];
  const isDifferentWing = Boolean(
    roomBInfo && selectedGateInfo.primaryPart !== roomBInfo.part
  );

  return (
    <AnimatePresence>
      {isOpen && targetRoom && (
        <motion.div
          key="floor-climb-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: IOS_EASE }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-end sm:items-center justify-center p-2.5 sm:p-4"
          onClick={onCancel}
        >
          <motion.div
            key="floor-climb-card"
            initial={{ y: 56, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.95, opacity: 0 }}
            transition={IOS_SPRING}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] max-h-[92dvh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-[30px] p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,23,42,0.28)] border border-white/90 text-center space-y-3.5"
          >
            {/* iOS Top Handle Pill */}
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto -mt-0.5 sm:hidden" />

            {/* Live Climbing Stairs Animation (Upper Floors) or Clean Entry Header (Ground Floor) */}
            {isUpperFloor ? (
              <ClimbingStairsAnimation targetFloor={targetFloor} />
            ) : (
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1A63EB] shadow-xs">
                <DoorOpen className="w-7 h-7" strokeWidth={1.5} />
              </div>
            )}

            {/* Room & Wing Header */}
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold uppercase tracking-wide border border-blue-100">
                {targetRoom.buildingName ?? 'Tòa Nhà B'} • Phòng {targetRoom.code}
                {roomBInfo ? ` • ${roomBInfo.partLabel}` : ''}
              </span>
              <h2 className="text-[19px] sm:text-[21px] font-extrabold text-slate-900 tracking-tight leading-snug">
                {isUpperFloor
                  ? `Chọn cổng vào & lên Tầng ${targetFloor}`
                  : 'Bạn vừa vào Tòa B từ cổng nào?'}
              </h2>
            </div>

            {/* 3-Gate Selector matching Building B real entrances */}
            <div className="text-left space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Vị trí cổng bạn đang đứng
                </span>
                <span className="text-[10px] font-semibold text-blue-600">
                  1 chạm để chọn đúng vị trí
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {BUILDING_B_GATE_LIST.map((gate) => {
                  const isActive = selectedGate === gate.id;
                  const isRecommended = recommendedGateId === gate.id;
                  return (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => setSelectedGate(gate.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/95 border-[#1A63EB] shadow-xs ring-2 ring-blue-500/15'
                          : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-extrabold ${
                              isActive ? 'text-[#1A63EB]' : 'text-slate-900'
                            }`}
                          >
                            {gate.name}
                          </span>
                          {isRecommended && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                              <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                              Gần phòng nhất
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {gate.landmark}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'border-[#1A63EB] bg-[#1A63EB]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Cross-Wing Warning when user enters from a different wing than target room */}
            {isDifferentWing && roomBInfo ? (
              <div className="text-left rounded-2xl bg-amber-50 border border-amber-200/90 px-3 py-2.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-[11.5px] text-amber-900 leading-relaxed">
                  Bạn đang ở <strong>{selectedGateInfo.shortLabel}</strong>, còn phòng{' '}
                  <strong>{roomBInfo.code}</strong> nằm ở <strong>{roomBInfo.partLabel}</strong>.{' '}
                  {isUpperFloor
                    ? `Hãy leo cầu thang ${selectedGateInfo.stairsCode} lên Tầng ${targetFloor} — `
                    : ''}
                  Bản đồ 2D sẽ mở <strong>sơ đồ tổng thể chữ L</strong> làm nổi bật vị trí phòng và cổng bạn đang đứng!
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-slate-600 leading-relaxed px-1">
                {isUpperFloor ? (
                  <>
                    Đi cầu thang <strong>{selectedGateInfo.stairsCode}</strong> ngay tại{' '}
                    <strong>{selectedGateInfo.shortLabel}</strong> lên{' '}
                    <strong>Tầng {targetFloor}</strong>, sau đó bấm xác nhận để xem vị trí phòng nổi bật trên bản đồ 2D.
                  </>
                ) : (
                  <>
                    Bản đồ 2D sẽ làm nổi bật vị trí phòng{' '}
                    <strong className="text-blue-600">{targetRoom.code}</strong> ngay trên sơ đồ Tầng Trệt.
                  </>
                )}
              </p>
            )}

            {/* Tactile iOS Action Buttons */}
            <div className="space-y-2 pt-0.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={() => onConfirmArrivedFloor(selectedGate)}
                className="w-full py-3.5 px-4 rounded-full bg-[#1A63EB] hover:bg-[#1554CC] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(26,99,235,0.35)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span>
                  {isUpperFloor
                    ? `Đã lên Tầng ${targetFloor} (${selectedGateInfo.shortLabel}) — Mở 2D`
                    : `Mở bản đồ 2D từ ${selectedGateInfo.shortLabel}`}
                </span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12 }}
                onClick={onCancel}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Quay lại bản đồ 3D</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
