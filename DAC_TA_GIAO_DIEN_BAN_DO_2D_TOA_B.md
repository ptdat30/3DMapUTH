# ĐẶC TẢ CHI TIẾT BẢN ĐỒ DẪN ĐƯỜNG 2D TẦNG TRỆT TÒA B (CƠ SỞ 1)
**Hệ thống:** 3DMapUTH - Trường Đại học Giao thông vận tải TP.HCM  
**Tiêu chuẩn áp dụng:** `uth-2d-wayfinding-design-system` (Chuẩn Kiến trúc Tối Giản Tông Ấm Tòa K)  
**Tài liệu tham chiếu:** `public/toab/` (`toab_tong_the.jpg`, `toab_phan1.jpg`, `toab_phan2.png`, `toab_phan3.png`)

---

## 1. TỔNG QUAN HÌNH HỌC & BỐ CỤC KHÔNG GIAN

Mặt bằng Tầng trệt Tòa B (Cơ sở 1) có hình dạng chữ L gồm 2 cánh chính được chia thành 3 phân đoạn chức năng:

```
[CÁNH TÂY - PHẦN 1]                         [TRUNG TÂM]              [CÁNH BẮC - PHẦN 2]                   [GÓC]         [CÁNH ĐÔNG - PHẦN 3]
┌────────────────────────┬─────┬──────┬──────┬──────┐ ┌────┬─────┐ ┌──────┬──────┬──────┬──────┐ ┌───────┐ ┌─────┬──────┬──────┬──────┬──────┐
│ B.2 - Tạp chí KHCN GTVT│ CT1 │B.001 │B.002 │B.003 │ │ WC │ CT2 │ │B.104 │B.105 │B.106 │B.107 │ │ B.GÓC │ │ CT3 │B.008 │B.009 │B.010 │B.011 │
├────────────────────────┴─────┴──────┴──────┴──────┤ └────┴─────┘ └──────┴──────┴──────┴──────┘ └───────┘ ├─────┴──────┴──────┴──────┴──────┤
│                HÀNH LANG TÂY                      │                  HÀNH LANG BẮC                         │          HÀNH LANG ĐÔNG          │
└───────────────────────────────────────────────────┘                                                        └────────────────────────────┬─────┤
                                                                                                                                          │ CT4 │
                                                                                                                                          └─────┘
```

1. **Phần 1 (Cánh Tây - Hướng ngang):**
   - Phòng lớn đầu hồi: `B.2` - Tạp chí Khoa học Công nghệ Giao thông Vận tải.
   - `Cầu thang bộ 1` (CT1): Nằm giữa B.2 và B.001.
   - Dãy 3 phòng học: `B.001`, `B.002`, `B.003`.
   - Hành lang phía Nam có cửa ra vào chính và các cung mở cửa quay bán nguyệt (door arcs) vào từng phòng.
2. **Khu vực Trung tâm Chuyển tiếp:**
   - Cụm `WC` nhô lên ở phía Bắc.
   - `Cầu thang bộ 2` (CT2) và sảnh chuyển tiếp sang Phần 2.
3. **Phần 2 (Cánh Bắc - Hướng ngang tiếp nối):**
   - Dãy 4 phòng học: `B.104`, `B.105`, `B.106`, `B.107`.
   - Mỗi phòng có các khe hở cửa đôi/đơn màu trắng mở ra hành lang phía Nam.
   - Kết thúc cánh ngang là khối `Phòng Góc` (B.GÓC).
4. **Phần 3 (Cánh Đông - Chạy dọc theo trục Bắc - Nam):**
   - Đầu phía Bắc: `Cầu thang bộ 3` (CT3).
   - Dãy 4 phòng học: `B.008`, `B.009`, `B.010`, `B.011`.
   - Hành lang chạy dọc phía Tây (mặt trong sân trường) đón sáng tự nhiên.
   - Cuối phía Nam: `Cầu thang bộ 4` (CT4) và lối thoát hiểm.

---

## 2. BẢNG MÃ MÀU THIẾT KẾ QUY CHUẨN (DESIGN TOKENS)

| Đối tượng | Mã màu HEX | Tên gọi màu | Ứng dụng |
| :--- | :---: | :--- | :--- |
| **Nền Hành lang** | `#F3EFEA` | Warm Cream | Nền hành lang thông thoáng, dịu mắt |
| **Viền Tường** | `#4A4540` | Charcoal Warm Gray | Viền tường ngăn phòng dày $3.5\text{px} - 4\text{px}$ |
| **Phòng Tạp chí B.2 & Góc** | `#CDB07A` | Mustard Gold | Nổi bật khối văn phòng / chức năng đặc biệt |
| **Phòng B.001-B.003, B.008-B.011** | `#A89B8C` | Muted Warm Taupe | Tông xám tro be ấm áp kiến trúc |
| **Phòng B.104 - B.107** | `#FAF2E6` | Warm Ivory | Tông kem nhạt thanh lịch tương phản nhẹ |
| **Khối Cầu thang (CT1 - CT4)** | `#605B55` | Charcoal Slate | Xám than đại diện cho lõi chịu lực |
| **Vân bậc cầu thang** | `#48443F` | Dark Stripes | Dải sọc song song dày $2.5\text{px}$ |
| **Nhà vệ sinh (WC)** | `#B5C2C9` | Steel Blue | Xanh thép chuẩn nhận diện tiện ích |
| **Tuyến đường dẫn lối** | `#0F4C5C` | Deep Teal | Đường dẫn $3.5\text{px}$, mũi tên rẽ hướng |
| **Pin Avatar người dùng** | `#0F4C5C` | Deep Teal Teardrop | Biểu tượng giọt nước có hình nhân trắng |

---

## 3. THÔNG SỐ TỌA ĐỘ SVG BẢN ĐỒ LIỀN MẠCH (`viewBox="0 0 1120 780"`)

- **B.2 (Tạp chí):** `x: 20, y: 40, w: 220, h: 200`, Cửa mở cung quay tại `x: 240, y: 240`.
- **Cầu Thang 1:** `x: 240, y: 40, w: 70, h: 150`, Ký hiệu bậc thang tại $X=252, Y=52$.
- **B.001:** `x: 310, y: 40, w: 95, h: 150`, Cửa tại `x: 310, y: 190`.
- **B.002:** `x: 405, y: 40, w: 95, h: 150`, Cửa tại `x: 405, y: 190`.
- **B.003:** `x: 500, y: 40, w: 95, h: 150`, Cửa tại `x: 500, y: 190`.
- **Khu WC:** `x: 490, y: 10, w: 90, h: 30`, Cửa tại `x: 535, y: 40`.
- **Cầu Thang 2:** `x: 580, y: 10, w: 55, h: 100`.
- **B.104:** `x: 635, y: 40, w: 90, h: 140`, 2 khe cửa trắng tại $X=645$ và $X=695$.
- **B.105:** `x: 725, y: 40, w: 90, h: 140`, 2 khe cửa trắng tại $X=735$ và $X=785$.
- **B.106:** `x: 815, y: 40, w: 90, h: 140`, 1 khe cửa trắng tại $X=850$.
- **B.107:** `x: 905, y: 40, w: 90, h: 140`, 1 khe cửa trắng tại $X=920$.
- **Phòng Góc:** `x: 995, y: 40, w: 105, h: 140`.
- **Cầu Thang 3:** `x: 1035, y: 180, w: 65, h: 60`.
- **B.008:** `x: 1035, y: 240, w: 65, h: 110`.
- **B.009:** `x: 1035, y: 350, w: 65, h: 110`.
- **B.010:** `x: 1035, y: 460, w: 65, h: 110`.
- **B.011:** `x: 1035, y: 570, w: 65, h: 110`.
- **Cầu Thang 4:** `x: 995, y: 680, w: 45, h: 55`.

---

## 4. TÍNH NĂNG TƯƠNG TÁC & CÔNG THÁI HỌC (INTERACTION SPEC)

1. **3 Chế độ Xem (View Modes):**
   - `Bản đồ Liền mạch`: Xem toàn cảnh chữ L của cả tòa nhà.
   - `3 Tab Phân đoạn`: Phóng to chuyên sâu từng phần (Phần 1, Phần 2, Phần 3).
   - `3 Khung Riêng`: Xếp 3 khung song song phục vụ rà soát đối chiếu.
2. **Tìm kiếm Nhanh (Instant Search):**
   - Hỗ trợ gõ tìm mọi phòng (`B.2`, `B.001`, `B.104`, `B.008`, `WC`, `CT`).
   - Tự động kích hoạt highlight viền phòng và vẽ tuyến đường tương ứng.
3. **Mô phỏng Dẫn đường Thời gian Thực:**
   - Avatar Teardrop Pin tự động lướt dọc theo tuyến đường từ Cổng Tòa B đến cửa phòng học được chọn khi bấm `[Mô phỏng bước đi]`.
4. **Ngăn kéo Đáy Thu gọn (Bottom Drawer):**
   - Thu gọn linh hoạt còn $44\text{px}$ để không chiếm dụng tầm nhìn bản đồ trên thiết bị di động.
