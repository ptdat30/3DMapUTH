# TÀI LIỆU ĐẶC TẢ KỸ THUẬT & BẢN THIẾT KẾ HỆ THỐNG (MASTER SPEC)
**Dự án:** 3D Campus WiFi Digital Twin & NOC Command Center  
**Mục đích:** Tài liệu ngữ cảnh toàn diện (Context Prompt / PRD) dành cho AI Coding Agent (Cursor / Antigravity / Windsurf) để xây dựng ứng dụng Web 3D giám sát chất lượng mạng WiFi theo thời gian thực.

---

## PHẦN 0: CHỈ THỊ DÀNH CHO AI CODING AGENT (SYSTEM DIRECTIVE)

> **Hướng dẫn cho AI Agent:** Bạn là Principal UI/UX Architect chuyên về hệ thống NOC (Network Operations Center) và Senior 3D WebGL Engineer (Three.js / React Three Fiber). Khi đọc file `.md` này, nhiệm vụ của bạn là hiện thực hóa toàn bộ đặc tả bên dưới thành một ứng dụng Web hoàn chỉnh, chạy mượt ở 60FPS, giao diện đạt chuẩn "Tactical Dark Mode Command Center" và có đầy đủ dữ liệu giả lập cố định theo Seed.
> 
> **Quy tắc bắt buộc khi viết code:**
> 1. Không dùng dữ liệu ngẫu nhiên thuần túy (`Math.random()`) làm nhảy loạn số liệu khi reload; bắt buộc dùng hàm PRNG có seed cố định (`mulberry32`).
> 2. Mọi biểu đồ 2D và mô hình 3D phải đồng bộ hai chiều (Bi-directional Cross-filtering) thông qua `Zustand` store.
> 3. Giữ nguyên cấu trúc 6 phân khu kiến trúc theo đúng mặt bằng 3D của trường (Cổng chính Số 2 Võ Oanh).
> 4. Khi tách tầng (Floor Isolation), sử dụng kỹ thuật X-Ray Wireframe kết hợp mặt phẳng cắt ngang Hologram 2.5D (`THREE.PlaneGeometry`) bên trong khối nhà.

---

## 1. CONCEPT TỔNG THỂ & NGÔN NGỮ THỊ GIÁC

### 1.1. Định hướng giao diện
Triển khai theo phong cách **Tactical NOC Command Center (Obsidian Glass Dark Mode)**:
* **Lý do lựa chọn:** Làm nổi bật hoàn toàn 6 khối kiến trúc tường trắng/mái màu của mô hình 3D gốc, giúp các vùng phủ sóng (Heatmap), tia kết nối và cột sáng cảnh báo (Alert Beacons) phát sáng rực rỡ, đồng thời đảm bảo độ tương phản cao khi trình chiếu trên máy chiếu hội trường.

### 1.2. Hệ thống Màu sắc (Color Tokens)
* **Môi trường 3D (Scene Background & Fog):** `#090D16` (Xanh đen vũ trụ) kết hợp lưới tọa độ mặt đất `#1E293B` (Opacity `0.35`).
* **Bề mặt HUD Panel (Glassmorphism):**
  * Background: `rgba(15, 23, 42, 0.78)` (`backdrop-blur-md`)
  * Border: `1px solid rgba(255, 255, 255, 0.08)`
  * Active/Hover Border: `1px solid rgba(56, 189, 248, 0.45)`
* **5 Cấp độ Trạng thái Sức khỏe Mạng (Semantic Status Colors):**
  1. **Xuất sắc (EXCELLENT | 90–100):** Emerald `#10B981`
  2. **Tốt (GOOD | 75–89):** Cyan `#06B6D4`
  3. **Trung bình (FAIR | 60–74):** Amber `#F59E0B`
  4. **Kém (POOR | 40–59):** Orange `#F97316`
  5. **Nghiêm trọng (CRITICAL | 0–39):** Crimson `#EF4444`

### 1.3. Typography & Motion
* **Font chữ:**
  * UI & Nhãn tiếng Việt: `Inter` hoặc `Plus Jakarta Sans`.
  * Số liệu Telemetry, độ trễ, địa chỉ IP/MAC: `JetBrains Mono` với thuộc tính CSS bắt buộc `font-variant-numeric: tabular-nums` để khung số không bị rung khi cập nhật theo thời gian thực.
* **Quy tắc chuyển động (Purposeful Motion):**
  * Chỉ các thực thể ở trạng thái `CRITICAL` hoặc `POOR` mới phát hiệu ứng sóng lan tỏa (Pulse Ring tần số $1.5\text{ Hz}$).
  * Chuyển góc nhìn camera sử dụng nội suy mượt (`Smooth Damping / Camera Lerp`) trong khoảng $0.6\text{s} - 0.8\text{s}$.

---

## 2. ĐẶC TẢ KHÔNG GIAN 3D & KIẾN TRÚC THÔNG TIN (DRILL-DOWN)

### 2.1. Ánh xạ 6 Phân khu Kiến trúc Thực tế (Spatial Mapping)
Mô hình 3D khuôn viên trường (Cổng chính Số 2 Võ Oanh) được định danh thành 6 khu vực chuẩn trong code:
1. **`bldg-A` — Tòa A (Central Dome):** Tòa Hành chính & Hội trường lớn (chính diện cổng chính, kiến trúc tân cổ điển có mái vòm vàng, 3 tầng).
2. **`bldg-B` — Tòa B (Left L-Wing):** Khối Giảng đường lý thuyết chữ L mái xanh dương bên trái (4 tầng).
3. **`bldg-C` — Tòa C (North Tower):** Tòa cao tầng phía sau bên trái có tranh tường mặt tiền — Trung tâm CNTT, Phòng Lab máy tính & Thư viện (6 tầng).
4. **`bldg-D` — Tòa D (Right L-Wing):** Khối chữ L mái xám vòm cao bên phải — Khu Khoa/Viện nghiên cứu & Văn phòng giảng viên (4 tầng).
5. **`bldg-E` — Tòa E (Far-Right Block):** Khối nhà dài mái đen sát rìa phải — Khu Thực hành, Nhà thi đấu đa năng & Căn tin (3 tầng).
6. **`zone-F` — Khu F (Central Courtyard & Main Gate):** Sân trung tâm và khu vực Cổng chính Số 2 Võ Oanh — Không gian mở tổ chức sự kiện.

### 2.2. Luồng Drill-down 5 Cấp (Zero-Reload Spatial Navigation)
Hệ thống hoạt động trên một màn hình Canvas duy nhất với 5 cấp độ thu phóng:
* **Level 0 (Campus Overview):** Góc nhìn Isometric toàn cảnh 6 khu vực, hiển thị huy hiệu tổng hợp trên nóc tòa nhà và cột sáng cảnh báo P1.
* **Level 1 (Building Focus):** Click vào 1 tòa nhà $\rightarrow$ Camera bay áp sát tòa đó, 5 khu vực còn lại giảm độ mờ (`opacity: 0.2`), bảng bên phải hiển thị Radar Chart và danh sách tầng của tòa đang chọn.
* **Level 2 (Floor X-Ray Slice):** Chọn 1 tầng $\rightarrow$ Vỏ tòa nhà chuyển sang chế độ X-Ray trong suốt, xuất hiện mặt phẳng Hologram 2.5D của tầng đó với lớp phủ Heatmap RSSI và vị trí các AP.
* **Level 3 (Area/Room Focus):** Click vào một phòng/khu vực trên mặt cắt tầng (VD: Phòng Lab C402) để xem mật độ sinh viên và chất lượng chuyển vùng (Roaming).
* **Level 4 (AP Hardware Inspector):** Click vào quả cầu AP $\rightarrow$ Mở bảng thông số kỹ thuật phần cứng (Băng tần 2.4/5GHz, Kênh truyền, Tx Power, SNR, danh sách Client kết nối).

---

## 3. MÔ HÌNH DỮ LIỆU & TOÁN HỌC MÔ PHỎNG

### 3.1. TypeScript Interfaces (`src/types/wifiTwin.ts`)

```typescript
export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export type ScenarioId = 
  | 'NORMAL_DAY' 
  | 'PEAK_SHIFT_CHANGE' 
  | 'ONLINE_EXAM_SURGE' 
  | 'COURTYARD_FESTIVAL' 
  | 'AP_POWER_OUTAGE';

export type IssueCategory = 
  | 'CHANNEL_CONGESTION' 
  | 'SIGNAL_DEADZONE' 
  | 'CLIENT_OVERLOAD' 
  | 'POE_POWER_LOSS' 
  | 'ROAMING_FAILURE';

export interface WifiMetrics {
  healthScore: number;               // 0 - 100
  status: HealthStatus;
  rssiDbm: number;                   // -35 dBm đến -92 dBm
  snrDb: number;                     // 5 dB đến 45 dB
  latencyMs: number;                 // 4 ms đến 250 ms
  jitterMs: number;                  // 1 ms đến 60 ms
  packetLossPercent: number;         // 0% đến 15%
  throughputMbps: number;            // 10 Mbps đến 950 Mbps
  clientCount: number;               // Số thiết bị kết nối
  apLoadPercent: number;             // 0% đến 100%
  channelUtilizationPercent: number; // 0% đến 100%
  interferencePercent: number;       // 0% đến 85%
  coveragePercent: number;           // 0% đến 100%
  roamingQualityPercent: number;     // 0% đến 100%
}

export interface AccessPointNode {
  id: string;
  name: string;
  buildingId: string;
  floorNumber: number;
  areaId: string;
  position3D: [number, number, number]; // Tọa độ trong không gian Three.js
  band: '2.4GHz' | '5GHz' | 'DUAL';
  channel24: 1 | 6 | 11;
  channel5: 36 | 40 | 44 | 48 | 149 | 153 | 157 | 161;
  txPowerDbm: number;
  isOnline: boolean;
  metrics: WifiMetrics;
}

export interface FunctionalArea {
  id: string;
  name: string;
  type: 'LECTURE_HALL' | 'COMPUTER_LAB' | 'LIBRARY' | 'CORRIDOR' | 'CANTEEN' | 'ADMIN' | 'OUTDOOR';
  floorNumber: number;
  buildingId: string;
  capacity: number;
  bounds2D: [number, number, number, number]; // [x, z, width, depth] trên mặt phẳng tầng
  metrics: WifiMetrics;
}

export interface FloorNode {
  id: string;
  floorNumber: number;
  label: string;
  elevationY: number; // Độ cao mặt cắt Y trong Three.js
  buildingId: string;
  areas: FunctionalArea[];
  metrics: WifiMetrics;
}

export interface BuildingNode {
  id: string;
  code: string;
  name: string;
  shortDesc: string;
  meshNames: string[]; // Tên mesh trong file GLTF/GLB hoặc khối Procedural
  center3D: [number, number, number];
  dimensions3D: [number, number, number];
  roofColor: string;
  floors: FloorNode[];
  metrics: WifiMetrics;
  primaryIssue: string;
  recommendation: string;
}

export interface TimeSeriesPoint {
  timeLabel: string; // "07:00", "07:30", ...
  hourDecimal: number;
  targetId: string;  // 'CAMPUS' hoặc buildingId
  healthScore: number;
  latencyMs: number;
  jitterMs: number;
  throughputMbps: number;
  clientCount: number;
  interferencePercent: number;
}

export interface NetworkAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: IssueCategory;
  buildingId: string;
  floorNumber?: number;
  apId?: string;
  title: string;
  metricTrigger: string;
  recommendation: string;
  acknowledged: boolean;
}
```

### 3.2. Công thức Toán học Tính `Health Score` & Phân loại Trạng thái
Mỗi AP hoặc phân khu được tính điểm sức khỏe $H \in [0, 100]$ dựa trên phương trình trọng số:

$$H = \text{clamp}\left(0.25 \cdot S_{\text{Signal}} + 0.25 \cdot S_{\text{Latency}} + 0.20 \cdot S_{\text{Loss}} + 0.15 \cdot S_{\text{Load}} + 0.15 \cdot S_{\text{Interference}}, 0, 100\right)$$

Trong đó các hàm chuẩn hóa thành phần về thang $[0, 100]$ được định nghĩa như sau:
* $S_{\text{Signal}} = \text{clamp}\left(\frac{\text{RSSI} - (-90)}{-45 - (-90)} \times 100, 0, 100\right)$
* $S_{\text{Latency}} = \text{clamp}\left(100 - \frac{\text{Latency} - 5}{150 - 5} \times 100, 0, 100\right)$
* $S_{\text{Loss}} = \text{clamp}\left(100 - \text{PacketLoss\%} \times 18, 0, 100\right)$
* $S_{\text{Load}} = \text{clamp}\left(100 - \max(0, \text{ChannelUtil\%} - 30) \times 1.4, 0, 100\right)$
* $S_{\text{Interference}} = \text{clamp}\left(100 - \text{Interference\%} \times 1.5, 0, 100\right)$

**Ngưỡng phân loại 5 trạng thái:**
* `EXCELLENT`: $H \ge 90$
* `GOOD`: $75 \le H < 90$
* `FAIR`: $60 \le H < 75$
* `POOR`: $40 \le H < 60$
* `CRITICAL`: $H < 40$ (hoặc `isOnline === false`)

### 3.3. Bảng Dữ liệu Chuẩn của 6 Phân khu (Kịch bản Mặc định: Giờ cao điểm & Thi trực tuyến 09:30)

| Mã | Tên Phân khu | Health Score | Coverage | Mật độ Client | Độ trễ | Mức nhiễu | Vấn đề chính | Đề xuất tự động |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tòa A** | Tòa Hành chính (Mái vòm vàng) | 93 (Xuất sắc) | 98% | 145 | 9 ms | 8% | Hoạt động ổn định, tải nhẹ | Duy trì cấu hình hiện tại |
| **Tòa B** | Giảng đường Chữ L (Mái xanh) | 52 (Kém) | 84% | 890 | 68 ms | 36% | Quá tải cục bộ tầng 2–3 giờ chuyển ca | Bật Load Balancing; giới hạn băng thông video 4K |
| **Tòa C** | Tòa Cao tầng CNTT & Lab | 36 (Nghiêm trọng) | 79% | 640 | 138 ms | 52% | 1 AP tầng 4 mất nguồn PoE; nghẽn kênh thi online | Chuyển tải sang AP-C4-03; kiểm tra port PoE Switch tầng 4 |
| **Tòa D** | Khối Khoa/Viện (Mái xám) | 82 (Tốt) | 94% | 310 | 19 ms | 16% | Suy hao sóng nhẹ ở góc khuất hành lang chữ L | Tăng công suất phát (Tx Power) thêm +2dBm tại 2 AP góc |
| **Tòa E** | Khối Thực hành & Căn tin (Mái đen) | 66 (Trung bình) | 88% | 415 | 44 ms | 31% | Nhiễu giao thoa băng tần 2.4GHz tại Căn tin tầng 1 | Quy hoạch lại kênh 1-6-11; bật Band Steering ưu tiên 5GHz |
| **Khu F** | Sân Trung tâm & Cổng Số 2 Võ Oanh | 78 (Tốt) | 91% | 180 | 24 ms | 12% | Roaming trễ khi sinh viên đi từ cổng vào Tòa A | Tinh chỉnh ngưỡng 802.11k/v/r Fast Roaming |

---

## 4. BỐ CỤC GIAO DIỆN (HUD OVERLAY ARCHITECTURE)

Canvas 3D chiếm toàn bộ `100vw x 100vh` (`position: fixed; inset: 0`). Các bảng điều khiển 2D nổi bên trên sử dụng `pointer-events-auto` (trong khi container bao ngoài để `pointer-events-none` nhằm không chặn thao tác xoay chuột trên 3D):

1. **Top Command Bar (`height: 64px`):**
   * Góc trái: Logo hệ thống + Breadcrumb điều hướng phân cấp (`Toàn trường > Tòa C > Tầng 4 > AP-C4-02`) + Nút `Reset View`.
   * Giữa: 5 Thẻ KPI tổng hợp (Campus Health Score, Online APs `73/75`, Active Clients `2,480`, Avg Latency `42 ms`, Total Throughput `1.84 Gbps`).
   * Góc phải: Bộ chọn 5 Kịch bản mô phỏng nhanh + Nút bật/tắt chế độ **So sánh 2 Tòa (Compare Mode)**.
2. **Floating 3D Layer Toolbar (Nằm giữa phía trên Viewport 3D):**
   * Các nút dạng Pill bật/tắt lớp hiển thị 3D: `[Bản đồ nhiệt Heatmap]`, `[Chùm sóng AP]`, `[Nhãn Tòa nhà]`, `[Tách tầng X-Ray]`, `[Cột sáng Cảnh báo]`.
3. **Left Analytics Dock (`width: 340px`):**
   * Thanh tìm kiếm nhanh Tòa nhà / Phòng / Mã AP + Bộ lọc theo 5 mức trạng thái.
   * **Biểu đồ 4:** Horizontal Bar Chart xếp hạng 6 phân khu theo Health Score.
   * **Biểu đồ 6:** Interactive Treemap phân bổ tỷ trọng các nguyên nhân sự cố mạng.
4. **Right Inspector & Alert Dock (`width: 380px`):**
   * Có 2 Tab chuyển đổi hoặc cuộn dọc:
     * **Khối trên:** **Biểu đồ 5** (Segmented Gauge/Score Ring) + **Biểu đồ 8** (Bảng Cảnh báo Ưu tiên P1/P2 có nút `[Fly to 3D]` và nút `[Auto-Fix]`).
     * **Khối dưới:** **Biểu đồ 2** (Radar Chart đa chiều so sánh chất lượng giữa các tòa) + **Biểu đồ 7** (Scatter Plot tương quan số Client và Độ trễ) + **Biểu đồ 9** (Phổ giao thoa kênh tần số RF 2.4GHz/5GHz khi chọn tầng/AP).
5. **Bottom Timeline & Telemetry Bar (`height: 120px`):**
   * Cụm điều khiển Timeline: Nút `Play/Pause`, tốc độ phát (`1x`, `5x`, `10x`), thanh trượt thời gian `00:00 – 23:59` (hiển thị mốc sự kiện trên thanh trượt).
   * **Biểu đồ 3:** Dual-Axis Area/Line Chart hiển thị chuỗi thời gian thực của Latency, Jitter và Throughput đồng bộ theo con trỏ Timeline.

---

## 5. ĐẶC TẢ CHI TIẾT 9 BIỂU ĐỒ TRỰC QUAN HÓA

1. **Spatial Coverage Heatmap (Bản đồ nhiệt phủ sóng 3D/2D):**
   * *Loại:* Canvas/Shader Texture nội suy theo khoảng cách nghịch đảo (IDW) từ tọa độ các AP trên mặt sàn tầng + Mini Matrix Heatmap (`Tòa x Tầng`).
   * *Trường dữ liệu:* `position3D`, `rssiDbm`, `coveragePercent`.
   * *Tương tác:* Chuyển đổi lớp màu giữa `RSSI Signal`, `SNR`, và `Client Density`.
2. **Multi-Building Quality Radar Chart (Đa giác đối chiếu chất lượng):**
   * *Loại:* ECharts Radar (6 trục thang điểm 100: `Coverage`, `Throughput`, `Latency Score`, `SNR Quality`, `Roaming`, `Channel Health`).
   * *Tương tác:* Mặc định so sánh tòa đang chọn với trung bình toàn trường (Campus Baseline); khi bật Compare Mode sẽ chồng lớp 2 tòa nhà.
3. **Time-Series Telemetry Line Chart (Chuỗi thời gian đa chỉ số):**
   * *Loại:* ECharts Dual-Axis Smooth Area/Line Chart.
   * *Trường dữ liệu:* `timeLabel`, `latencyMs` (đường cam), `jitterMs` (đường vàng nét đứt), `throughputMbps` (vùng xanh cyan).
   * *Tương tác:* Kéo con trỏ trên biểu đồ sẽ cập nhật ngay lập tức trạng thái toàn bộ mô hình 3D tại thời điểm đó.
4. **Building Health Ranking Bar Chart (Xếp hạng sức khỏe tòa nhà):**
   * *Loại:* Horizontal Bar Chart có thanh nền mục tiêu SLA (80 điểm).
   * *Tương tác:* Click vào thanh của tòa nào $\rightarrow$ Camera 3D bay tới tòa đó; Hover $\rightarrow$ Làm sáng viền tòa nhà trên 3D.
5. **Overall SLA Score Ring (Vòng đo chất lượng tổng thể):**
   * *Loại:* Segmented Doughnut / Arc Gauge.
   * *Tương tác:* Hiển thị điểm số lớn ở tâm và tỷ lệ phân bổ 5 trạng thái của 75 AP quanh vòng tròn; click vào từng màu để lọc AP trên 3D.
6. **Issue Root-Cause Treemap (Bản đồ cây nguyên nhân sự cố):**
   * *Loại:* ECharts Treemap.
   * *Trường dữ liệu:* 5 nhóm sự cố (`CHANNEL_CONGESTION`, `SIGNAL_DEADZONE`, `CLIENT_OVERLOAD`, `POE_POWER_LOSS`, `ROAMING_FAILURE`).
   * *Tương tác:* Click vào 1 nhóm sự cố để highlight các AP đang gặp đúng lỗi đó trên 3D.
7. **Client Density vs. Latency Scatter Plot (Tương quan tải và độ trễ):**
   * *Loại:* Bubble Scatter Chart kèm đường vạch ngang ngưỡng SLA (`Latency = 50ms`).
   * *Trường dữ liệu:* Trục X: `clientCount`, Trục Y: `latencyMs`, Bán kính chấm: `channelUtilizationPercent`, Màu sắc: `status`.
   * *Tương tác:* Click vào điểm dị biệt (Outlier) ở góc trên bên phải để bay thẳng tới AP đang quá tải.
8. **Priority Alert Action Table (Bảng cảnh báo hành động):**
   * *Loại:* Interactive Data List có phân loại mức độ ưu tiên (`CRITICAL`, `WARNING`), thời gian phát sinh, nguyên nhân và nút hành động.
   * *Tương tác:* Nút `[Định vị 3D]` bay camera tới tận AP; nút `[Tối ưu hóa]` chạy kịch bản tự động khắc phục lỗi (nâng điểm Health Score lên trạng thái Tốt).
9. **RF Channel Co-Interference Spectrum (Biểu đồ phổ giao thoa kênh tần số — Điểm nhấn "Wow" chuyên môn):**
   * *Loại:* Overlapping Gaussian Bell-Curve Chart cho các kênh băng tần 2.4GHz (`1, 6, 11`) và 5GHz (`36, 40, 44, 48, 149...`).
   * *Mục đích:* Minh họa trực quan vì sao 2 AP đặt gần nhau dùng chung kênh truyền lại gây nhiễu đồng kênh (Co-channel Interference).

---

## 6. KỸ THUẬT TƯƠNG TÁC MODEL 3D (THREE.JS / R3F SPECS)

### 6.1. Cơ chế Load Model GLB kết hợp Fallback Procedural Thông minh
* Hệ thống hỗ trợ load file model 3D thực tế của người dùng qua đường dẫn `/models/campus.glb` (hoặc cho phép kéo-thả file `.glb/.gltf` trực tiếp vào màn hình).
* **Quan trọng (Smart Architectural Fallback):** Trong trường hợp chưa có file `.glb` hoặc đang chạy môi trường preview độc lập, hệ thống tự động dựng (procedurally generate) **đúng 6 khối kiến trúc đặc trưng trong ảnh của trường** (Tòa A có hàng cột mặt tiền và mái vòm vàng, Tòa B chữ L mái xanh, Tòa C cao tầng có khung tranh mặt tiền, Tòa D chữ L mái xám có cửa sổ vòm cao, Tòa E mái đen dài với cửa sổ vòm dọc và ô kính tròn khuyết góc, Khu F sân xám và cổng chào Số 2 Võ Oanh) để ứng dụng luôn chạy hoàn hảo 100% ngay lập tức.

### 6.2. Hiệu ứng X-Ray Tách Tầng & Heatmap 2.5D
* Khi chọn 1 tòa nhà và bấm vào 1 tầng (ví dụ: Tầng 4 của Tòa C):
  * Vỏ ngoài của tòa nhà đó chuyển sang `meshPhysicalMaterial` với `transparent: true, opacity: 0.14, wireframe: false, depthWrite: false`.
  * Hiển thị các tấm mặt sàn `PlaneGeometry` tương ứng với từng tầng. Tầng đang chọn được nâng độ sáng, vẽ lưới phòng ban và phủ `CanvasTexture` nội suy màu nhiệt (Xanh $\rightarrow$ Vàng $\rightarrow$ Đỏ) quanh tọa độ các AP trên tầng đó.

### 6.3. Chống rối mắt trên không gian 3D (Anti-Clutter & Semantic LOD)
* Sử dụng `<Instances>` để vẽ toàn bộ 75 Access Points chỉ trong 1 Draw Call.
* Ở cấp độ `Campus Overview`: Ẩn các chấm AP nhỏ lẻ, chỉ hiển thị **Đế sáng chân tòa nhà (Base Footprint Glow)**, **6 Huy hiệu Glassmorphism trên nóc**, và **Cột sáng thẳng đứng (Vertical Light Pillar)** tại các điểm có cảnh báo `CRITICAL`.

---

## 7. KIẾN TRÚC THƯ MỤC & KẾ HOẠCH TRIỂN KHAI CHO AI AGENT

### 7.1. Tech Stack Khuyến nghị
* **Bundler & UI:** Vite + React 18 + TypeScript + Tailwind CSS + `lucide-react`.
* **3D Engine:** `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`.
* **Charts:** `echarts`, `echarts-for-react` (hoặc SVG/Canvas custom tối ưu).
* **State Management:** `zustand`.

### 7.2. Cấu trúc Thư mục Chuẩn
```text
src/
├── types/
│   └── wifiTwin.ts                # Toàn bộ TypeScript Interfaces
├── simulation/
│   ├── prng.ts                    # Hàm mulberry32 seeded random
│   ├── campusGenerator.ts         # Sinh dữ liệu 6 tòa nhà, 75 APs, 5 kịch bản & chuỗi thời gian 24h
│   └── healthMath.ts              # Công thức tính Health Score & phân loại 5 trạng thái
├── store/
│   └── useTwinStore.ts            # Zustand store quản lý: scenario, currentHour, selectedBuilding, selectedFloor, selectedAP, activeLayers, compareBuildingId, resolvedAlerts
├── components/
│   ├── scene3d/
│   │   ├── CampusCanvas.tsx       # R3F Canvas, Lights, Fog, CameraRig (Fly-to Lerp)
│   │   ├── ProceduralCampus.tsx   # Dựng 6 tòa nhà khớp ảnh 3D + hỗ trợ nạp file GLB ngoài
│   │   ├── FloorXRaySlice.tsx     # Mặt cắt tầng Hologram + Canvas Heatmap Generator
│   │   └── ApNodesAndBeacons.tsx  # Instanced APs, chùm sóng và cột sáng cảnh báo Critical
│   ├── charts/
│   │   ├── BuildingRankChart.tsx  # Bar chart xếp hạng 6 phân khu
│   │   ├── QualityRadarChart.tsx  # Radar chart 6 trục (hỗ trợ Compare Mode)
│   │   ├── TelemetryLineChart.tsx # Dual-axis Line chart theo Timeline
│   │   ├── IssueTreemapChart.tsx  # Treemap nguyên nhân sự cố
│   │   ├── ClientScatterChart.tsx # Scatter plot Client vs Latency
│   │   └── RfSpectrumChart.tsx    # Phổ giao thoa kênh 2.4GHz / 5GHz
│   └── hud/
│       ├── TopCommandBar.tsx      # KPI Header, Breadcrumb, Scenario Switcher
│       ├── LayerFloatingPills.tsx # Nút bật/tắt lớp 3D & Dropzone nạp file .glb
│       ├── LeftAnalyticsDock.tsx  # Panel phân tích bên trái
│       ├── RightInspectorDock.tsx # Panel cảnh báo, chi tiết Tòa/Tầng/AP & nút Auto-Fix
│       ├── CompareModalDrawer.tsx # Bảng đối chiếu trực tiếp 2 tòa nhà
│       └── BottomTimelineBar.tsx  # Thanh tua thời gian & kịch bản thuyết trình tự động
└── App.tsx
```

### 7.3. Checklist Nghiệm thu (Definition of Done)
- [x] Giao diện Dark Mode NOC sắc nét, bố cục HUD không che khuất mô hình 3D trung tâm.
- [x] Đầy đủ 6 phân khu kiến trúc của trường, click chọn được từng tòa và tự động bay camera.
- [x] Chế độ X-Ray cắt tầng hoạt động mượt, hiển thị rõ Heatmap phủ sóng và từng thiết bị AP.
- [x] Chuyển đổi tức thì giữa 5 kịch bản: Bình thường, Giờ cao điểm, Thi trực tuyến, Lễ hội sân trường, Mất điện AP.
- [x] Thanh trượt Timeline 24h hoạt động mượt kèm nút Play/Pause.
- [x] Đầy đủ 9 công cụ trực quan hóa (Heatmap, Radar, Line, Bar, Score Ring, Treemap, Scatter, Alert Table, RF Spectrum).
- [x] Có tính năng **"Áp dụng Khuyến nghị / Auto-Optimize"** giúp mô phỏng việc xử lý sự cố thành công ngay trên sóng truyền hình trực tiếp trước giảng viên.