'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Sparkles } from 'lucide-react';
import { CampusMaquetteScene } from '@/components/canvas/CampusMaquetteScene';
import { TopSearchBar } from '@/components/ui/TopSearchBar';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { StepBottomSheet } from '@/components/ui/StepBottomSheet';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MOCK_QR_NODES, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';

function NavigationAppContent() {
  const searchParams = useSearchParams();
  const campusParam = searchParams.get('campus');
  const qrParam = searchParams.get('qr');

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

      {/* Layer 2: Center 3D Viewport (Full-screen Canvas) */}
      <div className="absolute inset-0 z-0">
        <CampusMaquetteScene />
      </div>

      {/* Map Editor Tool Link */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto hidden md:block">
        <Link
          href="/admin/map-editor"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-md border border-slate-200/80 backdrop-blur-md transition-all"
        >
          <Wrench className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
          <span>Map Editor</span>
        </Link>
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
