# 3DMapUTH Technical Constitution

Hiến pháp Kỹ thuật này là văn kiện tối cao quy định toàn bộ các nguyên tắc kiến trúc, tiêu chuẩn kỹ thuật, quy chuẩn viết code và quy trình vận hành cho dự án **3DMapUTH** (Hệ thống Bản đồ số 3D & Dẫn đường tương tác Trường Đại học Giao thông vận tải TP.HCM - UTH). Bất kỳ đặc tả (Spec), kế hoạch (Plan), nhiệm vụ (Tasks) hay đoạn mã nguồn (Source Code) nào đều **BẮT BUỘC** phải tuân thủ nghiêm ngặt các điều luật dưới đây.

---

## Core Principles

### I. Core Tech Stack Compliance (Quy chuẩn Tech Stack Cốt lõi)
Mọi thành phần trong dự án phải được xây dựng dựa trên ngăn xếp công nghệ tiêu chuẩn đã được phê duyệt:
- **Frontend Framework:** Next.js (App Router), React 19, TypeScript (chế độ `strict` bắt buộc 100%).
- **Giao diện & Styling:** Tailwind CSS v4 kết hợp thư viện thành phần chuẩn (shadcn/ui / Radix UI).
- **Đồ họa Không gian 3D (3D Engine):** Three.js, `@react-three/fiber` (R3F) và `@react-three/drei` phục vụ render sa bàn và bản đồ 3D isometric tương tác.
- **Backend & API:** Next.js Serverless Route Handlers (`src/app/api/...`) và Server Actions.
- **Cơ sở dữ liệu:** PostgreSQL.
- **ORM (Object-Relational Mapping):** Prisma ORM v6. Tuyệt đối không sử dụng raw SQL trừ trường hợp tối ưu hiệu năng đặc biệt và phải được Tech Lead phê duyệt.

### II. Hierarchical Data Integrity & Idempotency (Cấu trúc Dữ liệu & Toàn vẹn Thực thể)
Toàn bộ dữ liệu không gian và dẫn đường phải đảm bảo tính toàn vẹn và phân cấp nghiêm ngặt:
- **Chuỗi quan hệ bắt buộc:** Mọi thực thể trong cơ sở dữ liệu phải tuân thủ quan hệ cha - con một chiều:
  $$\text{Campus} \longrightarrow \text{Building} \longrightarrow \text{Floor} \longrightarrow \text{Room} \longrightarrow \text{QrNode}$$
- **Tính lặp lại (Idempotency):** Mọi script can thiệp dữ liệu (đặc biệt là `prisma/seed.ts`) bắt buộc phải idempotent: sử dụng cơ chế `upsert` hoặc xóa sạch dữ liệu phụ thuộc trước khi nạp mới. Script phải đảm bảo thực thi thành công vô số lần mà không gây ra lỗi xung đột khóa chính (`Unique constraint failed`).
- **Chính sách Soft Delete:** Nghiêm cấm xóa vật lý (hard delete) các bản ghi phòng học (`Room`) và điểm định vị QR (`QrNode`). Mọi thao tác ngừng hoạt động phải sử dụng cờ trạng thái logic (`isActive = false`).

### III. Type Safety & Atomic Architecture (Quy chuẩn Code & Kiểu Dữ liệu)
Quy chuẩn viết code sạch, an toàn kiểu dữ liệu và mô đun hóa:
- **Ngôn ngữ phát triển:** 
  - Toàn bộ định danh trong code (tên biến, hàm, class, component, file, types, interfaces) viết 100% bằng **Tiếng Anh**.
  - Chú thích mã nguồn (Comments), tài liệu giải thích (Docs) và thông báo giao diện người dùng viết bằng **Tiếng Việt**.
- **An toàn kiểu dữ liệu (Strict Typing):** Bắt buộc khai báo tường minh `interface` hoặc `type` cho tất cả Component Props, API Request/Response DTOs và State Stores. Nghiêm cấm dùng kiểu `any` (sử dụng `unknown` kết hợp type narrowing nếu dữ liệu thực sự động).
- **Phân tách Đồ họa 3D & UI thường (Atomic Design):** Ưu tiên Functional Components và React Hooks. Toàn bộ logic render 3D WebGL (Canvas, Mesh, Material, Lights, Controls) phải được đóng gói riêng biệt trong thư mục `src/components/canvas/`, tách rời hoàn toàn khỏi các UI Components 2D DOM thông thường (`src/components/ui/`).
- **Xử lý ngoại lệ chuẩn hóa (Error Handling):** Mọi lời gọi API và truy vấn cơ sở dữ liệu bắt buộc phải bọc trong khối `try-catch`, trả về phản hồi chuẩn: `{ success: boolean, data?: T, message?: string, error?: string }`.

### IV. High-Performance 3D Rendering & UI/UX (Hiệu năng 3D & Trải nghiệm Người dùng)
Bảo đảm trải nghiệm mượt mà trên mọi thiết bị và giữ vững nhận diện thương hiệu:
- **Tương tác đa nền tảng (Cross-Platform Responsive):** Bản đồ 3D và các bảng điều khiển phải hoạt động trơn tru trên cả máy tính để bàn (chuột, bàn phím) và thiết bị di động (thao tác cảm ứng xoay orbit, zoom hai ngón tay, pan mặt phẳng).
- **Tối ưu hóa tài nguyên 3D (Asset Optimization):** Mọi mô hình 3D đưa vào ứng dụng bắt buộc sử dụng định dạng `.gltf` hoặc `.glb`. Phải chạy qua pipeline nén Draco và giảm tải đa giác meshoptimizer (`scripts/optimize-models.mjs`). Tuyệt đối không tải texture độ phân giải vượt mức cần thiết; áp dụng kỹ thuật Level of Detail (LOD) cho các tòa nhà ở xa camera.
- **Chuẩn nhận diện thương hiệu UTH:** Màu sắc chủ đạo, icon, typography và logo hiển thị trên giao diện phải tuân thủ nghiêm ngặt cẩm nang nhận diện thương hiệu của Trường Đại học Giao thông vận tải TP.HCM.

### V. Spec-Driven Development & Git Hygiene (Quy trình Phát triển & Quản lý Mã nguồn)
Quy trình phát triển phần mềm có kỷ luật và minh bạch:
- **Nguyên tắc Spec-First:** Bất kỳ tính năng mới nào cũng phải có tài liệu Đặc tả (Specification) và Kế hoạch Kỹ thuật (Technical Plan) được phê duyệt trước khi viết dòng code đầu tiên (`/speckit-specify` $\rightarrow$ `/speckit-plan` $\rightarrow$ `/speckit-tasks`).
- **Chuẩn hóa Commit:** Mọi commit message phải tuân thủ chuẩn Conventional Commits:
  - `feat:` Tính năng mới (ví dụ: `feat: integrate 3D model for building H`)
  - `fix:` Sửa lỗi (ví dụ: `fix: resolve prisma seed foreign key constraint`)
  - `docs:` Cập nhật tài liệu kỹ thuật
  - `perf:` Cải thiện hiệu năng render hoặc nén tài nguyên
  - `refactor:` Tái cấu trúc code nhưng không thay đổi chức năng
- **Bảo mật mã nguồn tuyệt đối:** Nghiêm cấm commit file cấu hình chứa bí mật (`.env`, `.env.local`), API keys, mật khẩu database lên kho mã nguồn Git. File `.gitignore` phải luôn được duy trì chặt chẽ.

---

## Technical Constraints & Non-Functional Requirements

1. **Hiệu năng WebGL:** Tốc độ khung hình (Frame Rate) trên thiết bị di động tầm trung tối thiểu phải đạt $\ge 30\text{ FPS}$, trên máy tính để bàn đạt $\ge 60\text{ FPS}$.
2. **Dung lượng mạng (Network Payload):** Kích thước tải toàn bộ mô hình 3D cho một cơ sở (Campus) không được vượt quá $25\text{ MB}$ nhờ nén Draco/WebP.
3. **Độ trễ API định vị:** Thời gian phản hồi của endpoint `/api/init-qr` và `/api/route-path` phải $< 200\text{ms}$.
4. **Cơ chế hoạt động ngoại tuyến (Offline Graceful Degradation):** Khi cơ sở dữ liệu PostgreSQL tạm thời gián đoạn kết nối, hệ thống phải tự động chuyển sang chế độ Mock Data Fallback để người dùng vẫn xem được bản đồ và dẫn đường bình thường.

---

## Development Workflow & Quality Gates

Mọi yêu cầu thay đổi (Pull Request / Task) phải vượt qua 4 chốt kiểm soát chất lượng (Quality Gates):
1. **Gate 1 - Type Check:** Chạy lệnh `npx tsc --noEmit` đạt 0 lỗi biên dịch.
2. **Gate 2 - Linter & Formatting:** Mã nguồn tuân thủ ESLint và cấu hình Prettier của dự án.
3. **Gate 3 - Build Validation:** Chạy lệnh `npm run build` thành công, không phát sinh cảnh báo Next.js nghiêm trọng.
4. **Gate 4 - Spec Compliance:** Code tạo ra phải đối chiếu trực tiếp với các mục trong `spec.md` và `plan.md` của tính năng tương ứng.

---

## Governance & Enforcement

- **Hiệu lực tối cao:** Hiến pháp Kỹ thuật này có giá trị cao nhất trong toàn bộ vòng đời phát triển dự án 3DMapUTH, xếp trên mọi thói quen lập trình cá nhân.
- **Quy trình sửa đổi Hiến pháp (Amendment Procedure):** 
  - Đề xuất sửa đổi phải được tạo dưới dạng bản thảo (Draft Proposal), nêu rõ lý do kỹ thuật và đánh giá tác động (Impact Analysis).
  - Phải được sự đồng thuận của Tech Lead và toàn bộ thành viên cốt lõi của nhóm phát triển.
  - Mỗi lần sửa đổi phải tăng phiên bản theo chuẩn Semantic Versioning (SemVer) và ghi nhận vào lịch sử sửa đổi.
- **Đánh giá định kỳ:** Tech Lead chịu trách nhiệm rà soát sự tuân thủ Hiến pháp vào cuối mỗi Sprint.

---

**Version**: 1.0.0 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06

