'use client';

import React, { useEffect } from 'react';
import { useTwinStore } from '@/store/useTwinStore';
import { Play, Pause, FastForward, Clock } from 'lucide-react';
import { TelemetryLineChart } from '@/components/charts/TelemetryLineChart';

export function BottomTimelineBar() {
  const currentHour = useTwinStore((state) => state.currentHour);
  const setCurrentHour = useTwinStore((state) => state.setCurrentHour);
  const isPlaying = useTwinStore((state) => state.isPlaying);
  const setIsPlaying = useTwinStore((state) => state.setIsPlaying);
  const playbackSpeed = useTwinStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useTwinStore((state) => state.setPlaybackSpeed);
  const stepForward = useTwinStore((state) => state.stepForward);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(100, Math.round(1000 / playbackSpeed));
    const timer = setInterval(() => {
      stepForward();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, stepForward]);

  // Format hour decimal to HH:MM (e.g., 9.5 -> "09:30")
  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-3 left-4 right-4 z-20 pointer-events-auto select-none">
      <div className="w-full max-w-6xl mx-auto p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 pr-3 md:border-r border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl transition-all cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Phát chuỗi thời gian 24h'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px] font-bold">
            {([1, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Time Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-cyan-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(currentHour)}</span>
          </div>
        </div>

        {/* Embedded Telemetry Chart & Scrubber */}
        <div className="flex-1 w-full min-w-0">
          <TelemetryLineChart />
        </div>
      </div>
    </footer>
  );
}
