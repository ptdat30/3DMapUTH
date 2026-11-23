'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, Navigation } from 'lucide-react';
import { CampusMaquetteScene } from '@/components/canvas/CampusMaquetteScene';
import { CampusCS3Scene } from '@/components/canvas/CampusCS3Scene';
import { TopSearchBar } from '@/components/ui/TopSearchBar';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { StepBottomSheet } from '@/components/ui/StepBottomSheet';
import { Building2DNavigator } from '@/components/navigation2d/Building2DNavigator';
import { BuildingB2DNavigator } from '@/components/navigation2d/BuildingB2DNavigator';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useTwinStore } from '@/store/useTwinStore';
import { MOCK_QR_NODES, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';

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
  const setCampus = useNavigationStore((state) => state.setCampus);
  const setCurrentQr = useNavigationStore((state) => state.setCurrentQr);
  const setRouteSteps = useNavigationStore((state) => state.setRouteSteps);
  const isNavigating = useNavigationStore((state) => state.isNavigating);

  const isTwinMode = useTwinStore((state) => state.isTwinMode);
  const [show2dModal, setShow2dModal] = useState(false);

  // Sync URL query params with Zustand store
  useEffect(() => {
    if (campusParam) {
      setCampus(campusParam);
    }

    if (qrParam) {
      const matchedQr = MOCK_QR_NODES.find((node) => node.code === qrParam);
      if (matchedQr) {
        setCurrentQr(matchedQr);
      }
    }
  }, [campusParam, qrParam, setCampus, setCurrentQr]);

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
            <TopSearchBar />

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

          {/* Layer 3: Bottom Sheet Card (Step-by-step navigation drawer with collapse/expand) */}
          <StepBottomSheet />

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

      {/* 2D Indoor Wayfinding Modal Dialog Overlay */}
      {show2dModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full h-full sm:max-w-7xl sm:h-[92vh] sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col">
            {currentCampusCode === 'cs1' ? (
              <BuildingB2DNavigator onClose={() => setShow2dModal(false)} />
            ) : (
              <Building2DNavigator onClose={() => setShow2dModal(false)} />
            )}
          </div>
        </div>
      )}
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
