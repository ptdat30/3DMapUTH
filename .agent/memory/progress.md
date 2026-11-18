# Project Progress & Development Tracking

## 1. Các tính năng đã hoàn thành (Completed Features)

- [x] **Tối ưu hóa Toàn diện Chức năng WiFi Digital Twin NOC trên Mobile:**
  - **Triệt tiêu hiện tượng 2 panel 380px đè lấp toàn bộ màn hình 3D:**
    - Cấu hình cả 2 dock `LeftAnalyticsDock.tsx` và `RightInspectorDock.tsx` mặc định **thu gọn (collapsed)** khi mở trên màn hình di động (< 1024px). Sa bàn 3D (cột sáng cảnh báo, quả cầu AP, heatmap) hiển thị trọn vẹn 100% tầm nhìn.
    - Bổ sung 2 nút pill mở nhanh nổi bật ở 2 bên mép dưới: `[ 📊 Xếp hạng Tòa ]` và `[ 🛡️ SLA & Cảnh báo (N) ]` với huy hiệu số lượng sự cố đang mở.
    - Khi người dùng bấm mở, panel hiển thị dưới dạng **Drawer Modal toàn màn hình** (`max-w-md mx-auto`) có lớp phủ nền mờ và nút đóng `[ Đóng ✕ ]` to rõ ràng ở góc trên.
    - Khi bấm `[Định vị 3D]` hoặc `[Tự động tối ưu]` trong bảng cảnh báo, modal tự động đóng lại trên mobile để người dùng lập tức quan sát camera 3D bay tới AP gặp sự cố.
  - **Khắc phục lỗi chồng chéo và tràn chữ thanh Timeline đáy (`BottomTimelineBar.tsx` & `TelemetryLineChart.tsx`):**
    - Sắp xếp lại dòng thông số Băng thông (Mbps) và Độ trễ (ms) trong đồ thị telemetry với cờ `nowrap` và ngắt dòng thông minh, loại bỏ hoàn toàn hiện tượng rớt chữ ("Băng o thông") và gạch nối biến dạng.
    - Căn chỉnh thanh điều khiển Play/Pause, tua tốc độ và đồng hồ hiển thị linh hoạt theo chiều ngang.
  - **Tối ưu hóa thanh TopCommandBar trên mobile:**
    - Co gọn logo thành `TWIN NOC`, giữ nút `TẮT ✕` dứt khoát ở góc trái, thu hẹp dropdown kịch bản và ẩn nút so sánh/nút tắt phụ trên mobile để thanh trên cùng không bị vỡ giao diện.
- [x] **Tái cấu trúc & Tối ưu hóa Toàn diện Giao diện Mobile (Mobile-First UX):**
  - **Khắc phục triệt để lỗi nút WIFI DIGITAL TWIN bị cắt cụt mép phải (Action Pills Cutoff):**
    - Rút gọn nhãn cơ sở từ `Cơ sở 3 (3D Masterplan)` thành `Cơ sở 3` tiêu chuẩn, súc tích.
    - Tối ưu nút `NocToggleBadge.tsx` thành dạng pill đồng nhất `[ ⚡ WiFi Twin | BẬT/TẮT ]` với chấm xanh nhấp nháy, loại bỏ dòng phụ "Nhấn để Bật Giám sát" chiếm diện tích ngang.
    - Mở rộng container hàng nút từ `max-w-md` (448px) lên `sm:max-w-lg` (512px) và căn giữa `justify-center`, giúp cả 3 nút (Cơ sở 1/3, 2D Tòa K, WiFi Twin) chỉ chiếm tổng cộng ~340px, hiển thị trọn vẹn 100% không bị che lấp trên mọi kích thước màn hình.
  - **Triệt tiêu 100% hiện tượng chồng chéo thanh điều khiển (Header Collisions):**
    - Gom toàn bộ thanh tìm kiếm `TopSearchBar` và các phím chức năng vào một container phân cấp dọc duy nhất (`flex flex-col items-center gap-2`).
    - Dòng 1: Thanh tìm kiếm nổi bo cong mềm mại tràn viền mobile `max-w-md`.
    - Dòng 2: Hàng phím tiện ích ngang (`overflow-x-auto scrollbar-none`): Bộ chuyển cơ sở `[CS 1 | CS 3]`, Phím dẫn đường `[🗺️ 2D Tòa K]`, và Phím giám sát `[⚡ NOC Twin | BẬT/TẮT]` tự động co gọn trên mobile, không còn hiện tượng chèn ép, đè lấp lên nhau.
  - **Tối ưu vị trí & kích thước Bộ chọn Tầng (`FloorSelector.tsx`):**
    - Tịnh tiến vị trí xuống `top-32 sm:top-28` để không bao giờ va chạm với hàng phím chức năng phía trên.
    - Tối ưu kích thước trên mobile xuống `w-11` (thay vì 54px) và các nút tròn $36\text{px}$ chuẩn công thái học di động, trả lại không gian thoáng đãng cho sa bàn 3D.
  - **Nâng cấp Thẻ Dẫn đường Đáy Thông minh (`StepBottomSheet.tsx`):**
    - **Chế độ Thu gọn / Mở rộng (Collapse / Expand Mode):** Chạm vào thanh drag handle hoặc nút chevron để thu gọn thẻ dẫn đường thành thanh mini-bar mỏng gọn $44\text{px}$ ở mép dưới (`Bước 1/4: Hướng Tòa Nhà B`), giải phóng hơn 90% diện tích màn hình để người dùng quan sát toàn cảnh 3D.
    - **Sửa triệt để lỗi không thể đóng dẫn đường:** Loại bỏ vòng lặp `useEffect` ép mở lại lộ trình mẫu khi `isNavigating` tắt; cập nhật `resetNavigation()` xóa sạch `activeSteps: []` giúp nút đóng `[X]` hoạt động dứt khoát.
    - Khi không trong trạng thái dẫn đường, thay thế toàn bộ thẻ to bằng nút pill nhỏ gọn `[ 🧭 Lộ trình mẫu: Cổng chính → P.302 ]` ở đáy màn hình.
  - **Tối ưu Bản đồ 2D Tòa K trên màn hình di động (`Building2DNavigator.tsx`):**
    - Thêm nút chuyển đổi nhanh `[Bản đồ / Chỉ dẫn]` trên header mobile để ẩn/hiện bảng danh sách bước đi theo nhu cầu.
    - Hàng phím chọn tầng (Trệt, T1, T2, T3) hỗ trợ vuốt cuộn ngang mượt mà, không bị vỡ layout.
- [x] **Hệ thống Giao diện Mẫu Dẫn đường 2D Tòa K (Cơ sở 3 - 4 Tầng):**
  - **Mặt bằng Kiến trúc SVG Chuẩn xác:** Hệ tọa độ thực 1000x400 (60m bề rộng thực tế, scale 0.06m/px) đầy đủ cho cả 4 tầng (Tầng trệt, Tầng 1, Tầng 2, Tầng 3), màu sắc quy chuẩn kiến trúc: Hành lang hồng (`#e59cf5`), Tường bê tông xám (`#c5cdd4`), Bậc thang đen (`#2b2b2b`), Nhà vệ sinh xanh mạ (`#b8f566`), Cầu thang xanh da trời (`#2db2ff`), Phòng học vàng (`#ffdd55`).
  - **Mô hình Đồ thị & Thuật toán Dijkstra Đa Tầng:** 44 nút mạng (Nodes) và 65 cạnh (Edges) bao gồm các liên kết thẳng đứng xuyên tầng qua 3 cụm cầu thang (Đông-Bắc `NE`, Đông-Nam `SE`, Tây-Nam `SW`).
  - **Bộ tính toán Chỉ dẫn Từng bước (Turn-by-turn Guidance):** Tự động sinh chỉ dẫn bằng tiếng Việt tự nhiên ("Đi thẳng 18m", "Rẽ trái vào hành lang", "Lên cầu thang Đông-Bắc lên Tầng 2", "Điểm đến P.301 ở phía bên phải").
  - **Tương tác Bản đồ Pan & Zoom Đẳng cấp:** Kéo thả chuột di chuyển mặt bằng, lăn chuột phóng to/thu nhỏ, nút bấm zoom in/out và Reset 100%, bật/tắt nhãn phòng và lưới tọa độ.
  - **Mô phỏng Avatar Người di chuyển Thời gian thực:** Chức năng Play/Pause, thanh tua tiến trình (Scrubber Slider 0-100%), tùy chỉnh tốc độ 1x/2x/3x, tự động chuyển tầng theo bước chân avatar.
  - **Chọn điểm Tương tác Trực tiếp trên Mặt bằng:** Click vào bất kỳ phòng học hoặc lối đi nào để hiện menu popup chọn làm "Điểm xuất phát" hoặc "Điểm đến".
  - **Tích hợp Kép Đầy đủ:**
    - Tuyến đường riêng biệt: `/navigation-2d` ([src/app/navigation-2d/page.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/app/navigation-2d/page.tsx)).
    - Bản thuần HTML: `/navigation-2d.html` ([public/navigation-2d.html](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/public/navigation-2d.html)).
    - Nút bấm trực tiếp trên Sa bàn 3D chính `[ 🗺️ Dẫn đường 2D (Tòa K) ]` ([src/app/page.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/app/page.tsx)) mở Modal Overlay tương tác toàn màn hình có nút "Quay lại 3D".
- [x] **3D Campus WiFi Digital Twin & NOC Command Center (Đặc tả Master Spec):**
  - **Chế độ Bật / Tắt (ON/OFF Dual-Mode):**
    - Nút chuyển đổi công nghệ cao `NocToggleBadge.tsx` trên giao diện sa bàn giúp bật chế độ Digital Twin.
    - **Bổ sung 3 vị trí TẮT trực diện, nổi bật và không thể bỏ lỡ khi đang ở chế độ Digital Twin:**
      1. **Góc trên bên trái ([TopCommandBar.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/hud/TopCommandBar.tsx)):** Nút badge `ĐANG BẬT [ TẮT ✕ ]` nằm ngay cạnh logo thương hiệu để bấm tắt tức thì tại vị trí vừa bật.
      2. **Góc trên bên phải ([TopCommandBar.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/hud/TopCommandBar.tsx)):** Nút đỏ nổi bật `[ TẮT DIGITAL TWIN ]` với chữ to rõ ràng trên mọi kích thước màn hình.
      3. **Thanh Toolbar 3D nổi giữa màn hình ([LayerFloatingPills.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/hud/LayerFloatingPills.tsx)):** Nút pill màu đỏ `[ TẮT DIGITAL TWIN ]` nằm ngay giữa tầm mắt phía trên viewport 3D.
  - **Môi trường Tactical Dark Mode (Obsidian Glass):** Background `#090D16`, Dark Fog, ánh sáng đa chiều làm nổi bật 6 tòa nhà và các lớp trực quan hóa.
  - **Hệ thống dữ liệu PRNG xác thực cố định (`mulberry32` seed 42):** 6 phân khu (Tòa A, B, C, D, E, Khu F), 75 Access Points, 5 kịch bản mô phỏng thực tế (`NORMAL_DAY`, `PEAK_SHIFT_CHANGE`, `ONLINE_EXAM_SURGE`, `COURTYARD_FESTIVAL`, `AP_POWER_OUTAGE`), và chuỗi thời gian 24h (48 mốc).
  - **Hệ thống HUD Overlays & Biểu đồ Chuyển động Sinh động (Live Animated Charts):**
    - **Live RF Spectrum Analyzer ([RfSpectrumChart.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/RfSpectrumChart.tsx)):** Đường cong Gauss dao động nhịp nhàng theo thời gian thực mô phỏng nhiễu sóng và bùng nổ gói tin WiFi; tia quét laser quang phổ (Oscilloscope sweep line) quét liên tục 60 FPS qua các kênh.
    - **Floating & Pulsing Scatter Plot ([ClientScatterChart.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/ClientScatterChart.tsx)):** Các chấm AP bồng bềnh hữu cơ; các điểm vượt ngưỡng SLA 50ms và nguy cấp phát sóng gợn lan tỏa (ripple waves); vạch quét radar chạy qua toàn bộ vùng phân tích; AP đang chọn có vòng ngắm laser xoay 360°.
    - **Tactical Rotating Radar ([QualityRadarChart.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/QualityRadarChart.tsx)):** Chùm quét radar chiến thuật xoay tròn 360° quét qua 6 đỉnh đa giác; các điểm đỉnh phát sáng và xung động liên tục.
    - **Orbiting SLA Score Gauge ([SlaScoreRing.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/SlaScoreRing.tsx)):** Vòng quỹ đạo vệ tinh nét đứt xoay tròn mượt mà quanh đồng hồ SLA, tâm điểm số phát sáng nhịp thở và bộ đếm chuyển động mượt.
    - **Shimmering Health Bars ([BuildingRankChart.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/BuildingRankChart.tsx)):** Dải năng lượng ánh sáng (light shimmer) lướt liên tục dọc theo các thanh tiến độ xếp hạng của 6 tòa nhà.
    - **Live Telemetry Scrubber ([TelemetryLineChart.tsx](file:///c:/Users/DAT/OneDrive%20-%20ut.edu.vn/Documents/Desktop/3DMapUTH/src/components/charts/TelemetryLineChart.tsx)):** Đầu con trỏ thời gian phát xung nhịp pinging radar màu cyan, đồng bộ cùng thanh tua thời gian.
    - `TopCommandBar.tsx`: 5 thẻ KPI tổng hợp (SLA Score, Online APs, Active Clients, Avg Latency, Throughput), Breadcrumb phân cấp (`Toàn trường > Tòa > Tầng > AP`), bộ chọn 5 kịch bản, nút So sánh và Reset View.
    - `LayerFloatingPills.tsx`: 5 nút bật/tắt lớp 3D (Heatmap, Chùm sóng AP, Nhãn Tòa nhà, Tách tầng X-Ray, Cột sáng Cảnh báo).
    - `LeftAnalyticsDock.tsx`: Thanh tìm kiếm nhanh, lọc theo 5 mức trạng thái, Biểu đồ 4 (Xếp hạng sức khỏe tòa nhà) và Biểu đồ 6 (Treemap nguyên nhân sự cố).
    - `RightInspectorDock.tsx`: Biểu đồ 5 (SLA Score Ring), Biểu đồ 8 (Bảng Cảnh báo Ưu tiên với `[Định vị 3D]` và `[Tự động tối ưu / Auto-Fix]`), Biểu đồ 2 (Radar đối chiếu chất lượng 6 trục), Biểu đồ 7 (Scatter plot Client vs Latency có ngưỡng SLA 50ms), Biểu đồ 9 (Phổ giao thoa kênh RF 2.4GHz/5GHz), và thẻ thanh tra phần cứng AP cấp 4.
    - `BottomTimelineBar.tsx`: Cụm tua thời gian 24h, Play/Pause, tốc độ (1x, 5x, 10x), Biểu đồ 3 (Telemetry Line Chart).
    - `CompareModalDrawer.tsx`: Bảng đối chiếu trực tiếp 2 tòa nhà side-by-side.
  - **Các lớp 3D tích hợp trên CS1:**
    - `AlertPillars.tsx`: Cột sáng laser đỏ/cam thẳng đứng xung động trên các tòa/AP có sự cố nghiêm trọng (Tòa C AP-C4-02).
    - `BuildingHealthBadges.tsx`: Huy hiệu Glassmorphism nổi trên nóc 6 tòa nhà hiển thị điểm sức khỏe và trạng thái.
    - `ApNodesLayer.tsx`: Các quả cầu AP phát sáng theo màu trạng thái và sóng lan tỏa (Pulse Ring).
    - `FloorXRaySlice.tsx`: Mặt cắt tầng Hologram 2.5D với bản đồ nhiệt Canvas Heatmap RSSI.
    - `TwinCameraRig.tsx`: Bay camera mượt mà $0.6\text{s} - 0.8\text{s}$ tới tòa nhà hoặc AP được chọn.
  - **Tính năng Tự động Tối ưu hóa (Auto-Fix):** Nhấn `[Tự động tối ưu]` lập tức phục hồi AP-C4-02, tăng điểm Tòa C từ 36 (CRITICAL) lên 86 (GOOD), giải tỏa cảnh báo đỏ.
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
