# ĐẶC TẢ CHI TIẾT GIAO DIỆN BẢN ĐỒ DẪN ĐƯỜNG 2D (INDOOR 2D WAYFINDING SPECIFICATION)
**Trường Đại học Giao thông vận tải TP.HCM (UTH)**  
*Tài liệu chuẩn hóa thiết kế & đồng bộ giao diện mặt bằng kiến trúc 2D từ hình ảnh tham chiếu thực tế*

---

## 1. TỔNG QUAN & PHONG CÁCH THIẾT KẾ (DESIGN PHILOSOPHY)

Dựa trên hình ảnh mặt bằng tham chiếu [2d_map_reference.jpg](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/public/2d_map_reference.jpg), hệ thống dẫn đường 2D được định hình theo phong cách **Warm Minimalist Architectural Wayfinding (Kiến trúc tối giản tông ấm cao cấp)**:

- **Định dạng hiển thị:** Khổ dọc (**Portrait Layout / Mobile-First**), tỷ lệ chuẩn $3:4$ hoặc $9:16$, khớp hoàn hảo với thói quen cầm điện thoại dọc của sinh viên và giảng viên khi di chuyển trong tòa nhà.
- **Tính trực quan (Clarity & Legibility):** Đường nét tường rõ ràng, màu sắc phân khu dịu mắt mang hơi hướng bản vẽ kiến trúc Bắc Âu / Nhật Bản, không bị chói, phân biệt rành mạch giữa **Khu vực phòng học**, **Lõi cầu thang bộ**, **Nhà vệ sinh**, và **Trục hành lang giao thông**.
- **Tính chính xác trong dẫn đường:** Tuyến đường di chuyển đi qua đúng vị trí khe hở của cửa ra vào (Door Openings), có mũi tên định hướng trực quan và icon vị trí người dùng (User Location Pin) thời gian thực.

![Hình ảnh tham chiếu mặt bằng 2D UTH](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/public/2d_map_reference.jpg)

---

## 2. BẢNG MÃ MÀU THIẾT KẾ QUY CHUẨN (DESIGN TOKENS & COLOR PALETTE)

Để đảm bảo đồng bộ 100% về mặt thị giác khi lập trình, toàn bộ màu sắc được trích xuất chính xác theo mã HEX sau:

| Đối tượng giao diện | Mã màu HEX | Tên màu / Phong cách | Mô tả chi tiết |
| :--- | :---: | :--- | :--- |
| **Nền Hành lang (Corridor)** | `#F3EFEA` | Warm Cream | Nền hành lang sáng ấm, tạo cảm giác lối đi thông thoáng. |
| **Đường viền Tường (Wall Borders)** | `#4A4540` | Charcoal Warm Gray | Viền tường bê tông ngăn phòng, nét đậm $3.5\text{px} - 4\text{px}$. |
| **Phòng Học 301 (P.301)** | `#FAF2E6` | Warm Ivory | Tông màu kem sáng nhạt, nổi bật chữ số phòng. |
| **Phòng Học 302 (P.302)** | `#C8BEB3` | Muted Warm Taupe | Tông xám be tro ấm, tạo sự tương phản nhẹ với phòng bên cạnh. |
| **Khối Cầu Thang (Stairs 1 & 2)** | `#605B55` | Charcoal Slate | Tông xám than đậm, đại diện cho lõi giao thông đứng chịu lực. |
| **Rãnh bậc thang (Stair Treads)** | `#48443F` | Dark Charcoal Stripes | Dải sọc kẻ đứng song song mô phỏng bề mặt các bậc tam cấp. |
| **Khu Nhà vệ sinh (WC Nam & Nữ)** | `#B5C2C9` | Muted Steel Blue | Tông xanh xám thép dịu nhẹ, chuẩn màu nhận diện tiện ích vệ sinh. |
| **Tuyến đường dẫn lối (Route Path)**| `#0F4C5C` | Deep Teal / Cổ vịt | Đường dẫn nét liền đậm ($3\text{px}$), tương phản rõ trên nền hành lang. |
| **Mũi tên định hướng (Arrows)** | `#0F4C5C` | Deep Teal Solid | Tam giác đều gắn trực tiếp trên tuyến đường chỉ hướng bước đi. |
| **Pin Vị trí người dùng (Avatar)** | `#0F4C5C` | Deep Teal Pin + White | Biểu tượng giọt nước (Teardrop), bên trong có hình người màu trắng. |
| **Chữ trên phòng học** | `#1A1817` | Neutral Deep Black | Chữ đen đậm rõ ràng, dễ đọc khi đang đi bộ. |
| **Chữ & Icon Cầu thang** | `#FFFFFF` | Pure White | Trắng nổi bật trên nền xám than. |
| **Icon Nhà vệ sinh** | `#FFFFFF` | Pure White Pictogram | Icon Nam / Nữ chuẩn quốc tế (ISO). |

---

## 3. CẤU TRÚC HÌNH HỌC & HỆ TỌA ĐỘ SVG (SVG GEOMETRY SPECIFICATION)

Khung vẽ SVG chuẩn đề xuất tỷ lệ chuẩn: `viewBox="0 0 480 640"` ($W=480, H=640$).

```
X: 0               X: 380             X: 480
┌──────────────────────┬──────────────────┐ Y: 0
│    CẦU THANG 1       │                  │
├──────────────────────┤                  │ Y: 100
│                      │                  │
│    PHÒNG HỌC 301     │                  │
│                      │ ◄───[Cửa P301]   │ Y: 280
├──────────────────────┤       ▲          │
│                      │       │ [Pin]    │
│    PHÒNG HỌC 302     │       │          │
│                      │ ◄───[Cửa P302]   │ Y: 460
├──────────────────────┤       ▲          │
│    CẦU THANG 2       └───►───┘          │ Y: 540
├──────────────────────┬──────────────────┤
│   WC NAM  │  WC NỮ   │ [Cửa WC]         │ Y: 620
└──────────────────────┴──────────────────┘ Y: 640
```

### 3.1. Phân chia 2 trục không gian:
1. **Trục Chức năng bên Trái (Functional Block):**
   - Chiều rộng: $X = 16 \rightarrow 380$ (Rộng $364\text{px}$, chiếm ~76% chiều ngang).
   - Bao gồm toàn bộ phòng học, cầu thang và khu vệ sinh.
2. **Trục Hành lang bên Phải (Corridor Circulation):**
   - Chiều rộng: $X = 380 \rightarrow 464$ (Rộng $84\text{px}$, chiếm ~24% chiều ngang).
   - Trục giao thông chính chạy dọc xuyên suốt tầng từ Nam đến Bắc.

### 3.2. Chi tiết kích thước từng khối (Tọa độ tuyệt đối):

#### A. Khối Cầu Thang 1 (Đỉnh phía Bắc)
- Tọa độ: `x: 16, y: 16, width: 230, height: 84`
- Màu nền: `#605B55`
- Vân bậc: Các đường sọc đứng song song màu `#48443F` từ $X = 100 \rightarrow 230$, nét $3\text{px}$, khoảng cách $8\text{px}$.
- Icon bên trái: Biểu tượng bậc gấp khúc 4 bậc màu trắng `#FFFFFF` tại $X=35, Y=35$.
- Chữ: "Cầu Thang 1" màu trắng `#FFFFFF`, font size $16\text{px}$, font-weight 600, căn giữa vùng $X=135, Y=60$.

#### B. Khối Phòng Học 301
- Tọa độ: `x: 16, y: 100, width: 364, height: 180`
- Màu nền: `#FAF2E6`, viền ngoài `#4A4540` dày $3.5\text{px}$.
- Vị trí Cửa ra vào (Door Opening Cut):
  - Nằm trên mép tường phải ($X = 380$).
  - Khoảng hở không vẽ viền tường: $Y = 175 \rightarrow 215$ (rộng $40\text{px}$).
- Chữ: "Phòng Học 301", font size $22\text{px}$, font-weight 700, màu `#1A1817`, căn giữa tại `x: 198, y: 190`.

#### C. Khối Phòng Học 302
- Tọa độ: `x: 16, y: 280, width: 364, height: 180`
- Màu nền: `#C8BEB3`, viền ngoài `#4A4540` dày $3.5\text{px}$.
- Vị trí Cửa ra vào:
  - Nằm trên mép tường phải ($X = 380$).
  - Khoảng hở: $Y = 355 \rightarrow 395$ (rộng $40\text{px}$).
- Chữ: "Phòng Học 302", font size $22\text{px}$, font-weight 700, màu `#1A1817`, căn giữa tại `x: 198, y: 370`.

#### D. Khối Cầu Thang 2
- Tọa độ: `x: 16, y: 460, width: 245, height: 80`
- Màu nền: `#605B55`, sọc đứng `#48443F` từ $X=105 \rightarrow 245$.
- Icon bên trái: Biểu tượng bậc gập màu trắng tại $X=35, Y=475$.
- Chữ: "Cầu Thang 2" màu trắng, căn giữa tại `x: 145, y: 505`.
- Cửa thoát ra hành lang: Mép tường phải tại $X=245, Y=490 \rightarrow 520$.

#### E. Khối Nhà Vệ Sinh (WC Nam & WC Nữ)
- Tọa độ: `x: 16, y: 540, width: 364, height: 84`
- Màu nền: `#B5C2C9`, viền `#4A4540`.
- Vách ngăn đôi: Đường thẳng đứng phân cách WC Nam và Nữ tại $X=198$ (tùy chọn hoặc liên thông).
- Nửa bên trái (WC Nam): Icon Nam trắng (`w: 20, h: 32`) tại $X=60$, chữ "WC Nam" tại $X=125, Y=585$.
- Nửa bên phải (WC Nữ): Chữ "WC Nữ" tại $X=245, Y=585$, Icon Nữ trắng tại $X=330$.
- Cửa vào: Khoảng hở mép phải $X=380, Y=560 \rightarrow 595$.

---

## 4. QUY CÁCH DẪN ĐƯỜNG & CHỈ BÁO HÌNH HỌC (NAVIGATION & ROUTING ENGINE)

### 4.1. Tuyến đường thực tế trong hình ảnh:
- **Điểm xuất phát (Origin):** Cầu Thang 2 (`Node: stair2_exit` tại $X=245, Y=502$).
- **Điểm đến (Destination):** Bên trong Phòng Học 301 (`Node: p301_inside` tại $X=340, Y=195$).
- **Hành trình từng bước:**
  1. `stair2_exit` ($245, 502$) $\rightarrow$ Đi thẳng hướng Đông ra giữa hành lang $\rightarrow$ `corridor_junc_stair2` ($425, 502$). (Gắn 1 mũi tên hướng Đông `►`).
  2. `corridor_junc_stair2` ($425, 502$) $\rightarrow$ Rẽ trái $90^\circ$ đi thẳng hướng Bắc theo hành lang $\rightarrow$ qua `corridor_p302` ($425, 375$) $\rightarrow$ qua vị trí người dùng `user_pin` ($425, 330$) $\rightarrow$ đến trước cửa P.301 `corridor_p301` ($425, 195$). (Gắn 2 mũi tên hướng Bắc `▲`).
  3. `corridor_p301` ($425, 195$) $\rightarrow$ Rẽ trái $90^\circ$ bước xuyên qua khe cửa $\rightarrow$ `p301_inside` ($380 \rightarrow 340, 195$). (Gắn 1 mũi tên hướng Tây `◄`).

### 4.2. Vector Path SVG chuẩn xác:
```svg
<path
  d="M 245 502 L 425 502 L 425 195 L 380 195"
  fill="none"
  stroke="#0F4C5C"
  stroke-width="3"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
```

### 4.3. Avatar Pin (Vị trí người dùng):
- Tọa độ: `cx: 425, cy: 330`
- Cấu tạo:
  - Khung Teardrop màu Deep Teal (`#0F4C5C`), đỉnh nhọn hướng xuống dưới.
  - Vòng tròn trắng viền $1.5\text{px}$.
  - Icon hình nhân thu nhỏ màu trắng ở giữa ($12\text{px}$).

---

## 5. MÔ HÌNH ĐỒ THỊ DIJKSTRA LIÊN KẾT (GRAPH SCHEMA)

Khi người dùng yêu cầu code hóa hệ thống này vào React / TypeScript, đồ thị sau sẽ được nạp trực tiếp:

```typescript
export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  floor: number;
  type: 'classroom' | 'stairs' | 'restroom' | 'corridor' | 'door';
}

export const FLOOR3_NODES: Record<string, MapNode> = {
  stair1: { id: 'stair1', name: 'Cầu Thang 1', x: 230, y: 58, floor: 3, type: 'stairs' },
  stair2: { id: 'stair2', name: 'Cầu Thang 2', x: 245, y: 502, floor: 3, type: 'stairs' },
  p301_inside: { id: 'p301_inside', name: 'Phòng Học 301', x: 198, y: 190, floor: 3, type: 'classroom' },
  p301_door: { id: 'p301_door', name: 'Cửa P.301', x: 380, y: 195, floor: 3, type: 'door' },
  p302_inside: { id: 'p302_inside', name: 'Phòng Học 302', x: 198, y: 370, floor: 3, type: 'classroom' },
  p302_door: { id: 'p302_door', name: 'Cửa P.302', x: 380, y: 375, floor: 3, type: 'door' },
  wc_nam: { id: 'wc_nam', name: 'WC Nam', x: 110, y: 580, floor: 3, type: 'restroom' },
  wc_nu: { id: 'wc_nu', name: 'WC Nữ', x: 280, y: 580, floor: 3, type: 'restroom' },
  wc_door: { id: 'wc_door', name: 'Lối vào WC', x: 380, y: 580, floor: 3, type: 'door' },
  corr_top: { id: 'corr_top', name: 'Hành lang Bắc', x: 425, y: 58, floor: 3, type: 'corridor' },
  corr_p301: { id: 'corr_p301', name: 'Hành lang trước P.301', x: 425, y: 195, floor: 3, type: 'corridor' },
  corr_user: { id: 'corr_user', name: 'Vị trí hiện tại', x: 425, y: 330, floor: 3, type: 'corridor' },
  corr_p302: { id: 'corr_p302', name: 'Hành lang trước P.302', x: 425, y: 375, floor: 3, type: 'corridor' },
  corr_stair2: { id: 'corr_stair2', name: 'Hành lang Cầu thang 2', x: 425, y: 502, floor: 3, type: 'corridor' },
  corr_bottom: { id: 'corr_bottom', name: 'Hành lang Nam', x: 425, y: 580, floor: 3, type: 'corridor' },
};
```

---

## 6. NGUYÊN TẮC ĐỒNG BỘ GIAO DIỆN KHI THỰC THI (EXECUTION PROTOCOL)

Khi người dùng ra lệnh: *"Thực hiện giao diện bản đồ 2D theo file mô tả .md"* hoặc *"Đổi giao diện 2D sang bản mẫu mới"*, Agent cam kết tuân thủ chính xác 100% các điều kiện sau:

1. **Khớp hệ màu (Color Consistency):**
   - Không được tự ý thay thế bằng màu pastel hay màu sắc ngẫu nhiên. Bắt buộc dùng đúng 5 màu chủ đạo: Nền kem `#F3EFEA`, Tường than `#4A4540`, P.301 `#FAF2E6`, P.302 `#C8BEB3`, Thang `#605B55`, WC `#B5C2C9`, và Đường dẫn `#0F4C5C`.
2. **Khớp hình học cửa ra vào (Door Cuts):**
   - Tường bao phía hành lang không được vẽ kín một khối chữ nhật đơn giản, mà phải đục khoét các khe hở cửa ($40\text{px}$) để tuyến đường đi xuyên vào phòng đúng chuẩn thực tế.
3. **Hiển thị vân bậc thang & Icons:**
   - Cầu thang phải có họa tiết vạch sọc bậc tam cấp và icon gấp khúc màu trắng.
   - Khu WC phải có icon hình nhân Nam / Nữ chuẩn đồ họa.
4. **Mũi tên định hướng & Avatar Teardrop Pin:**
   - Tuyến đường phải có các mũi tên tam giác đều chỉ đúng hướng rẽ.
   - Điểm vị trí avatar phải vẽ đúng hình giọt nước có icon người trắng ở tâm.
5. **Đồng bộ đa thiết bị:**
   - Khung vẽ co giãn linh hoạt (`viewBox` tỉ lệ $3:4$), hỗ trợ Pan chuột, Zoom và cuộn mượt mà trên cả máy tính lẫn màn hình di động.
