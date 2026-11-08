# Implementation Plan: Tìm đường đi bộ từ Tòa H đến Tòa J (Cơ sở 3 UTH)

**Branch**: `001-find-route-toa-h-toa-j` | **Date**: 2026-11-06 | **Spec**: [specs/001-find-route-toa-h-toa-j/spec.md](spec.md)

**Input**: Đặc tả kỹ thuật tính năng tìm đường đi bộ liên tòa nhà từ Tòa H đến Tòa J tại Cơ sở 3 UTH.

---

## 1. Summary

Tính năng này hiện thực hóa khả năng dẫn đường trực quan ngoài trời (Outdoor Pedestrian Pathfinding) giữa Tòa H (Trung tâm hành chính) và Tòa J (Khu giảng đường) tại sa bàn 3D Cơ sở 3 UTH.
- **Tiếp cận kỹ thuật:**
  - Dựng đường ống dẫn đường 3D phát sáng màu Cyan (Glow Path) bằng Three.js `CatmullRomCurve3` với độ cao nâng $+0.2\text{m}$ để chống z-fighting.
  - Điều khiển camera bay mượt mà (Smooth lerp) bằng `useFrame` trong `CameraRig.tsx`.
  - Quản lý trạng thái dẫn đường tập trung thông qua Zustand (`useNavigationStore.ts`).
  - Hỗ trợ cơ chế định tuyến kép (Hybrid Dual Routing): kết nối API PostgreSQL qua Prisma và tự động fallback sang `mockNavigationData.ts` khi mất kết nối mạng.

---

## 2. Technical Context

- **Language/Version:** TypeScript 5.0+ (Strict mode bắt buộc theo Hiến pháp Điều III).
- **Primary Dependencies:** Next.js 16 (App Router), React 19, Three.js 0.186, `@react-three/fiber` (R3F), `@react-three/drei`, Tailwind CSS v4, Zustand, Lucide React.
- **Storage:** PostgreSQL kết nối qua Prisma ORM v6 kết hợp bộ nhớ đệm client in-memory (`mockNavigationData.ts`).
- **Testing:** Chạy `npx tsc --noEmit`, kiểm thử kịch bản ngoại tuyến và kiểm thử API endpoint theo [quickstart.md](quickstart.md).
- **Target Platform:** Web (Desktop Chrome/Safari/Edge & Mobile Safari/Chrome iOS/Android).
- **Project Type:** Web Application (Interactive 3D Digital Twin & Navigation).
- **Performance Goals:** $\ge 60\text{ FPS}$ trên Desktop, $\ge 30\text{ FPS}$ trên Mobile; thời gian tính toán và vẽ đường $< 300\text{ms}$.
- **Constraints:** Offline-capable, kích thước toàn bộ mô hình 3D nén $< 25\text{MB}$.
- **Scale/Scope:** 5 tòa nhà trọng điểm CS3, hệ thống đường nội khu, hỗ trợ mở rộng cho CS1 và CS2.

---

## 3. Constitution Check

*GATE: Đánh giá đối chiếu trực tiếp với Hiến pháp Kỹ thuật 3DMapUTH (v1.0.0)*

| Điều luật Hiến pháp | Tiêu chí đánh giá | Trạng thái | Đánh giá chi tiết |
| :--- | :--- | :---: | :--- |
| **Điều I: Core Tech Stack** | Next.js App Router, React 19, TS strict, R3F, Tailwind, Prisma. | ✅ PASS | Kế hoạch sử dụng 100% stack quy định, không thêm thư viện ngoài lề. |
| **Điều II: Data Integrity** | Quan hệ phân cấp `Campus->Building->Floor->Room->QrNode`, Idempotent seed, Soft delete. | ✅ PASS | Khớp 100% với schema Prisma hiện tại, sử dụng `hubCoordinates` của Building. |
| **Điều III: Coding Standards** | Code tiếng Anh, docs tiếng Việt, cấm `any`, tách biệt Canvas 3D khỏi UI 2D. | ✅ PASS | Các component 3D đặt trong `src/components/canvas/`, UI đặt trong `src/components/ui/`. |
| **Điều IV: UI/UX & 3D Render** | Responsive Desktop/Mobile, nén GLB Draco, màu nhận diện UTH. | ✅ PASS | Đã tối ưu GLB qua `scripts/optimize-models.mjs`, Glow Line màu Cyan UTH. |
| **Điều V: Spec-Driven** | Quy trình Spec $\rightarrow$ Plan $\rightarrow$ Tasks, Conventional Commits. | ✅ PASS | Hoàn tất đầy đủ `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`. |

**Kết luận Gate:** ĐẠT 100% — Không có bất kỳ vi phạm nào cần giải trình (Zero Violations).

---

## 4. Project Structure

### Documentation (Artifacts tạo ra cho tính năng này)

```text
specs/001-find-route-toa-h-toa-j/
├── spec.md              # Đặc tả yêu cầu người dùng, scenarios Gherkin, UI/UX
├── plan.md              # Bản kế hoạch kiến trúc tổng thể (File này)
├── research.md          # Kết quả nghiên cứu kỹ thuật & 4 quyết định Phase 0
├── data-model.md        # Mô hình dữ liệu, máy trạng thái & TypeScript interfaces
├── quickstart.md        # Hướng dẫn chạy thử nghiệm & xác thực tính năng
├── contracts/           # Giao ước Hợp đồng API
│   └── route-api.json   # JSON Schema cho endpoint /api/route-path
└── checklists/
    └── requirements.md  # Bảng kiểm định chất lượng đặc tả
```

### Source Code Mapping

```text
src/
├── app/
│   ├── page.tsx                           # Tích hợp Canvas và UI điều hướng
│   └── api/route-path/route.ts            # Route handler tính toán tuyến đường
├── components/
│   ├── canvas/                            # TẦNG ĐỒ HỌA 3D (Tách biệt hoàn toàn)
│   │   ├── CampusCS3Scene.tsx             # Sa bàn CS3, chứa mô hình Tòa H & Tòa J
│   │   ├── CADBuildingModel.tsx           # Component nạp mô hình GLB tối ưu
│   │   ├── CameraRig.tsx                  # Điều khiển chuyển động camera bay mượt
│   │   └── NavigationPath3D.tsx           # Component vẽ ống sáng phát sáng (Glow Path)
│   └── ui/                                # TẦNG GIAO DIỆN 2D (Atomic UI)
│       ├── TopSearchBar.tsx               # Tìm kiếm và chọn nhanh Tòa H / Tòa J
│       ├── StepBottomSheet.tsx            # Bảng chỉ dẫn cự ly & thời gian đi bộ
│       └── BuildingTooltip.tsx            # Tooltip 3D neo trên đỉnh tòa nhà
├── data/
│   └── mockNavigationData.ts              # Cơ sở dữ liệu tọa độ ngoại tuyến dự phòng
├── store/
│   └── useNavigationStore.ts              # Quản lý State toàn cục (Zustand)
└── types/
    └── navigation.ts                      # Toàn bộ Interface & Type định nghĩa
```

**Structure Decision**: Tuân thủ triệt để cấu trúc dự án Next.js App Router hiện có, tách biệt rõ ràng giữa logic đồ họa không gian 3D (`src/components/canvas/`) và giao diện người dùng 2D (`src/components/ui/`), kết nối đồng bộ thông qua Zustand Store.

---

## 5. Complexity Tracking

*(Không có vi phạm Hiến pháp nào cần giải trình — Tất cả thiết kế đều tối giản, tinh gọn và bám sát kiến trúc dự án).*
