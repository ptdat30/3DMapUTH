# Bộ Prompt Chỉ Làm Đồ Họa 3D & Giao Diện Điện Thoại (Chuẩn 100% Theo Ảnh Mẫu)

Tài liệu này cung cấp **3 bộ Prompt chuyên biệt** (hoàn toàn không dính tới Database hay Backend) để bạn copy và dùng ngay tùy theo công cụ bạn đang mở:
1. **Prompt 1 (Code Đồ họa 3D + UI Mobile trên Web/App):** Dán vào **Cursor, v0.dev, Bolt.new, Lovable, Claude** kèm ảnh mẫu để chạy ra ngay màn hình điện thoại có sa bàn 3D xoay được và nút bấm chuyển bước.
2. **Prompt 2 (Chỉ dựng riêng Khối Đồ Họa 3D Sa bàn trường học):** Tập trung 100% vào vật liệu trắng nhám (Clay Maquette), hiệu ứng cắt mái `Tòa B` phát sáng viền xanh và mũi tên 3D Cyan phát sáng nhẹ cho chip đồ họa điện thoại.
3. **Prompt 3 (Tạo thêm các màn hình thiết kế UI/UX đồng bộ bằng AI tạo ảnh):** Dùng khi bạn muốn vẽ thêm ảnh minh họa cho Bước 2, Bước 3, Bước 4 hoặc màn hình Tìm kiếm phòng có cùng phong cách đồ họa như bức ảnh này để đưa vào slide báo cáo đồ án.

## 1. Prompt Code Giao Diện & Đồ Họa 3D Điện Thoại (Dán vào Cursor / v0 / Bolt / Claude kèm Ảnh)

```text
Bạn là một chuyên gia lập trình Đồ họa 3D trên thiết bị di động (Mobile 3D Web Graphics & UI Developer) với React, Tailwind CSS và Three.js (@react-three/fiber, @react-three/drei, GSAP).
Hãy nhìn bức ảnh mẫu đính kèm và viết code tạo ra giao diện đồ họa điện thoại giống hệt 100% bức ảnh này. CHỈ làm phần Đồ họa 3D và Giao diện Mobile (dùng dữ liệu mẫu tại chỗ, tuyệt đối KHÔNG tạo Database, Prisma hay API Backend).

### 1. KHUNG HIỂN THỊ ĐIỆN THOẠI (MOBILE FRAME)
- Tỷ lệ dọc 9:16 chuẩn iPhone (`w-full max-w-[412px] h-[100dvh] max-h-[892px] mx-auto relative overflow-hidden bg-[#e9eef4] select-none touch-none`).
- Toàn bộ không gian nền là Canvas 3D chiếm 100% chiều cao, các thành phần UI 2D nằm nổi (`absolute`) đè lên trên.

### 2. ĐỒ HỌA 3D SA BÀN TRƯỜNG HỌC (ARCHITECTURAL CLAY STYLE)
Tự dựng cảnh quan 3D bằng các khối hình học Three.js tối ưu cho GPU điện thoại (60 FPS):
- Góc nhìn & Ánh sáng:
  + Camera góc nhìn Isometric từ trên cao nhìn chéo xuống (`position: [26, 28, 26]`, `fov: 32`).
  + Ánh sáng trắng dịu (`ambientLight` 0.9 + `directionalLight` đổ bóng mềm `ContactShadows`), màu nền trời và mặt sân hòa quyện theo tông trắng xám xanh (`#e9eef4` và `#dfe5ec`).
- Khối Tòa Nhà & Cảnh Quan:
  + `Tòa A` (bên trái) và `Tòa C` (góc phải dưới): Khối kiến trúc màu trắng sứ nhám (`#f8fafc`), mái đóng kín, các ô cửa sổ lõm nhẹ màu xám (`#cbd5e1`), có chữ "Tòa A" và "Tòa C" gắn trên mái/tường.
  + `Tòa B` (góc trên phải - Điểm đích): Mở nắp mái (Roof Cutaway) để lộ rõ các vách ngăn phòng học, cửa phòng và cầu thang bên trong tầng trên cùng. Xung quanh khối `Tòa B` có hào quang phát sáng màu xanh dương dịu (`#3b82f6` glow) và nhãn pill trắng nổi chữ đậm `Tòa B`. Có cầu nối trên cao nối giữa Tòa A và Tòa B.
  + Sân trường & Cổng: Tường rào trắng có cổng chính ở góc dưới bên trái, điểm xuyết các cây xanh Low-poly (ghép từ các khối cầu màu xanh lá dịu `#739e82`).
- Ghim QR & Đường Mũi Tên 3D Phát Sáng:
  + Tại cổng chính: Đặt ghim 3D hình giọt nước màu xanh lá (`#22c55e`) kèm thẻ trắng bo tròn `QR Cổng Chính` (chữ `QR` màu xanh lá).
  + Đường dẫn 3D: Vẽ một đường mũi tên 3D nổi khối (chia làm 2 nhịp mũi tên nối tiếp nhau) màu xanh Cyan phát sáng rực rỡ (`#00d4ff`, `emissive: "#0099ff"`, hơi trong suốt ở viền) chạy thẳng từ `QR Cổng Chính` băng qua sân trường đến ngay bậc thềm cửa sảnh `Tòa B`.

### 3. BA LỚP GIAO DIỆN 2D NỔI (FLOATING UI OVERLAY)
1. Thanh Tìm Kiếm Phía Trên (`top-4 left-4 right-4`):
   - Khung trắng `bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2.5`.
   - Gồm nút mũi tên trái `<-`, icon kính lúp `🔍`, chữ xám `Điểm đến:` và chữ đen đậm `Phòng B302 - Tòa B (Cơ sở 1)`.
2. Thanh Chọn Tầng Dọc Bên Phải (`right-4 bottom-[255px]`):
   - Khung thuốc dọc `bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-md flex flex-col gap-1.5 w-[54px]`.
   - Gồm 5 nút tròn (`w-10 h-10 rounded-full text-xs font-semibold`): 2 nút đầu đang bật màu xanh dương `#2563eb` chữ trắng (`Toàn cảnh`, `Tòa B`), 3 nút dưới nền trong suốt chữ đen (`T1`, `T2`, `T3`).
3. Thẻ Điều Hướng Dưới Đáy (`bottom-0 left-0 right-0`):
   - Khung trắng bo tròn góc trên `bg-white rounded-t-[30px] px-6 pt-3 pb-7 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]`.
   - Thanh gạch ngang nhỏ ở đỉnh (`w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3`).
   - Dòng tiến độ `Bước 1 / 4` kèm thanh progress ngang nhỏ bên cạnh.
   - Hàng nội dung chính: Vòng tròn xám nhạt (`w-14 h-14 rounded-full bg-slate-100`) chứa icon người đi bộ màu đen + dòng chữ lớn in đậm 2 dòng: `Đi qua sân trường 50m hướng về sảnh chính Tòa B`.
   - Hai nút bấm bo tròn (`rounded-full py-3.5 font-semibold`): Nút trái `Quay lại` (nền xám `#e9edf2` chữ đen) và nút phải `Bước tiếp theo` (nền xanh `#1d74f5` chữ trắng).

### 4. HIỆU ỨNG CHUYỂN ĐỘNG TRÊN ĐIỆN THOẠI
Khi bấm `Bước tiếp theo` / `Quay lại` hoặc bấm chọn `T1`, `T2`, `T3` bên phải, dùng GSAP điều khiển Camera bay mượt mà từ góc nhìn Toàn cảnh sân trường zoom sát vào mặt cắt các tầng bên trong `Tòa B` và đổi đường mũi tên xanh tương ứng.
```

## 2. Prompt Chỉ Làm Riêng Phần Đồ Họa Mô Hình 3D (Dành cho Three.js / Blender Script)

Nếu bạn đã có sẵn khung giao diện 2D và chỉ muốn AI viết code tạo riêng **Cảnh quan 3D (3D Scene Component)** sắc nét, nhẹ máy cho điện thoại như trên ảnh:

```text
Hãy viết riêng cho tôi component 3D `Campus3DScene.tsx` bằng `@react-three/fiber` và `@react-three/drei` tái hiện chính xác phong cách đồ họa sa bàn 3D trong bức ảnh đính kèm:
1. Vật liệu (Materials): Toàn bộ tường tòa nhà dùng `meshStandardMaterial` màu trắng sứ (`#f8fafc`, `roughness: 0.75`, `metalness: 0.05`) để tạo cảm giác mô hình kiến trúc sạch sẽ, không dùng texture nặng gây giật lag trên điện thoại.
2. Tòa nhà đích (`Tòa B` Cutaway): Dựng 3 tầng, tầng trên cùng không vẽ trần mà dựng các bức tường mỏng (`thickness: 0.2`) chia thành 5 phòng học và hành lang chữ L ở giữa, kèm mô hình cầu thang bộ có bậc. Bọc quanh `Tòa B` một khối hộp lớn hơn một chút với vật liệu xanh dương phát sáng mờ (`color: "#3b82f6"`, `transparent: true`, `opacity: 0.15`, `BackSide`) để tạo viền hào quang xanh như trong ảnh.
3. Mũi tên dẫn đường 3D (`GlowingArrowPath`): Tạo geometry hình mũi tên 3D có độ dày (`ExtrudeGeometry`), đặt nằm ngang cách mặt sân `0.15` đơn vị. Sử dụng shader hoặc `meshStandardMaterial` với `color: "#00d4ff"`, `emissive: "#00a8ff"`, `emissiveIntensity: 0.8` và thêm hiệu ứng nhấp nháy/trượt nhẹ theo `useFrame`.
4. Nhãn 3D (`Html` overlay): Đặt nhãn `QR Cổng Chính` kèm pin xanh lá `#22c55e` ở đầu mũi tên và nhãn `Tòa B` ở trên mái cắt của Tòa B với thuộc tính `center` và `distanceFactor` để chữ luôn sắc nét trên màn hình Retina của điện thoại.
```

## 3. Prompt Tạo Thêm Ảnh Thiết Kế UI Đồ Họa Điện Thoại (Dùng cho AI Tạo Ảnh / Midjourney / Nano Banana)

Nếu bạn muốn tạo thêm các bức ảnh đồ họa điện thoại cho các màn hình khác (ví dụ: *Màn hình lúc mới quét QR chọn phòng*, hoặc *Màn hình Bước 3 khi đã lên Tầng 3 Tòa B*) giữ nguyên 100% bố cục và tông màu của bức ảnh này để đưa vào báo cáo:

```text
Keep the exact same sleek mobile phone frame, top floating search bar ('Điểm đến: Phòng B302 - Tòa B (Cơ sở 1)'), right floating floor selector pill, and bottom white navigation sheet style from the reference image. Change the center 3D architectural viewport to zoomed-in indoor cutaway view of Floor 3 of 'Tòa B' ('T3' button highlighted in blue on the right pill selector). Show semi-transparent white classroom walls, hallway doors, a 3D staircase, and a glowing cyan-blue 3D arrow path coming up from the stairs, turning right along the hallway straight into the open door of room 'B302' (highlighted with a soft blue glow and a floating label 'Phòng B302'). In the bottom sheet card, show 'Bước 3 / 4', a turn-right arrow icon, bold text 'Từ cầu thang Tầng 3, rẽ phải đi dọc hành lang đến Phòng B302', and the 'Quay lại' and 'Bước tiếp theo' buttons.
```
