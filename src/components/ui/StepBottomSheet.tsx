'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  X,
  ChevronDown,
  ChevronUp,
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

export interface StepBottomSheetProps {
  onConfirmArrivedBuilding?: () => void;
}

export function StepBottomSheet({ onConfirmArrivedBuilding }: StepBottomSheetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeSteps = useNavigationStore((state) => state.activeSteps);
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const targetRoom = useNavigationStore((state) => state.targetRoom);
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

  const renderStepIcon = (small = false) => {
    const iconClass = small ? 'w-5 h-5 text-slate-800' : 'w-7 h-7 text-slate-900';
    if (step.directionType === 'STRAIGHT' || step.stepOrder === 1) {
      return small ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-900">
          <circle cx="12" cy="4" r="2" />
          <path d="M15.89 8.11C15.5 7.72 14.83 7 13.53 7h-2.06c-.85 0-1.63.48-2 1.24L7.5 12.2l1.83.82 1.67-3.4V14l-2.6 3.9 1.66 1.1 2.94-4.41V22h2v-8.5l1.88-2.35 2.12 3.18 1.66-1.1-2.9-4.36-.8-2.66 1.1.26z" />
        </svg>
      ) : (
        <WalkingPersonIcon />
      );
    }
    if (step.directionType === 'LEFT') {
      return <CornerUpLeft className={iconClass} strokeWidth={2} />;
    }
    if (step.directionType === 'RIGHT' || step.stepOrder === 2) {
      return <CornerUpRight className={iconClass} strokeWidth={2} />;
    }
    if (step.directionType === 'STAIRS_UP' || step.stepOrder === 3) {
      return <TrendingUp className={iconClass} strokeWidth={2} />;
    }
    return <CheckCircle2 className={`${iconClass} text-emerald-600`} strokeWidth={2} />;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="step-bottom-sheet-shell"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.9 }}
        className="absolute bottom-0 inset-x-0 max-w-md mx-auto z-30 pointer-events-auto landscape:max-w-sm landscape:bottom-3 landscape:right-4 landscape:left-auto"
      >
      {/* Collapsed Mini Bottom Bar Mode */}
      {isCollapsed ? (
        <motion.div
          key="collapsed-bar"
          initial={{ y: 16, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl mx-3 mb-3 px-3.5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/90 flex items-center justify-between gap-2.5"
        >
          <div
            onClick={() => setIsCollapsed(false)}
            className="flex-1 min-w-0 flex items-center gap-2.5 cursor-pointer"
            title="Nhấn để mở rộng chỉ dẫn chi tiết"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              {renderStepIcon(true)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">
                  {step.stepOrder}/{totalSteps}
                </span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {step.instruction}
                </p>
              </div>
              {step.subText && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.subText}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Mở rộng"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetNavigation}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
              title="Đóng dẫn đường"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* Expanded Full Bottom Sheet Card */
        <motion.div
          key={`expanded-card-${step.id}`}
          initial={{ y: 24, opacity: 0.7, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="bg-white/95 backdrop-blur-md rounded-t-[26px] landscape:rounded-[24px] px-5 sm:px-6 pt-2.5 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t landscape:border border-slate-100"
        >
          {/* Grey Drag Handle Pill with Collapse Click */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="w-full flex flex-col items-center group cursor-pointer mb-2.5 focus:outline-none"
            title="Nhấn để thu gọn thẻ dẫn đường"
          >
            <div className="w-10 h-1 bg-slate-300 group-hover:bg-slate-400 rounded-full transition-colors mb-0.5" />
            <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-medium">
              Chạm để thu gọn
            </span>
          </button>

          {/* Step Progress Line: "Bước 1 / 4" + Route info + Controls */}
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

            <div className="flex items-center gap-1.5">
              {/* Subtle Progress Bar */}
              <div className="flex items-center gap-1 mr-1">
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

              {/* Minimize Chevron Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Thu gọn"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={resetNavigation}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                title="Đóng dẫn đường"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instruction Row: Circular Icon Avatar + Bold Text */}
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
              {renderStepIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                {step.instruction}
              </h2>
              {step.subText && (
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  {step.subText}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {totalSteps === 1 && onConfirmArrivedBuilding ? (
            <button
              type="button"
              onClick={onConfirmArrivedBuilding}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all text-center shadow-md cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-[0.98]"
            >
              ✓ Tôi đã tới {targetRoom?.buildingName ?? 'tòa nhà'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirstStep}
                className={`py-2.5 sm:py-3 rounded-xl font-semibold text-xs transition-all text-center cursor-pointer ${
                  isFirstStep
                    ? 'bg-[#e9edf2]/50 text-slate-400 cursor-not-allowed'
                    : 'bg-[#e9edf2] text-slate-800 hover:bg-[#dfe4eb] active:scale-[0.98]'
                }`}
              >
                Quay lại
              </button>

              {isLastStep && onConfirmArrivedBuilding ? (
                <button
                  type="button"
                  onClick={onConfirmArrivedBuilding}
                  className="py-2.5 sm:py-3 px-2 rounded-xl font-bold text-xs transition-all text-center shadow-md cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.98]"
                >
                  ✓ Tôi đã tới {targetRoom?.buildingName ?? 'tòa nhà'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLastStep}
                  className={`py-2.5 sm:py-3 rounded-xl font-semibold text-xs transition-all text-center shadow-md cursor-pointer ${
                    isLastStep
                      ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                      : 'bg-[#1d74f5] text-white hover:bg-[#1565d8] shadow-blue-500/25 active:scale-[0.98]'
                  }`}
                >
                  {isLastStep ? 'Đã đến nơi' : 'Bước tiếp theo'}
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
      </motion.div>
    </AnimatePresence>
  );
}
