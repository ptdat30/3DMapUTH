'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  BuildingFloor,
  BuildingPart,
  BuildingBGateId,
  BUILDING_B_GATES,
  BUILDING_B_GATE_LIST,
  getRecommendedGateForPart,
  RoomBInfo,
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
  Layers,
  ChevronDown,
  ChevronUp,
  Crosshair,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Clock,
  Footprints,
  Navigation,
  MapPin,
  Image as ImageIcon,
  Map as MapIcon,
  Check,
  RotateCcw,
  DoorOpen,
} from 'lucide-react';

export interface BuildingB2DNavigatorProps {
  onClose?: () => void;
  initialRoomCode?: string;
  initialEntryGate?: BuildingBGateId;
}

type ViewMode = 'vector' | 'image';
type ActivePartSelection = BuildingPart | 'master';
type StartPointOption = 'nearest_stairs' | 'ground_gate';

interface Point {
  x: number;
  y: number;
}

interface TurnInstruction {
  direction: 'right' | 'left' | 'straight';
  actionText: string;
}

// ============================================================================
// Step-by-step logic plan:
// 1. Mobile-first full-bleed 100dvh indoor map canvas styled like Apple/Google Maps
//    with soft icy-blue campus grid, subtle 2.5D tilted floorplan (-7deg toggleable),
//    vibrant blue GPS route line, animated heading puck, and red teardrop destination pin.
// 2. Floating top turn-by-turn pill card (distance + target room + close button),
//    tapping opens instant room search across all 4 floors & 3 parts.
// 3. Floating top-left Floor & Part pill selector + right-side floating circular buttons
//    (Compass tilt toggle, GPS recenter, Search).
// 4. Floating bottom sheet card with turn arrow, distance/ETA metrics, full-width
//    "Tiếp tục dẫn đường" primary CTA button, and expandable step-by-step drawer.
// ============================================================================

export function BuildingB2DNavigator({
  onClose,
  initialRoomCode = 'B.003',
  initialEntryGate,
}: BuildingB2DNavigatorProps) {
  // Resolve initial destination room (defaults to B.003 to match mobile mockup)
  const initialRoom = useMemo<RoomBInfo>(() => {
    const found = Object.values(TOA_B_ROOMS).find(
      (r) => r.code.toLowerCase() === initialRoomCode.toLowerCase()
    );
    return found || TOA_B_ROOMS['b_003'];
  }, [initialRoomCode]);

  const resolvedInitialGate: BuildingBGateId =
    initialEntryGate ?? getRecommendedGateForPart(initialRoom.part);
  const startsInDifferentWing =
    BUILDING_B_GATES[resolvedInitialGate].primaryPart !== initialRoom.part;

  // Core navigation state
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoom.id);
  const [currentFloor, setCurrentFloor] = useState<BuildingFloor>(initialRoom.floor);
  const [entryGate, setEntryGate] = useState<BuildingBGateId>(resolvedInitialGate);
  const [activePart, setActivePart] = useState<ActivePartSelection>(
    startsInDifferentWing ? 'master' : initialRoom.part
  );
  const [viewMode, setViewMode] = useState<ViewMode>('vector');
  const [startPoint, setStartPoint] = useState<StartPointOption>('nearest_stairs');

  // UI overlays & sheet states
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map camera state (pan, zoom, straight 0deg alignment by default)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isTilted, setIsTilted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });

  // Walking navigation simulation (0 = start puck in corridor, 1 = arrived at door)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.18);
  const animFrameRef = useRef<number | null>(null);

  const selectedRoom: RoomBInfo = useMemo(() => {
    return TOA_B_ROOMS[selectedRoomId] || initialRoom;
  }, [selectedRoomId, initialRoom]);

  // Rooms visible on the active floor & part
  const currentPartRooms = useMemo(() => {
    return Object.values(TOA_B_ROOMS).filter((room) => {
      const matchFloor = room.floor === currentFloor;
      const matchPart = activePart === 'master' ? true : room.part === activePart;
      return matchFloor && matchPart;
    });
  }, [currentFloor, activePart]);

  // Search results (instant across all floors/parts)
  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return Object.values(TOA_B_ROOMS).filter((r) => r.floor === currentFloor);
    }
    return searchRooms(trimmed).slice(0, 16);
  }, [searchQuery, currentFloor]);

  const entryGateInfo = BUILDING_B_GATES[entryGate];
  const isCrossWing = entryGateInfo.primaryPart !== selectedRoom.part;

  // Select any room -> auto-sync floor, auto-open L-shape master if cross-wing
  const handleSelectRoom = useCallback(
    (room: RoomBInfo) => {
      setSelectedRoomId(room.id);
      setCurrentFloor(room.floor);
      const differentWing = BUILDING_B_GATES[entryGate].primaryPart !== room.part;
      setActivePart(differentWing ? 'master' : room.part);
      setIsSearchOpen(false);
      setIsFloorMenuOpen(false);
      setSearchQuery('');
      setPan({ x: 0, y: 0 });
      setZoom(1);
      setSimProgress(0.12);
      setIsPlaying(false);
    },
    [entryGate]
  );

  // Switch entry gate (Cổng 1 / Cổng 2 / Cổng 3) -> auto-switch between Master L-shape & wing zoom
  const handleSwitchEntryGate = useCallback(
    (nextGate: BuildingBGateId) => {
      setEntryGate(nextGate);
      const differentWing = BUILDING_B_GATES[nextGate].primaryPart !== selectedRoom.part;
      setActivePart(differentWing ? 'master' : selectedRoom.part);
      setPan({ x: 0, y: 0 });
      setZoom(1);
      setSimProgress(0.1);
      setIsPlaying(false);
    },
    [selectedRoom.part]
  );

  // Compute navigation waypoints in the active viewBox
  const routeWaypoints: Point[] = useMemo(() => {
    if (activePart === 'master') {
      const door = selectedRoom.masterCoords.door;
      const gatePt = BUILDING_B_GATES[entryGate].masterPoint;
      const spineY = 234;
      const eastSpineX = 840;

      // Cross-wing & same-wing L-shape corridor routing on Master Overview
      if (selectedRoom.part === 'part3') {
        if (entryGate === 'gate3_north_east') {
          return [
            { x: gatePt.x, y: gatePt.y },
            { x: eastSpineX, y: door.y },
            { x: door.x, y: door.y },
          ];
        }
        return [
          { x: gatePt.x, y: spineY },
          { x: eastSpineX, y: spineY },
          { x: eastSpineX, y: door.y },
          { x: door.x, y: door.y },
        ];
      }

      if (entryGate === 'gate3_north_east') {
        return [
          { x: gatePt.x, y: gatePt.y },
          { x: eastSpineX, y: spineY },
          { x: door.x, y: spineY },
          { x: door.x, y: door.y },
        ];
      }

      return [
        { x: gatePt.x, y: spineY },
        { x: door.x, y: spineY },
        { x: door.x, y: door.y },
      ];
    }

    const door = selectedRoom.partCoords.door;
    const corridorY = 266;

    if (activePart === 'part1') {
      const startX = 435; // CT1
      return [
        { x: startX, y: 222 },
        { x: startX, y: corridorY },
        { x: door.x, y: corridorY },
        { x: door.x, y: door.y - 10 },
      ];
    }

    if (activePart === 'part2') {
      const startX = 140; // CT2
      if (selectedRoom.category === 'restroom') {
        return [
          { x: startX, y: 230 },
          { x: startX, y: 155 },
          { x: door.x, y: door.y },
        ];
      }
      return [
        { x: startX, y: 230 },
        { x: startX, y: corridorY },
        { x: door.x, y: corridorY },
        { x: door.x, y: door.y - 10 },
      ];
    }

    // part3
    const startX = selectedRoom.nearestStairs === 'CT4' ? 990 : 110;
    return [
      { x: startX, y: 230 },
      { x: startX, y: corridorY },
      { x: door.x, y: corridorY },
      { x: door.x, y: door.y - 10 },
    ];
  }, [activePart, selectedRoom, entryGate]);

  // SVG path d string for active remaining route
  const routeSvgPath = useMemo(() => {
    if (routeWaypoints.length === 0) return '';
    return routeWaypoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [routeWaypoints]);

  // Compute user puck position & heading angle along route
  const puckState = useMemo(() => {
    if (routeWaypoints.length < 2) {
      return { x: routeWaypoints[0]?.x ?? 0, y: routeWaypoints[0]?.y ?? 0, angle: 0 };
    }

    const lengths: number[] = [];
    let totalLength = 0;
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const len = Math.hypot(
        routeWaypoints[i + 1].x - routeWaypoints[i].x,
        routeWaypoints[i + 1].y - routeWaypoints[i].y
      );
      lengths.push(len);
      totalLength += len;
    }

    if (totalLength === 0) {
      return { x: routeWaypoints[0].x, y: routeWaypoints[0].y, angle: 0 };
    }

    const targetDist = simProgress * totalLength;
    let accumulated = 0;

    for (let i = 0; i < lengths.length; i++) {
      const segLen = lengths[i];
      if (accumulated + segLen >= targetDist || i === lengths.length - 1) {
        const ratio = segLen > 0 ? Math.max(0, Math.min(1, (targetDist - accumulated) / segLen)) : 0;
        const p1 = routeWaypoints[i];
        const p2 = routeWaypoints[i + 1];
        const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI + 90;
        return {
          x: p1.x + (p2.x - p1.x) * ratio,
          y: p1.y + (p2.y - p1.y) * ratio,
          angle,
        };
      }
      accumulated += segLen;
    }

    const last = routeWaypoints[routeWaypoints.length - 1];
    return { x: last.x, y: last.y, angle: 0 };
  }, [routeWaypoints, simProgress]);

  // Turn instruction matching corridor direction (supports cross-wing L-shape routing)
  const turnInstruction: TurnInstruction = useMemo(() => {
    if (isCrossWing && activePart === 'master') {
      return {
        direction: 'straight',
        actionText: `Từ ${entryGateInfo.shortLabel} đi xuyên hành lang sang ${selectedRoom.partLabel} tới`,
      };
    }
    if (selectedRoom.category === 'stairs') {
      return { direction: 'straight', actionText: 'Đi thẳng đến' };
    }
    const startX = routeWaypoints[0]?.x ?? 0;
    const doorX = selectedRoom.partCoords.door.x;
    if (doorX < startX) {
      return { direction: 'left', actionText: 'Rẽ trái vào' };
    }
    return { direction: 'right', actionText: 'Rẽ phải vào' };
  }, [routeWaypoints, selectedRoom, isCrossWing, activePart, entryGateInfo.shortLabel]);

  // Dynamic remaining distance & ETA based on simulation progress (adds cross-wing corridor length)
  const remainingMeters = useMemo(() => {
    const crossWingExtra = isCrossWing ? 36 : 0;
    const base = Math.max(selectedRoom.estimatedDistanceMeters, 10) + crossWingExtra;
    return Math.max(0, Math.round(base * (1 - simProgress * 0.85)));
  }, [selectedRoom.estimatedDistanceMeters, simProgress, isCrossWing]);

  const etaMinutes = useMemo(() => {
    const crossWingExtraSec = isCrossWing ? 42 : 0;
    const remainingSeconds =
      (selectedRoom.walkingSeconds + crossWingExtraSec) * (1 - simProgress * 0.85);
    return Math.max(1, Math.ceil(remainingSeconds / 60));
  }, [selectedRoom.walkingSeconds, simProgress, isCrossWing]);

  // Animation loop for "Tiếp tục dẫn đường"
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const durationMs = 4500;

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      setSimProgress((prev) => {
        const next = prev + dt / durationMs;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Unified pointer pan handlers (supports both touch drag on mobile & mouse drag on desktop)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setZoom((prev) => Math.max(0.7, Math.min(2.4, prev + delta)));
  };

  const handleRecenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrimaryNavigationCta = () => {
    if (simProgress >= 0.99) {
      setSimProgress(0.05);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const currentViewBox = useMemo(() => {
    if (activePart === 'master') return '0 0 1024 586';
    if (activePart === 'part1') return '0 0 1020 320';
    if (activePart === 'part2') return '0 0 1060 330';
    return '0 0 1110 330';
  }, [activePart]);

  const currentOriginalImage = useMemo(() => {
    if (activePart === 'master') return MASTER_FLOOR_IMAGE;
    return PART_IMAGE_MAP[currentFloor][activePart];
  }, [activePart, currentFloor]);

  const renderTurnIcon = (className: string) => {
    if (turnInstruction.direction === 'left') {
      return <CornerUpLeft className={className} strokeWidth={2.2} />;
    }
    if (turnInstruction.direction === 'straight') {
      return <ArrowUp className={className} strokeWidth={2.2} />;
    }
    return <CornerUpRight className={className} strokeWidth={2.2} />;
  };

  const destinationLabel =
    selectedRoom.category === 'classroom'
      ? `Phòng ${selectedRoom.code}`
      : `${selectedRoom.code} • ${selectedRoom.name}`;

  const activeSteps =
    startPoint === 'ground_gate'
      ? selectedRoom.directions.fromGroundGate
      : selectedRoom.directions.fromNearestStairs;

  return (
    <div className="relative w-full h-[100dvh] sm:h-full overflow-hidden bg-[#E9EFF6] text-slate-900 select-none font-sans">
      {/* =====================================================================
          LAYER 0: INTERACTIVE CAMPUS & INDOOR 2.5D MAP CANVAS (FULL BLEED)
          ===================================================================== */}
      <div
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={() => {
          if (isFloorMenuOpen) setIsFloorMenuOpen(false);
        }}
        style={{
          background:
            'linear-gradient(160deg, #EBF3FB 0%, #D5E9FA 26%, #EAF0F7 52%, #E2E9F2 100%)',
        }}
      >
        {/* Subtle Surrounding Campus Architectural Grid & Roads (Matches Mobile Reference) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
          viewBox="0 0 430 932"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Upper soft sky-blue campus court zone (straight horizontal alignment) */}
          <rect x="0" y="0" width="430" height="270" fill="#CDE5FA" opacity="0.55" />

          {/* Surrounding building blocks & campus walkways aligned straight (0deg) */}
          <g>
            {/* Campus roads/paths (white strips) */}
            <rect x="-80" y="345" width="600" height="36" fill="#F8FAFC" opacity="0.9" />
            <rect x="-80" y="515" width="600" height="44" fill="#F8FAFC" opacity="0.92" />
            <rect x="330" y="200" width="26" height="650" fill="#F8FAFC" opacity="0.85" />
            <rect x="65" y="515" width="22" height="360" fill="#F8FAFC" opacity="0.85" />

            {/* Subtle 3D surrounding campus buildings */}
            <rect
              x="-20"
              y="565"
              width="80"
              height="160"
              rx="4"
              fill="#DCE5F0"
              stroke="#CBD6E4"
              strokeWidth="2"
            />
            <rect
              x="95"
              y="565"
              width="225"
              height="155"
              rx="4"
              fill="#DFE7F2"
              stroke="#CBD6E4"
              strokeWidth="2"
            />
            <rect
              x="365"
              y="565"
              width="120"
              height="155"
              rx="4"
              fill="#DCE5F0"
              stroke="#CBD6E4"
              strokeWidth="2"
            />
            <rect
              x="345"
              y="320"
              width="135"
              height="190"
              rx="4"
              fill="#E5ECF5"
              stroke="#CBD6E4"
              strokeWidth="2"
            />
            <rect
              x="95"
              y="735"
              width="225"
              height="130"
              rx="4"
              fill="#D9E3EE"
              stroke="#CBD6E4"
              strokeWidth="2"
            />
          </g>
        </svg>

        {/* Centered Interactive Floorplan Plane with Zoom, Pan & Compass Tilt */}
        <div
          className="w-full h-full flex items-center justify-center px-3 pb-16 pt-12"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {viewMode === 'vector' ? (
            <div
              className="w-full max-w-[920px] flex items-center justify-center transition-transform duration-300"
              style={{
                transform: isTilted && activePart !== 'master' ? 'rotate(-7deg)' : 'rotate(0deg)',
              }}
            >
              <svg
                viewBox={currentViewBox}
                className="w-full h-auto max-h-[54vh] overflow-visible"
                style={{
                  filter: 'drop-shadow(0 14px 22px rgba(30, 41, 59, 0.22))',
                }}
              >
                <defs>
                  {/* Dark charcoal stair treads matching screenshot */}
                  <pattern
                    id="mobileStairTreads"
                    width="100%"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="120" height="12" fill="#1C222A" />
                    <line
                      x1="14"
                      y1="6"
                      x2="96"
                      y2="6"
                      stroke="#E2E8F0"
                      strokeWidth="1.6"
                      opacity="0.82"
                    />
                  </pattern>

                  {/* Soft blue route glow */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="3"
                      floodColor="#1A63EB"
                      floodOpacity="0.35"
                    />
                  </filter>

                  {/* Destination red pin drop shadow */}
                  <filter id="pinShadow" x="-40%" y="-20%" width="180%" height="180%">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="3"
                      floodColor="#0F172A"
                      floodOpacity="0.32"
                    />
                  </filter>
                </defs>

                {activePart !== 'master' ? (
                  <g id="indoorPartBlueprint">
                    {/* 2.5D Outer Building Wall Base / Extrusion */}
                    <rect
                      x="22"
                      y="24"
                      width={
                        activePart === 'part1'
                          ? 988
                          : activePart === 'part2'
                          ? 1028
                          : 1078
                      }
                      height="278"
                      rx="4"
                      fill="#475569"
                    />

                    {/* Crisp White Corridor Floor */}
                    <rect
                      x="26"
                      y="22"
                      width={
                        activePart === 'part1'
                          ? 980
                          : activePart === 'part2'
                          ? 1020
                          : 1070
                      }
                      height="274"
                      rx="3"
                      fill="#FFFFFF"
                      stroke="#334155"
                      strokeWidth="3.5"
                    />

                    {/* Render All Rooms on Current Part */}
                    {currentPartRooms.map((room) => {
                      const isSelected = room.id === selectedRoomId;
                      const { x, y, width, height, door } = room.partCoords;
                      const isStairs = room.category === 'stairs';
                      const isWc = room.category === 'restroom';

                      const fillColor = isStairs
                        ? '#1C222A'
                        : isSelected
                        ? '#B8DFFF'
                        : isWc
                        ? '#D1E4EE'
                        : '#CFDCEB';

                      return (
                        <g
                          key={room.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRoom(room);
                          }}
                          className="cursor-pointer"
                        >
                          {/* Room Footprint */}
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fillColor}
                            stroke={isSelected ? '#2563EB' : '#475569'}
                            strokeWidth={isSelected ? 3.5 : 2.5}
                            className="transition-colors duration-200"
                          />

                          {/* Crisp ISO Staircase Icon + Label (CT1..CT4) */}
                          {isStairs && (
                            <g
                              transform={`translate(${x + width / 2}, ${y + height / 2 - 4})`}
                              pointerEvents="none"
                            >
                              {/* Soft rounded dark badge frame */}
                              <rect
                                x="-34"
                                y="-34"
                                width="68"
                                height="68"
                                rx="14"
                                fill="#2B3441"
                                stroke="#475569"
                                strokeWidth="1.5"
                              />
                              {/* Ascending 4-step staircase silhouette */}
                              <path
                                d="M -22 20 L -11 20 L -11 9 L 0 9 L 0 -2 L 11 -2 L 11 -13 L 22 -13"
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {/* Diagonal handrail / up-down direction arrow */}
                              <line
                                x1="-18"
                                y1="2"
                                x2="-2"
                                y2="-14"
                                stroke="#93C5FD"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                              />
                              <polyline
                                points="-10,-14 -2,-14 -2,-6"
                                fill="none"
                                stroke="#93C5FD"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {/* Clear staircase code label below icon */}
                              <text
                                x="0"
                                y="52"
                                fill="#E2E8F0"
                                fontSize="13"
                                fontWeight="800"
                                textAnchor="middle"
                              >
                                {room.code}
                              </text>
                            </g>
                          )}

                          {/* Door Opening Cutout on Corridor Wall */}
                          <line
                            x1={door.x - 18}
                            y1={door.y}
                            x2={door.x + 18}
                            y2={door.y}
                            stroke="#FFFFFF"
                            strokeWidth="6"
                          />

                          {/* Room Typography */}
                          {!isStairs && (
                            <g pointerEvents="none">
                              <text
                                x={x + width / 2}
                                y={
                                  width > 240
                                    ? y + height / 2 - 14
                                    : y + height / 2 + 6
                                }
                                fill="#1E293B"
                                fontSize={width > 240 ? '20' : '21'}
                                fontWeight="800"
                                textAnchor="middle"
                                style={{ letterSpacing: '-0.01em' }}
                              >
                                {room.code}
                              </text>
                              {width > 240 && (
                                <>
                                  <text
                                    x={x + width / 2}
                                    y={y + height / 2 + 12}
                                    fill="#334155"
                                    fontSize="13.5"
                                    fontWeight="700"
                                    textAnchor="middle"
                                  >
                                    {room.name.toUpperCase().slice(0, 26)}
                                  </text>
                                  {room.name.length > 26 && (
                                    <text
                                      x={x + width / 2}
                                      y={y + height / 2 + 30}
                                      fill="#334155"
                                      fontSize="13.5"
                                      fontWeight="700"
                                      textAnchor="middle"
                                    >
                                      {room.name.toUpperCase().slice(26).trim()}
                                    </text>
                                  )}
                                </>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {selectedRoom.part === activePart && selectedRoom.floor === currentFloor && (
                      <>
                        {/* Vibrant Highlight Halo on Selected Room */}
                        <rect
                          x={selectedRoom.partCoords.x - 3}
                          y={selectedRoom.partCoords.y - 3}
                          width={selectedRoom.partCoords.width + 6}
                          height={selectedRoom.partCoords.height + 6}
                          rx="4"
                          fill="none"
                          stroke="#1A63EB"
                          strokeWidth="4.5"
                          filter="url(#routeGlow)"
                          pointerEvents="none"
                        />

                        {/* Classic Red Teardrop Destination Map Pin floating above Target Room */}
                        <g
                          transform={`translate(${
                            selectedRoom.partCoords.x + selectedRoom.partCoords.width / 2
                          }, ${selectedRoom.partCoords.y + 42})`}
                          filter="url(#pinShadow)"
                          pointerEvents="none"
                        >
                          <ellipse cx="0" cy="4" rx="10" ry="3.5" fill="#0F172A" opacity="0.22" />
                          <path
                            d="M 0,2 C -14,-14 -20,-26 -20,-36 C -20,-47 -11,-56 0,-56 C 11,-56 20,-47 20,-36 C 20,-26 14,-14 0,2 Z"
                            fill="#EA4335"
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                          />
                          <circle cx="0" cy="-36" r="7" fill="#FFFFFF" />
                        </g>
                      </>
                    )}
                  </g>
                ) : (
                  /* Master 3-Part Overview (Full L-Shape Cross-Wing Wayfinding) */
                  <g id="masterOverview">
                    <rect
                      x="0"
                      y="0"
                      width="1024"
                      height="586"
                      rx="18"
                      fill="#F8FAFC"
                      stroke="#CBD5E1"
                      strokeWidth="3"
                    />

                    {/* Continuous L-Shape White Connecting Corridor Strip */}
                    <path
                      d="M 40 220 L 855 220 L 855 560 L 826 560 L 826 248 L 40 248 Z"
                      fill="#FFFFFF"
                      stroke="#94A3B8"
                      strokeWidth="2"
                    />

                    <g onClick={() => setActivePart('part1')} className="cursor-pointer">
                      <rect
                        x="20"
                        y="100"
                        width="445"
                        height="120"
                        rx="10"
                        fill={selectedRoom.part === 'part1' ? '#DBEAFE' : '#CFDCEB'}
                        stroke={selectedRoom.part === 'part1' ? '#1A63EB' : '#475569'}
                        strokeWidth="3.5"
                      />
                      <text x="242" y="154" fill="#1E293B" fontSize="22" fontWeight="800" textAnchor="middle">
                        PHẦN 1 (KHỐI NAM)
                      </text>
                      <text x="242" y="184" fill="#475569" fontSize="14" fontWeight="600" textAnchor="middle">
                        CT1 • Phòng .001 – .003
                      </text>
                    </g>

                    <g onClick={() => setActivePart('part2')} className="cursor-pointer">
                      <rect
                        x="475"
                        y="30"
                        width="355"
                        height="190"
                        rx="10"
                        fill={selectedRoom.part === 'part2' ? '#DBEAFE' : '#CFDCEB'}
                        stroke={selectedRoom.part === 'part2' ? '#1A63EB' : '#475569'}
                        strokeWidth="3.5"
                      />
                      <text x="652" y="116" fill="#1E293B" fontSize="22" fontWeight="800" textAnchor="middle">
                        PHẦN 2 (KHỐI BẮC)
                      </text>
                      <text x="652" y="146" fill="#475569" fontSize="14" fontWeight="600" textAnchor="middle">
                        WC • CT2 • Phòng .004 – .007
                      </text>
                    </g>

                    <g onClick={() => setActivePart('part3')} className="cursor-pointer">
                      <rect
                        x="855"
                        y="30"
                        width="150"
                        height="535"
                        rx="10"
                        fill={selectedRoom.part === 'part3' ? '#DBEAFE' : '#CFDCEB'}
                        stroke={selectedRoom.part === 'part3' ? '#1A63EB' : '#475569'}
                        strokeWidth="3.5"
                      />
                      <text x="930" y="280" fill="#1E293B" fontSize="20" fontWeight="800" textAnchor="middle">
                        PHẦN 3
                      </text>
                      <text x="930" y="308" fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
                        Cánh Đông
                      </text>
                      <text x="930" y="330" fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
                        CT3–CT4 • .008–.011
                      </text>
                    </g>

                    {/* Clickable 3 Entrance Gate Markers (Cổng 1, Cổng 2, Cổng 3) */}
                    {BUILDING_B_GATE_LIST.map((gate) => {
                      const isCurrentGate = entryGate === gate.id;
                      const badgeY =
                        gate.id === 'gate3_north_east'
                          ? gate.masterPoint.y + 42
                          : gate.masterPoint.y + 38;
                      return (
                        <g
                          key={`master-gate-${gate.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchEntryGate(gate.id);
                          }}
                          className="cursor-pointer"
                        >
                          <line
                            x1={gate.masterPoint.x}
                            y1={gate.masterPoint.y}
                            x2={gate.masterPoint.x}
                            y2={badgeY - 12}
                            stroke={isCurrentGate ? '#1A63EB' : '#94A3B8'}
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                          />
                          <circle
                            cx={gate.masterPoint.x}
                            cy={gate.masterPoint.y}
                            r="7"
                            fill={isCurrentGate ? '#1A63EB' : '#FFFFFF'}
                            stroke={isCurrentGate ? '#FFFFFF' : '#64748B'}
                            strokeWidth="2.5"
                          />
                          <rect
                            x={gate.masterPoint.x - 66}
                            y={badgeY - 12}
                            width="132"
                            height="30"
                            rx="15"
                            fill={isCurrentGate ? '#1A63EB' : '#FFFFFF'}
                            stroke={isCurrentGate ? '#1D4ED8' : '#CBD5E1'}
                            strokeWidth="2"
                          />
                          <text
                            x={gate.masterPoint.x}
                            y={badgeY + 7}
                            fill={isCurrentGate ? '#FFFFFF' : '#334155'}
                            fontSize="12"
                            fontWeight="800"
                            textAnchor="middle"
                          >
                            {isCurrentGate ? `● ${gate.shortLabel} (${gate.stairsCode})` : `${gate.shortLabel} (${gate.stairsCode})`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Highlighted Target Room Box on Master Overview */}
                    <rect
                      x={selectedRoom.masterCoords.x}
                      y={selectedRoom.masterCoords.y}
                      width={selectedRoom.masterCoords.width}
                      height={selectedRoom.masterCoords.height}
                      rx="6"
                      fill="#93C5FD"
                      stroke="#1A63EB"
                      strokeWidth="3.5"
                      filter="url(#routeGlow)"
                      pointerEvents="none"
                    />

                    {/* Red Pin at Selected Room on Master Plan */}
                    <g
                      transform={`translate(${selectedRoom.masterCoords.door.x}, ${selectedRoom.masterCoords.door.y})`}
                      filter="url(#pinShadow)"
                      pointerEvents="none"
                    >
                      <path
                        d="M 0,0 C -14,-16 -20,-28 -20,-38 C -20,-49 -11,-58 0,-58 C 11,-58 20,-49 20,-38 C 20,-28 14,-16 0,0 Z"
                        fill="#EA4335"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                      <circle cx="0" cy="-38" r="7" fill="#FFFFFF" />
                      <rect
                        x="-36"
                        y="-82"
                        width="72"
                        height="20"
                        rx="10"
                        fill="#0F172A"
                      />
                      <text
                        x="0"
                        y="-68"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {selectedRoom.code}
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          ) : (
            /* Original Drawing View from TOAB_2D */
            <div className="relative max-w-full max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentOriginalImage}
                alt={`Bản vẽ gốc ${activePart}`}
                className="max-h-[58vh] w-auto object-contain block"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                Bản vẽ gốc: {currentOriginalImage.split('/').pop()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          LAYER 1: TOP FLOATING TURN-BY-TURN HEADER CARD (EXACT MOBILE RATIO)
          ===================================================================== */}
      <div className="absolute top-3 inset-x-3 sm:max-w-[430px] sm:mx-auto z-30 pointer-events-none flex flex-col gap-2.5">
        {/* Main Floating Highlighted Room Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_8px_28px_rgba(15,23,42,0.12)] border border-white/90 px-3.5 py-2.5 flex items-center gap-3">
          {/* Highlighted Room Pin Icon */}
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#1A63EB]">
            <MapPin className="w-5 h-5" strokeWidth={1.8} />
          </div>

          {/* Target Room Name & Location (Tap to Search / Switch Room) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 min-w-0 text-left group cursor-pointer"
            title="Chạm để tìm phòng khác"
          >
            <div className="text-[18px] font-extrabold text-slate-900 leading-tight tracking-tight truncate">
              {destinationLabel}
            </div>
            <div className="text-[12.5px] text-slate-600 truncate leading-snug">
              <span className="font-bold text-[#1A63EB]">{FLOOR_INFO[selectedRoom.floor].label}</span>
              {' • '}
              <span>{selectedRoom.partLabel}</span>
              {' • '}
              <span>Gần {selectedRoom.nearestStairs}</span>
            </div>
          </button>

          {/* Circular Close Button */}
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                setIsSearchOpen(true);
              }
            }}
            className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center shrink-0 transition"
            aria-label="Đóng bản đồ"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Sub-row: Floor Selector Pill (Left) & Floating Map Tools (Right) */}
        <div className="flex items-start justify-between">
          {/* Top-Left Floor Dropdown Pill */}
          <div className="relative pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFloorMenuOpen((prev) => !prev);
              }}
              className="bg-white/95 backdrop-blur-md hover:bg-white rounded-full shadow-[0_4px_16px_rgba(15,23,42,0.10)] border border-white/90 px-3.5 py-2 flex items-center gap-1.5 text-[#1A63EB] text-[13px] font-bold active:scale-95 transition"
            >
              <Layers className="w-4 h-4 text-[#1A63EB]" strokeWidth={1.5} />
              <span>{FLOOR_INFO[currentFloor].label}</span>
              <span className="text-[11px] font-semibold text-slate-400">•</span>
              <span className="text-[12px] font-extrabold text-emerald-600">
                {entryGateInfo.shortLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#1A63EB] transition-transform ${
                  isFloorMenuOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={2}
              />
            </button>

            {/* Cross-Wing Quick Switch Pill: jump to zoomed target wing anytime */}
            {isCrossWing && activePart === 'master' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePart(selectedRoom.part);
                  setPan({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className="mt-2 bg-amber-50/95 hover:bg-amber-100 backdrop-blur-md text-amber-900 border border-amber-300/80 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                <span>Xuyên cánh từ {entryGateInfo.shortLabel} →</span>
                <span className="underline text-[#1A63EB]">
                  Zoom {selectedRoom.partLabel.replace(/^Phần \d+\s*/, '')}
                </span>
              </button>
            )}

            {/* Floor, Part & ViewMode Popover Menu */}
            {isFloorMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-2 w-60 bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] border border-slate-200/80 p-3 z-40 space-y-3"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Chọn tầng
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['ground', 'floor1', 'floor2', 'floor3'] as BuildingFloor[]).map(
                      (floorKey) => {
                        const isActive = currentFloor === floorKey;
                        return (
                          <button
                            key={floorKey}
                            type="button"
                            onClick={() => {
                              setCurrentFloor(floorKey);
                              const fallbackRoom = Object.values(TOA_B_ROOMS).find(
                                (r) =>
                                  r.floor === floorKey &&
                                  (activePart === 'master' || r.part === activePart)
                              );
                              if (fallbackRoom) setSelectedRoomId(fallbackRoom.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                              isActive
                                ? 'bg-[#1A63EB] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>{FLOOR_INFO[floorKey].label}</span>
                            {isActive && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Cổng bạn đi vào (điểm xuất phát)
                  </div>
                  <div className="space-y-1">
                    {BUILDING_B_GATE_LIST.map((gate) => {
                      const isActive = entryGate === gate.id;
                      return (
                        <button
                          key={gate.id}
                          type="button"
                          onClick={() => {
                            handleSwitchEntryGate(gate.id);
                            setIsFloorMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs text-left transition flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                            <span className="truncate">{gate.name}</span>
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Khu vực tòa B
                  </div>
                  <div className="space-y-1">
                    {(
                      [
                        { key: 'part1', label: 'Phần 1 (Khối Nam)' },
                        { key: 'part2', label: 'Phần 2 (Khối Bắc)' },
                        { key: 'part3', label: 'Phần 3 (Cánh Đông)' },
                        { key: 'master', label: 'Toàn Cảnh 3 Phần' },
                      ] as { key: ActivePartSelection; label: string }[]
                    ).map((item) => {
                      const isActive = activePart === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setActivePart(item.key);
                            if (item.key !== 'master') {
                              const roomInPart = Object.values(TOA_B_ROOMS).find(
                                (r) => r.floor === currentFloor && r.part === item.key
                              );
                              if (roomInPart) setSelectedRoomId(roomInPart.id);
                            }
                            setIsFloorMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                            isActive
                              ? 'bg-blue-50 text-[#1A63EB] font-bold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode((prev) => (prev === 'vector' ? 'image' : 'vector'));
                      setIsFloorMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    {viewMode === 'vector' ? (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Xem bản vẽ gốc TOAB_2D</span>
                      </>
                    ) : (
                      <>
                        <MapIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Về bản đồ Vector 2.5D</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Top-Right Floating Circular Map Controls (Compass, GPS Recenter, Search) */}
          <div className="pointer-events-auto flex flex-col gap-2.5">
            {/* Compass Needle Button (Toggles subtle 2.5D tilt) */}
            <button
              type="button"
              onClick={() => setIsTilted((prev) => !prev)}
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md hover:bg-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/90 flex items-center justify-center active:scale-95 transition"
              title="Xoay hướng la bàn"
              aria-label="La bàn"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-300"
                style={{ transform: isTilted ? 'rotate(-14deg)' : 'rotate(0deg)' }}
              >
                <polygon points="12,3 15.5,12 8.5,12" fill="#EA4335" />
                <polygon points="12,21 15.5,12 8.5,12" fill="#CBD5E1" />
                <circle cx="12" cy="12" r="1.4" fill="#FFFFFF" />
              </svg>
            </button>

            {/* GPS Target / Recenter Button */}
            <button
              type="button"
              onClick={handleRecenter}
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md hover:bg-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/90 flex items-center justify-center text-slate-700 active:scale-95 transition"
              title="Căn giữa vị trí hiện tại"
              aria-label="Căn giữa bản đồ"
            >
              <Crosshair className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md hover:bg-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/90 flex items-center justify-center text-[#1A63EB] active:scale-95 transition"
              title="Tìm phòng nhanh"
              aria-label="Tìm phòng"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LAYER 2: COMPACT BOTTOM ROOM HIGHLIGHT CARD
          ===================================================================== */}
      <div className="absolute bottom-3 inset-x-3 sm:max-w-[430px] sm:mx-auto z-30">
        <div className="bg-white/98 backdrop-blur-xl rounded-[28px] shadow-[0_12px_38px_rgba(15,23,42,0.16)] border border-white/90 px-4 pt-2.5 pb-4 transition-all duration-300">
          {/* Top Drag Handle */}
          <div
            onClick={() => setIsBottomExpanded((prev) => !prev)}
            className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-3 cursor-pointer"
          />

          {/* Row 1: Highlighted Room Summary */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1A63EB] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(26,99,235,0.32)] font-extrabold text-xs">
              {selectedRoom.shortBadge}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-extrabold text-slate-900 leading-tight tracking-tight truncate">
                {selectedRoom.name}
              </div>
              <div className="text-[12.5px] text-slate-600 truncate mt-0.5">
                {FLOOR_INFO[selectedRoom.floor].label} • {selectedRoom.partLabel} • Gần{' '}
                <span className="font-bold text-[#1A63EB]">{selectedRoom.nearestStairs}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBottomExpanded((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition cursor-pointer"
              aria-label="Mở rộng danh sách phòng cùng khu"
            >
              {isBottomExpanded ? (
                <ChevronDown className="w-4 h-4" strokeWidth={1.8} />
              ) : (
                <ChevronUp className="w-4 h-4" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Expandable Quick Switch Rooms on Current Part */}
          {isBottomExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 max-h-[30vh] overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Các phòng khác tại {PART_INFO[selectedRoom.part].label} ({FLOOR_INFO[selectedRoom.floor].label}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentPartRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRoom(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      r.id === selectedRoomId
                        ? 'bg-[#1A63EB] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {r.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Action Buttons (Switch Master <-> Wing Zoom & Search Another Room) */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              type="button"
              onClick={() => {
                setActivePart((prev) => (prev === 'master' ? selectedRoom.part : 'master'));
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className="py-3 px-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MapIcon className="w-4 h-4 text-[#1A63EB]" strokeWidth={1.5} />
              <span className="truncate">
                {activePart === 'master' ? `Zoom ${selectedRoom.partLabel.replace(/^Phần \d+\s*/, '')}` : 'Xem toàn cảnh 3 khối'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="py-3 px-3 rounded-full bg-[#1A63EB] hover:bg-[#1554CC] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_6px_18px_rgba(26,99,235,0.3)] transition cursor-pointer"
            >
              <Search className="w-4 h-4" strokeWidth={1.8} />
              <span>Tìm phòng khác</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LAYER 3: FULL-WIDTH MOBILE ROOM SEARCH & QUICK PICKER OVERLAY
          ===================================================================== */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full sm:max-w-[420px] max-h-[82dvh] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden">
            {/* Search Input Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center gap-2.5">
              <div className="flex-1 relative flex items-center">
                <Search
                  className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm số phòng (B.003, B.301, Thư viện, WC...)"
                  className="w-full pl-10 pr-8 py-2.5 rounded-full bg-slate-100 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A63EB]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Quick Floor Filter Strip */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
              {(['ground', 'floor1', 'floor2', 'floor3'] as BuildingFloor[]).map(
                (floorKey) => (
                  <button
                    key={floorKey}
                    type="button"
                    onClick={() => setCurrentFloor(floorKey)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      currentFloor === floorKey
                        ? 'bg-[#1A63EB] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {FLOOR_INFO[floorKey].label}
                  </button>
                )
              )}
            </div>

            {/* Room Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {searchResults.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Không tìm thấy phòng phù hợp với &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                searchResults.map((room) => {
                  const isCurrent = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-left transition ${
                        isCurrent
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#1A63EB] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {room.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {room.floorLabel} • {room.partLabel}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold font-mono shrink-0 ${
                          isCurrent
                            ? 'bg-[#1A63EB] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {room.shortBadge}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
