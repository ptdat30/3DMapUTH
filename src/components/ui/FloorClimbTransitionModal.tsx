'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { RoomData } from '@/types/navigation';
import {
  BUILDING_B_GATES,
  BUILDING_B_GATE_LIST,
  BuildingBGateId,
  BuildingPart,
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
 * Step 1 Interactive Stage: Full L-shape Building B overview map showing
 * all 3 wings, target room pin, all 3 clickable gates, and a live animated
 * stick-figure walking into the currently selected gate with radar ripples.
 */
function BuildingBOverviewGateStage({
  selectedGate,
  recommendedGate,
  targetPart,
  targetRoomCode,
  onSelectGate,
}: {
  selectedGate: BuildingBGateId;
  recommendedGate: BuildingBGateId;
  targetPart: BuildingPart;
  targetRoomCode: string;
  onSelectGate: (gate: BuildingBGateId) => void;
}) {
  // Compact coordinates inside viewBox 0 0 320 185 (L-shape Building B)
  const gateCoords: Record<BuildingBGateId, { x: number; y: number; walkFrom: [number, number]; label: string }> = {
    gate1_parking: { x: 64, y: 84, walkFrom: [64, 126], label: 'Cổng 1' },
    gate2_north_south: { x: 146, y: 84, walkFrom: [146, 126], label: 'Cổng 2' },
    gate3_north_east: { x: 234, y: 92, walkFrom: [192, 118], label: 'Cổng 3' },
  };

  const targetPinPos: Record<BuildingPart, { x: number; y: number }> = {
    part1: { x: 74, y: 50 },
    part2: { x: 184, y: 42 },
    part3: { x: 274, y: 122 },
  };

  const activeGateCoord = gateCoords[selectedGate];
  const pinPos = targetPinPos[targetPart];

  return (
    <div className="relative w-full flex-1 min-h-[240px] sm:flex-none sm:h-48 rounded-[24px] overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#E8F2FF] to-[#DCEBFF] border border-blue-200/70 shadow-inner flex items-center justify-center p-2">
      {/* Subtle Top-Left Legend */}
      <div className="absolute top-2.5 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 text-[10px] font-bold border border-slate-200/80 shadow-xs">
        Toàn cảnh Tòa B
      </div>

      {/* Top-Right Room Pin Indicator */}
      <div className="absolute top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>{targetRoomCode}</span>
      </div>

      <svg viewBox="0 0 320 185" className="w-full h-full max-w-[330px]" aria-label="Sơ đồ 3 cổng Tòa B">
        {/* Subtle campus courtyard ground */}
        <rect x="14" y="20" width="292" height="150" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Parking lot hint near Gate 1 */}
        <rect x="24" y="132" width="76" height="28" rx="6" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
        <text x="62" y="149" fill="#475569" fontSize="8.5" fontWeight="700" textAnchor="middle">
          NHÀ XE
        </text>

        {/* Continuous L-Shape Corridor */}
        <path
          d="M 24 76 L 246 76 L 246 162 L 234 162 L 234 88 L 24 88 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />

        {/* Wing 1: Khối Nam */}
        <rect
          x="24"
          y="36"
          width="116"
          height="40"
          rx="6"
          fill={targetPart === 'part1' ? '#BFDBFE' : '#DBEAFE'}
          stroke={targetPart === 'part1' ? '#1A63EB' : '#64748B'}
          strokeWidth={targetPart === 'part1' ? '2.2' : '1.4'}
        />
        <text x="82" y="59" fill="#1E293B" fontSize="9.5" fontWeight="800" textAnchor="middle">
          KHỐI NAM
        </text>

        {/* Wing 2: Khối Bắc */}
        <rect
          x="148"
          y="24"
          width="96"
          height="52"
          rx="6"
          fill={targetPart === 'part2' ? '#BFDBFE' : '#DBEAFE'}
          stroke={targetPart === 'part2' ? '#1A63EB' : '#64748B'}
          strokeWidth={targetPart === 'part2' ? '2.2' : '1.4'}
        />
        <text x="196" y="53" fill="#1E293B" fontSize="9.5" fontWeight="800" textAnchor="middle">
          KHỐI BẮC
        </text>

        {/* Wing 3: Cánh Đông */}
        <rect
          x="248"
          y="24"
          width="50"
          height="138"
          rx="6"
          fill={targetPart === 'part3' ? '#BFDBFE' : '#DBEAFE'}
          stroke={targetPart === 'part3' ? '#1A63EB' : '#64748B'}
          strokeWidth={targetPart === 'part3' ? '2.2' : '1.4'}
        />
        <text x="273" y="91" fill="#1E293B" fontSize="9" fontWeight="800" textAnchor="middle">
          CÁNH
        </text>
        <text x="273" y="103" fill="#1E293B" fontSize="9" fontWeight="800" textAnchor="middle">
          ĐÔNG
        </text>

        {/* Target Room Red Pin on the Overview Map */}
        <g transform={`translate(${pinPos.x}, ${pinPos.y})`} pointerEvents="none">
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M 0,2 C -5,-4 -7,-8 -7,-11 C -7,-15 -4,-18 0,-18 C 4,-18 7,-15 7,-11 C 7,-8 5,-4 0,2 Z"
              fill="#EF4444"
              stroke="#FFFFFF"
              strokeWidth="1.4"
            />
            <circle cx="0" cy="-11" r="2.2" fill="#FFFFFF" />
          </motion.g>
        </g>

        {/* Animated Radar Ripple + Directional Entry Arrow at Selected Gate */}
        <g key={`gate-anim-${selectedGate}`} pointerEvents="none">
          {/* Dual Expanding Blue Radar Rings */}
          <circle cx={activeGateCoord.x} cy={activeGateCoord.y} r="7" fill="none" stroke="#1A63EB" strokeWidth="2.2">
            <animate attributeName="r" values="6;22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={activeGateCoord.x} cy={activeGateCoord.y} r="7" fill="none" stroke="#38BDF8" strokeWidth="1.6">
            <animate attributeName="r" values="6;22" begin="0.75s" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0" begin="0.75s" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Animated Entry Arrow Pulses pointing into the Selected Gate */}
          <line
            x1={activeGateCoord.walkFrom[0]}
            y1={activeGateCoord.walkFrom[1]}
            x2={activeGateCoord.x}
            y2={activeGateCoord.y}
            stroke="#1A63EB"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.85"
          >
            <animate attributeName="stroke-dashoffset" values="16;0" dur="0.9s" repeatCount="indefinite" />
          </line>

          {/* Moving Blue Glow Dot gliding cleanly into the gate */}
          <motion.circle
            r="4.2"
            fill="#1A63EB"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            initial={{ cx: activeGateCoord.walkFrom[0], cy: activeGateCoord.walkFrom[1], opacity: 0 }}
            animate={{
              cx: [activeGateCoord.walkFrom[0], activeGateCoord.x],
              cy: [activeGateCoord.walkFrom[1], activeGateCoord.y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.4,
              times: [0, 0.15, 0.85, 1],
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </g>

        {/* 3 Clickable Gate Pins Directly on the Overview Map */}
        {BUILDING_B_GATE_LIST.map((gate) => {
          const pt = gateCoords[gate.id];
          const isActive = selectedGate === gate.id;
          const isRec = recommendedGate === gate.id;
          return (
            <g
              key={`overview-gate-${gate.id}`}
              onClick={() => onSelectGate(gate.id)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 7.5 : 5.5}
                fill={isActive ? '#1A63EB' : isRec ? '#10B981' : '#FFFFFF'}
                stroke={isActive ? '#FFFFFF' : '#334155'}
                strokeWidth="2"
              />
              <rect
                x={pt.x - 21}
                y={pt.y + (gate.id === 'gate3_north_east' ? -24 : 11)}
                width="42"
                height="15"
                rx="7.5"
                fill={isActive ? '#1A63EB' : '#FFFFFF'}
                stroke={isActive ? '#1D4ED8' : '#CBD5E1'}
                strokeWidth="1.2"
              />
              <text
                x={pt.x}
                y={pt.y + (gate.id === 'gate3_north_east' ? -13.5 : 21.5)}
                fill={isActive ? '#FFFFFF' : '#1E293B'}
                fontSize="8.2"
                fontWeight="800"
                textAnchor="middle"
              >
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Step 2 Animation: Seamless monolithic stick-figure climbing 3D-shaded stairs.
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
    <div className="relative w-full flex-1 min-h-[240px] sm:flex-none sm:h-48 rounded-[24px] overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#E8F2FF] to-[#DCEBFF] border border-blue-200/70 shadow-inner flex items-center justify-center p-2">
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

        {/* Destination Beacon Pin on Top Landing (outer static translate, inner bounce) */}
        <g transform="translate(242, 46)">
          <ellipse cx="0" cy="6" rx="7" ry="2.2" fill="#1E3A8A" opacity="0.22" />
          <motion.g
            animate={{ y: [0, -3.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M 0,4 C -6,-3 -9,-8 -9,-12 C -9,-17 -5,-21 0,-21 C 5,-21 9,-17 9,-12 C 9,-8 6,-3 0,4 Z"
              fill="#EF4444"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />
            <circle cx="0" cy="-12" r="3" fill="#FFFFFF" />
          </motion.g>
        </g>

        {/* Seamless Monolithic Stick-Figure Climber (Apple Pictogram style, locked joints) */}
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
          {/* Contact shadow beneath feet */}
          <ellipse cx="1" cy="1" rx="10" ry="2.4" fill="#0F172A" opacity="0.22" />

          {/* Back Leg — anchored strictly at Hip (0, -21) */}
          <g transform="translate(0, -21)">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="30 0 0;-30 0 0;30 0 0;-30 0 0;30 0 0"
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                dur={`${cycle}s`}
                repeatCount="indefinite"
              />
              <path
                d="M 0 0 L 4 10 L 0 20"
                fill="none"
                stroke="#334155"
                strokeWidth="5.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Back Arm — anchored strictly at Shoulder (3, -38) */}
          <g transform="translate(3, -38)">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-32 0 0;30 0 0;-32 0 0;30 0 0;-32 0 0"
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                dur={`${cycle}s`}
                repeatCount="indefinite"
              />
              <path
                d="M 0 0 L 3 9 L 9 14"
                fill="none"
                stroke="#334155"
                strokeWidth="4.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Unified Seamless Torso connecting Hip (0, -21) to Shoulder (3, -38) */}
          <path
            d="M 0 -21 L 3 -38"
            fill="none"
            stroke="#0F172A"
            strokeWidth="7.4"
            strokeLinecap="round"
          />

          {/* Front Leg — anchored strictly at Hip (0, -21) */}
          <g transform="translate(0, -21)">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-32 0 0;28 0 0;-32 0 0;28 0 0;-32 0 0"
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                dur={`${cycle}s`}
                repeatCount="indefinite"
              />
              <path
                d="M 0 0 L 5 10 L 1 20"
                fill="none"
                stroke="#0F172A"
                strokeWidth="5.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Front Arm — anchored strictly at Shoulder (3, -38) */}
          <g transform="translate(3, -38)">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="32 0 0;-30 0 0;32 0 0;-30 0 0;32 0 0"
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                dur={`${cycle}s`}
                repeatCount="indefinite"
              />
              <path
                d="M 0 0 L 3 9 L 9 14"
                fill="none"
                stroke="#0F172A"
                strokeWidth="4.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Clean Solid Head aligned above Shoulder */}
          <circle cx="5.2" cy="-49.5" r="6.2" fill="#0F172A" />
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
  const [wizardStep, setWizardStep] = useState<'select_gate' | 'climb_floor'>('select_gate');

  // Always start at Step 1 (Overview map + Gate picker) whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedGate(recommendedGateId);
      setWizardStep('select_gate');
    }
  }, [isOpen, recommendedGateId]);

  const selectedGateInfo = BUILDING_B_GATES[selectedGate];
  const isDifferentWing = Boolean(
    roomBInfo && selectedGateInfo.primaryPart !== roomBInfo.part
  );
  const targetPart: BuildingPart = roomBInfo?.part ?? 'part1';

  return (
    <AnimatePresence>
      {isOpen && targetRoom && (
        <motion.div
          key="floor-climb-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: IOS_EASE }}
          className="fixed inset-0 z-50 bg-white sm:bg-slate-900/50 sm:backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 sm:p-4"
          onClick={onCancel}
        >
          <motion.div
            key="floor-climb-card"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ duration: 0.36, ease: IOS_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[100dvh] sm:h-auto sm:max-w-[420px] sm:max-h-[92dvh] overflow-y-auto bg-white sm:bg-white/98 sm:backdrop-blur-xl rounded-none sm:rounded-[30px] px-5 pt-6 pb-8 sm:p-5 sm:shadow-[0_24px_60px_rgba(15,23,42,0.28)] sm:border sm:border-white/90 text-center flex flex-col"
          >
            {/* Step Indicator Dots (only shown when upper floor requires 2 steps) */}
            {isUpperFloor && (
              <div className="flex items-center justify-center gap-1.5 mb-4 sm:mb-3 shrink-0">
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    wizardStep === 'select_gate' ? 'w-6 bg-[#1A63EB]' : 'w-2 bg-blue-200'
                  }`}
                />
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    wizardStep === 'climb_floor' ? 'w-6 bg-[#1A63EB]' : 'w-2 bg-slate-200'
                  }`}
                />
              </div>
            )}

            {/* Smooth iOS Horizontal Step Transition */}
            <AnimatePresence mode="wait" initial={false}>
              {wizardStep === 'select_gate' ? (
                <motion.div
                  key="step-select-gate"
                  initial={{ x: -28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -28, opacity: 0 }}
                  transition={{ duration: 0.24, ease: IOS_EASE }}
                  className="flex-1 flex flex-col justify-between gap-4 sm:gap-3.5"
                >
                  {/* Full L-Shape Building B Overview Map with Animated Gate Entry */}
                  <BuildingBOverviewGateStage
                    selectedGate={selectedGate}
                    recommendedGate={recommendedGateId}
                    targetPart={targetPart}
                    targetRoomCode={targetRoom.code}
                    onSelectGate={setSelectedGate}
                  />

                  {/* Concise Title */}
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold tracking-wide border border-blue-100">
                      {targetRoom.code}
                      {roomBInfo
                        ? ` • ${roomBInfo.partLabel.replace(/^Phần \d+\s*\((.+)\)$/, '$1')}`
                        : ''}
                    </span>
                    <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-snug">
                      Chọn cổng bạn vào
                    </h2>
                  </div>

                  {/* Compact 3-Column Gate Picker */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {BUILDING_B_GATE_LIST.map((gate) => {
                      const isActive = selectedGate === gate.id;
                      const isRecommended = recommendedGateId === gate.id;
                      const shortDesc =
                        gate.id === 'gate1_parking'
                          ? 'Gần nhà xe'
                          : gate.id === 'gate2_north_south'
                          ? 'Bắc – Nam'
                          : 'Bắc – Đông';
                      return (
                        <button
                          key={gate.id}
                          type="button"
                          onClick={() => setSelectedGate(gate.id)}
                          className={`relative px-2 py-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 border-[#1A63EB] ring-2 ring-blue-500/15'
                              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                          }`}
                        >
                          {isRecommended && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold whitespace-nowrap shadow-xs">
                              Gần nhất
                            </span>
                          )}
                          <div
                            className={`text-xs font-extrabold ${
                              isActive ? 'text-[#1A63EB]' : 'text-slate-900'
                            }`}
                          >
                            {gate.shortLabel}
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                            {shortDesc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Step 1 Primary CTA */}
                  <div className="space-y-1.5 pt-0.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => {
                        if (isUpperFloor) {
                          setWizardStep('climb_floor');
                        } else {
                          onConfirmArrivedFloor(selectedGate);
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-full bg-[#1A63EB] hover:bg-[#1554CC] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(26,99,235,0.35)] transition-colors cursor-pointer"
                    >
                      {isUpperFloor ? (
                        <>
                          <span>Tiếp tục • Lên Tầng {targetFloor}</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                          <span>Mở bản đồ 2D</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      onClick={onCancel}
                      className="w-full py-2 rounded-full text-slate-500 hover:text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Quay lại</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-climb-floor"
                  initial={{ x: 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 28, opacity: 0 }}
                  transition={{ duration: 0.24, ease: IOS_EASE }}
                  className="flex-1 flex flex-col justify-between gap-4 sm:gap-3.5"
                >
                  {/* Live Seamless Stick-Figure Climbing Stairs Animation */}
                  <ClimbingStairsAnimation targetFloor={targetFloor} />

                  {/* Minimal Floor Climb Header */}
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold tracking-wide border border-blue-100">
                      {selectedGateInfo.shortLabel} • Cầu thang {selectedGateInfo.stairsCode}
                    </span>
                    <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-snug">
                      Lên Tầng {targetFloor}
                    </h2>
                  </div>

                  {/* Single-line cross-wing hint only when entering a different wing */}
                  {isDifferentWing && roomBInfo && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" strokeWidth={1.8} />
                      <span>Khác cánh • Sẽ mở sơ đồ tổng thể 3 khối</span>
                    </div>
                  )}

                  {/* Step 2 Action Buttons */}
                  <div className="space-y-1.5 pt-0.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => onConfirmArrivedFloor(selectedGate)}
                      className="w-full py-3.5 px-4 rounded-full bg-[#1A63EB] hover:bg-[#1554CC] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_rgba(26,99,235,0.35)] transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      <span>Đã lên Tầng {targetFloor} • Mở 2D</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setWizardStep('select_gate')}
                      className="w-full py-2 rounded-full text-slate-500 hover:text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Đổi cổng</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
