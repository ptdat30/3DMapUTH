import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2DNavigator } from '@/components/navigation2d/Building2DNavigator';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hệ thống Dẫn đường 2D Tòa K - Trường ĐH Giao thông Vận tải TP.HCM',
  description: 'Bản đồ số 2D và hệ thống dẫn đường đa tầng tòa K CS3 UTH',
};

export default function Navigation2DPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 flex flex-col">
      {/* Top Banner Navigation bar to easily return to 3D Campus */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Về Bản đồ 3D Campus</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
          <h1 className="text-white text-xs sm:text-sm font-bold tracking-tight truncate">
            UTH Wayfinding 2D · Tòa K (Cơ sở 3)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/navigation-2d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium hidden md:inline-flex items-center gap-1"
          >
            <span>Mở bản thuần HTML</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main 2D Interactive Wayfinding Canvas */}
      <main className="flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden">
        <Building2DNavigator />
      </main>
    </div>
  );
}
