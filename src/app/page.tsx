'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { CampusMaquetteScene } from '@/components/canvas/CampusMaquetteScene';
import { CampusCS3Scene } from '@/components/canvas/CampusCS3Scene';
import { TopSearchBar } from '@/components/ui/TopSearchBar';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { StepBottomSheet } from '@/components/ui/StepBottomSheet';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MOCK_QR_NODES, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';

function NavigationAppContent() {
  const searchParams = useSearchParams();
  const campusParam = searchParams.get('campus');
  const qrParam = searchParams.get('qr');

  const currentCampusCode = useNavigationStore((state) => state.currentCampusCode);
  const setCampus = useNavigationStore((state) => state.setCampus);
  const setCurrentQr = useNavigationStore((state) => state.setCurrentQr);
  const setRouteSteps = useNavigationStore((state) => state.setRouteSteps);
  const isNavigating = useNavigationStore((state) => state.isNavigating);

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
    <main className="w-full h-[100dvh] relative overflow-hidden bg-[#e9eef4] select-none touch-none">
      {/* Layer 1: Top Floating Search Bar (Centered max-w-md on larger screens) */}
      <TopSearchBar />

      {/* Floating Floor Selector Pill on the Right */}
      <FloorSelector />

      {/* Layer 2: Center 3D Viewport (Mount only active canvas to prevent dual WebGL frame drop) */}
      <div className="absolute inset-0 z-0">
        {currentCampusCode === 'cs3' ? (
          <CampusCS3Scene />
        ) : (
          <CampusMaquetteScene />
        )}
      </div>

      {/* Campus Switcher Controls */}
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
      </div>

      {/* Layer 3: Bottom Sheet Card (Full width on mobile, centered max-w-md on desktop) */}
      <StepBottomSheet />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100dvh] bg-[#e9eef4] flex flex-col items-center justify-center text-slate-800">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-600">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" strokeWidth={1.5} />
            <span>Đang tải sa bàn 3D UTH...</span>
          </div>
        </div>
      }
    >
      <NavigationAppContent />
    </Suspense>
  );
}
