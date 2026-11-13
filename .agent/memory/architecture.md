# Project Architecture & Technical Overview

## 1. Directory Structure

```text
3DMapUTH/
├── .agent/
│   ├── memory/
│   │   ├── architecture.md       # Cấu trúc kỹ thuật, kiến trúc thư mục, tech stack
│   │   └── progress.md           # Nhật ký tiến độ, lịch sử fix bug và roadmap
│   ├── rules/
│   │   └── auto-skill-router.md  # Giao thức điều phối Auto-Skill Routing
│   └── skills/                   # 6 Agent Skills chuyên sâu (Vibe, R3F, GLSL, Blender, Motion, Debugger)
├── .antigravity/
│   └── mcp.json                  # Cấu hình 5 MCP Servers cho Antigravity
├── .cursor/
│   └── mcp.json                  # Cấu hình 5 MCP Servers cho Cursor IDE
├── .antigravityrules             # Quy tắc hệ thống Vibe Coding & Auto-Skill Router
├── .cursorrules                  # Quy tắc hệ thống Cursor IDE
├── cad_models/                   # Source CAD Python (build123d / cadgen)
├── prisma/
│   ├── schema.prisma             # Lược đồ cơ sở dữ liệu (PostgreSQL)
│   └── seed.ts                   # Kịch bản nạp dữ liệu cơ sở 1 & cơ sở 3
├── public/
│   ├── landmarks/                # Ảnh chụp thực tế các mốc điểm trường
│   └── models/
│       └── cs3/                  # Danh mục model 3D .glb đã tối ưu hóa cho CS3
├── src/
│   ├── app/                      # Next.js 16 App Router (page.tsx, layout.tsx, api routes)
│   ├── components/
│   │   ├── canvas/               # WebGL R3F Scenes & 3D Components
│   │   │   ├── CADBuildingModel.tsx      # Loader GLTF với WeakMap cache & Error Boundary
│   │   │   ├── CampusCS3Scene.tsx        # Toàn cảnh Cơ sở 3 (Đường, sân bóng, bãi xe, khối nhà)
│   │   │   ├── CampusMaquetteScene.tsx   # Toàn cảnh Cơ sở 1 (Sa bàn kiến trúc)
│   │   │   ├── CameraRig.tsx             # GSAP Timeline điều phối Orbit Camera
│   │   │   ├── CinematicTourManager.tsx  # Quản lý tour bay camera khi tìm phòng Gym
│   │   │   ├── NavigationPath3D.tsx      # Ống ánh sáng dẫn đường 3D (TubeGeometry)
│   │   │   └── BuildingTooltip.tsx       # Html annotation tương tác trên đầu tòa nhà
│   │   └── ui/                   # Giao diện phẳng Next.js / Tailwind CSS
│   │       ├── TopSearchBar.tsx          # Thanh tìm kiếm phòng học / tòa nhà
│   │       ├── FloorSelector.tsx         # Bộ chọn tầng & lọc phòng
│   │       └── StepBottomSheet.tsx       # Bảng hướng dẫn đường đi từng bước
│   ├── data/
│   │   ├── cs3Layout.ts          # Cấu hình tọa độ, góc xoay, tỉ lệ và móng 8 khối CS3
│   │   └── mockNavigationData.ts # Dữ liệu đồ thị đường đi mốc điểm CS1 & CS3
│   ├── hooks/
│   │   └── useCinematicTour.ts   # Custom hook timeline camera, highlight & draw path
│   ├── lib/
│   │   └── prisma.ts             # Prisma Client singleton
│   ├── store/
│   │   └── useNavigationStore.ts # Zustand global store quản lý navigation & camera state
│   └── types/
│       └── navigation.ts         # TypeScript interfaces & types
└── tools/
    └── blender_mcp_addon.py      # Addon Blender MCP kết nối AI trực tiếp với Blender
```

## 2. Core Tech Stack

- **Framework:** Next.js 16.4.3 (App Router, Turbopack, React 19 Strict Mode)
- **3D Graphics & Rendering:**
  - Three.js (`three` + `@types/three` v0.186.x)
  - React Three Fiber (`@react-three/fiber` v9.x)
  - Drei Helper Suite (`@react-three/drei` v10.x)
  - Physics Engine (`@react-three/rapier`)
  - Post-processing (`@react-three/postprocessing`)
- **Animation & Motion:**
  - GSAP v3.15.x (`gsap` Timeline & Easing)
  - Framer Motion v14.x
  - Theatre.js (`@theatre/core`, `@theatre/studio`)
- **State Management:** Zustand v5 (Single source of truth cho Navigation, Campus, Active Floor, Cinematic Tour)
- **Database & ORM:** PostgreSQL (Aiven Cloud Managed) + Prisma ORM v6
- **Styling:** Tailwind CSS v4 + Lucide React (`strokeWidth={1.5}`)
- **Vibe Coding & AI Tools:**
  - 5 MCP Servers: `context7`, `playwright`, `sequential-thinking`, `magic-ui`, `blender`
  - Blender MCP Addon v1.8

## 3. Danh mục 3D Models (.glb) tại Cơ sở 3 (CS3)

| Mã tòa | File Model | Dung lượng | Số đa giác (Tris) | Vị trí Three.js [X, Y, Z] | Chức năng |
| --- | --- | --- | --- | --- | --- |
| `toa_h` | `/models/cs3/toa_h.glb` | 935 KB | 56,104 | `[-7.5, 2.7, 1.0]` | Trung tâm Hành chính & Đào tạo 6 tầng (hình chữ U) |
| `toa_i_lon` | `/models/cs3/toa_i_lon.glb` | 1.55 MB | 88,916 | `[-16.0, 2.95, -19.5]` | Khu Giảng đường 5 tầng góc Tây Bắc |
| `toa_i_small` | `/models/cs3/toa_i_small.glb` | 2.34 MB | 99,876 | `[-26.5, 1.1, -19.5]` | Khu phụ trợ & phòng thực hành chuyên đề |
| `xuong_oto` | `/models/cs3/xuong_oto.glb` | 1.59 MB | 91,160 | `[-25.0, 1.75, 1.0]` | Xưởng thực hành Khoa Cơ khí Động lực |
| `toa_j` | `/models/cs3/toakytucxa.glb` | 1.63 MB | 92,440 | `[16.5, 3.01, -19.5]` | Ký túc xá & Giảng đường Đa năng 6 tầng phía Đông Bắc |
| `toa_k` | `/models/cs3/toa_k.glb` | 645 KB | 36,808 | `[16.0, 2.7, 1.5]` | Viện Đào tạo & Nghiên cứu Đèo Cả 7 tầng |
| `toa_l` | `/models/cs3/toa_l.glb` | 881 KB | 51,066 | `[14.8, 1.3, 22.3]` | Phòng Gym UTH Fitness & Phòng CNTT & Trạm Y tế |
| `nha_da_nang` | `/models/cs3/nha_da_nang.glb` | 763 KB | 46,254 | `[28.9, 1.95, 20.5]` | Nhà thi đấu đa năng có mái vòm (Góc Đông Nam Cổng 2) |

## 4. Cơ cấu Quy hoạch Mặt bằng & Tọa độ Cơ sở 1 (CS1 - Số 2 Võ Oanh)

Quản lý tập trung qua `src/data/cs1Layout.ts` và render tại `src/components/canvas/CampusMaquetteScene.tsx`.

| Mã tòa / Khu vực | Tên công trình | Vị trí Three.js [X, Y, Z] | File Model (.glb) | Dung lượng | Chức năng |
| --- | --- | --- | --- | --- | --- |
| `toa_a` | Tòa Nhà A (Khối duy nhất) | `[2.0, 4.25, 18.2]` | Procedural Maquette | - | Khối Hiệu Bộ, Ban Giám Hiệu, Hội Trường & Phòng Đào Tạo |
| `toa_b` | Tòa Nhà B (Chữ L) | `[-18.9, 4.25, 8.0]` | `/models/cs1/toa_b.glb` | 4.26 MB (gốc 96.6MB) | Giảng đường B, Khoa CNTT & Hệ thống Lab máy tính / AI |
| `toa_c` | Tòa Nhà C (Chữ L) | `[14.9, 4.05, 0.4]` | `/models/cs1/toa_c.glb` | 2.60 MB (gốc 60.6MB) | Giảng đường C đa ngành & Văn phòng các Viện |
| `toa_d` | Tòa Nhà D | `[-3.6, 4.0, -21.5]` | `/models/cs1/toa_d.glb` | 4.12 MB (gốc 82.5MB) | Giảng đường chuyên đề phía sau (cuối hành lang thông gió B-C) |
| `toa_f` | Tòa Nhà F | `[-19.9, 3.5, -17.3]` | `/models/cs1/toa_f.glb` | 5.22 MB (gốc 120.8MB) | Phòng học chuyên ngành & Sau đại học (Góc Tây Bắc) |
| `toa_e` | Tòa Nhà E | `[25.9, 4.25, 14.7]` | Procedural Maquette | - | Viện Đào Tạo Quốc Tế (Chạy dọc mép ranh giới phía Đông) |
| `pkg_cs1_center` | Bãi Xe Trung Tâm | `[-5.1, 0.05, 4.7]` | Sàn đỏ `#ff3131` | - | Sân sinh hoạt chung & Bãi xe trung tâm lớn |
| `pkg_cs1_front` | Bãi Xe Mặt Tiền | `[2.0, 0.05, 25.7]` | Sàn đỏ `#ff3131` | - | Dải bãi đỗ xe dọc cổng chính đường Võ Oanh |
| `pkg_cs1_southwest` | Nhà Xe Cán Bộ | `[-18.9, 0.05, 23.0]` | Sàn đỏ `#ff3131` | - | Nhà xe có mái che góc Tây Nam |

## 5. Hệ thống Quản lý State (Zustand: `useNavigationStore`)

- **Campus Mode:** `currentCampusCode`: `'cs1' | 'cs3'`
- **View Mode:** `viewMode`: `'OVERALL_CAMPUS' | 'BUILDING_FLOOR' | 'ROOM_DETAIL'`
- **Selection State:** `selectedBuildingCode`, `activeBuildingCode`, `activeFloorLevel`
- **Route Planning:** `activeRoute`, `routeSteps`, `targetRoom`, `isNavigating`
- **Cinematic Tour:** `isCinematicTouring`, `tourProgress`, `isHighlightingTarget`
- **Camera Rig Control:** `cameraPosition`, `cameraTarget`, `isCameraAnimating`
