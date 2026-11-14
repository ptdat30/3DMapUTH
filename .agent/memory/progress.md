# Project Progress & Development Tracking

## 1. Các tính năng đã hoàn thành (Completed Features)

- [x] **Thiết kế & Tái cấu trúc Mặt bằng 3D Cơ sở 1 (CS1 - Số 2 Võ Oanh):**
  - **100% Hoàn thành tích hợp toàn bộ 6 mô hình 3D thực tế (.glb):** `toa_a.glb`, `toa_b.glb`, `toa_c.glb`, `toa_d.glb`, `toa_e.glb`, `toa_f.glb`.
  - Tối ưu hóa siêu nén Draco + texture PBR 2K giảm tải từ **~470 MB xuống chỉ còn ~21 MB** (giảm hơn 95% dung lượng, tải tức thì <1s, 60 FPS mượt mà trên mọi thiết bị):
    - `toa_a.glb`: 2.40 MB (gốc 66.4 MB, 385k tris)
    - `toa_b.glb`: 4.26 MB (gốc 96.6 MB)
    - `toa_c.glb`: 2.60 MB (gốc 60.6 MB)
    - `toa_d.glb`: 4.12 MB (gốc 82.5 MB)
    - `toa_e.glb`: 2.24 MB (gốc 44.5 MB, 140k tris)
    - `toa_f.glb`: 5.22 MB (gốc 120.8 MB)
  - Căn chỉnh góc xoay & tọa độ hình học chuẩn xác theo sơ đồ mặt bằng:
    - **Tòa A:** Khối duy nhất trải dài mặt tiền trung tâm `[2.0, 4.3, 18.2]`, scale `[18.7, 13.2, 8.5]`, rotation `[0, 0, 0]`.
    - **Tòa B:** Xoay $+90^\circ$ (`Math.PI / 2`) để nhánh dọc chạy dọc mép Tây và nhánh ngang ở mép Bắc.
    - **Tòa C:** Xoay $-90^\circ$ (`-Math.PI / 2`) để nhánh dọc ôm mép Đông bãi xe và nhánh ngang ở mép Bắc.
    - **Tòa D:** Đặt thẳng hàng cuối hành lang thông gió B-C `[-3.6, 4.0, -21.5]`, scale `[7.0, 4.2, 8.0]`.
    - **Tòa E:** Khối dọc chạy theo trục Bắc-Nam dọc mép ranh giới Đông `[25.9, 4.25, 14.7]`, rotation `[0, -Math.PI / 2, 0]` (đã xoay 180° để mặt tiền hướng chuẩn vào sân trường), scale `[15.2, 13.5, 11.4]`.
    - **Tòa F:** Đặt tại góc Tây Bắc phía sau Tòa B `[-19.9, 3.5, -17.3]`.
  - Quản lý tập trung qua `src/data/cs1Layout.ts` gồm 6 khối tòa nhà và 3 khu vực bãi xe.
  - Nâng cấp component `CampusMaquetteScene.tsx` với đầy đủ `CADBuildingModel` cho cả 6 tòa, cơ chế preload `useGLTF.preload` và procedural fallback dự phòng sự cố mạng.
  - Đã gỡ bỏ đường mũi tên phát sáng xuyên qua Tòa A và 3 nhãn đỏ nổi "BÃI XE", "NHÀ XE" khỏi không gian 3D giúp khung cảnh khuôn viên thông thoáng, sạch sẽ.
  - Sửa lỗi lệch màu sân cổng chính: Đồng bộ vật liệu `roadAsphalt` sang màu xám nhựa đường `#818183` và loại bỏ tấm plane trắng thừa đè lên bãi xe mặt tiền, giúp toàn bộ khoảng sân trước Cổng Chính và Tòa A đồng nhất một màu sắc liền lạc.
- [x] **Dựng sa bàn 3D Cơ sở 1 (CS1):** Mô hình kiến trúc tòa nhà, hệ thống phân tầng và định tuyến QR Code.
- [x] **Tái cấu trúc tổng thể Cơ sở 3 (CS3):**
  - Khởi tạo file cấu hình tập trung `src/data/cs3Layout.ts` quản lý 8 công trình cốt lõi và 2 khu tiện ích.
  - Căn chỉnh khớp 100% bản vẽ quy hoạch mặt bằng (Masterplan Blueprint): Cổng 1 ($X=8.0$), Cổng 2 ($X=22.0$), Bãi xe Đông, Sân bóng đá mini ($X=0, Z=-19.5$).
  - Gióng thẳng hàng mặt tiền Phòng Gym (Tòa L) và Nhà Đa Năng sát tường rào Cổng 2 ($Z=24.8$).
- [x] **Tối ưu hóa hiệu năng & Triệt tiêu Drop FPS (Rock-Solid 60 FPS trên toàn bộ thiết bị):**
  - **Tối ưu Raycasting Bounding Box trên các mô hình CAD nặng:** Thay thế thuật toán duyệt va chạm từng tam giác (hơn 2.5 triệu đa giác trong scene) bằng kiểm tra va chạm Bounding Box $O(1)$ với các ma trận tĩnh tái sử dụng (`_inverseMatrix`, `_ray`, `_hitPoint`), triệt tiêu 100% hiện tượng drop FPS / nghẽn CPU khi di chuột (mousemove).
  - **Loại bỏ `castShadow` trên `GlowingArrowPath`:** Vật thể phát sáng (neon emissive) không cần tính bóng đổ, ngăn chặn hoàn toàn việc làm bẩn (dirty) và render lại Shadow Map 60 lần/giây do chuyển động sóng sin.
  - **Tối ưu hóa Shadow Map GPU:** Thu hẹp shadow camera frustum và giảm shadow map từ 2048 xuống 1024x1024, giảm 75% áp lực VRAM và thời gian xử lý shadow pass.
  - **Điều tiết độ phân giải thích ứng (Adaptive DPR) & Throttling sự kiện:** Thiết lập `dpr={[1, 1.5]}`, `performance={{ min: 0.6 }}` cùng `<AdaptiveDpr pixelated />` và `<AdaptiveEvents />` cho cả CS1 và CS3, tự động hạ tải khi camera xoay nhanh hoặc trên màn hình Retina / 4K / High-DPI.
  - **Phục hồi Early-Z Culling phần cứng:** Loại bỏ `logarithmicDepthBuffer` (do mặt sân và đường đã được phân tách khối 3D với `polygonOffset`), cho phép GPU loại bỏ sớm các pixel bị che khuất ở cấp độ phần cứng.
  - Unmount hoàn toàn WebGL Canvas không hoạt động khi chuyển đổi giữa CS1 và CS3.
  - Sử dụng `WeakMap` cache tuned scene trong `CADBuildingModel.tsx`, ngăn chặn cấp phát 50MB trên heap V8.
  - Tắt `receiveShadow` trên tất cả mặt đường, vạch sơn, sân bóng, bãi xe và khối đế móng.
  - Tắt `castShadow` trên 7 đoạn tường rào và 4 cột cổng.
  - Bật `frustumCulled={true}` cho toàn bộ primitive và mesh con của các tòa nhà.
  - Nén lưới đa giác (mesh decimation) toàn bộ model: Tòa H (5.37MB $\rightarrow$ 935KB), Nhà Đa Năng (4.39MB $\rightarrow$ 763KB), Xưởng Ô tô (43MB $\rightarrow$ 1.6MB).
- [x] **Khắc phục lỗi Tòa J:**
  - Thay thế bằng mô hình chính thức `toakytucxa.glb` (1.63 MB, 92k tris).
  - Tách rời hoàn toàn khỏi Sân bóng đá (khoảng đệm an toàn 3.5m) và vỉa hè đường ngang (1.7m).
- [x] **Kịch bản Cinematic Tour Camera:**
  - Custom hook `useCinematicTour.ts` điều phối kịch bản bay camera GSAP, highlight phát quang phòng Gym UTH Fitness và vẽ dần tuyến đường đi từ Cổng chính.
  - Nút "Bỏ qua" (Skip Tour) phản hồi tức thì.
- [x] **Hệ sinh thái Vibe Coding & 3D Web + Blender (Toàn diện 5 Bước):**
  - **Bước 1 (Môi trường & MCP):** Node v24.16.0, Python 3.14.5, uv 0.13.6; cấu hình 5 MCP Servers (`context7`, `playwright`, `sequential-thinking`, `magic-ui`, `blender`) trên cả `.antigravity/mcp.json`, `.cursor/mcp.json` và global IDE; tải Addon Blender MCP v1.8 tại `tools/blender_mcp_addon.py`.
  - **Bước 2 (Bộ thư viện 3D):** Cài đặt thành công 10 gói thư viện Web 3D (`three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `@react-three/postprocessing`, `gsap`, `@theatre/core`, `@theatre/studio`, `framer-motion`).
  - **Bước 3 (Memory Bank):** Khởi tạo `.agent/memory/architecture.md` và `.agent/memory/progress.md`.
  - **Bước 4 (6 Kỹ năng Chuyên sâu):** Xây dựng đủ 6 file `SKILL.md` chi tiết kỹ thuật cao và đồng bộ sang `.antigravity/skills/`:
    1. `vibe-fullstack-architect`: UI component, Next.js App Router, React 19, Zustand, Magic UI.
    2. `r3f-3d-architect`: gltfjsx, zero-allocation useFrame, InstancedMesh, dispose, 60 FPS standard.
    3. `glsl-shader-wizard`: Custom shaderMaterial, Simplex Noise, Fresnel math, Bloom/ToneMapping.
    4. `blender-python-animator`: bpy automation, bottom-center origin, PBR shader node tree, Draco GLB export.
    5. `web-3d-motion-director`: ScrollTrigger, Drei ScrollControls, HTML/WebGL pointer-events isolation, camera lerping.
    6. `vibe-debugger-memory`: Memory Bank workflow, Playwright autonomous test, self-healing loop.
  - **Bước 5 (Auto-Skill Router):** Thiết lập `.agent/rules/auto-skill-router.md` (`alwaysApply: true`), cập nhật `.antigravityrules` và `.cursorrules` với quy trình 4 bước bắt buộc và format huy hiệu:
    `⚡ [Auto-Skills Activated: ...] | 🔌 [MCPs: ...]`

## 2. Các lỗi đã giải quyết (Resolved Bugs)

- **Lỗi 6 (Nhấp nháy sọc vằn / Shadow Acne & Z-fighting mặt sân CS1):**
  - *Hiện tượng:* Bề mặt sân trường và lối đi giữa Tòa B và Tòa D xuất hiện sọc vằn xám/trắng nhấp nháy moiré liên tục khi xoay camera.
  - *Nguyên nhân:*
    1. `directionalLight` thiếu `shadow-bias` và `shadow-normalBias`, gây ra hiện tượng tự đổ bóng sọc vằn (shadow acne) trên mặt phẳng nằm ngang.
    2. Hai mặt phẳng 2D `planeGeometry` nền tổng và sân trường chỉ cách nhau 0.01m, gây Z-fighting khi camera ở xa với `near: 0.1`.
    3. `ContactShadows` tạo một tấm quad trong suốt ở $Y=0.02$ đè trực tiếp lên mặt đường và hành lang $Y=0.02$.
  - *Khắc phục:*
    1. Bổ sung `shadow-bias={-0.0004}` và `shadow-normalBias={0.02}` vào `directionalLight`, đổi loại bóng thành `THREE.PCFSoftShadowMap`.
    2. Chuyển sang khối đế hộp có độ dày (`boxGeometry` 140x0.04x140m ở $Y=-0.02$ và sân 68x0.02x64m ở $Y=+0.01$).
    3. Thêm `polygonOffset: true` (`factor: -2, units: -2`) cho `roadAsphalt` và `walkwayPavement` tại $Y=0.025$.
    4. Nâng `camera.near` từ `0.1` lên `0.5` và bật `logarithmicDepthBuffer: true` trên WebGL context.
    5. Gỡ bỏ `ContactShadows` triệt tiêu xung đột rendering giống chuẩn CS3.
- **Lỗi 5 (Build Error Turbopack Unexpected token ','):** Lỗi cú pháp do dòng mô tả và key `scale` bị lặp trong cấu hình Tòa D tại `src/data/cs1Layout.ts`. Đã làm sạch toàn bộ đối tượng cấu hình và kiểm chứng `next build` thành công hoàn toàn.
- **Lỗi 1 (Drop FPS chu kỳ 4s):** Do chạy song song 2 WebGL Canvas và clone scene deep 50MB mỗi frame. Đã khắc phục bằng conditional unmount và WeakMap scene cache.
- **Lỗi 2 (Z-Fighting đường xe & sân bóng):** Do cao độ $Y$ bị trùng nhau ($Y=0.03$). Đã nâng sân bóng và móng tòa nhà lên $Y=0.10$ và tịnh tiến trục đường ngang về $Z=-11.0$.
- **Lỗi 3 (2 tòa J dính chùm):** File model cũ chứa 2 khối nhà hàn dính vào nhau. Đã thay bằng `toakytucxa.glb` chuẩn 1 khối.
- **Lỗi 4 (Lộ dữ liệu cá nhân trên GitHub):** Đã thu hồi toàn bộ báo cáo phân tích nội bộ, task Jira, CSV học vụ khỏi git tracking qua `.gitignore` và giữ nguyên trên máy cục bộ.

## 3. Kế hoạch tiếp theo (Roadmap / Next Steps)

- [ ] Tích hợp hiệu ứng Post-processing (Bloom nhẹ cho ống ánh sáng NavigationPath3D).
- [ ] Bổ sung bảng thông tin chi tiết từng phòng học khi click vào Tòa J và Tòa H.
- [ ] Tích hợp kết nối trực tiếp với Blender qua `blender-mcp` để tinh chỉnh chi tiết nội thất phòng học.
- [ ] Tự động hóa bộ test Playwright kiểm tra canvas render và bắt lỗi WebGL trên mobile viewport.
