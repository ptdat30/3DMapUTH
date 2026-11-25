'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation } from 'lucide-react';
import { CampusMaquetteScene } from '@/components/canvas/CampusMaquetteScene';
import { CampusCS3Scene } from '@/components/canvas/CampusCS3Scene';
import { TopSearchBar } from '@/components/ui/TopSearchBar';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { StepBottomSheet } from '@/components/ui/StepBottomSheet';
import { FloorClimbTransitionModal } from '@/components/ui/FloorClimbTransitionModal';
import { Building2DNavigator } from '@/components/navigation2d/Building2DNavigator';
import { BuildingB2DNavigator } from '@/components/navigation2d/BuildingB2DNavigator';
import { BuildingBGateId } from '@/data/buildingB2dData';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useTwinStore } from '@/store/useTwinStore';
import { MOCK_QR_NODES, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';
import { CS1_BUILDING_ENTRANCES, normalizeBuildingBRoomCode } from '@/data/cs1OutdoorRouting';

// Digital Twin NOC Overlays
import { TopCommandBar } from '@/components/hud/TopCommandBar';
import { LayerFloatingPills } from '@/components/hud/LayerFloatingPills';
import { LeftAnalyticsDock } from '@/components/hud/LeftAnalyticsDock';
import { RightInspectorDock } from '@/components/hud/RightInspectorDock';
import { BottomTimelineBar } from '@/components/hud/BottomTimelineBar';
import { CompareModalDrawer } from '@/components/hud/CompareModalDrawer';
import { NocToggleBadge } from '@/components/hud/NocToggleBadge';

function NavigationAppContent() {
  const searchParams = useSearchParams();
  const campusParam = searchParams.get('campus');
  const qrParam = searchParams.get('qr');

  const currentCampusCode = useNavigationStore((state) => state.currentCampusCode);
  const currentQr = useNavigationStore((state) => state.currentQr);
  const targetRoom = useNavigationStore((state) => state.targetRoom);
  const setCampus = useNavigationStore((state) => state.setCampus);
  const setCurrentQr = useNavigationStore((state) => state.setCurrentQr);
  const setRouteSteps = useNavigationStore((state) => state.setRouteSteps);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const isNavigating = useNavigationStore((state) => state.isNavigating);

  const isTwinMode = useTwinStore((state) => state.isTwinMode);
  const [show2dModal, setShow2dModal] = useState(false);
  const [autoOpenSearch, setAutoOpenSearch] = useState(false);
  const [showFloorConfirmModal, setShowFloorConfirmModal] = useState(false);
  const [selectedBuildingBGate, setSelectedBuildingBGate] = useState<BuildingBGateId | undefined>(
    undefined
  );
  const [no2dNoticeRoom, setNo2dNoticeRoom] = useState<string | null>(null);

  // Sync URL query params (?campus=cs1&qr=cs1_qr_1) with Zustand store & prompt room search
  useEffect(() => {
    if (campusParam) {
      setCampus(campusParam);
    }

    if (qrParam) {
      const matchedQr = MOCK_QR_NODES.find((node) => node.code === qrParam);
      if (matchedQr) {
        setCurrentQr(matchedQr);
        resetNavigation();
        setAutoOpenSearch(true);
      }
    }
  }, [campusParam, qrParam, setCampus, setCurrentQr, resetNavigation]);

  // Step 2: User confirms arrival at the highlighted building -> check floor before opening 2D
  const handleConfirmArrivedBuilding = () => {
    const bldCode = targetRoom?.buildingCode;
    const floorLevel = targetRoom?.floorLevel ?? 0;

    if (currentCampusCode === 'cs1' && bldCode && bldCode !== 'toa_b') {
      const info = CS1_BUILDING_ENTRANCES[bldCode];
      if (!info?.has2DMap) {
        setNo2dNoticeRoom(
          `Bạn đã tới ${targetRoom?.buildingName ?? 'tòa nhà'}! Phòng ${targetRoom?.code ?? ''} nằm tại ${
            floorLevel === 0 ? 'Tầng Trệt' : `Tầng ${floorLevel}`
          } (Bản đồ 2D chi tiết cho tòa này đang được cập nhật).`
        );
        return;
      }
    }

    setNo2dNoticeRoom(null);

    // Always ask which of the 3 Building B gates the user entered (+ floor climb if floor > 0)
    // so cross-wing routing (e.g., entering East wing while targeting South wing) is always accurate!
    if (currentCampusCode === 'cs1' && (!bldCode || bldCode === 'toa_b')) {
      setShowFloorConfirmModal(true);
      return;
    }

    if (floorLevel > 0) {
      setShowFloorConfirmModal(true);
      return;
    }

    // Ground floor for other buildings -> open 2D indoor map directly
    setShow2dModal(true);
  };

  // Step 3: User confirms entry gate (+ floor climb) -> open 2D map from that exact gate & floor
  const handleConfirmArrivedFloor = (entryGate: BuildingBGateId) => {
    setSelectedBuildingBGate(entryGate);
    setShowFloorConfirmModal(false);
    setShow2dModal(true);
  };

  return (
    <main
      className={`w-full h-[100dvh] relative overflow-hidden select-none touch-none transition-colors duration-500 ${isTwinMode ? 'bg-[#090D16]' : 'bg-[#e9eef4]'
        }`}
    >
      {/* ==================================================================== */}
      {/* DIGITAL TWIN NOC HUD OVERLAYS (ACTIVE WHEN isTwinMode === true)      */}
      {/* ==================================================================== */}
      {isTwinMode ? (
        <>
          {/* Top Command Bar with KPIs, Breadcrumbs, Scenarios & Controls */}
          <TopCommandBar />

          {/* Floating 3D Layer Pills */}
          <LayerFloatingPills />

          {/* Left Analytics Dock (Ranking & Treemap) */}
          <LeftAnalyticsDock />

          {/* Right Inspector & Alert Dock (SLA Ring, Action Table, Radar, Scatter, RF) */}
          <RightInspectorDock />

          {/* Bottom Timeline & Telemetry Scrubber Bar */}
          <BottomTimelineBar />

          {/* Compare Mode Modal Drawer */}
          <CompareModalDrawer />
        </>
      ) : (
        /* ==================================================================== */
        /* STANDARD CAMPUS NAVIGATION OVERLAYS (ACTIVE WHEN isTwinMode === false)*/
        /* ==================================================================== */
        <>
          {/* Top Responsive Header Container: Unified Search Bar + Floating Action Pills */}
          <header className="absolute top-3 inset-x-3 sm:top-4 sm:left-4 sm:right-4 z-30 pointer-events-none flex flex-col items-center gap-2">
            {/* Layer 1: Top Floating Search Bar (Centered max-w-md, full width on mobile) */}
            <TopSearchBar
              autoOpen={autoOpenSearch}
              onAutoOpenHandled={() => setAutoOpenSearch(false)}
            />

            {/* Active Scanned QR Location Pill (Visible when user scanned QR 1 or QR 2) */}
            {currentQr && currentCampusCode === 'cs1' && (
              <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/95 text-white text-[11px] font-bold shadow-md border border-blue-400/60">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>Vị trí quét: {currentQr.name}</span>
              </div>
            )}

            {/* Layer 2: Quick Action Pills (Campus Switcher, 2D Wayfinding, WiFi NOC Digital Twin) */}
            <div className="w-full max-w-md sm:max-w-lg flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 pointer-events-auto py-0.5 px-0.5">
              {/* Campus Switcher Pill */}
              <div className="flex items-center p-1 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setCampus('cs1')}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    currentCampusCode === 'cs1'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="sm:hidden">CS 1</span>
                  <span className="hidden sm:inline">Cơ sở 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCampus('cs3')}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    currentCampusCode === 'cs3'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="sm:hidden">CS 3</span>
                  <span className="hidden sm:inline">Cơ sở 3</span>
                </button>
              </div>

              {/* 2D Indoor Wayfinding Navigator Launcher Button */}
              <button
                type="button"
                onClick={() => setShow2dModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md border border-indigo-500 text-xs font-bold transition-all cursor-pointer shrink-0"
                title={currentCampusCode === 'cs1' ? "Mở hệ thống dẫn đường 2D Tòa B (Cơ sở 1)" : "Mở hệ thống dẫn đường 2D Tòa K (Cơ sở 3)"}
              >
                <Map className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{currentCampusCode === 'cs1' ? '2D Tòa B' : '2D Tòa K'}</span>
              </button>

              {/* High-Tech Digital Twin NOC ON/OFF Toggle Button */}
              <div className="shrink-0">
                <NocToggleBadge />
              </div>
            </div>
          </header>

          {/* Floating Floor Selector Pill on the Right */}
          <FloorSelector />

          {/* Layer 3: Bottom Sheet Card (Step-by-step navigation drawer with 2D Handoff) */}
          <StepBottomSheet onConfirmArrivedBuilding={handleConfirmArrivedBuilding} />

          {/* Floor Escalation Confirmation Modal with Climbing Stairs Animation & iOS Spring */}
          <FloorClimbTransitionModal
            isOpen={showFloorConfirmModal}
            targetRoom={targetRoom}
            onConfirmArrivedFloor={handleConfirmArrivedFloor}
            onCancel={() => setShowFloorConfirmModal(false)}
          />

          {/* Arrival Notice for buildings whose 2D map is coming soon */}
          <AnimatePresence>
            {no2dNoticeRoom && (
              <motion.div
                initial={{ y: 36, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="fixed inset-x-4 bottom-28 max-w-md mx-auto z-40 pointer-events-auto bg-white/98 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-emerald-200 flex items-start justify-between gap-3"
              >
                <div className="text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="font-bold text-emerald-700 mb-1">✓ Đã xác nhận tới tòa nhà</div>
                  {no2dNoticeRoom}
                </div>
                <button
                  type="button"
                  onClick={() => setNo2dNoticeRoom(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 shrink-0 cursor-pointer"
                >
                  Đóng
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Quick Route Starter Pill (Shown only when not currently in navigation) */}
          {!isNavigating && (
            <div className="absolute bottom-4 inset-x-4 max-w-sm mx-auto z-20 pointer-events-auto flex items-center justify-center">
              <button
                type="button"
                onClick={() => setRouteSteps(MOCK_STEPS_CS1_TO_B302)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 hover:text-blue-600 shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-200/90 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Bắt đầu trải nghiệm dẫn đường mẫu từ Cổng chính đến Phòng 302 Tòa B"
              >
                <Navigation className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={1.5} />
                <span className="truncate">Lộ trình mẫu: Cổng chính → P.302 (Tòa B)</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Layer 2: Center 3D Viewport (Mount only active canvas to prevent dual WebGL frame drop) */}
      <div className="absolute inset-0 z-0">
        {isTwinMode || currentCampusCode === 'cs1' ? (
          <CampusMaquetteScene />
        ) : (
          <CampusCS3Scene />
        )}
      </div>

      {/* 2D Indoor Wayfinding Modal Dialog Overlay (Silky iPhone Full-Screen Sheet Transition) */}
      <AnimatePresence>
        {show2dModal && (
          <motion.div
            key="modal-2d-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              key="modal-2d-sheet"
              initial={{ y: '100%', scale: 0.96, opacity: 0.8 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: '100%', scale: 0.97, opacity: 0.6 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="w-full h-full sm:max-w-7xl sm:h-[92vh] sm:rounded-[32px] overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900 flex flex-col"
            >
              {currentCampusCode === 'cs1' ? (
                <BuildingB2DNavigator
                  initialRoomCode={
                    targetRoom?.code ? normalizeBuildingBRoomCode(targetRoom.code) : 'B.003'
                  }
                  initialEntryGate={selectedBuildingBGate}
                  onClose={() => setShow2dModal(false)}
                />
              ) : (
                <Building2DNavigator onClose={() => setShow2dModal(false)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100dvh] bg-[#090D16] flex flex-col items-center justify-center text-slate-200">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono tracking-wider uppercase text-cyan-300">
            UTH Campus 3D & Digital Twin
          </p>
        </div>
      }
    >
      <NavigationAppContent />
    </Suspense>
  );
}
