'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CampusMaquetteScene } from '@/components/canvas/CampusMaquetteScene';
import { CampusCS3Scene } from '@/components/canvas/CampusCS3Scene';
import { TopSearchBar } from '@/components/ui/TopSearchBar';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { StepBottomSheet } from '@/components/ui/StepBottomSheet';
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

    if (!isNavigating) {
      setRouteSteps(MOCK_STEPS_CS1_TO_B302);
    }
  }, [campusParam, qrParam, setCampus, setCurrentQr, setRouteSteps, isNavigating]);

  return (
    <main
      className={`w-full h-[100dvh] relative overflow-hidden select-none touch-none transition-colors duration-500 ${
        isTwinMode ? 'bg-[#090D16]' : 'bg-[#e9eef4]'
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
          {/* Layer 1: Top Floating Search Bar (Centered max-w-md on larger screens) */}
          <TopSearchBar />

          {/* Floating Floor Selector Pill on the Right */}
          <FloorSelector />

          {/* Campus Switcher Controls + Digital Twin NOC Toggle Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-auto flex items-center gap-2">
            {/* Campus Switcher Pill */}
            <div className="flex items-center p-1 rounded-2xl bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCampus('cs1')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  currentCampusCode === 'cs1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cơ sở 1
              </button>
              <button
                type="button"
                onClick={() => setCampus('cs3')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  currentCampusCode === 'cs3'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cơ sở 3 (3D Masterplan)
              </button>
            </div>

            {/* High-Tech Digital Twin NOC ON/OFF Toggle Button */}
            <NocToggleBadge />
          </div>

          {/* Layer 3: Bottom Sheet Card (Full width on mobile, centered max-w-md on desktop) */}
          <StepBottomSheet />
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
