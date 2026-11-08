/**
 * CS3 CAMPUS 3D SPATIAL COORDINATE LAYOUT CONFIGURATION (OPTIMIZED & CALIBRATED)
 * Trường Đại học Giao thông Vận tải TP.HCM (UTH) - Cơ sở 3 (172.0m x 132.0m)
 *
 * Hệ trục tọa độ Three.js:
 * - Trục X: Tây (-) -> Đông (+) [Chiều ngang khuôn viên: 172.0m, phạm vi -34.4 đến +34.4]
 * - Trục Y: Cao độ [0.00: Nền, 0.03: Đường nhựa, 0.08: Móng bê tông, 0.10: Sân bóng, >0.15: Tòa nhà]
 * - Trục Z: Bắc (-) -> Nam (+)  [Chiều dọc khuôn viên: 132.0m, phạm vi -26.4 đến +26.4]
 *
 * Các điểm mốc căn chỉnh theo tường rào & cổng:
 * - Tường rào phía Nam: Z = +26.4
 * - Cổng ra vào 1 (Cổng chính): X = 8.0, Z = +26.4
 * - Cổng ra vào 2 (Cổng phụ bãi xe Đông): X = 20.0, Z = +26.4
 * - Trục đường ngang thoát hiểm phía Bắc: Z = -11.0 (Rộng 3.8m, từ Z = -12.9 đến Z = -9.1)
 */

export interface CS3BuildingConfig {
  id: string;
  code: string;
  name: string;
  shortName: string;
  subTitle: string;
  modelUrl: string;
  position: [number, number, number]; // [X, Y, Z]
  rotation: [number, number, number]; // [Euler X, Y, Z] radian
  scale: [number, number, number];    // [ScaleX, ScaleY, ScaleZ]
  heightOffset: number;               // Chiều cao hiển thị nhãn/tooltip 3D
  plotSize: [number, number];         // [Kích thước X, Kích thước Z] của khối đế móng
  floors: number;
  category: 'ADMIN' | 'CLASSROOM' | 'WORKSHOP' | 'SPORTS' | 'DORMITORY';
  relativeLocationComment: string;    // Thuyết minh vị trí tương quan trong không gian
}

export interface CS3AmenityConfig {
  id: string;
  code: string;
  name: string;
  position: [number, number, number];
  size: [number, number];             // [widthX, depthZ]
  relativeLocationComment: string;
}

/**
 * 8 KHỐI CÔNG TRÌNH CỐT LÕI TẠI CƠ SỞ 3 UTH (ĐÃ CĂN CHỈNH GIÓNG HÀNG & CHỐNG CHỒNG CHÉO)
 */
export const CS3_BUILDINGS_LAYOUT: CS3BuildingConfig[] = [
  // --------------------------------------------------------------------------
  // 1. TÒA NHÀ H (TRUNG TÂM HÀNH CHÍNH & ĐÀO TẠO 6 TẦNG)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_h',
    code: 'toa_h',
    name: 'Khu Nhà H (6 Tầng)',
    shortName: 'Tòa H',
    subTitle: 'Khu Trung Tâm Hành Chính & Giảng Đường Đào Tạo (H001 - H608)',
    modelUrl: '/models/cs3/toa_h.glb',
    // Vị trí: Tâm X = -7.5, Z = 1.0 (Chiều sâu 18m, trải từ Z = -8.0 đến Z = +10.0)
    // Cách trục đường ngang (Z = -9.1) là 1.1m hành lang đi bộ
    position: [-7.5, 2.7, 1.0],
    rotation: [0, Math.PI / 2, 0], // Lòng chữ U mở về hướng Đông (hướng ra đường chính & Tòa K)
    scale: [9.5, 8.5, 11.0],
    heightOffset: 5.2,
    plotSize: [18.0, 18.0],
    floors: 6,
    category: 'ADMIN',
    relativeLocationComment:
      'Nằm ở vị trí trung tâm cơ sở 3, khối nhà hình chữ U mở lòng về phía Đông (hướng ra trục đường chính và đối diện Tòa K). Mặt lưng giáp Xưởng ô tô, mép Bắc cách đường ngang 1.1m, mép Đông cách đường chính 4.5m.',
  },

  // --------------------------------------------------------------------------
  // 2. TÒA I LỚN (GIẢNG ĐƯỜNG 5 TẦNG PHÍA BẮC)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_i_lon',
    code: 'toa_i_lon',
    name: 'Tòa Nhà I Lớn',
    shortName: 'Tòa I Lớn',
    subTitle: 'Khu Giảng Đường 5 Tầng (I001 - I402)',
    modelUrl: '/models/cs3/toa_i_lon.glb',
    // Vị trí: Góc Tây Bắc, X = -16.0, Z = -19.5 (Trải từ Z = -24.5 đến Z = -14.5)
    // Cách mép đường ngang (Z = -12.9) là 1.6m; Cách Sân bóng (X = -8.0) là 3.2m
    position: [-16.0, 2.95, -19.5],
    rotation: [0, Math.PI / 2, 0],
    scale: [7.0, 5.0, 11.5],
    heightOffset: 4.8,
    plotSize: [9.5, 11.5],
    floors: 5,
    category: 'CLASSROOM',
    relativeLocationComment:
      'Nằm ở góc Tây Bắc của khuôn viên, bên trái Sân bóng đá (cách mép sân bóng 3.2m). Mặt tiền phía Nam cách mép đường ngang 1.6m, hoàn toàn không đè lên làn đường.',
  },

  // --------------------------------------------------------------------------
  // 3. TÒA I NHỎ (KHU NHÀ I PHỤ TRỢ & PHÒNG HỌC THỰC HÀNH)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_i_nho',
    code: 'toa_i_duong',
    name: 'Khu Nhà I (Đường - Tòa I Nhỏ)',
    shortName: 'Tòa I Nhỏ',
    subTitle: 'Khu Nhà Phụ Trợ & Phòng Thực Hành Chuyên Đề',
    modelUrl: '/models/cs3/toa_i_small.glb',
    // Vị trí: Sát vách tường rào phía Tây góc Tây Bắc, X = -26.5, Z = -19.5
    position: [-26.5, 1.1, -19.5],
    rotation: [0, Math.PI / 2, 0],
    scale: [4.5, 4.5, 6.0],
    heightOffset: 2.8,
    plotSize: [4.5, 11.0],
    floors: 1,
    category: 'WORKSHOP',
    relativeLocationComment:
      'Nằm áp sát tường rào biên giới phía Tây góc trên cùng (Tây Bắc), chạy song song với Tòa I Lớn và ngăn cách với Xưởng ô tô bởi trục đường ngang.',
  },

  // --------------------------------------------------------------------------
  // 4. XƯỞNG THỰC HÀNH Ô TÔ (KHOA CƠ KHÍ ĐỘNG LỰC)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_xuong_oto',
    code: 'xuong_oto',
    name: 'Xưởng Thực Hành Ô Tô',
    shortName: 'Xưởng Ô Tô',
    subTitle: 'Khoa Cơ Khí Động Lực (Xưởng Động Cơ, Khung Gầm, Điện Ô Tô)',
    modelUrl: '/models/cs3/xuong_oto.glb',
    // Vị trí: Góc Tây Nam khuôn viên, X = -25.0, Z = 1.0 (Trải từ Z = -7.5 đến Z = +9.5)
    // Cách mép đường ngang (Z = -9.1) là 1.6m; Cách lưng Tòa H là 4.0m
    position: [-25.0, 1.75, 1.0],
    rotation: [0, 0, 0],
    scale: [5.5, 4.0, 9.2],
    heightOffset: 3.8,
    plotSize: [7.5, 17.5],
    floors: 1,
    category: 'WORKSHOP',
    relativeLocationComment:
      'Nằm ở góc Tây Nam khuôn viên trường, chạy dọc tường rào phía Tây, nằm phía sau lưng Tòa H (cách 4.0m sân nội bộ) và mép trên cách trục đường ngang 1.6m.',
  },

  // --------------------------------------------------------------------------
  // 5. TÒA NHÀ J (KHU KÝ TÚC XÁ & GIẢNG ĐƯỜNG 6 TẦNG PHÍA ĐÔNG BẮC)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_j',
    code: 'toa_j',
    name: 'Khu Nhà J (6 Tầng)',
    shortName: 'Tòa J (KTX)',
    subTitle: 'Khu Giảng Đường Đa Năng & Ký Túc Xá Sinh Viên',
    modelUrl: '/models/cs3/toakytucxa.glb',
    // Vị trí: Góc Đông Bắc, X = 16.5, Z = -19.5 (Trải từ Z = -24.3 đến Z = -14.7)
    // Thay thế toàn bộ bằng mô hình toakytucxa.glb chính thức
    // Tách biệt rõ ràng với Sân bóng (khoảng cách đệm 3.5m) và mép đường ngang (1.7m)
    position: [16.5, 3.01, -19.5],
    rotation: [0, 0, 0],
    scale: [5.8, 3.2, 10.5],
    heightOffset: 4.8,
    plotSize: [11.5, 10.5],
    floors: 6,
    category: 'DORMITORY',
    relativeLocationComment:
      'Tọa lạc tại góc Đông Bắc khuôn viên trường, nằm bên phải Sân bóng đá (khoảng cách đệm 3.5m, không hề chồng lấn). Sử dụng mô hình toakytucxa.glb mới, mép dưới cách trục đường 1.7m, nhìn sang Bãi đỗ xe phía Đông.',
  },

  // --------------------------------------------------------------------------
  // 6. TÒA NHÀ K (VIỆN ĐÀO TẠO & NGHIÊN CỨU 7 TẦNG)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_k',
    code: 'toa_k',
    name: 'Khu Nhà K (7 Tầng)',
    shortName: 'Tòa K',
    subTitle: 'Viện Nghiên Cứu & Đào Tạo Đèo Cả, Viện CNTT, Viện Cơ Khí (K001 - K301)',
    modelUrl: '/models/cs3/toa_k.glb',
    // Vị trí: Trục Đông, X = 16.0, Z = 1.5 (Trải từ Z = -6.25 đến Z = +9.25)
    // Mép Tây (X = 11.5) cách mép đường chính (X = 10.0) là 1.5m
    position: [16.0, 2.7, 1.5],
    rotation: [0, -Math.PI / 2, 0], // Mặt tiền hướng Tây nhìn sang sân Tòa H
    scale: [6.8, 5.8, 11.5],
    heightOffset: 4.8,
    plotSize: [10.5, 15.5],
    floors: 7,
    category: 'CLASSROOM',
    relativeLocationComment:
      'Nằm ở phía Đông của trục đường chính, đối diện trực tiếp với lòng sân Tòa H. Mép Tây cách trục đường chính 1.5m, phía sau là Bãi đỗ xe Đông.',
  },

  // --------------------------------------------------------------------------
  // 7. KHU NHÀ L & PHÒNG GYM UTH FITNESS (GIÓNG THẲNG HÀNG SÁT TƯỜNG CỔNG 2)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_l',
    code: 'toa_l',
    name: 'Khu Nhà L (Phòng Gym UTH Fitness & Y Tế)',
    shortName: 'Tòa L / Gym',
    subTitle: 'Phòng Gym Thể Chất UTH Fitness, Phòng CNTT & Trạm Y Tế',
    modelUrl: '/models/cs3/toa_l.glb',
    // Vị trí: Mặt tiền phía Nam, X = 14.8, Z = 22.3 (Chiều sâu 5.0m, từ Z = 19.8 đến Z = 24.8)
    // Mặt tiền gióng thẳng hàng sát bức tường rào phía Nam ngay bên trái Cổng 2 (Z = 24.8)
    position: [14.8, 1.3, 22.3],
    rotation: [0, 0, 0],
    scale: [5.5, 6.0, 4.8],
    heightOffset: 3.5,
    plotSize: [9.2, 5.0],
    floors: 1,
    category: 'SPORTS',
    relativeLocationComment:
      'Nằm ở hàng mặt tiền phía Nam ngay bên trái Cổng Ra Vào 2 và bên phải Cổng 1. Mặt tiền gióng thẳng hàng sát bức tường rào Nam (mặt trước tại Z = 24.8), đối xứng trục với Nhà Đa Năng qua làn đường Cổng 2.',
  },

  // --------------------------------------------------------------------------
  // 8. PHÒNG ĐA NĂNG (NHÀ THI ĐẤU CÓ MÁI VÒM - GIÓNG SÁT TƯỜNG CỔNG 2)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs3_nha_da_nang',
    code: 'nha_da_nang',
    name: 'Nhà Đa Năng (2 Tầng)',
    shortName: 'Nhà Đa Năng',
    subTitle: 'Trung Tâm Thể Thao Đa Năng & Tổ Chức Sự Kiện Sinh Viên',
    modelUrl: '/models/cs3/nha_da_nang.glb',
    // Vị trí: Góc Đông Nam, X = 28.9, Z = 20.5 (Chiều sâu 8.6m, từ Z = 16.2 đến Z = 24.8)
    // Mặt tiền gióng thẳng hàng tuyệt đối với Tòa L (mặt trước cùng tại Z = 24.8) sát tường rào và Cổng 2
    position: [28.9, 1.95, 20.5],
    rotation: [0, 0, 0],
    scale: [5.0, 4.8, 4.8],
    heightOffset: 3.6,
    plotSize: [8.6, 8.6],
    floors: 2,
    category: 'SPORTS',
    relativeLocationComment:
      'Nằm tại góc ngoài cùng phía Đông Nam khuôn viên trường, ngay bên phải Cổng Ra Vào 2. Mặt tiền gióng thẳng hàng hoàn hảo với Khu Nhà L tại trục Z = 24.8 dọc theo tường rào phía Nam.',
  },
];

/**
 * CÁC HẠNG MỤC TIỆN ÍCH & HẠ TẦNG CẢNH QUAN
 */
export const CS3_AMENITIES_LAYOUT: CS3AmenityConfig[] = [
  // Sân bóng đá cỏ nhân tạo (Được nâng cao độ Y = 0.1 để chống Z-fighting)
  {
    id: 'amenity_san_bong_da',
    code: 'san_bong_da',
    name: 'Sân Bóng Đá Mini',
    // Vị trí: X = 0.0, Z = -19.5, Y = 0.1 (Cao hơn nền đường 0.07m để nổi bật và không bao giờ bị đè)
    // Rộng 15.0m (từ X = -7.5 đến +7.5), Sâu 10.0m (từ Z = -24.5 đến -14.5)
    position: [0.0, 0.1, -19.5],
    size: [15.0, 10.0],
    relativeLocationComment:
      'Nằm ở trục trung tâm phía Bắc của trường, kẹp giữa Tòa I Lớn (cách 3.75m) và Tòa J (cách 3.8m). Cao độ nâng lên Y = 0.1, mép dưới cách đường ngang 1.6m chống Z-fighting hoàn toàn.',
  },
  // Bãi đỗ xe ô tô & xe máy phía Đông
  {
    id: 'amenity_bai_xe_dong',
    code: 'bai_xe_dong',
    name: 'Bãi Đỗ Xe Phía Đông',
    // Vị trí: X = 26.5, Z = -6.5, kích thước 14.0m x 36.0m
    position: [26.5, 0.03, -6.5],
    size: [14.0, 36.0],
    relativeLocationComment:
      'Khu vực đỗ xe rộng lớn chiếm trọn góc Đông Bắc phía sau Nhà Đa Năng, thông ra Cổng Ra Vào 2.',
  },
];
