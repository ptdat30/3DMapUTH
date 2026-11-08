# 3DMapUTH

Hệ thống bản đồ số 3D Isometric và dẫn đường tương tác phục vụ số hóa không gian học đường tại Trường Đại học Giao thông Vận tải TP.HCM (UTH). Nền tảng giải quyết bài toán định vị không gian thời gian thực thông qua mã QR vật lý và thuật toán dẫn đường liên tầng từ sa bàn tổng thể ngoài trời đến từng phòng học cụ thể.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-23272f?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_(Strict)-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-049ef4?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 1. Key Features

- **Hiển thị 3D Isometric & Tối ưu hóa Mesh (LOD / Draco Compression):**
  Khởi tạo sa bàn kiến trúc trực quan bằng Three.js / React Three Fiber. Toàn bộ mô hình CAD (`.glb`) được xử lý qua pipeline nén đa giác `meshoptimizer` và Draco Compression, giảm tải hơn 90% dung lượng hình học mà vẫn bảo đảm độ phân giải và tỷ lệ thực của các tòa nhà. Tự động áp dụng Level of Detail (LOD) và đổ bóng phần cứng bằng `THREE.PCFShadowMap`.

- **Định vị & Dẫn đường liên tầng thông qua QR Node:**
  Giải quyết bài toán định vị trong nhà (Indoor Positioning) mà không phụ thuộc vào GPS sai số cao. Người dùng quét mã QR tại các vị trí mốc (cổng trường, chân cầu thang, sảnh thang máy), hệ thống đồng bộ Camera Rig với hướng nhìn thực tế và vẽ luồng đường đi 3D (3D Spline Path) theo 2 giai đoạn:
  1. *Chặng 1 (Outdoor Hub):* Di chuyển trên mặt bằng sa bàn khuôn viên đến sảnh tòa nhà đích.
  2. *Chặng 2 (Indoor Floor):* Tự động chuyển ngữ cảnh camera vào mặt cắt tầng tương ứng và dẫn trực diện tới cửa phòng học.

- **Phân tách kiến trúc UI / Canvas (Decoupled Architectural Rendering):**
  Toàn bộ ngữ cảnh WebGL 3D (`src/components/canvas/`) chạy độc lập với cây phân cấp giao diện 2D DOM (`src/components/ui/`). Quản lý trạng thái camera, chế độ xem (Overall Campus / Floor Plan), và bộ điều hướng thông qua bộ nhớ tập trung Zustand, loại bỏ hiện tượng re-render dư thừa trên Canvas.

- **Quản lý dữ liệu không gian phân cấp (Hierarchical Spatial Data):**
  Cấu trúc cơ sở dữ liệu định chuẩn quan hệ chặt chẽ từ Cơ sở (`Campus`), Khối nhà (`Building`), Mặt sàn (`Floor`), Phòng học (`Room`) đến Điểm mốc quét mã (`QrNode`), cho phép truy vấn định tuyến có trọng số và khả năng mở rộng đa cơ sở (Cơ sở 1 Võ Oanh, Cơ sở 3 Tân Triều...).

---

## 2. System Architecture & Data Model

Dữ liệu không gian và logic định tuyến tuân thủ nghiêm ngặt mô hình thực thể một chiều theo Hiến pháp Kỹ thuật dự án:

```
[ Campus ]
    │
    ├── 1:N ──> [ Building ]
    │               │
    │               ├── 1:N ──> [ Floor ]
    │               │               │
    │               │               └── 1:N ──> [ Room ]
    │               │                             │ (doorCoordinates)
    │               │                             ▼
    └── 1:N ──> [ QrNode ] ─────────> [ RouteSegment ] ── 1:N ──> [ RouteStep ]
```

### Chi tiết lược đồ quan hệ thực thể (ERD)

```mermaid
erDiagram
    Campus ||--o{ Building : contains
    Campus ||--o{ QrNode : locates
    Building ||--o{ Floor : has
    Building ||--o{ QrNode : anchors
    Floor ||--o{ Room : houses
    QrNode ||--o{ RouteSegment : initiates
    Building ||--o{ RouteSegment : routes_via_hub
    Room ||--o{ RouteSegment : targets
    RouteSegment ||--o{ RouteStep : executes

    Campus {
        string id PK
        string code UK "cs1, cs2, cs3"
        string name
        string overviewModelUrl
    }
    Building {
        string id PK
        string code UK
        string name
        json hubCoordinates "[x, y, z]"
    }
    Floor {
        string id PK
        int level "0 (Trệt), 1, 2..."
        string name
        string modelUrl
    }
    Room {
        string id PK
        string code
        string name
        string roomType "CLASSROOM, LAB, OFFICE..."
        json doorCoordinates "[x, y, z]"
    }
    QrNode {
        string id PK
        string code UK
        json coordinates "[x, y, z]"
        json initialCameraPos "[x, y, z]"
        json initialCameraTarget "[x, y, z]"
    }
    RouteSegment {
        string id PK
        enum type "OUTDOOR_HUB, INDOOR_FLOOR..."
    }
    RouteStep {
        string id PK
        int stepOrder
        string instruction
        enum directionType "STRAIGHT, LEFT, RIGHT, STAIRS_UP..."
        json pathPoints "Array of [x, y, z]"
    }
```

---

## 3. Tech Stack

| Tầng kiến trúc | Công nghệ sử dụng | Mục đích triển khai |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.4 (App Router)** | Kiến trúc Server/Client Components, Turbopack bundler, tối ưu SEO và routing |
| **Runtime & Language** | **React 19 + TypeScript (Strict)** | Xử lý logic trạng thái bất biến, kiểm soát kiểu dữ liệu tĩnh 100% không dùng `any` |
| **Styling & Components** | **Tailwind CSS v4 + shadcn/ui** | Hệ thống utility-first styling, Lucide React icons, giao diện responsive Desktop/Mobile |
| **3D WebGL Graphics** | **Three.js + R3F + Drei** | Render mesh 3D, camera rig động, xử lý đổ bóng phần cứng và shader đường dẫn sáng |
| **Animation Engine** | **GSAP (GreenSock)** | Chuyển cảnh camera tọa độ mượt mà giữa các điểm nhìn kiến trúc |
| **State Management** | **Zustand** | Quản lý state toàn cục tinh gọn, không boilerplate, tương thích WebGL render loops |
| **Database & ORM** | **PostgreSQL + Prisma ORM v6** | Lưu trữ quan hệ phân cấp, truy vấn định tuyến, bảo đảm toàn vẹn khóa ngoại |

---

## 4. Project Structure

Mã nguồn được phân tách theo nguyên tắc Atomic Design và Decoupled Graphics Pipeline:

```text
3DMapUTH/
├── public/                       # Static assets
│   ├── models/                   # 3D GLB models đã qua Draco/Meshopt
│   │   ├── cs1/                  # Assets Cơ sở 1 (toa_b_t1.glb, ...)
│   │   └── cs3/                  # Assets Cơ sở 3 (toa_h, toa_j, toa_l, xuong_oto, ...)
│   └── landmarks/                # Hình ảnh tham chiếu điểm mốc thực tế
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout, client patches, meta viewport
│   │   ├── page.tsx              # Viewport điều phối 3D và giao diện người dùng
│   │   └── api/                  # Serverless Route Handlers
│   │       ├── init-qr/route.ts  # Endpoint giải mã mã QR và trả về tọa độ điểm đứng
│   │       └── route-path/route.ts # Endpoint sinh lộ trình di chuyển đa điểm
│   ├── components/
│   │   ├── canvas/               # Graphics Layer (Three.js / WebGL Only)
│   │   │   ├── CampusCS3Scene.tsx    # Sa bàn 3D quy hoạch CS3 (Đường nội bộ, sân bóng, khối nhà)
│   │   │   ├── CampusMaquetteScene.tsx # Sa bàn quy hoạch CS1
│   │   │   ├── CADBuildingModel.tsx  # Dynamic loader với Error Boundary & material tuning
│   │   │   ├── CameraRig.tsx         # Điều khiển chuyển động camera với OrbitControls
│   │   │   ├── NavigationPath3D.tsx  # Catmull-Rom tube spline phát sáng chỉ hướng
│   │   │   └── BuildingTooltip.tsx   # 3D HTML annotation neo theo tọa độ mô hình
│   │   └── ui/                   # DOM Layer (React 2D UI Components)
│   │       ├── TopSearchBar.tsx      # Thanh tìm kiếm phòng học, bộ lọc phòng & khu vực
│   │       ├── FloorSelector.tsx     # Bộ chuyển tầng cho các tòa nhà đa tầng
│   │       ├── StepBottomSheet.tsx   # Bảng chỉ dẫn bước di chuyển (Mobile / Desktop)
│   │       └── CampusSwitcher.tsx    # Chuyển đổi giữa các cơ sở đào tạo
│   ├── data/
│   │   ├── realRoomsData.json    # Bộ dữ liệu 108 phòng học thực tế tại Cơ sở 3
│   │   └── mockNavigationData.ts # Fallback data source khi ngắt kết nối cơ sở dữ liệu
│   ├── store/
│   │   └── useNavigationStore.ts # Centralized Zustand store
│   └── types/
│       └── navigation.ts         # TypeScript interfaces & types định chuẩn dữ liệu
├── prisma/
│   ├── schema.prisma             # Lược đồ cơ sở dữ liệu quan hệ
│   └── seed.ts                   # Idempotent database seeder (upsert toàn bộ CS1 & CS3)
├── scripts/
│   ├── optimize-models.mjs       # Script nén Draco / meshoptimizer cho file .glb
│   └── generate-real-rooms.ts    # Parser dữ liệu phòng học thực tế từ CSV sang JSON
├── constitution.md               # Hiến pháp Kỹ thuật và chuẩn mực kiến trúc dự án
└── package.json
```

---

## 5. Getting Started

### 5.1. Yêu cầu hệ thống (Prerequisites)
- **Node.js:** Phiên bản `>= 20.x` (khuyến nghị `v20 LTS` hoặc `v22 LTS`).
- **PostgreSQL:** Phiên bản `>= 15` (cục bộ hoặc điện toán đám mây như Aiven, Supabase).
- **Trình quản lý gói:** `npm` (mặc định) hoặc `pnpm`.

### 5.2. Các bước cài đặt chi tiết

**Bước 1: Clone mã nguồn**
```bash
git clone https://github.com/ptdat30/3DMapUTH.git
cd 3DMapUTH
```

**Bước 2: Cài đặt dependencies**
```bash
npm install
```

**Bước 3: Thiết lập biến môi trường**
Tạo file `.env` tại thư mục gốc của dự án:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Cấu hình các tham số môi trường theo bảng dưới đây:

| Biến môi trường | Bắt buộc | Giá trị mẫu / Mô tả |
| :--- | :---: | :--- |
| `DATABASE_URL` | Có | `postgresql://user:password@host:port/dbname?sslmode=require` |
| `NEXT_PUBLIC_ASSET_PREFIX` | Không | Để trống nếu tải tài nguyên từ thư mục `/public` cục bộ |

**Bước 4: Đồng bộ cơ sở dữ liệu và nạp dữ liệu (Idempotent Seed)**
Chạy migration và script nạp 108 phòng học thực tế kèm mạng lưới định vị:
```bash
# Đồng bộ schema vào cơ sở dữ liệu PostgreSQL
npx prisma db push

# Nạp dữ liệu hạt giống (Script an toàn lặp lại, không gây duplicate key)
npm run db:seed
```

**Bước 5: Khởi chạy môi trường phát triển (Development Server)**
```bash
npm run dev
```

Truy cập hệ thống tại: `http://localhost:3000`

---

## 6. Development Scripts

| Lệnh thực thi | Mô tả chức năng |
| :--- | :--- |
| `npm run dev` | Khởi động Next.js development server với Turbopack tại port 3000 |
| `npm run build` | Kiểm tra tính đúng đắn của TypeScript và đóng gói bản phát hành Production |
| `npm run start` | Khởi chạy máy chủ Production sau khi hoàn tất lệnh build |
| `npm run lint` | Chạy bộ kiểm tra tĩnh mã nguồn ESLint v9 |
| `npm run db:seed` | Nạp toàn bộ dữ liệu cơ sở, tòa nhà, tầng, phòng học vào PostgreSQL qua Prisma |
| `npm run models:optimize` | Quét thư mục `public/models/` và nén tự động các mô hình `.glb` qua `meshoptimizer` |
| `npx prisma studio` | Khởi chạy giao diện web quản trị cơ sở dữ liệu trực quan |

---

## 7. Engineering Standards

Toàn bộ quy trình phát triển và kiểm thử mã nguồn được kiểm soát bởi các nguyên tắc trong tài liệu `constitution.md`:

- **Type Safety Tuyệt Đối (Zero `any`):** Mọi dữ liệu vào/ra từ API, Component Props và State Store phải được định kiểu tường minh bằng TypeScript Interface/Type. Sử dụng `unknown` kết hợp type guards trong trường hợp dữ liệu dynamic.
- **Tính Lặp Lại Của Dữ Liệu (Idempotent Seed):** Mọi thao tác ghi dữ liệu mẫu trong `prisma/seed.ts` bắt buộc sử dụng `upsert` hoặc xóa theo cascade để đảm bảo script có thể chạy vô số lần mà không gây ra lỗi xung đột khóa chính (`Unique constraint failed`).
- **Chính Sách Soft Delete:** Tuyệt đối không xóa cứng (hard delete) dữ liệu phòng học (`Room`) hoặc điểm mốc định vị (`QrNode`) trên môi trường vận hành. Trạng thái hoạt động được quản lý bằng trường `isActive`.
- **Phân Định Trách Nhiệm Ngôn Ngữ:**
  - Định danh kỹ thuật (Tên file, component, hàm, biến, type): 100% bằng tiếng Anh.
  - Chú thích kỹ thuật (Code comments), tài liệu giải thích (Architecture docs) và giao diện người dùng: Tiếng Việt chuẩn mực kỹ thuật.
- **Quy Chuẩn Commit (Conventional Commits):** Mọi commit phải tuân thủ định dạng chuẩn (`feat:`, `fix:`, `docs:`, `perf:`, `refactor:`).
- **Quality Gates Trước Khi Merge:** Bắt buộc vượt qua 3 chốt chặn:
  1. `npx tsc --noEmit` đạt 0 lỗi biên dịch.
  2. `npm run lint` đạt 0 lỗi và 0 cảnh báo.
  3. `npm run build` tạo artifact production thành công.
