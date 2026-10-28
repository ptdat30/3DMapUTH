# Bộ Prompt & Hướng Dẫn Khởi Tạo Dự Án Dẫn Đường 3D Trường Học Bằng Mã QR (Multi-Campus 3D Indoor/Outdoor Navigation)

Tài liệu này bao gồm **Master Prompt** (dùng để dán trực tiếp vào Cursor, Windsurf, GitHub Copilot hoặc ChatGPT/Claude khi lập trình), **Cây thư mục chuẩn**, **Thiết kế Database trên Aiven (1 GB)** và **Các câu lệnh Terminal khởi tạo dự án từ con số 0**.

## 1. Master Prompt Khởi Tạo Dự Án (Copy & Paste vào AI IDE)

Bạn hãy copy toàn bộ nội dung trong khối dưới đây và gửi cho AI trong trình soạn thảo code (Cursor / VS Code) để AI tự động sinh khung dự án chuẩn xác theo đúng kiến trúc đã chốt:

```text
Bạn là một Senior Full-stack Developer & 3D Web Graphics Engineer chuyên về Next.js, TypeScript, Three.js (React Three Fiber) và Prisma ORM.
Hãy giúp tôi khởi tạo cấu trúc mã nguồn (Project Scaffolding) cho đồ án: "Hệ thống dẫn đường 3D từng bước (Step-by-step) trong khuôn viên trường đại học thông qua mã QR cố định".

### 1. BỐI CẢNH & QUY TẮC NGHIỆP VỤ CỐT LÕI
- Quy mô: Trường có 3 Cơ sở (Campuses). Mỗi cơ sở có nhiều Tòa nhà (Buildings), mỗi tòa nhà có nhiều Tầng (Floors) và nhiều Phòng (Rooms).
- Vị trí mã QR cố định: Người dùng dùng điện thoại quét mã QR dán cố định tại cổng trường, sảnh tòa nhà, cầu thang... URL trong mã QR có dạng: `https://domain.com/?campus=cs1&qr=qr_cong_chinh`.
- Không tính toán thuật toán tìm đường phức tạp lúc chạy (No real-time pathfinding): Toàn bộ kịch bản đường đi được thiết lập sẵn (Pre-baked paths) và chia thành từng bước (Step-by-step) để người dùng bấm "Bước tiếp theo" (Next) hoặc "Quay lại" (Prev).
- Cơ chế ghép nối 2 chặng (2-Stage Route Concatenation) để tối ưu dữ liệu cho cơ sở có nhiều tòa nhà:
  + Chặng 1 (Outdoor / Liên tòa): Đi từ Điểm QR hiện tại -> Điểm Sảnh Tòa Nhà Đích (Building Hub). Hiển thị mô hình 3D Toàn cảnh cơ sở (`OVERALL_CAMPUS` mode).
  + Chặng 2 (Indoor / Nội bộ tòa): Đi từ Điểm Sảnh Tòa Nhà Đích -> Cửa Phòng Đích. Tự động chuyển sang chế độ cắt lớp từng tầng của tòa nhà đó (`BUILDING_FLOOR` mode).
  + Nếu Điểm QR và Phòng Đích nằm cùng một tòa nhà, hệ thống bỏ qua Chặng 1 và chỉ chạy Chặng 2.

### 2. TECH STACK YÊU CẦU
- Framework: Next.js (App Router), TypeScript, Tailwind CSS.
- 3D Rendering: Three.js, `@react-three/fiber`, `@react-three/drei`, `gsap` (để làm hiệu ứng bay Camera mượt mà và vẽ đường ống mũi tên 3D theo từng bước).
- State Management: `zustand` (quản lý bước hiện tại, chế độ xem Toàn cảnh / Từng tầng, tọa độ Camera).
- Icons & UI: `lucide-react`.
- Database: PostgreSQL (hoặc MySQL)托管 trên Aiven (gói Free 1GB) kết nối qua Prisma ORM. Database chỉ lưu dữ liệu Text, tọa độ JSON `[x, y, z]` và URL trỏ tới file `.glb` / ảnh thực tế (lưu trên Cloudflare R2 / Cloudinary).

### 3. YÊU CẦU GIAO DIỆN MOBILE-FIRST (9:16)
Thiết kế giao diện chính tại `src/app/page.tsx` chia làm 3 lớp (Layers):
1. Top Floating Search Bar: Hiển thị điểm xuất phát (từ mã QR), thanh tìm kiếm chọn Phòng đích, hiển thị tên Phòng + Tòa + Cơ sở.
2. Center 3D Viewport (Full-screen Canvas):
   - Render mô hình `.glb` dạng tối giản (White/Clay semi-transparent style).
   - Vẽ đường dẫn 3D màu xanh phát sáng (Glowing Cyan Tube/Arrow) nối các tọa độ của bước hiện tại.
   - Hiển thị Ghim "Bạn đang ở đây" tại điểm QR và Floating Photo Pin (ảnh chụp thực tế tại ngã rẽ/cầu thang của bước hiện tại).
   - Bên phải có thanh Floating Pill Selector: `[Toàn cảnh]`, `[Tên Tòa]`, `[T1]`, `[T2]`, `[T3]`.
3. Bottom Sheet Card:
   - Hiển thị tiến độ `Bước X / Tổng số bước`.
   - Icon hướng di chuyển (Đi thẳng, Rẽ trái, Rẽ phải, Lên cầu thang) + Câu chỉ dẫn ngắn gọn.
   - Hai nút bấm lớn: `[Quay lại]` và `[Bước tiếp theo]`.

### 4. NHIỆM VỤ CỦA BẠN TRONG LƯỢT NÀY
Hãy tạo lần lượt:
1. Cây thư mục chi tiết và file `prisma/schema.prisma` phản ánh đúng cấu trúc 3 Cơ sở -> Tòa nhà -> Tầng -> Phòng / Điểm QR / Kịch bản 2 chặng.
2. Store Zustand (`src/store/useNavigationStore.ts`) quản lý danh sách các bước (Steps) sau khi ghép Chặng 1 + Chặng 2, hàm `nextStep()`, `prevStep()`, và trạng thái Camera/Tầng.
3. Component 3D mẫu (`src/components/canvas/CampusScene.tsx` và `PathTube.tsx`) sử dụng `@react-three/fiber` và `gsap` để di chuyển Camera theo tọa độ của từng bước.
4. Dữ liệu mẫu (`src/data/mockNavigationData.ts`) cho Cơ sở 1 (gồm QR Cổng Chính, Tòa A, Tòa B, và đường đi 4 bước tới Phòng B302) để chạy thử ngay trên trình duyệt khi chưa cần file `.glb` thật.
```

## 2. Cây Thư Mục Chuẩn Của Dự Án (Project Structure)

Cấu trúc dưới đây tách biệt rõ ràng phần **Hiển thị 3D (`canvas`)**, **Giao diện điều khiển (`ui`)**, **Quản lý trạng thái (`store`)** và **Cơ sở dữ liệu Aiven (`prisma`)**:

```text
campus-3d-nav/
├── prisma/
│   ├── schema.prisma              # Cấu trúc bảng cho Database Aiven (1GB)
│   └── seed.ts                    # Script nạp dữ liệu mẫu cho 3 cơ sở
├── public/
│   ├── models/                    # Chứa file 3D (.glb) khi chạy local (sau đưa lên Cloudflare R2)
│   │   ├── cs1/
│   │   │   ├── cs1_overview.glb   # Khối tổng thể sân trường & vỏ các tòa A, B, C
│   │   │   ├── toa_b_t1.glb       # Mặt cắt nội thất Tòa B - Tầng 1
│   │   │   ├── toa_b_t2.glb       # Mặt cắt nội thất Tòa B - Tầng 2
│   │   │   └── toa_b_t3.glb       # Mặt cắt nội thất Tòa B - Tầng 3
│   │   ├── cs2/
│   │   └── cs3/
│   └── landmarks/                 # Ảnh chụp thực tế tại các điểm rẽ/cầu thang
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── init-qr/route.ts   # API lấy thông tin điểm QR & danh sách phòng khi vừa quét mã
│   │   │   └── route-path/route.ts# API ghép nối Chặng 1 (Outdoor) + Chặng 2 (Indoor) trả về mảng Steps
│   │   ├── admin/                 # Trang công cụ nội bộ để click lên mô hình 3D lấy tọa độ (x,y,z) nhanh
│   │   ├── layout.tsx
│   │   └── page.tsx               # Màn hình chính khi sinh viên quét mã QR
│   ├── components/
│   │   ├── canvas/                # Toàn bộ các thành phần 3D (React Three Fiber)
│   │   │   ├── CampusScene.tsx    # Khung cảnh 3D chính, ánh sáng, chuyển đổi Toàn cảnh <-> Tòa nhà
│   │   │   ├── BuildingModel.tsx  # Load file .glb và xử lý hiệu ứng tách tầng / làm mờ (Opacity)
│   │   │   ├── PathTube.tsx       # Vẽ đường dẫn mũi tên xanh phát sáng theo từng bước
│   │   │   ├── CameraRig.tsx      # Điều khiển Camera bay mượt mà bằng GSAP khi bấm Next/Prev
│   │   │   └── LandmarkPin.tsx    # Ghim "Bạn đang ở đây" & khung ảnh chụp thực tế nổi trong không gian 3D
│   │   └── ui/                    # Giao diện 2D đè lên trên màn hình 3D
│   │       ├── TopSearchBar.tsx   # Thanh tìm kiếm phòng & hiển thị vị trí QR hiện tại
│   │       ├── FloorSelector.tsx  # Nút chọn: Toàn cảnh | Tòa B | T1 | T2 | T3 bên cạnh phải
│   │       └── StepBottomSheet.tsx# Thẻ chỉ dẫn từng bước + nút [Quay lại] / [Bước tiếp theo]
│   ├── store/
│   │   └── useNavigationStore.ts  # Zustand store lưu trữ bước hiện tại, tầng hiện tại, danh sách steps
│   ├── types/
│   │   └── navigation.ts          # Định nghĩa kiểu dữ liệu TypeScript cho Vector3, Step, QRNode, Room
│   ├── lib/
│   │   └── prisma.ts              # Khởi tạo kết nối Prisma tới Aiven Database
│   └── data/
│       └── mockNavigationData.ts  # Dữ liệu giả lập để test giao diện ngay khi chưa nhập DB
├── .env                           # Lưu DATABASE_URL của Aiven và NEXT_PUBLIC_CDN_URL
├── package.json
└── tsconfig.json
```

## 3. Thiết Kế Database Trên Aiven (`prisma/schema.prisma`)

Sơ đồ dưới đây giúp bạn lưu trữ toàn bộ **3 cơ sở, nhiều tòa nhà, hàng trăm phòng và hàng nghìn bước dẫn đường** mà chỉ tốn chưa tới **15 MB** trên gói 1 GB miễn phí của Aiven:

| Tên Bảng (Model) | Vai trò chính | Các trường dữ liệu quan trọng |
| :--- | :--- | :--- |
| **`Campus`** | Quản lý 3 cơ sở (`cs1`, `cs2`, `cs3`) | `code`, `name`, `overviewModelUrl` (link file `.glb` toàn cảnh sân trường) |
| **`Building`** | Quản lý các tòa nhà trong từng cơ sở (`Toa_A`, `Toa_B`) | `campusId`, `code`, `name`, `hubCoordinates` (tọa độ cửa sảnh chính `[x,y,z]`) |
| **`Floor`** | Quản lý từng tầng của mỗi tòa nhà | `buildingId`, `level` (`1`, `2`, `3`), `modelUrl` (link file `.glb` của tầng đó) |
| **`QrNode`** | Điểm dán mã QR cố định (Điểm xuất phát) | `code` (truyền qua URL), `campusId`, `buildingId` (nullable nếu ở sân), `coordinates`, `initialCameraPos`, `initialCameraTarget` |
| **`Room`** | Điểm đến (Phòng học, Phòng ban, Lab, WC) | `code` (`B302`), `name`, `keywords` (từ khóa tìm kiếm), `floorId`, `doorCoordinates` |
| **`RouteSegment`** | Chứa kịch bản đường đi (Chia làm 2 loại: `OUTDOOR_QR_TO_HUB` và `INDOOR_HUB_TO_ROOM`) | `type`, `fromQrId`, `toBuildingId`, `fromBuildingId`, `toRoomId`, danh sách `steps` |
| **`RouteStep`** | Từng bước cụ thể khi bấm Next / Prev | `stepOrder`, `instruction` (câu chỉ dẫn), `directionIcon`, `viewMode` (`OVERALL` hay `FLOOR`), `floorLevel`, `pathPoints` (mảng tọa độ vẽ đường xanh), `cameraPos`, `cameraTarget`, `landmarkPhotoUrl` |

Nội dung file `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // Hoặc "mysql" tùy dịch vụ bạn chọn trên Aiven
  url      = env("DATABASE_URL")
}

model Campus {
  id               String     @id @default(cuid())
  code             String     @unique // VD: "cs1", "cs2", "cs3"
  name             String     // VD: "Cơ sở 1 - Quận 1"
  overviewModelUrl String     // URL file .glb toàn cảnh cơ sở
  buildings        Building[]
  qrNodes          QrNode[]
}

model Building {
  id             String         @id @default(cuid())
  code           String         // VD: "toa_a", "toa_b"
  name           String         // VD: "Tòa nhà B"
  campusId       String
  campus         Campus         @relation(fields: [campusId], references: [id])
  hubCoordinates Json           // Tọa độ sảnh chính [x, y, z] để nối Chặng 1 và Chặng 2
  floors         Floor[]
  qrNodes        QrNode[]
  routesToHub    RouteSegment[] @relation("ToBuildingHub")
  routesFromHub  RouteSegment[] @relation("FromBuildingHub")

  @@unique([campusId, code])
}

model Floor {
  id         String   @id @default(cuid())
  level      Int      // VD: 1, 2, 3
  name       String   // VD: "Tầng 1", "Tầng 2"
  modelUrl   String   // URL file .glb mặt cắt riêng của tầng này
  buildingId String
  building   Building @relation(fields: [buildingId], references: [id])
  rooms      Room[]

  @@unique([buildingId, level])
}

model QrNode {
  id                  String         @id @default(cuid())
  code                String         @unique // VD: "cs1_qr_cong_chinh", "cs1_toa_b_t1"
  name                String         // VD: "Cổng chính Cơ sở 1"
  campusId            String
  campus              Campus         @relation(fields: [campusId], references: [id])
  buildingId          String?        // Null nếu QR dán ngoài sân trường
  building            Building?      @relation(fields: [buildingId], references: [id])
  floorLevel          Int?           // Null nếu ở ngoài sân
  coordinates         Json           // [x, y, z] vị trí đặt ghim "Bạn đang ở đây"
  initialCameraPos    Json           // [x, y, z] vị trí Camera ban đầu khớp hướng mắt người quét
  initialCameraTarget Json           // [x, y, z] điểm nhìn của Camera ban đầu
  routes              RouteSegment[]
}

model Room {
  id              String         @id @default(cuid())
  code            String         // VD: "B302"
  name            String         // VD: "Phòng Lab AI B302"
  searchKeywords  String         // VD: "lab ai, thực hành máy tính, b302"
  floorId         String
  floor           Floor          @relation(fields: [floorId], references: [id])
  doorCoordinates Json           // [x, y, z]
  routes          RouteSegment[]
}

enum SegmentType {
  OUTDOOR_QR_TO_HUB   // Chặng 1: Từ điểm QR ngoài sân/tòa khác -> Sảnh tòa nhà đích
  INDOOR_HUB_TO_ROOM  // Chặng 2: Từ Sảnh tòa nhà đích -> Phòng đích
  DIRECT_QR_TO_ROOM   // Trường hợp QR nằm cùng tầng/cùng tòa với Phòng đích
}

enum ViewMode {
  OVERALL_CAMPUS      // Hiển thị mô hình toàn cảnh các tòa trong cơ sở
  BUILDING_FLOOR      // Zoom vào 1 tòa và tách tầng
}

model RouteSegment {
  id             String      @id @default(cuid())
  type           SegmentType
  fromQrId       String?
  fromQr         QrNode?     @relation(fields: [fromQrId], references: [id])
  toBuildingId   String?
  toBuilding     Building?   @relation("ToBuildingHub", fields: [toBuildingId], references: [id])
  fromBuildingId String?
  fromBuilding   Building?   @relation("FromBuildingHub", fields: [fromBuildingId], references: [id])
  toRoomId       String?
  toRoom         Room?       @relation(fields: [toRoomId], references: [id])
  steps          RouteStep[]
}

model RouteStep {
  id               String       @id @default(cuid())
  segmentId        String
  segment          RouteSegment @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  stepOrder        Int          // Thứ tự bước: 1, 2, 3...
  instruction      String       // VD: "Đi qua sân trường 50m hướng về sảnh chính Tòa B"
  directionType    String       // "STRAIGHT" | "LEFT" | "RIGHT" | "STAIRS_UP" | "ARRIVED"
  viewMode         ViewMode     // OVERALL_CAMPUS hoặc BUILDING_FLOOR
  buildingCode     String?      // VD: "toa_b" (nếu ở chế độ BUILDING_FLOOR)
  floorLevel       Int?         // VD: 1, 2, 3 (tầng cần bật sáng ở bước này)
  pathPoints       Json         // Mảng tọa độ [[x1,y1,z1], [x2,y2,z2]] để vẽ đường ống 3D của bước này
  cameraPos        Json         // [x, y, z] vị trí Camera bay tới ở bước này
  cameraTarget     Json         // [x, y, z] góc nhìn Camera ở bước này
  landmarkPhotoUrl String?      // Ảnh chụp thực tế tại điểm rẽ/cầu thang (nếu có)
}
```

## 4. Các Bước Thực Hành Setup Dự Án Ngay Trên Máy (Step-by-step)

Bạn mở Terminal (hoặc Command Prompt / PowerShell) và chạy lần lượt 5 bước sau để dựng khung dự án chạy được ngay:

### Bước 1: Khởi tạo dự án Next.js + TypeScript + Tailwind CSS
```bash
npx create-next-app@latest campus-3d-nav --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd campus-3d-nav
```

### Bước 2: Cài đặt bộ thư viện 3D (Three.js + React Three Fiber + GSAP) & State Management
```bash
# Cài đặt Three.js, React Three Fiber, Drei (hỗ trợ load file .glb, Html pin, Camera) và GSAP
npm install three @react-three/fiber @react-three/drei gsap zustand lucide-react clsx tailwind-merge

# Cài đặt bộ định nghĩa kiểu TypeScript cho Three.js
npm install -D @types/three
```

### Bước 3: Cài đặt và kết nối Prisma với Aiven Database (1 GB Free)
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```
Sau khi chạy `npx prisma init`, bạn mở file `.env` ở thư mục gốc và dán chuỗi kết nối **Service URI** lấy từ trang quản trị Aiven vào:
```env
# Thay bằng Service URI từ tài khoản Aiven PostgreSQL của bạn
DATABASE_URL="postgres://avnadmin:MAT_KHAU_CUA_BAN@pg-campus-nav.aivencloud.com:12345/defaultdb?sslmode=require"

# URL kho chứa file 3D (.glb) và ảnh thực tế (lúc đang code dưới máy để trống sẽ lấy trong thư mục public/)
NEXT_PUBLIC_ASSET_PREFIX=""
```
Sau đó copy nội dung `schema.prisma` ở **Mục 3** vào file `prisma/schema.prisma` rồi đẩy cấu trúc bảng lên Aiven bằng lệnh:
```bash
npx prisma db push
```

### Bước 4: Tạo công cụ "Click lấy tọa độ 3D nhanh" (Mẹo cực kỳ quan trọng khi làm đồ án)
Khi đưa mô hình 3D vào web, nếu bạn phải tự mò tọa độ `[x, y, z]` của từng cửa phòng, ngã rẽ và góc đặt Camera trong Blender rồi gõ tay vào Database thì rất dễ lệch.
Khi bảo AI (Cursor/Copilot) viết code, bạn hãy dán thêm **Prompt phụ** này để tạo một trang Admin ẩn (`/admin/map-editor`) giúp bạn nhập liệu cho 3 cơ sở nhanh gấp 10 lần:

```text
Hãy tạo giúp tôi một trang công cụ nội bộ tại `src/app/admin/map-editor/page.tsx`:
1. Cho phép chọn hiển thị file `.glb` của bất kỳ Cơ sở / Tòa nhà / Tầng nào.
2. Khi tôi click chuột vào bất kỳ điểm nào trên sàn nhà 3D (sử dụng sự kiện `onClick={(e) => e.point}` của `@react-three/fiber`), hãy hiển thị tọa độ `[e.point.x, e.point.y, e.point.z]` đã làm tròn 2 chữ số thập phân và tự động thêm điểm đó vào mảng `pathPoints`.
3. Thêm nút "Lấy góc Camera hiện tại" (đọc `camera.position` và `controls.target` từ `OrbitControls`) để tôi xoay góc nhìn ưng ý nhất cho Bước đó rồi bấm 1 nút là copy được ngay chuỗi JSON cấu hình của `RouteStep` (`pathPoints`, `cameraPos`, `cameraTarget`) đem lưu vào Database Aiven.
```

### Bước 5: Chạy thử nghiệm trên máy và điện thoại cùng mạng Wi-Fi
```bash
npm run dev -- -H 0.0.0.0
```
* Khi thêm cờ `-H 0.0.0.0`, bạn có thể lấy địa chỉ IPv4 của laptop (ví dụ `http://192.168.1.15:3000/?campus=cs1&qr=cs1_qr_cong_chinh`) tạo thành mã QR thử nghiệm.
* Dùng điện thoại quét trực tiếp mã QR đó để kiểm tra độ mượt của thao tác bấm **Bước tiếp theo / Quay lại** ngay trên màn hình cảm ứng thật.
