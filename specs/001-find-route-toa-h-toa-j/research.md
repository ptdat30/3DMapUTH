# Technical Research: Tìm đường đi bộ từ Tòa H đến Tòa J (Cơ sở 3 UTH)

**Feature**: `001-find-route-toa-h-toa-j`  
**Phase**: Phase 0 (Research & Technical Decisions)  
**Status**: Completed  

---

## 1. Research Decision 1: Dựng tuyến đường 3D phát sáng (Glow Path) trên WebGL Canvas

### Quyết định kỹ thuật (Decision):
Sử dụng đường cong **`CatmullRomCurve3`** của Three.js kết hợp thẻ **`<tubeGeometry>`** và vật liệu **`MeshStandardMaterial`** có thuộc tính `emissive="#00f2fe"` (màu xanh Cyan phát sáng rực rỡ) với độ cao nâng cốt (vertical offset) $+0.2\text{m}$ so với mặt đường.

### Lý do lựa chọn (Rationale):
- `CatmullRomCurve3` cho phép nội suy mượt mà qua các nút giao thông (Waypoints) từ sảnh Tòa H $\rightarrow$ vòng xuyến nội khu $\rightarrow$ sảnh Tòa J mà không bị gãy góc thô ráp.
- Thẻ `<tubeGeometry>` tạo ra khối ống 3D có thể quan sát rõ nét ở mọi góc xoay của camera (không bị mỏng dẹt như đường vẽ 2D pixel lines).
- Việc bù cao độ $+0.2\text{m}$ ($Y = 0.2$) triệt tiêu hoàn toàn lỗi hiển thị chập chờn đa giác chồng lấn (Z-fighting) khi camera ở xa.

### Các phương án khác đã xem xét (Alternatives Considered):
- *Three.js `Line2` / Fat Lines:* Hiển thị tốt trên 2D nhưng khi xoay camera ở góc nghiêng thấp (grazing angle) dễ bị méo phối cảnh và khó tạo hiệu ứng bóng đổ ánh sáng thực.
- *ShaderMaterial tự viết hoàn toàn:* Đẹp nhưng phức tạp và có thể giảm FPS trên các thiết bị di động cũ; `MeshStandardMaterial` với `emissiveIntensity={2.5}` đã đủ tạo độ phát sáng ấn tượng trên R3F.

---

## 2. Research Decision 2: Hoạt cảnh chuyển động Camera mượt mà (Smooth Camera Tweening)

### Quyết định kỹ thuật (Decision):
Tích hợp điều khiển chuyển động camera vào component `src/components/canvas/CameraRig.tsx` sử dụng thuật toán nội suy tuyến tính có gia số mượt mà (**Vector3.lerp** kết hợp **MathUtils.damp** trong hook `useFrame` của React Three Fiber).

### Lý do lựa chọn (Rationale):
- Chuyển động không phụ thuộc vào thư viện bên ngoài nặng nề, tận dụng tối đa chu kỳ render $60\text{ FPS}$ của R3F.
- Tự động hủy chuyển động cũ (Cancel Tween) khi người dùng click đổi mục tiêu mới giữa chừng (như đã quy định trong Edge Case của `spec.md`).
- Đồng bộ mượt mà cả vị trí Camera (`camera.position`) lẫn tâm điểm nhìn (`controls.target`).

### Các phương án khác đã xem xét (Alternatives Considered):
- *GSAP (GreenSock):* Rất mạnh nhưng cần quản lý vòng đời (lifecycle) đồng bộ với Three.js Context để tránh memory leak khi component unmount.
- *CameraControls / OrbitControls mặc định:* Chỉ hỗ trợ xoay tại chỗ, không có sẵn cơ chế bay lượn mềm mại từ tòa này sang tòa khác.

---

## 3. Research Decision 3: Cơ chế Tìm đường & Dự phòng Ngoại tuyến (Routing & Offline Graceful Degradation)

### Quyết định kỹ thuật (Decision):
Kiến trúc định tuyến kép (Hybrid Dual Routing):
- **Chế độ Trực tuyến (Online Mode):** Gọi Next.js Route Handler `POST /api/route-path` kết nối PostgreSQL thông qua Prisma Client để truy vấn đồ thị Node/Edge.
- **Chế độ Ngoại tuyến (Offline Mode):** Khi mất mạng hoặc DB chưa sẵn sàng, API và Frontend tự động bắt ngoại lệ và trả về tập Waypoints tính toán sẵn trong `src/data/mockNavigationData.ts`.

### Lý do lựa chọn (Rationale):
- Tuân thủ nghiêm ngặt **Điều II** trong Hiến pháp Kỹ thuật 3DMapUTH: Không bao giờ để hệ thống bị gián đoạn hay đổ vỡ khi môi trường thực nghiệm mất kết nối.
- Thời gian phản hồi trong chế độ offline $< 10\text{ms}$, đảm bảo độ mượt mà tuyệt đối cho người dùng trên mạng di động 4G yếu.

---

## 4. Research Decision 4: Giao diện tương tác Responsive trên Mobile & Desktop

### Quyết định kỹ thuật (Decision):
Sử dụng **Tailwind CSS v4** kết hợp **Lucide React** và `Framer Motion`:
- **Mobile:** Sử dụng Bottom Sheet trượt linh hoạt dưới chân màn hình (`StepBottomSheet.tsx`). Khi xoay màn hình ngang (Landscape), tự động biến đổi thành Floating Mini-Card ở góc phải.
- **Desktop:** Sử dụng Floating Glassmorphism Side Panel cố định góc trên bên trái, không che khuất sa bàn 3D.

### Lý do lựa chọn (Rationale):
- Đảm bảo tuân thủ tiêu chuẩn UI/UX Responsive trong Điều IV của Hiến pháp Kỹ thuật.
- Cảm ứng vuốt chạm (Swipe gestures) tự nhiên trên smartphone.

---

## Kết luận & Sẵn sàng cho Phase 1:
Toàn bộ các ẩn số kỹ thuật (Unknowns) đã được làm rõ và đưa ra quyết định kiến trúc cụ thể. Không còn mục `[NEEDS CLARIFICATION]` nào tồn đọng. Dự án sẵn sàng tiến vào Phase 1: Thiết kế Thực thể Dữ liệu (data-model) và Giao ước Hợp đồng (contracts).

