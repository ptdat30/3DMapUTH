'use client';

import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  X,
} from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';

// Custom Walking Pedestrian SVG Icon matching reference image
function WalkingPersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7 text-slate-900"
    >
      <circle cx="12" cy="4" r="2" />
      <path d="M15.89 8.11C15.5 7.72 14.83 7 13.53 7h-2.06c-.85 0-1.63.48-2 1.24L7.5 12.2l1.83.82 1.67-3.4V14l-2.6 3.9 1.66 1.1 2.94-4.41V22h2v-8.5l1.88-2.35 2.12 3.18 1.66-1.1-2.9-4.36-.8-2.66 1.1.26z" />
    </svg>
  );
}

export function StepBottomSheet() {
  const activeSteps = useNavigationStore((state) => state.activeSteps);
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const currentStepIndex = useNavigationStore((state) => state.currentStepIndex);
  const nextStep = useNavigationStore((state) => state.nextStep);
  const prevStep = useNavigationStore((state) => state.prevStep);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);

  if (!activeSteps || activeSteps.length === 0) {
    return null;
  }

  const step = activeSteps[currentStepIndex];
  const totalSteps = activeSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const renderStepIcon = () => {
    if (step.directionType === 'STRAIGHT' || step.stepOrder === 1) {
      return <WalkingPersonIcon />;
    }
    if (step.directionType === 'LEFT') {
      return <CornerUpLeft className="w-7 h-7 text-slate-900" strokeWidth={2} />;
    }
    if (step.directionType === 'RIGHT' || step.stepOrder === 2) {
      return <CornerUpRight className="w-7 h-7 text-slate-900" strokeWidth={2} />;
    }
    if (step.directionType === 'STAIRS_UP' || step.stepOrder === 3) {
      return <TrendingUp className="w-7 h-7 text-slate-900" strokeWidth={2} />;
    }
    return <CheckCircle2 className="w-7 h-7 text-emerald-600" strokeWidth={2} />;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto z-30 pointer-events-auto landscape:max-w-sm landscape:bottom-3 landscape:right-4 landscape:left-auto">
      {/* White Bottom Sheet Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-t-[30px] landscape:rounded-[24px] px-6 pt-3 pb-7 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t landscape:border border-slate-100">
        {/* Grey Drag Handle Pill */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2 landscape:hidden" />

        {/* Step Progress Line: "Bước 1 / 3" + Route info + Close */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              Bước {step.stepOrder} / {totalSteps}
            </span>
            {activeRoute && (
              <span className="text-xs text-sky-600 font-medium">
                {activeRoute.totalDistance}m (~{activeRoute.estimatedMinutes}p)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Subtle Progress Bar */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={`prog-bar-${idx}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-slate-800'
                      : idx < currentStepIndex
                      ? 'w-2.5 bg-blue-500'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={resetNavigation}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng dẫn đường"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instruction Row: Circular Icon Avatar + Bold Text */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-13 h-13 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
            {renderStepIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-slate-900 leading-snug">
              {step.instruction}
            </h2>
            {step.subText && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {step.subText}
              </p>
            )}
          </div>
        </div>

        {/* Two Large Rounded-Full Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            className={`py-3 rounded-xl font-semibold text-xs transition-all text-center cursor-pointer ${
              isFirstStep
                ? 'bg-[#e9edf2]/50 text-slate-400 cursor-not-allowed'
                : 'bg-[#e9edf2] text-slate-800 hover:bg-[#dfe4eb] active:scale-[0.98]'
            }`}
          >
            Quay lại
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={isLastStep}
            className={`py-3 rounded-xl font-semibold text-xs transition-all text-center shadow-md cursor-pointer ${
              isLastStep
                ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                : 'bg-[#1d74f5] text-white hover:bg-[#1565d8] shadow-blue-500/25 active:scale-[0.98]'
            }`}
          >
            {isLastStep ? 'Đã đến nơi' : 'Bước tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}
