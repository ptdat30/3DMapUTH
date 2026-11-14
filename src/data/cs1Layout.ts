/**
 * CS1 CAMPUS 3D SPATIAL COORDINATE LAYOUT CONFIGURATION
 * Trường Đại học Giao thông Vận tải TP.HCM (UTH) - Cơ sở 1 (Số 2 Võ Oanh, P.25, Q.Bình Thạnh)
 *
 * Bản đồ mặt bằng thực tế (Masterplan Blueprint):
 * - Tòa A: Khối duy nhất trải dài toàn bộ mặt tiền trung tâm.
 * - Tòa B, Tòa C, Tòa F: Đã tích hợp mô hình 3D thực tế (.glb) với texture PBR đã nén tối ưu.
 * - Chiều ngang (Trục X): Tây (-) -> Đông (+)
 * - Chiều cao (Trục Y): Cao độ [0.00: Nền tổng, 0.03: Đường nội bộ, 0.08: Bãi xe, 0.12: Móng công trình, >0.15: Tòa nhà]
 * - Chiều dọc (Trục Z): Bắc (-) -> Nam (+) [Mặt tiền Cổng chính đường Võ Oanh nằm ở phía Nam: Z > 0]
 */

export type CS1BuildingCategory = 'ADMIN' | 'CLASSROOM' | 'LAB' | 'HALL' | 'PARKING' | 'FACILITY';

export interface CS1BuildingPart {
  name: string;
  position: [number, number, number];
  size: [number, number, number];
}

export interface CS1BuildingConfig {
  id: string;
  code: string;
  name: string;
  shortName: string;
  subTitle: string;
  modelUrl?: string;
  position: [number, number, number]; // [X, Y, Z]
  rotation: [number, number, number]; // [Euler X, Y, Z] radian
  scale: [number, number, number];    // [ScaleX, ScaleY, ScaleZ]
  plotSize: [number, number];         // [Kích thước X, Kích thước Z] của khối đế móng
  height: number;                     // Chiều cao kiến trúc
  floors: number;
  heightOffset: number;               // Độ cao treo nhãn nổi 3D (HTML Label)
  category: CS1BuildingCategory;
  primaryColor: string;
  accentColor?: string;
  parts?: CS1BuildingPart[];
  relativeLocationComment: string;
}

export interface CS1ParkingConfig {
  id: string;
  code: string;
  name: string;
  position: [number, number, number];
  size: [number, number];             // [widthX, depthZ]
  color: string;
  relativeLocationComment: string;
}

/**
 * 6 KHỐI TÒA NHÀ & CÔNG TRÌNH KIẾN TRÚC TẠI CƠ SỞ 1 (CS1)
 */
export const CS1_BUILDINGS_LAYOUT: CS1BuildingConfig[] = [
  // --------------------------------------------------------------------------
  // 1. TÒA A (KHỐI DUY NHẤT - TRUNG TÂM HIỆU BỘ & ĐÀO TẠO MẶT TIỀN)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_a',
    code: 'toa_a',
    name: 'Tòa Nhà A (Hiệu Bộ & Đào Tạo)',
    shortName: 'Tòa A',
    subTitle: 'Khu Trung Tâm Hành Chính, Hiệu Bộ, Hội Trường & Phòng Đào Tạo',
    position: [2.0, 4.25, 18.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    plotSize: [35.6, 8.3],
    height: 8.5,
    floors: 5,
    heightOffset: 9.8,
    category: 'ADMIN',
    primaryColor: '#f8fafc',
    accentColor: '#3b82f6',
    relativeLocationComment:
      'Khối Tòa A duy nhất trải dài suốt mặt tiền trung tâm trường (kích thước 35.6m x 8.3m), nằm ngay phía sau dải Bãi xe cổng chính Võ Oanh và phía trước Bãi xe trung tâm.',
  },

  // --------------------------------------------------------------------------
  // 2. TÒA B (MODEL 3D .GLB THỰC TẾ - KHOA CNTT & PHÒNG LAB)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_b',
    code: 'toa_b',
    name: 'Tòa Nhà B (Khoa CNTT & Giảng Đường)',
    shortName: 'Tòa B',
    subTitle: 'Giảng Đường B, Trung Tâm Đào Tạo AI & Hệ Thống Lab Máy Tính',
    modelUrl: '/models/cs1/toa_b.glb',
    position: [-18.9, 4.25, 8.0],
    rotation: [0, Math.PI / 2, 0], // Xoay 90 độ để góc chữ L nằm ở Tây Bắc, nhánh dọc chạy dọc mép Tây
    scale: [23.0, 20.0, 22.0],
    plotSize: [24.7, 42.0],
    height: 9.5,
    floors: 6,
    heightOffset: 10.5,
    category: 'LAB',
    primaryColor: '#f8fafc',
    accentColor: '#60a5fa',
    parts: [
      {
        name: 'Nhánh Ngang Phía Bắc (Nối sang Tòa D/C)',
        position: [-17.8, 4.75, -8.7],
        size: [24.7, 9.5, 8.4],
      },
      {
        name: 'Nhánh Dọc Phía Tây (Chạy dọc sân trường ra mặt tiền)',
        position: [-26.0, 4.75, 8.1],
        size: [8.3, 9.5, 42.0],
      },
    ],
    relativeLocationComment:
      'Khối model 3D chữ L thực tế ôm trọn góc Tây Bắc và cạnh Tây của Bãi xe trung tâm. Nhánh ngang phía sau giáp Tòa F và lối vào Tòa D; nhánh dọc kéo dài xuống cổng chính.',
  },

  // --------------------------------------------------------------------------
  // 3. TÒA C (MODEL 3D .GLB THỰC TẾ - GIẢNG ĐƯỜNG TỔNG HỢP)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_c',
    code: 'toa_c',
    name: 'Tòa Nhà C (Giảng Đường Tổng Hợp)',
    shortName: 'Tòa C',
    subTitle: 'Khu Giảng Đường Đa Ngành C1 - C5',
    modelUrl: '/models/cs1/toa_c.glb',
    position: [11.9, 4.05, -2],
    rotation: [0, -Math.PI / 2, 0], // Xoay -90 độ để góc chữ L ở Đông Bắc, nhánh dọc ở mép Đông
    scale: [15.0, 15.0, 14.0],
    plotSize: [22.3, 26.6],
    height: 8.5,
    floors: 5,
    heightOffset: 10.0,
    category: 'CLASSROOM',
    primaryColor: '#f8fafc',
    accentColor: '#94a3b8',
    parts: [
      {
        name: 'Nhánh Ngang Phía Bắc (Đối diện nhánh ngang Tòa B)',
        position: [8.7, 4.25, -8.7],
        size: [22.3, 8.5, 8.4],
      },
      {
        name: 'Nhánh Dọc Phía Đông (Bao bọc mép đông Bãi xe trung tâm)',
        position: [15.7, 4.25, 2.3],
        size: [8.3, 8.5, 13.8],
      },
    ],
    relativeLocationComment:
      'Khối model 3D chữ L thực tế đối xứng với Tòa B qua sân trường. Nhánh ngang cùng nhánh ngang Tòa B tạo thành hành lang thông gió mở lối vào Tòa D. Nhánh dọc bao bọc mép đông Bãi xe trung tâm.',
  },

  // --------------------------------------------------------------------------
  // 4. TÒA D (MODEL 3D .GLB THỰC TẾ - KHU GIẢNG ĐƯỜNG SAU)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_d',
    code: 'toa_d',
    name: 'Tòa Nhà D (Khu Giảng Đường Sau)',
    shortName: 'Tòa D',
    subTitle: 'Khu Giảng Đường Chuyên Đề & Phòng Thí Nghiệm',
    modelUrl: '/models/cs1/toa_d.glb',
    position: [-3.6, 4.0, -21.5],
    rotation: [0, 0, 0],
    scale: [7.0, 4.2, 8.0],
    plotSize: [9.6, 15.3],
    height: 8.0,
    floors: 5,
    heightOffset: 9.0,
    category: 'CLASSROOM',
    primaryColor: '#f8fafc',
    accentColor: '#64748b',
    relativeLocationComment:
      'Khối model 3D thực tế của Tòa D nằm sâu phía sau trường (hướng Bắc), gióng thẳng hàng ngay cuối lối đi thông thoáng giữa Tòa B và Tòa C.',
  },

  // --------------------------------------------------------------------------
  // 5. TÒA F (MODEL 3D .GLB THỰC TẾ - GÓC TÂY BẮC)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_f',
    code: 'toa_f',
    name: 'Tòa Nhà F (Khu Giảng Đường Tây Bắc)',
    shortName: 'Tòa F',
    subTitle: 'Khu Phòng Học Chuyên Ngành & Nghiên Cứu Sau Đại Học',
    modelUrl: '/models/cs1/toa_f.glb',
    position: [-19.9, 3.5, -17.3],
    rotation: [0, 0, 0],
    scale: [10.5, 6.0, 9.0],
    plotSize: [20.5, 8.3],
    height: 7.0,
    floors: 4,
    heightOffset: 8.5,
    category: 'CLASSROOM',
    primaryColor: '#f8fafc',
    accentColor: '#94a3b8',
    relativeLocationComment:
      'Khối model 3D chữ nhật nằm ngang góc Tây Bắc trường, phía sau nhánh ngang của Tòa B và bên trái Tòa D.',
  },

  // --------------------------------------------------------------------------
  // 6. TÒA E (KHỐI NHÀ DỌC PHÍA ĐÔNG)
  // --------------------------------------------------------------------------
  {
    id: 'bld_cs1_toa_e',
    code: 'toa_e',
    name: 'Tòa Nhà E (Khu Đào Tạo Phía Đông)',
    shortName: 'Tòa E',
    subTitle: 'Viện Đào Tạo Quốc Tế & Khu Văn Phòng Khoa',
    position: [29, 4.25, 11.7],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    plotSize: [8.3, 28.9],
    height: 8.5,
    floors: 5,
    heightOffset: 9.7,
    category: 'CLASSROOM',
    primaryColor: '#f8fafc',
    accentColor: '#94a3b8',
    relativeLocationComment:
      'Nằm độc lập chạy dọc ranh giới phía Đông khuôn viên, cách Tòa C và Tòa A một khoảng hành lang thông thoáng 2.0m. Kéo dài từ ngang Tòa C xuống gần hết mặt tiền phía Nam.',
  },
];

/**
 * 3 KHU VỰC BÃI ĐỖ XE & NHÀ XE TẠI CƠ SỞ 1
 */
export const CS1_PARKINGS_LAYOUT: CS1ParkingConfig[] = [
  // 1. BÃI XE TRUNG TÂM (SÂN TRƯỜNG LỚN)
  {
    id: 'pkg_cs1_center',
    code: 'bai_xe_trung_tam',
    name: 'Bãi Xe Trung Tâm (Sân Trường LỚn)',
    position: [-4.1, 0.05, 2.7],
    size: [33.3, 18.6],
    color: '#ff3131',
    relativeLocationComment:
      'Khu vực trung tâm rộng lớn nhất của cơ sở 1, được bao quanh bởi Tòa B, Tòa C và Tòa A. Vừa là sân sinh hoạt chung, vừa là bãi đỗ xe chính.',
  },

  // 2. BÃI XE MẶT TIỀN (CỔNG CHÍNH VÕ OANH)
  {
    id: 'pkg_cs1_front',
    code: 'bai_xe_cong_chinh',
    name: 'Bãi Xe Mặt Tiền Cổng Chính',
    position: [2.0, 0.05, 25.7],
    size: [35.6, 6.7],
    color: '#ff3131',
    relativeLocationComment:
      'Dải bãi xe dài nằm sát cổng chính đường Võ Oanh, phía trước Tòa A.',
  },

  // 3. NHÀ XE PHỤ TRỢ (GÓC TÂY NAM)
  {
    id: 'pkg_cs1_southwest',
    code: 'nha_xe_can_bo',
    name: 'Nhà Xe Cán Bộ & Bảo Vệ (Góc Tây Nam)',
    position: [-18.9, 0.05, 23.0],
    size: [5.9, 5.4],
    color: '#ff3131',
    relativeLocationComment:
      'Nhà xe nhỏ có mái che nằm kẹp giữa nhánh dọc Tòa B và Tòa A, cạnh lối thoát hiểm góc Tây Nam.',
  },
];
