# Quickstart Validation Guide: Tìm đường đi bộ từ Tòa H đến Tòa J

**Feature**: `001-find-route-toa-h-toa-j`  
**Purpose**: Hướng dẫn các bước xác thực tính năng (Validation Runbook) từ đầu đến cuối trước khi bàn giao.

---

## 1. Yêu cầu Tiên quyết (Prerequisites)

1. Máy tính đã cài đặt **Node.js v20 LTS** trở lên.
2. Đã clone mã nguồn và chạy `npm install` thành công.
3. Không bắt buộc phải có Database PostgreSQL trực tuyến (hệ thống có sẵn Mock Fallback).

---

## 2. Khởi chạy Ứng dụng

Mở Terminal tại thư mục gốc của dự án:

```bash
# Khởi động Next.js 16 với Turbopack
npm run dev
```

Mở trình duyệt truy cập vào đường dẫn thử nghiệm:  
👉 **`http://localhost:3000/?campus=cs3`**

---

## 3. Các Kịch bản Xác thực (Validation Scenarios)

### 🧪 Kịch bản 1: Chọn Tòa J và Xem Lộ trình 3D (Core Flow)
1. **Thao tác:** 
   - Trên Canvas 3D Cơ sở 3, rê chuột và click vào mô hình 3D của **Tòa J** (khối nhà màu trắng ở phía Tây).
   - Hoặc click vào thanh `TopSearchBar` ở đỉnh màn hình và chọn "Tòa J (Khu Giảng Đường)".
2. **Kết quả kỳ vọng:**
   - [ ] Thẻ Tooltip nổi trên Tòa J xuất hiện với nút "Chỉ đường tới đây".
   - [ ] Một dải ống ánh sáng 3D màu Cyan phát sáng (Glow Path) nối từ sảnh Tòa H $\rightarrow$ sảnh Tòa J lập tức xuất hiện.
   - [ ] Camera tự động lượn mượt mà nâng cao góc nhìn bao quát toàn bộ cung đường đi.
   - [ ] Dưới chân màn hình xuất hiện `StepBottomSheet` hiển thị: **Khoảng cách: ~75m**, **Thời gian: ~1 phút**, các bước đi thẳng và rẽ.

---

### 🧪 Kịch bản 2: Hủy chọn khi Click ra ngoài (Deselection)
1. **Thao tác:** 
   - Khi đường dẫn Tòa H $\rightarrow$ Tòa J đang hiển thị, dùng chuột (hoặc ngón tay trên mobile) click vào khoảng trống bầu trời hoặc vùng cỏ không có công trình.
2. **Kết quả kỳ vọng:**
   - [ ] Tuyến đường phát sáng biến mất.
   - [ ] Khung `StepBottomSheet` thu gọn hoặc đóng lại.
   - [ ] Camera 3D nhẹ nhàng lượn trở về góc sa bàn toàn cảnh ban đầu.

---

### 🧪 Kịch bản 3: Kiểm thử Khả năng Chịu lỗi Mất mạng (Offline Fallback Test)
1. **Thao tác:**
   - Mở Chrome DevTools (`F12`) $\rightarrow$ Tab **Network** $\rightarrow$ Chọn chế độ **Offline** (ngắt toàn bộ internet).
   - Click chọn lại Tòa J trên bản đồ để tìm đường.
2. **Kết quả kỳ vọng:**
   - [ ] Ứng dụng **không bị trắng trang hay crash**.
   - [ ] Tuyến đường Tòa H $\rightarrow$ Tòa J vẫn được vẽ ngay lập tức từ `src/data/mockNavigationData.ts`.
   - [ ] Xuất hiện badge thông báo trạng thái ngoại tuyến mượt mà.

---

### 🧪 Kịch bản 4: Kiểm thử API Endpoint
Chạy lệnh kiểm thử trực tiếp Route Handler API bằng PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/route-path" -Method Post -ContentType "application/json" -Body '{"originBuildingCode":"toa_h","targetBuildingCode":"toa_j"}' | ConvertTo-Json -Depth 4
```

**Kết quả kỳ vọng:**  
Trả về JSON `success: true`, cự ly khoảng cách $\approx 75.5\text{m}$ và mảng `fullPathPoints` chuẩn schema [contracts/route-api.json](contracts/route-api.json).

