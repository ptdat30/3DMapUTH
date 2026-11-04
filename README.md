# 🏛️ 3DMapUTH — Hệ Thống Bản Đồ Số & Dẫn Đường Nội Khu 3D UTH

> Bản đồ số 3D tương tác kiến trúc và hệ thống dẫn đường nội khu thông minh cho các cơ sở của **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**. Hỗ trợ quét mã QR tại chỗ, định vị phòng học theo thời gian thực, xem bản đồ phân tầng (Floor Map) và trải nghiệm sa bàn 3D chân thực.

![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.186-orange?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.19-green?style=flat-square&logo=prisma)

---

## 📌 Tính Năng Nổi Bật

- **🌐 Đa Khuôn Viên (Multi-Campus):**
  - **Cơ sở 1 (Võ Oanh):** Sa bàn kiến trúc tổng quan các Tòa A, B, C, E và khu hiệu bộ.
  - **Cơ sở 3 (Tân Triều - 3D Masterplan):** Sa bàn quy hoạch 3D đầy đủ hệ thống giao thông vòng xuyến, vạch kẻ đường, sân bóng đá cỏ nhân tạo và các khối nhà thực tế (Tòa H, Tòa L, Tòa J, Nhà Đa Năng, Xưởng Ô Tô, Nhà I...).
- **🧭 Dẫn Đường 2 Chặng Liên Hoàn (Dual-Segment Navigation):**
  - *Chặng 1 (Ngoài trời / Sa bàn):* Dẫn từ cổng vào / vị trí hiện tại đến sảnh chính tòa nhà mục tiêu.
  - *Chặng 2 (Trong nhà / Từng tầng):* Tự động chuyển camera vào sơ đồ mặt bằng tầng và dẫn từng bước đến cửa phòng học.
- **📱 Quét Mã QR Định Vị Tức Thì:** Đặt tham số URL `?qr=QR_CS1_GATE_MAIN` để xác định ngay vị trí sinh viên đang đứng.
- **🏢 Bản Đồ Phân Tầng (Interactive Floor Selector):** Chuyển đổi mượt mà giữa các tầng (Tầng 1, 2, 3...) với góc nhìn mặt cắt trực quan.
- **🚀 Tối Ưu Hóa Siêu Nhẹ (Mobile & 4G Ready):**
  - Toàn bộ mô hình 3D được nén giảm tải đa giác **> 92%** bằng thuật toán `meshoptimizer`.
  - Cơ chế **Progressive Loading**: Sa bàn và lô đất hiển thị tức thì (0.1 giây), mô hình 3D tải ngầm phía sau mà không gây trắng màn hình.

---

## 💻 Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js:** Phiên bản **`v20.x`** trở lên (khuyến nghị **v20 LTS** hoặc **v22 LTS**).
- **Trình quản lý gói:** `npm` (đi kèm Node.js) hoặc `pnpm` / `yarn`.
- **Git:** Đã cài đặt trên máy.
- *(Tùy chọn)* **Python 3.10+ / uv:** Chỉ cần thiết nếu bạn muốn chạy các script sinh mô hình CAD tham số tự động (`cadgen`).

---

## 🚀 Hướng Dẫn Cài Đặt Cho Máy Mới Vừa Clone Code

Thực hiện lần lượt các bước sau trên Terminal / Command Prompt:

### Bước 1: Clone mã nguồn về máy

```bash
git clone https://github.com/ptdat30/3DMapUTH.git
cd 3DMapUTH
```

### Bước 2: Cài đặt các thư viện (Dependencies)

```bash
npm install
```

> **Lưu ý:** Dự án sử dụng React 19 và Next.js 16. Nếu gặp cảnh báo tương thích trên một số hệ điều hành, lệnh `npm install` vẫn hoàn tất bình thường.

### Bước 3: Thiết lập biến môi trường (`.env`)

Sao chép file cấu hình mẫu `.env.example` thành `.env`:

- **Trên Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Trên macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

Nội dung cơ bản của file `.env`:
```env
# Chuỗi kết nối PostgreSQL (Mặc định có thể để trống hoặc dùng URI từ Aiven/Supabase/PostgreSQL cục bộ)
DATABASE_URL="postgresql://avnadmin:YOUR_PASSWORD@pg-campus-nav.aivencloud.com:12345/defaultdb?sslmode=require"

# Tiền tố CDN cho tài nguyên 3D (để trống để lấy trực tiếp từ thư mục public/ cục bộ)
NEXT_PUBLIC_ASSET_PREFIX=""
```

> **Ghi chú về Database:** Dự án đã tích hợp sẵn cơ chế **Mock Data độc lập** trong `src/data/mockNavigationData.ts`. Kể cả khi bạn chưa có Database PostgreSQL, ứng dụng vẫn chạy đầy đủ 100% tính năng bản đồ và dẫn đường offline!

### Bước 4: Tạo Prisma Client

Khởi tạo mã nguồn Prisma Client tương thích với phiên bản máy bạn:

```bash
npx prisma generate
```

*(Nếu bạn có sẵn Database PostgreSQL và muốn nạp dữ liệu vào bảng, chạy tiếp: `npx prisma db push` và `npm run db:seed`).*

### Bước 5: Khởi chạy môi trường phát triển (Development Server)

```bash
npm run dev
```

Mở trình duyệt và truy cập:
👉 **[http://localhost:3000](http://localhost:3000)**

Để trải nghiệm tính năng QR dẫn đường thử nghiệm, bạn có thể truy cập các đường dẫn mẫu:
- **Cơ sở 1 (Từ Cổng chính đến Phòng B302):** `http://localhost:3000/?campus=cs1&qr=QR_CS1_GATE_MAIN`
- **Cơ sở 3 (Sa bàn 3D Masterplan):** `http://localhost:3000/?campus=cs3`

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
3DMapUTH/
├── public/                       # Tài nguyên tĩnh phục vụ Web
│   ├── models/                   # Thư mục chứa các mô hình 3D (.glb)
│   │   ├── cs1/                  # Mô hình Cơ sở 1
│   │   └── cs3/                  # Mô hình Cơ sở 3 (toa_h, toa_l, toa_j, xuong_oto...)
│   └── landmarks/                # Ảnh sa bàn, mốc định vị
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── page.tsx              # Giao diện chính bản đồ & điều hướng
│   │   ├── admin/map-editor/     # Công cụ biên tập tọa độ bản đồ
│   │   └── api/                  # API routes (route-path, init-qr)
│   ├── components/
│   │   ├── canvas/               # Toàn bộ mã nguồn đồ họa 3D WebGL
│   │   │   ├── CampusCS3Scene.tsx    # Sa bàn 3D Cơ sở 3 (Đường, sân bóng, lô đất)
│   │   │   ├── CampusMaquetteScene.tsx # Sa bàn 3D Cơ sở 1
│   │   │   ├── CADBuildingModel.tsx  # Bộ nạp 3D đa năng (tự đổ bóng, Error Boundary)
│   │   │   └── CameraRig.tsx         # Điều khiển chuyển động camera GSAP mượt mà
│   │   └── ui/                   # Giao diện tương tác người dùng
│   │       ├── TopSearchBar.tsx      # Thanh tìm kiếm phòng học & tòa nhà
│   │       ├── FloorSelector.tsx     # Bộ nút chọn tầng (Lầu 1, Lầu 2, Lầu 3)
│   │       └── StepBottomSheet.tsx   # Khung chỉ đường từng bước dưới đáy màn hình
│   ├── data/
│   │   └── mockNavigationData.ts # Dữ liệu tọa độ phòng học, node QR, đường đi
│   └── store/
│       └── useNavigationStore.ts # Quản lý trạng thái bản đồ toàn cục (Zustand)
├── scripts/
│   └── optimize-models.mjs       # Pipeline nén mô hình 3D tự động (giảm >92% dung lượng)
├── cad_models/                   # Code Python thiết kế CAD tham số (build123d / cadgen)
├── prisma/
│   ├── schema.prisma             # Lược đồ cơ sở dữ liệu quan hệ
│   └── seed.ts                   # Dữ liệu hạt giống (Seed database)
└── package.json                  # Cấu hình dự án và danh mục script
```

---

## 🛠️ Quy Trình Thêm & Tối Ưu Mô Hình 3D Mới (3D Asset Workflow)

Các mô hình 3D xuất từ AI (Meshy AI) hoặc Blender thường rất nặng (**30 MB – 60 MB/file** với hàng triệu đa giác), dễ gây đơ máy hoặc giật lag trên điện thoại.

Dự án đã tích hợp sẵn công cụ tự động nén tối ưu hóa:

1. **Bước 1:** Đặt file `.glb` mới vào thư mục: `public/models/cs3/` (ví dụ: `toa_k.glb`).
2. **Bước 2:** Chạy lệnh nén tối ưu tự động:
   ```bash
   npm run models:optimize
   ```
   *Công cụ sẽ tự động hàn đỉnh (`weld`), lược bớt đa giác rác (`simplify`) qua thư viện `meshoptimizer` để giảm hơn **90% dung lượng** (từ 50 MB xuống còn ~2 MB – 4 MB) mà vẫn giữ nguyên đường nét kiến trúc.*
3. **Bước 3:** Sử dụng component trong [CampusCS3Scene.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/canvas/CampusCS3Scene.tsx):
   ```tsx
   <CADBuildingModel
     modelUrl="/models/cs3/toa_k.glb"
     position={[15.0, 2.5, 4.2]}
     rotation={[0, 0, 0]}
     scale={[5.0, 5.0, 5.0]}
     buildingCode="toa_k"
     buildingName="KHU NHÀ K (7 TẦNG)"
     fallback={<MarkedBuildingPlot ... />}
   />
   ```

---

## 📜 Danh Mục Lệnh Thường Dùng (NPM Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi động máy chủ phát triển cục bộ (`localhost:3000`) |
| `npm run build` | Kiểm tra lỗi TypeScript và đóng gói bản phát hành Production |
| `npm run start` | Chạy máy chủ sau khi đã build thành công |
| `npm run lint` | Quét kiểm tra lỗi cú pháp và quy chuẩn code ESLint |
| `npm run models:optimize` | Tự động quét và nén giảm dung lượng toàn bộ file 3D `.glb` |
| `npm run db:seed` | Nạp dữ liệu mẫu vào cơ sở dữ liệu qua Prisma |
| `npx prisma studio` | Mở giao diện Web quản trị dữ liệu Prisma trực quan |

---

## ❓ Xử Lý Lỗi Thường Gặp (Troubleshooting)

### 1. Lỗi: `Cannot find module '@prisma/client'`
👉 **Cách khắc phục:** Chạy lệnh:
```bash
npx prisma generate
```

### 2. Màn hình 3D bị giật lag trên máy tính dùng card đồ họa rời
👉 **Cách khắc phục:**
- Kiểm tra cài đặt trình duyệt Chrome/Edge: Vào `Settings` ➔ tìm `Hardware Acceleration` (Sử dụng tăng tốc phần cứng khi khả dụng) ➔ Bật `On` và khởi động lại trình duyệt.
- Chạy lệnh `npm run models:optimize` để đảm bảo các file `.glb` đã được nén về mức tối ưu.

### 3. Cổng `3000` bị chiếm dụng bởi tiến trình khác
👉 **Cách khắc phục:** Next.js sẽ tự động chuyển sang cổng tiếp theo (ví dụ: `http://localhost:3001`). Hoặc bạn có thể chỉ định cổng tùy ý:
```bash
npm run dev -- -p 3005
```

---

## 👨‍💻 Tác Quyền & Đóng Góp

Dự án được phát triển nhằm mục đích hiện đại hóa trải nghiệm sinh viên, hỗ trợ tìm đường và số hóa không gian học tập tại **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**.
Mọi đóng góp (Pull Request / Issue) đều được hoan nghênh!
