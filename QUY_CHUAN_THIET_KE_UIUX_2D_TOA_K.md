# QUY CHUẨN THIẾT KẾ UI/UX & BẢN ĐỒ DẪN ĐƯỜNG 2D (INDOOR WAYFINDING DESIGN SYSTEM)
**Dự án:** 3DMapUTH - Trường Đại học Giao thông vận tải TP.HCM  
**Mẫu chuẩn tham chiếu:** Tòa K (Cơ sở 3) & Tòa B (Cơ sở 1)  
**Phiên bản:** v1.0.0 (Release Standard)  
**Đối tượng sử dụng:** Frontend Developers, UI/UX Designers, AI Agents

---

## 1. TỔNG QUAN MỤC TIÊU VÀ PHẠM VI (OVERVIEW & SCOPE)

### 1.1. Mục tiêu
Đóng gói và chuẩn hóa toàn bộ tri thức thiết kế UI/UX, thông số hình học, bộ Design Tokens và tương tác của hệ thống bản đồ dẫn đường 2D (Indoor Wayfinding) đã thành công trên Tòa K, tạo thành **Bộ Quy Chuẩn Tái Sử Dụng (Reusable Standard)** giúp:
- Đội ngũ Frontend lập trình nhanh chóng, chính xác các tòa nhà tiếp theo mà không cần thiết kế lại từ đầu.
- Đồng bộ $100\%$ nhận diện thị giác cao cấp theo phong cách **Kiến trúc Tối Giản Tông Ấm (Warm Minimalist Architectural Wayfinding)**.
- Triệt tiêu hoàn toàn các lỗi chồng chéo giao diện trên thiết bị di động (Zero Mobile Collision).

### 1.2. Phạm vi & Đối tượng
- **Phạm vi:** Áp dụng cho toàn bộ bản đồ mặt bằng 2D của tất cả các tòa nhà thuộc Cơ sở 1 (Tòa A, B, C, D, E, F) và Cơ sở 3 (Tòa K, H, I, J, L).
- **Đối tượng áp dụng:**
  - *Frontend Engineers:* Sử dụng component inventory, TypeScript types và mã nguồn mẫu để phát triển tính năng.
  - *UI/UX Designers:* Sử dụng bảng mã màu, tỷ lệ hình học, lưới layout để xuất bản vẽ SVG / Figma token chuẩn.
  - *AI Agents:* Tự động kích hoạt skill `uth-2d-wayfinding-design-system` để sinh code và thẩm định chất lượng bản đồ.
- **Tech Stack cốt lõi:**
  - React 19 + Next.js App Router (Client Components `'use client'`).
  - TypeScript (Strict Mode, 100% không dùng `any`).
  - Tailwind CSS v3/v4.
  - Scalable Vector Graphics (SVG hệ tọa độ thực) + `lucide-react` (`strokeWidth={1.5}`).

---

## 2. QUY TRÌNH THIẾT KẾ & TRIỂN KHAI UI/UX HIỆN TẠI (WORKFLOW)

Quy trình chuẩn hóa gồm 6 giai đoạn khép kín từ bản vẽ mặt bằng thô đến sản phẩm chạy thực tế:

```
[MẶT BẰNG THÔ] ──► [VECTOR HÓA SVG] ──► [GRAPH ENGINE] ──► [DESIGN TOKENS] ──► [FRONTEND ASSEMBLY] ──► [KIỂM THỬ A11Y & MOBILE]
 (CAD / Ảnh chụp)     (Đục khe cửa 40px)     (Dijkstra Nodes)     (Tông ấm Tòa K)     (React Component)        (Zero Collision / 60 FPS)
```

1. **Thu thập & Bóc tách Dữ liệu Mặt bằng (Phase 1):**
   - Rà soát bản vẽ kỹ thuật, lập danh mục toàn bộ phòng học, phòng ban, lõi cầu thang, thang máy, khu WC, lối thoát hiểm.
   - Thống nhất mã định danh phòng (VD: `B.001`, `K.301`).
2. **Vector hóa Hình học & Đục Khe Cửa (Phase 2):**
   - Thiết lập khung vẽ SVG (`viewBox="0 0 480 640"` cho khổ dọc $3:4$, hoặc `viewBox="0 0 1120 780"` cho khổ ngang).
   - **Nguyên tắc bất biến:** Không bao giờ vẽ tường bao kín bít bùng. Bắt buộc đục khoét khe mở cửa rộng $36\text{px} - 40\text{px}$ để đường dẫn hướng có thể đi xuyên vào phòng.
3. **Mô hình Đồ thị Dẫn đường (Phase 3):**
   - Khởi tạo danh sách các đỉnh (Nodes) gồm: tâm phòng, vị trí cửa, ngã ba/ngã tư hành lang, sảnh cầu thang.
   - Liên kết các cạnh (Edges) kèm trọng số khoảng cách thực tế để thuật toán Dijkstra tính toán lộ trình ngắn nhất.
4. **Áp dụng Bộ Design Tokens (Phase 4):**
   - Gắn bảng mã màu chuẩn tông ấm (Warm Minimalist), vân sọc bậc tam cấp, ký hiệu ISO.
5. **Đóng gói Component React (Phase 5):**
   - Tích hợp tính năng Pan (kéo chuột/vuốt chạm), Zoom (lăn chuột/pinch), Search Box gợi ý thông minh, Ngăn kéo chỉ dẫn thu gọn được.
6. **Kiểm thử Công thái học Mobile & Nghiệm thu (Phase 6):**
   - Kiểm tra trên các màn hình có chiều rộng từ $375\text{px}$ đến $4\text{K}$. Đảm bảo không tràn nút, không rớt chữ, đạt chuẩn WCAG AA và 60 FPS.

---

## 3. ĐẶC ĐIỂM GIAO DIỆN & DESIGN TOKENS (DESIGN TOKENS SPECIFICATION)

### 3.1. Bảng mã màu Quy chuẩn (Color Tokens)

Toàn bộ màu sắc được trích xuất chính xác theo hệ màu kiến trúc Bắc Âu / Nhật Bản tông ấm:

```
[#FAF2E6 - P.Chính]   [#C8BEB3 - P.Phụ]   [#CDB07A - Văn Phòng]   [#605B55 - Cầu Thang]   [#B5C2C9 - Vệ Sinh]   [#0F4C5C - Lộ Trình]
      Warm Ivory         Muted Taupe          Mustard Gold            Slate Charcoal          Steel Blue             Deep Teal
```

| Tên Token | Mã HEX | Vai trò trên bản đồ 2D | Ý nghĩa thiết kế |
| :--- | :---: | :--- | :--- |
| **`bg-corridor`** | `#F3EFEA` | Nền hành lang và sảnh giao thông | Tông kem ấm, tạo cảm giác lối đi sáng sủa, thông thoáng. |
| **`wall-border`** | `#4A4540` | Viền tường bê tông ngăn phòng ($3.5-4\text{px}$) | Màu than chì ấm, phân định ranh giới rành mạch, không bị gắt như màu đen tuyền `#000000`. |
| **`room-ivory`** | `#FAF2E6` | Phòng học chính, phòng lý thuyết | Màu kem sáng thanh lịch, tôn vinh chữ số phòng màu đen đậm. |
| **`room-taupe`** | `#C8BEB3` / `#A89B8C` | Phòng học phụ, phòng thực hành, lab | Màu xám be tro ấm, tạo độ tương phản dịu mắt với các phòng lân cận. |
| **`room-gold`** | `#CDB07A` | Văn phòng Khoa, Viện, Tạp chí, Phòng góc | Tông vàng mù tạt ấm, nhấn mạnh các phòng nghiệp vụ đặc biệt. |
| **`stair-bg`** | `#605B55` | Nền khối cầu thang bộ | Màu xám than đậm tượng trưng cho lõi chịu lực kiên cố. |
| **`stair-stripe`**| `#48443F` | Các đường vạch sọc bậc tam cấp | Dải sọc song song mô phỏng bề mặt nhám chống trượt. |
| **`wc-steel`** | `#B5C2C9` | Khu nhà vệ sinh (WC Nam / Nữ) | Màu xanh thép dịu mát, chuẩn nhận diện tiện ích quốc tế. |
| **`route-teal`** | `#0F4C5C` | Tuyến đường dẫn lối, Pin vị trí, Mũi tên | Màu xanh cổ vịt đậm (Deep Teal), tương phản hoàn hảo trên nền kem `#F3EFEA`. |
| **`text-dark`** | `#1A1817` | Chữ số phòng, nhãn chính | Đen trung tính đậm nét, cực kỳ dễ đọc khi người dùng đang di chuyển. |
| **`text-white`** | `#FFFFFF` | Ký hiệu bậc thang, Icon WC, chữ trên nền đậm | Trắng tinh khiết, nổi bật tuyệt đối trên nền `#605B55` và `#0F4C5C`. |

### 3.2. Quy chuẩn Typography (Kiểu chữ & Tỷ lệ)
- **Primary Font Family:** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`.
- **Số hiệu phòng chính:** `font-size: 20px - 24px`, `font-weight: 700` hoặc `800`, căn giữa phòng (`text-anchor="middle"`).
- **Tên mô tả phòng (Sub-label):** `font-size: 11px - 13px`, `font-weight: 700`, viết hoa toàn bộ để dễ nhận diện từ xa.
- **Tên cầu thang / WC:** `font-size: 14px - 16px`, `font-weight: 600`, màu `#FFFFFF`.
- **Badge thông tin / Mã phụ:** `font-size: 9px - 10px`, `font-weight: 800`, font-mono.

### 3.3. Quy chuẩn Khe Cửa (Door Opening) & Cung Mở Quay
- **Khoảng hở tường:** Rộng chuẩn $36\text{px} - 40\text{px}$.
- **Cung quay cánh cửa:** Sử dụng thẻ `<path>` vẽ cung cong $1/4$ đường tròn nét đứt (`stroke-dasharray="3,3"` màu `#7A736B`) nối tiếp với đoạn thẳng cánh cửa để người dùng hình dung hướng đẩy cửa.

### 3.4. Ký hiệu Bậc Thang & Icon Nhà Vệ Sinh
- **Vân sọc bậc thang:** Định nghĩa `<pattern id="stairPattern">` gồm các vạch dày $2.5\text{px} - 3.5\text{px}$, cách đều $6\text{px} - 8\text{px}$.
- **Biểu tượng gấp khúc:** Đường zigzag 4 bậc gấp khúc màu trắng (`stroke="#FFFFFF" strokeWidth="3"` hoặc `"4"`).
- **Biểu tượng WC ISO:** Vector hình nhân Nam và Nữ chuẩn đồ họa quốc tế, kích thước $\approx 24\text{px} \times 32\text{px}$.

---

## 4. DANH MỤC THÀNH PHẦN (COMPONENT INVENTORY, SPECS & PROPS)

### 4.1. `MapCanvasViewport` (Khung bao Tương tác SVG)
- **Vai trò:** Vùng chứa bản vẽ SVG hỗ trợ Pan & Zoom mượt mà.
- **Props Interface:**
  ```typescript
  interface MapCanvasViewportProps {
    zoom: number;
    pan: { x: number; y: number };
    isDragging: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    children: React.ReactNode;
  }
  ```
- **Styling:** Nền ngoài `#4A4540` bo góc `rounded-2xl`, bóng đổ `shadow-2xl`. Bên trong chứa thẻ `<svg>` nền `#F3EFEA`.

### 4.2. `RoomBlock` (Khối Phòng Học Tương Tác)
- **States:**
  - `Normal`: Màu nền theo vai trò (`room-ivory`, `room-taupe`, `room-gold`), viền tường than dày $3.5\text{px}$.
  - `Hover`: Độ mờ giảm nhẹ `opacity-95`, đổi con trỏ chuột sang `cursor-pointer`.
  - `Selected`: Xuất hiện đường viền bao quanh nét đứt màu Deep Teal (`#0F4C5C`) cách tường $4\text{px}$ kèm chấm phát xung `animate-ping`.

### 4.3. `RoutePathRenderer` (Hiển thị Tuyến Dẫn Đường)
- **Đường dẫn chính:** `<path d="..." fill="none" stroke="#0F4C5C" strokeWidth="3.5" strokeLinecap="round" />`.
- **Mũi tên định hướng:** Các tam giác đều gắn tại mỗi đoạn gấp khúc chỉ đúng chiều bước đi.
- **Avatar Pin (Vị trí hiện tại):**
  - Khung Teardrop ngược (đỉnh nhọn cắm xuống tọa độ thực).
  - Vòng tròn màu Deep Teal, viền trắng $1.5\text{px}$.
  - Icon hình nhân thu nhỏ màu trắng ở tâm.
  - Vòng hào quang mờ ($15\%$ opacity) tỏa ra xung quanh.

### 4.4. `StepBottomSheet` (Ngăn Kéo Chỉ Dẫn Dưới Đáy)
- **States:**
  - `Expanded`: Hiển thị danh sách các bước rẽ kèm khoảng cách mét, nút "Mô phỏng bước đi" và nút "Đặt lại lộ trình".
  - `Collapsed`: Thu gọn thành thanh mini-bar mỏng $44\text{px}$ hiển thị vắn tắt: `Lộ trình: Cầu Thang 2 → Phòng 301`.
- **Công thái học di động:** Đảm bảo khi mở bản đồ, người dùng có thể chạm vào drag handle để thu gọn ngăn kéo ngay lập tức, trả lại hơn $90\%$ diện tích màn hình cho bản vẽ.

---

## 5. BỐ CỤC & RESPONSIVE BREAKPOINTS (MOBILE-FIRST)

Quy tắc bất biến: **Không để xảy ra bất kỳ hiện tượng chồng lấp (Collision) hay tràn chữ (Cutoff) nào trên thiết bị di động.**

```
+-------------------------------------------------------------+
| Header: [ < ]  [ TÒA K • TẦNG 3 ]          [ Zoom - / + ] [X] |  Tier 1: Tiêu đề & Công cụ
+-------------------------------------------------------------+
| Sub-bar: [ Tìm phòng: K.301, CT... ]      [ 3 Tab / Liền ]  |  Tier 2: Tìm kiếm & Phân đoạn
+-------------------------------------------------------------+
|                                                             |
|                                                             |
|                    BẢN VẼ MẶT BẰNG SVG                      |  Tỉ lệ khổ dọc 3:4 hoặc 9:16
|                  (Hỗ trợ Pan, Zoom, Pinch)                   |
|                                                             |
|                                                             |
+-------------------------------------------------------------+
| Footer: [ === Kéo để thu gọn/mở rộng === ]                  |  Tier 3: Ngăn kéo chỉ dẫn
| [ 1. Đi thẳng 15m ] [ 2. Rẽ trái vào P.301 ] [ Mô phỏng ▶ ] |  (Thu gọn còn 44px)
+-------------------------------------------------------------+
```

### Chi tiết các Breakpoints:
1. **Mobile Thắt Lưng Buộc Bụng ($<480\text{px}$, iPhone SE 375px):**
   - Hàng phím tiện ích ngang rút gọn tối đa: Nhãn viết tắt (VD: `CS 1`, `2D K`).
   - Tổng chiều rộng cụm nút không được vượt quá $340\text{px}$.
   - Khổ hiển thị ưu tiên dọc $3:4$ (`max-w-[420px]`).
2. **Tablet ($640\text{px} - 1024\text{px}$, iPad):**
   - Khung thẻ bản đồ căn giữa màn hình ($88\text{vw}$), hỗ trợ cử chỉ vuốt 2 ngón tay thu phóng mượt mà.
3. **Desktop ($>1024\text{px}$):**
   - Bố cục tối đa $1200\text{px}$, hỗ trợ lăn chuột (Wheel Zoom) và phím bấm Reset view $100\%$.

---

## 6. QUY CHUẨN TƯƠNG TÁC, ANIMATION & TIẾP CẬN (INTERACTION & A11Y)

### 6.1. Tương tác Thao tác Bản đồ (Pan & Zoom)
- **Chuột (Desktop):** Nhấn giữ chuột trái để kéo (Pan), lăn chuột giữa để phóng to/thu nhỏ (Zoom), con trỏ đổi `cursor-grab` sang `cursor-grabbing`.
- **Cảm ứng (Mobile):** Vuốt 1 ngón tay để di chuyển bản đồ; chạm 2 ngón tay để chụm/mở rộng (Pinch-to-zoom).
- **Giới hạn tỷ lệ:** Min Zoom $= 0.6\times$, Max Zoom $= 2.5\times$ để tránh vỡ hạt đồ họa.

### 6.2. Hiệu ứng Chuyển động (Animations)
- **Vòng lặp Mô phỏng:** Sử dụng `requestAnimationFrame` để cập nhật tọa độ Avatar Pin di chuyển đều đặn dọc theo các đoạn thẳng của lộ trình trong $4\text{s} - 5\text{s}$.
- **Transition:** Mọi thao tác đổi màu, hover, mở ngăn kéo đáy đều sử dụng `transition-all duration-200 ease-out`.

### 6.3. Tiêu chuẩn Tiếp cận (Accessibility - A11y)
- **Tương phản màu sắc (Color Contrast):** Đạt chuẩn WCAG AA:
  - Chữ đen `#1A1817` trên nền kem `#FAF2E6`: Tỷ lệ tương phản $\ge 12:1$ (Vượt chuẩn).
  - Chữ trắng `#FFFFFF` trên nền than `#605B55`: Tỷ lệ tương phản $\ge 5.8:1$ (Vượt chuẩn $4.5:1$).
- **Hỗ trợ Screen Reader:** Mọi nút bấm tương tác bắt buộc có thuộc tính `title="..."` hoặc `aria-label="..."`.
- **Phím tắt:** Hỗ trợ phím `Esc` để đóng modal bản đồ và quay về Sa bàn 3D.

---

## 7. CHECKLIST TRIỂN KHAI CHO FRONTEND & TIÊU CHÍ NGHIỆM THU (QUALITY GATE)

Trước khi nghiệm thu bất kỳ bản đồ 2D của tòa nhà mới nào, đội ngũ Frontend bắt buộc kiểm tra đủ 10 tiêu chí:

- [ ] **1. Tỷ lệ hình học:** Bản vẽ chuẩn tỷ lệ thực tế, không méo hình, không lệch góc $90^\circ$.
- [ ] **2. Khe hở cửa ra vào:** Đục khoét đủ khe cửa ($36-40\text{px}$) ra hành lang, có đường cong cánh cửa mở.
- [ ] **3. Bảng mã màu chuẩn Tòa K:** Nền kem `#F3EFEA`, viền tường `#4A4540`, phòng `#FAF2E6`/`#C8BEB3`/`#CDB07A`, cầu thang `#605B55`, WC `#B5C2C9`, lộ trình `#0F4C5C`.
- [ ] **4. Lõi cầu thang & WC:** Có đủ dải sọc bậc tam cấp `#48443F`, icon zigzag trắng và ký hiệu WC Nam/Nữ ISO.
- [ ] **5. Mũi tên dẫn hướng:** Tam giác đều chỉ đúng chiều di chuyển tại các khúc cua.
- [ ] **6. Công thái học Mobile:** Không có nút nào bị tràn mép, header 2 tầng gọn gàng, tổng bề rộng phím chức năng $\le 340\text{px}$.
- [ ] **7. Ngăn kéo đáy thu gọn:** Có thể bấm thu gọn ngăn kéo còn $44\text{px}$ để ngắm trọn vẹn bản đồ.
- [ ] **8. Độ tương phản WCAG AA:** Đảm bảo mọi dòng chữ đều đọc được rõ ràng khi đang đi bộ.
- [ ] **9. Hiệu năng hiển thị:** Vận hành trơn tru đạt mức 60 FPS khi Pan và Zoom trên thiết bị thật.
- [ ] **10. Kiểm thử TypeScript:** Chạy lệnh `npx tsc --noEmit` đạt 0 lỗi, build production thành công.

---

## 8. MÃ NGUỒN THAM CHIẾU CHUẨN (PRODUCTION-READY CODE TEMPLATE)

Dưới đây là mẫu Component React chuẩn mực sử dụng TypeScript và Tailwind CSS:

```tsx
// src/components/navigation2d/StandardBuilding2DMap.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X, Play, Pause, ChevronDown, ChevronUp, Footprints } from 'lucide-react';

export const TOKENS = {
  bgCorridor: '#F3EFEA',
  wallBorder: '#4A4540',
  roomIvory: '#FAF2E6',
  roomTaupe: '#C8BEB3',
  stairsBg: '#605B55',
  stairsStripe: '#48443F',
  restroom: '#B5C2C9',
  routeTeal: '#0F4C5C',
};

export function StandardBuilding2DMap({ onClose }: { onClose?: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#E8E2D9] flex flex-col overflow-hidden select-none">
      {/* Header Bar */}
      <header className="z-20 px-4 py-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D8CFC4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onClose && (
            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#4A4540]">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
          <h1 className="text-xs sm:text-sm font-black text-[#4A4540] uppercase">Mặt Bằng Kiến Trúc Chuẩn UTH</h1>
        </div>
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#D8CFC4]">
          <button type="button" onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg">
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg">
            <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg">
            <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* SVG Canvas Viewport */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="transition-transform duration-75">
          <div className="bg-[#4A4540] p-2 rounded-xl shadow-2xl">
            <svg viewBox="0 0 480 640" className="w-[88vw] max-w-[420px] h-auto bg-[#F3EFEA] block">
              {/* Pattern bậc thang */}
              <defs>
                <pattern id="stepStripe" width="8" height="80" patternUnits="userSpaceOnUse">
                  <line x1="4" y1="0" x2="4" y2="80" stroke={TOKENS.stairsStripe} strokeWidth="3" />
                </pattern>
              </defs>
              {/* Vẽ phòng học */}
              <rect x="16" y="100" width="364" height="180" fill={TOKENS.roomIvory} stroke={TOKENS.wallBorder} strokeWidth="4" />
              <text x="198" y="195" textAnchor="middle" fill="#1A1817" fontSize="22" fontWeight="700">Phòng Học Mẫu</text>
            </svg>
          </div>
        </div>
      </main>

      {/* Collapsible Bottom Drawer */}
      <footer className="z-20 bg-[#FAF7F2] border-t border-[#D8CFC4] shadow-md">
        <button type="button" onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)} className="w-full py-1.5 flex flex-col items-center">
          <div className="w-10 h-1 rounded-full bg-[#C8BEB3] mb-1" />
          <span className="text-[11px] font-bold text-[#7A736B]">
            {isDrawerCollapsed ? 'Mở rộng hướng dẫn dẫn đường' : 'Thu gọn hướng dẫn'}
          </span>
        </button>
      </footer>
    </div>
  );
}
```
