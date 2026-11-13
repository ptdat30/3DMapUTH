# Project Progress & Development Tracking

## 1. Các tính năng đã hoàn thành (Completed Features)

- [x] **Thiết kế & Tái cấu trúc Mặt bằng 3D Cơ sở 1 (CS1 - Số 2 Võ Oanh):**
  - Tích hợp 4 mô hình 3D thực tế của người dùng: `TÒA_B.glb`, `TÒA_C.glb`, `TÒA_D.glb`, `TÒA_F.glb`.
  - Tối ưu hóa siêu nén (Draco + texture 2K) giảm tải từ **360 MB xuống ~16 MB** (giảm 95.5% dung lượng, 0 lag khi tải trên WebGL): `toa_b.glb` (4.26MB), `toa_c.glb` (2.60MB), `toa_d.glb` (4.12MB), `toa_f.glb` (5.22MB).
  - Căn chỉnh góc xoay & tọa độ hình học chuẩn xác theo sơ đồ mặt bằng:
    - Tòa B: Xoay $+90^\circ$ (`Math.PI / 2`) để nhánh dọc chạy dọc mép Tây và nhánh ngang ở mép Bắc.
    - Tòa C: Xoay $-90^\circ$ (`-Math.PI / 2`) để nhánh dọc ôm mép Đông bãi xe và nhánh ngang ở mép Bắc.
    - Tòa D: Đặt thẳng hàng cuối hành lang thông gió B-C `[-3.6, 4.0, -21.5]`, scale `[7.0, 4.2, 8.0]`.
    - Tòa F: Đặt tại góc Tây Bắc phía sau Tòa B `[-19.9, 3.5, -17.3]`.
  - Hợp nhất Tòa A thành **1 khối duy nhất** trải dài suốt mặt tiền trung tâm ($35.6\text{m} \times 8.3\text{m}$) theo đúng sơ đồ thực tế mới nhất.
  - Quản lý tập trung qua `src/data/cs1Layout.ts` gồm 6 khối tòa nhà và 3 khu vực bãi xe (Bãi xe trung tâm, Bãi xe mặt tiền cổng chính, Nhà xe góc Tây Nam).
  - Nâng cấp component `CampusMaquetteScene.tsx` kết hợp giữa `CADBuildingModel` (tải model 3D thực tế có texture PBR) và procedural maquette cho các khối chưa có model.
- [x] **Dựng sa bàn 3D Cơ sở 1 (CS1):** Mô hình kiến trúc tòa nhà, hệ thống phân tầng và định tuyến QR Code.
- [x] **Tái cấu trúc tổng thể Cơ sở 3 (CS3):**
  - Khởi tạo file cấu hình tập trung `src/data/cs3Layout.ts` quản lý 8 công trình cốt lõi và 2 khu tiện ích.
  - Căn chỉnh khớp 100% bản vẽ quy hoạch mặt bằng (Masterplan Blueprint): Cổng 1 ($X=8.0$), Cổng 2 ($X=22.0$), Bãi xe Đông, Sân bóng đá mini ($X=0, Z=-19.5$).
  - Gióng thẳng hàng mặt tiền Phòng Gym (Tòa L) và Nhà Đa Năng sát tường rào Cổng 2 ($Z=24.8$).
- [x] **Tối ưu hóa hiệu năng & Triệt tiêu Lag (Fix 4s Drop FPS):**
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
