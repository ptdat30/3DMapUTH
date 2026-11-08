# DANH SÁCH TASK JIRA: KHẢO SÁT ẢNH THỰC TẾ, DỰNG HÌNH 3D & LIỆT KÊ PHÒNG HỌC
**Dự án:** 3DMapUTH - Bản đồ số 3D & Dẫn đường tương tác  
**Epic:** `[EPIC-3D] Khảo sát thực địa, Dựng hình phối cảnh 3D & Số hóa Danh mục Phòng học Campus UTH (CS1 & CS3)`  
**Mục tiêu quy chuẩn:** 
1. Thu thập hình ảnh chụp thực tế hiện trạng công trình.
2. Chuyển đổi thành hình vẽ phối cảnh 3D (concept render dạng ảnh) đồng bộ sa bàn số.
3. **Liệt kê đầy đủ danh mục phòng học, phòng ban, phòng thí nghiệm và tiện ích theo từng tầng** để nạp dữ liệu vào hệ thống bản đồ số (Database Prisma).

---

## 📌 BẢNG TỔNG HỢP PHÂN CÔNG (JIRA BOARD SUMMARY)

| Mã Task | Thành viên (Assignee) | Danh mục công trình phụ trách | Cơ sở | Ước lượng (Points) | Ưu tiên |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **MAP-301** | **Tài** | Tòa J (Giảng đường), Tòa D | CS3, CS1 | 5 | High |
| **MAP-302** | **Quân** | Tòa I (Phụ trợ), Xưởng Ô tô, Tòa F | CS3, CS1 | 8 | High |
| **MAP-303** | **Huy** | Nhà Đa Năng, Phòng Gym (Fitness), Tòa C | CS3, CS1 | 8 | High |
| **MAP-304** | **Hoàng** | Tòa K (Giảng đường mới), Tòa E | CS3, CS1 | 5 | Medium |
| **MAP-305** | **Đạt** | Tòa H (Trung tâm 7 tầng), Tòa B (CNTT & Lab) | CS3, CS1 | 5 | Highest |
| **MAP-306** | **Hiếu** | Tòa A (Hiệu bộ CS1), Tòa I Lớn (Giảng đường 6 tầng CS3) | CS1, CS3 | 8 | Highest |

---

## 🎯 QUY CHUẨN ĐẦU VÀO, ĐẦU RA & BIỂU MẪU BÀN GIAO CHUNG

### 📥 1. INPUT (Dữ liệu đầu vào):
1. **Hình ảnh chụp thực tế (Real-world Photos):** Tối thiểu 4 - 8 góc chụp rõ nét/tòa nhà (Mặt chính diện kèm bảng tên, 2 mặt bên, mặt sau, góc phối cảnh tổng thể $45^\circ$, và các chi tiết kiến trúc đặc thù).
2. **Khảo sát thực địa sơ đồ phòng (Field Room Audit):** Chụp lại sơ đồ thoát hiểm/sơ đồ bố trí phòng gắn tại sảnh hoặc biển chỉ dẫn từng tầng của tòa nhà.

### 📤 2. OUTPUT (Sản phẩm bàn giao):
1. **Bộ hình vẽ phối cảnh 3D dạng ảnh (3D Concept / Isometric Images):**
   - File `.PNG` (tách nền trong suốt) và `.JPG`.
   - Độ phân giải cao $\ge 2048 \times 2048$ px (hoặc $4\text{K}$).
   - Phong cách sa bàn 3D isometric hiện đại, chuẩn nhận diện màu sắc UTH.
2. **Bảng danh mục phòng học theo tầng (Room Inventory Sheet):**
   - File Excel / CSV / Markdown bàn giao theo mẫu chuẩn sau:

| STT | Tòa nhà | Tầng | Mã phòng | Tên phòng / Chức năng | Loại phòng (Type) | Ghi chú vị trí |
| :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| 1 | Tòa H | Tầng 1 | `H101` | Phòng Trực kỹ thuật | OFFICE | Cánh trái, gần cầu thang |
| 2 | Tòa H | Tầng 3 | `H302` | Phòng Học Lý thuyết H302 | CLASSROOM | Hành lang giữa |
| 3 | Tòa H | Tầng 3 | `WC-H3-NAM` | Nhà vệ sinh Nam Tầng 3 | RESTROOM | Cuối hành lang phải |

*(Loại phòng chuẩn: `CLASSROOM`, `LAB`, `OFFICE`, `MEETING`, `HALL`, `GYM`, `WORKSHOP`, `RESTROOM`, `UTILITY`)*

---

## 📋 CHI TIẾT TASK JIRA TỪNG THÀNH VIÊN

---

### [MAP-301] Dựng hình vẽ 3D & Liệt kê danh mục phòng Tòa J (CS3) & Tòa D (CS1)
- **Issue Type:** `Task`
- **Assignee:** **Tài**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `High` | **Story Points:** `5`
- **Mô tả công việc (Description):**
  - Chụp ảnh khảo sát thực tế và dựng phối cảnh 3D cho **Tòa J (CS3)** và **Tòa D (CS1)**.
  - Đồng thời khảo sát, tổng hợp danh sách toàn bộ các phòng học và phòng chức năng theo từng tầng của 2 tòa nhà này.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Tòa J (Cơ sở 3 - Khu giảng đường):**
     - Khảo sát các tầng giảng đường: Liệt kê các phòng học lý thuyết mã J (ví dụ: `J101`, `J102`... lên các tầng `J201` - `J20x`, `J301` - `J30x`, `J401` - `J40x`).
     - Ghi nhận vị trí phòng trực giảng viên, khu vệ sinh nam/nữ mỗi tầng, sảnh thang máy và thang bộ thoát hiểm.
  2. **Tòa D (Cơ sở 1):**
     - Liệt kê toàn bộ giảng đường dãy D (`D101`, `D102`, `D201`, `D202`, `D301`...).
     - Ghi nhận các phòng thực hành tin học, văn phòng bộ môn (nếu có).
- **Sản phẩm bàn giao (Deliverables):**
  - [x] File ảnh 3D Isometric Tòa J CS3 và Tòa D CS1 (`.png` tách nền, `.jpg` $\ge 2\text{K}$).
  - [x] File Bảng danh mục phòng (`Toa_J_CS3_Rooms.csv` & `Toa_D_CS1_Rooms.csv`) đầy đủ mã phòng, tầng, chức năng.
  - [x] Bộ ảnh chụp thực tế đính kèm link Drive.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Đủ ảnh chụp 4 mặt của 2 tòa nhà.
  - [ ] Hình 3D đúng tỷ lệ và số tầng thực tế.
  - [ ] Danh sách phòng không bỏ sót tầng nào, có phân loại rõ ràng (Phòng học / Văn phòng / WC).

---

### [MAP-302] Dựng hình 3D & Liệt kê phòng Tòa I phụ trợ, Xưởng Ô tô (CS3) & Tòa F (CS1)
- **Issue Type:** `Task`
- **Assignee:** **Quân**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `High` | **Story Points:** `8`
- **Mô tả công việc (Description):**
  - Khảo sát ảnh thực địa và vẽ phối cảnh 3D cho **Tòa I - Khu phụ trợ (CS3)**, **Xưởng Thực hành Ô tô (CS3)**, và **Tòa F (CS1)**.
  - Thu thập bảng danh sách chi tiết các phân xưởng, phòng làm việc và lớp học trực thuộc.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Tòa I - Khu phụ trợ (CS3):**
     - Liệt kê các phòng dịch vụ cơ sở vật chất, phòng kỹ thuật điện nước, kho phụ trợ, khu vực căng tin/tiện ích sinh viên.
  2. **Xưởng Ô tô (CS3):**
     - Liệt kê các phân xưởng chuyên ngành: Phân xưởng Động cơ ô tô, Phân xưởng Gầm & Truyền động, Phân xưởng Điện - Điện tử ô tô, Phân xưởng Sơn - Thân vỏ, Phòng giáo viên xưởng, Kho dụng cụ/vật tư kỹ thuật.
  3. **Tòa F (Cơ sở 1):**
     - Liệt kê các phòng học dãy F (`F101`, `F102`, `F201`, `F202`, `F301`...), phòng thí nghiệm chuyên đề.
- **Sản phẩm bàn giao (Deliverables):**
  - [x] 03 file ảnh vẽ phối cảnh 3D (`.png` trong suốt $\ge 2\text{K}$) cho Tòa I phụ trợ, Xưởng Ô tô và Tòa F.
  - [x] Bảng dữ liệu danh mục phòng/phân xưởng của 3 công trình (`.csv` / `.xlsx`).
  - [x] Link thư mục ảnh chụp thực tế hiện trường.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Phối cảnh 3D Xưởng Ô tô thể hiện đúng kiến trúc công nghiệp mái vòm/khung thép.
  - [ ] Danh mục phân xưởng ô tô ghi đúng tên chuyên môn và vị trí cửa ra vào xưởng.

---

### [MAP-303] Dựng hình 3D & Liệt kê phòng Nhà Đa Năng, Phòng Gym (CS3) & Tòa C (CS1)
- **Issue Type:** `Task`
- **Assignee:** **Huy**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `High` | **Story Points:** `8`
- **Mô tả công việc (Description):**
  - Thu thập ảnh thực tế và thiết kế hình vẽ phối cảnh 3D cho cụm thể thao **Nhà Đa Năng (CS3)**, **Phòng Gym UTH Fitness (CS3)**, và **Tòa C (CS1)**.
  - Lập bảng danh mục chi tiết các sân tập, phòng chức năng và lớp học.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Nhà Đa Năng (CS3):**
     - Liệt kê các khu vực: Sân thi đấu đa năng (Cầu lông / Bóng rổ / Bóng chuyền), Khán đài A-B, Phòng Điều hành & Quản lý thể thao, Phòng Y tế sơ cấp cứu, Khu thay đồ & Tắm nam/nữ, Kho thiết bị dụng cụ TDTT.
  2. **Phòng Gym (UTH Fitness Center - CS3):**
     - Liệt kê: Quầy lễ tân check-in, Khu máy tập thể hình (Free Weight), Khu Cardio (chạy bộ/xe đạp), Phòng HLV thể hình, Phòng thay đồ.
  3. **Tòa C (Cơ sở 1):**
     - Liệt kê toàn bộ giảng đường lớn dãy C (`C101`, `C102`, `C201`, `C202`, `C301`...), phòng máy tính, phòng họp khoa.
- **Sản phẩm bàn giao (Deliverables):**
  - [x] Bộ ảnh vẽ 3D Nhà Đa Năng (góc chim bay và Isometric), Phòng Gym và Tòa C CS1 (`.png`, `.jpg`).
  - [x] Bảng danh mục phòng và khu vực thể thao chi tiết (`NhaDaNang_Gym_ToaC_Rooms.csv`).
  - [x] Ảnh chụp thực tế các mặt và sảnh vào.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Thể hiện rõ nét quy mô mái vòm Nhà Đa Năng trên bản vẽ 3D.
  - [ ] Bảng danh mục phòng có đầy đủ các phòng phụ trợ thể thao (Y tế, kho, phòng thay đồ).

---

### [MAP-304] Dựng hình 3D & Liệt kê phòng Tòa K (CS3) & Tòa E (CS1)
- **Issue Type:** `Task`
- **Assignee:** **Hoàng**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `Medium` | **Story Points:** `5`
- **Mô tả công việc (Description):**
  - Khảo sát hiện trường và vẽ phối cảnh 3D dạng ảnh cho **Tòa K (CS3)** và **Tòa E (CS1)**.
  - Thu thập danh mục toàn bộ phòng học và văn phòng của 2 tòa nhà.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Tòa K (Cơ sở 3 - Khối giảng đường K mới):**
     - Liệt kê các phòng học tiêu chuẩn mã K (`K101`, `K102`, `K201`, `K202`, `K301`...), phòng tự học sinh viên, phòng sinh hoạt Đoàn - Hội sinh viên.
  2. **Tòa E (Cơ sở 1):**
     - Liệt kê các phòng học dãy E (`E101`, `E102`, `E201`, `E202`, `E301`...), phòng học chuyên đề ngoại ngữ, phòng hội đồng chấm khóa luận tốt nghiệp.
- **Sản phẩm bàn giao (Deliverables):**
  - [x] File ảnh vẽ 3D Isometric Tòa K CS3 và Tòa E CS1 (`.png` tách nền $\ge 2\text{K}$).
  - [x] Bảng thống kê chi tiết các phòng theo tầng (`Toa_K_CS3_Rooms.csv` & `Toa_E_CS1_Rooms.csv`).
  - [x] Thư mục ảnh chụp hiện trường đầy đủ góc sáng.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Hình vẽ 3D thể hiện chuẩn các ô cửa sổ và vị trí cửa ra vào chính.
  - [ ] Bảng phòng ghi chính xác mã phòng gắn trên bảng tên thực tế cửa phòng.

---

### [MAP-305] Dựng hình 3D & Liệt kê phòng Tòa H Trung tâm (CS3) & Tòa B (CS1)
- **Issue Type:** `Task`
- **Assignee:** **Đạt**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `Highest` | **Story Points:** `5`
- **Mô tả công việc (Description):**
  - Khảo sát toàn diện công trình biểu tượng trung tâm **Tòa H (7 tầng CS3)** và **Tòa B (Khoa CNTT CS1)** để tạo bộ ảnh 3D chuẩn mực cao nhất và số hóa chi tiết toàn bộ các phòng chức năng.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Tòa H (Cơ sở 3 - Trung tâm hành chính & Giảng đường 7 tầng):**
     - *Tầng 1 (Trệt):* Sảnh đón trung tâm, Phòng Quản lý Đào tạo, Phòng Công tác Sinh viên, Ban Quản lý CS3, Dãy phòng làm việc cánh trái (`H101` - `H107`), Hội trường lớn CS3.
     - *Tầng 2 - Tầng 5:* Các giảng đường học tập (`H201` - `H208`, `H301` - `H308`, `H401` - `H408`, `H501` - `H508`), Phòng máy tính thực hành.
     - *Tầng 6 - Tầng 7:* Văn phòng các Viện/Khoa chuyên ngành, Phòng Họp giao ban, Phòng Tiếp khách VIP, Thư viện / Phòng đọc sinh viên.
  2. **Tòa B (Cơ sở 1 - Tòa nhà Khoa CNTT & Lab máy tính):**
     - *Tầng 1:* Văn phòng Khoa Công Nghệ Thông Tin (`B101`), Phòng Giáo vụ, Sảnh tiếp sinh viên.
     - *Tầng 2:* Dãy phòng máy tính thực hành (`B201`, `B202`, `B203`).
     - *Tầng 3 - Tầng 4:* Phòng Lab Nghiên cứu AI & Robotics (`B302`), Phòng Hội thảo Chuyên đề (`B301`), Phòng Lab An toàn thông tin & Mạng máy tính.
- **Sản phẩm bàn giao (Deliverables):**
  - [x] Bộ ảnh 3D phối cảnh chất lượng cao $\ge 4\text{K}$ Tòa H CS3 (chính diện, góc chéo $45^\circ$, có logo UTH) và Tòa B CS1.
  - [x] Bảng cơ sở dữ liệu phòng phân tầng cực kỳ chi tiết của Tòa H (7 tầng) và Tòa B (`Toa_H_CS3_Rooms.csv` & `Toa_B_CS1_Rooms.csv`).
  - [x] Ảnh chụp thực tế sảnh kính, các tầng và bảng tên từng phòng.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Tòa H được render tinh xảo nhất, chuẩn nhận diện thương hiệu UTH.
  - [ ] Danh mục phòng Tòa H khớp với sơ đồ bố trí phòng của Ban Quản lý CS3 (đầy đủ cả 7 tầng).

---

### [MAP-306] Dựng hình 3D & Liệt kê phòng Tòa A Hiệu bộ (CS1) & Tòa I Lớn 6 tầng (CS3)
- **Issue Type:** `Task`
- **Assignee:** **Hiếu**
- **Sprint:** `Sprint 3 - 3D Visual Assets & Room Digitization`
- **Priority:** `Highest` | **Story Points:** `8`
- **Mô tả công việc (Description):**
  - Khảo sát thực tế và dựng hình vẽ 3D cho 2 công trình hành chính & giảng đường lớn nhất: **Tòa A (Khu Hiệu Bộ Trung Tâm CS1)** và **Tòa I Lớn (Khu Giảng Đường 6 Tầng CS3)**.
  - Lập danh mục toàn bộ phòng ban hiệu bộ và khối phòng học bậc thang/tiêu chuẩn.
- **Yêu cầu khảo sát & Liệt kê phòng:**
  1. **Tòa A (Cơ sở 1 - Tòa nhà Ban Giám Hiệu & Hiệu bộ):**
     - *Tầng 1:* Sảnh lễ tân chính, Hội trường lớn A101, Phòng Hành chính - Tổng hợp, Phòng Tài chính - Kế toán.
     - *Tầng 2:* Văn phòng Ban Giám Hiệu (Phòng Hiệu trưởng, các Phó Hiệu trưởng), Phòng Họp Ban Giám hiệu, Phòng Tiếp khách đối ngoại.
     - *Tầng 3 - Tầng 4:* Phòng Tổ chức Cán bộ, Phòng Đào tạo Sau đại học, Phòng Quản lý Khoa học Công nghệ & Hợp tác Quốc tế, Hội trường A.
  2. **Tòa I Lớn (Cơ sở 3 - Khối Giảng đường Phức hợp 6 tầng mới):**
     - *Tầng 1:* Sảnh tiếp đón, Cụm phòng học bậc thang lớn (`I101`, `I102`), Phòng quản lý cơ sở vật chất.
     - *Tầng 2 - Tầng 6:* Toàn bộ các phòng học tiêu chuẩn (`I201` - `I206`, `I301` - `I306`, `I401` - `I406`, `I501` - `I506`, `I601` - `I606`), hệ thống cụm thang máy và thang thoát hiểm.
- **Sản phẩm bàn giao (Deliverables):**
  - [x] File ảnh vẽ 3D phối cảnh độ phân giải cao $\ge 4\text{K}$ Tòa A Hiệu bộ CS1 và Tòa I Lớn 6 tầng CS3 (`.png`, `.jpg`).
  - [x] Bảng danh mục đầy đủ các phòng ban Tòa A và phòng học 6 tầng Tòa I (`Toa_A_CS1_Rooms.csv` & `Toa_I_Lon_CS3_Rooms.csv`).
  - [x] Bộ ảnh chụp thực tế toàn cảnh công trình.
- **Tiêu chí nghiệm thu (Definition of Done):**
  - [ ] Bản vẽ 3D Tòa A thể hiện sự uy nghiêm, trang trọng; Tòa I thể hiện đúng tầm vóc 6 tầng đồ sộ.
  - [ ] Danh mục phòng Tòa A liệt kê chính xác các phòng ban chức năng của Nhà trường.
