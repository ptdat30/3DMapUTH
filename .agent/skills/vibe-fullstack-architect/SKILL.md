---
name: vibe-fullstack-architect
description: "TỰ ĐỘNG KÍCH HOẠT khi thiết kế kiến trúc dự án, tạo giao diện UI/UX (React, Next.js, Tailwind CSS), quản lý state, kết nối API/Backend hoặc tối ưu cấu trúc code."
---

# Vibe Fullstack Architect Skill

## 1. Nguyên tắc cốt lõi (Core Architectural Principles)
- **Modular Design & Single Responsibility:** Chia nhỏ UI thành các component độc lập, tái sử dụng cao. Mỗi component chỉ thực hiện một nhiệm vụ duy nhất (Presentational vs Container Components).
- **TypeScript Strict Mode:** Tuyệt đối không dùng `any`. Sử dụng generic types, union types và narrowing qua type guards (`is`).
- **Framework Synchronization:** Luôn gọi công cụ **Context7 MCP** (`@upstash/context7-mcp`) để tra cứu tài liệu mới nhất về React 19, Next.js App Router (Server vs Client Components), và Tailwind CSS v4 trước khi viết mã.
- **UI Components Hiện đại:** Tận dụng **Magic UI MCP** (`@21st-dev/magic-mcp`) và `lucide-react` (`strokeWidth={1.5}`) để sinh các thành phần giao diện mượt mà, chuẩn accessible.

## 2. Tiêu chuẩn kiến trúc State (Zustand Best Practices)

Tách biệt UI State, Navigation State và Server State. Không lạm dụng `useEffect` để fetch dữ liệu.

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  activeCampus: 'cs1' | 'cs3';
  isSearching: boolean;
  selectedBuildingId: string | null;
  setActiveCampus: (campus: 'cs1' | 'cs3') => void;
  setSelectedBuilding: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      activeCampus: 'cs3',
      isSearching: false,
      selectedBuildingId: null,
      setActiveCampus: (campus) => set({ activeCampus: campus }, false, 'setActiveCampus'),
      setSelectedBuilding: (id) => set({ selectedBuildingId: id }, false, 'setSelectedBuilding'),
    }),
    { name: 'AppStore' }
  )
);
```

## 3. Cấu trúc Component Chuẩn (Next.js App Router & Tailwind CSS)

```tsx
// src/components/ui/NavigationCard.tsx
'use client';

import React, { memo } from 'react';
import { Compass, Navigation, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface NavigationCardProps {
  title: string;
  subTitle: string;
  onNavigate: () => void;
  className?: string;
}

export const NavigationCard = memo(function NavigationCard({
  title,
  subTitle,
  onNavigate,
  className = '',
}: NavigationCardProps) {
  const activeCampus = useAppStore((state) => state.activeCampus);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/50 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/90 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-500/20 dark:text-sky-400">
            <Compass className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subTitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigate}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-sky-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-sky-500 cursor-pointer"
          aria-label="Start Navigation"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
});
```

## 4. Xử lý Bất đồng bộ & Guard Clauses (Fail Fast)
- Đặt các câu điều kiện kiểm tra (Guard Clauses) ở ngay đầu hàm để thoát sớm, tránh lồng ghép if/else sâu (Arrow Anti-Pattern).
- Bọc toàn bộ các API calls trong khối `try/catch` có error logging rõ ràng và toast thông báo người dùng.

