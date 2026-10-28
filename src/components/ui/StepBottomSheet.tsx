'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
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
  const currentStepIndex = useNavigationStore((state) => state.currentStepIndex);
  const nextStep = useNavigationStore((state) => state.nextStep);
  const prevStep = useNavigationStore((state) => state.prevStep);

  if (!activeSteps || activeSteps.length === 0) {
    return null;
  }

  const step = activeSteps[currentStepIndex];
  const totalSteps = activeSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Split instruction text into 2 clean lines if available
  const getTwoLineInstruction = () => {
    if (step.stepOrder === 1) {
      return {
        line1: 'Đi qua sân trường 50m',
        line2: 'hướng về sảnh chính Tòa B',
      };
    }
    if (step.stepOrder === 2) {
      return {
        line1: 'Rẽ phải và tiến thẳng',
        line2: 'vào sảnh chính Tòa B',
      };
    }
    if (step.stepOrder === 3) {
      return {
        line1: 'Tại sảnh Tòa B, di chuyển',
        line2: 'lên cầu thang bộ đến Tầng 3',
      };
    }
    return {
      line1: 'Tại hành lang Tầng 3, rẽ phải',
      line2: 'đến Cửa Phòng Lab AI B302',
    };
  };

  const { line1, line2 } = getTwoLineInstruction();

  const renderStepIcon = () => {
    if (step.directionType === 'STRAIGHT' || step.stepOrder === 1) {
      return <WalkingPersonIcon />;
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
    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto z-30 pointer-events-auto">
      {/* White Bottom Sheet Card */}
      <div className="bg-white rounded-t-[30px] px-6 pt-3 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-slate-100">
        {/* Grey Drag Handle Pill */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        {/* Step Progress Line: "Bước 1 / 4" + Progress Bar */}
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-xs font-semibold text-slate-600">
            Bước {step.stepOrder} / {totalSteps}
          </span>
          {/* Subtle Progress Bar */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={`prog-bar-${idx}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-6 bg-slate-800'
                    : idx < currentStepIndex
                    ? 'w-3 bg-blue-500'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Instruction Row: Circular Icon Avatar + 2 Lines Bold Text */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
            {renderStepIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">
              {line1}
            </h2>
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight mt-0.5">
              {line2}
            </h2>
          </div>
        </div>

        {/* Two Large Rounded-Full Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            className={`py-3.5 rounded-full font-semibold text-sm transition-all text-center ${
              isFirstStep
                ? 'bg-[#e9edf2]/60 text-slate-400 cursor-not-allowed'
                : 'bg-[#e9edf2] text-slate-800 hover:bg-[#dfe4eb] active:scale-[0.98]'
            }`}
          >
            Quay lại
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={isLastStep}
            className={`py-3.5 rounded-full font-semibold text-sm transition-all text-center shadow-md ${
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
