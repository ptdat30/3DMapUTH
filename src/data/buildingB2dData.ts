// ============================================================================
// UTH Indoor Wayfinding 2D System - Tòa B (Building B)
// Data Single Source of Truth - Chuẩn Thiết kế Warm Minimalist Tòa K
// Phân chia theo 3 Phần kiến trúc (Phần 1, Phần 2, Phần 3) & 4 Tầng (Trệt, 1, 2, 3)
// ============================================================================

export type BuildingFloor = 'ground' | 'floor1' | 'floor2' | 'floor3';
export type BuildingPart = 'part1' | 'part2' | 'part3';
export type BuildingBGateId = 'gate1_parking' | 'gate2_north_south' | 'gate3_north_east';
export type RoomCategory = 'classroom' | 'office' | 'stairs' | 'restroom' | 'facility';

export interface BuildingBGateInfo {
  id: BuildingBGateId;
  shortLabel: string;
  name: string;
  landmark: string;
  stairsCode: string;
  primaryPart: BuildingPart;
  masterPoint: { x: number; y: number };
}

export const BUILDING_B_GATES: Record<BuildingBGateId, BuildingBGateInfo> = {
  gate1_parking: {
    id: 'gate1_parking',
    shortLabel: 'Cổng 1',
    name: 'Cổng 1 • Gần Nhà xe',
    landmark: 'Gần Nhà xe • Khối Nam (CT1)',
    stairsCode: 'CT1',
    primaryPart: 'part1',
    masterPoint: { x: 220, y: 234 },
  },
  gate2_north_south: {
    id: 'gate2_north_south',
    shortLabel: 'Cổng 2',
    name: 'Cổng 2 • Nối Khối Bắc – Nam',
    landmark: 'Đoạn nối Khối Bắc & Khối Nam (CT2)',
    stairsCode: 'CT2',
    primaryPart: 'part2',
    masterPoint: { x: 475, y: 234 },
  },
  gate3_north_east: {
    id: 'gate3_north_east',
    shortLabel: 'Cổng 3',
    name: 'Cổng 3 • Nối Khối Bắc – Cánh Đông',
    landmark: 'Đoạn nối Khối Bắc & Cánh Đông (CT3)',
    stairsCode: 'CT3',
    primaryPart: 'part3',
    masterPoint: { x: 840, y: 220 },
  },
};

export const BUILDING_B_GATE_LIST: BuildingBGateInfo[] = [
  BUILDING_B_GATES.gate1_parking,
  BUILDING_B_GATES.gate2_north_south,
  BUILDING_B_GATES.gate3_north_east,
];

export interface RoomBInfo {
  id: string;
  code: string;
  name: string;
  shortBadge: string; // Badge hiển thị kiểu "P.301", "WC-M", "CT1" theo hình ảnh tham chiếu
  floor: BuildingFloor;
  floorLabel: string;
  part: BuildingPart;
  partLabel: string;
  category: RoomCategory;
  description: string;
  fillColor: string;
  nearestStairs: string;
  estimatedDistanceMeters: number;
  walkingSeconds: number;
  directions: {
    fromGroundGate: string[];
    fromNearestStairs: string[];
  };
  // Tọa độ hình học trong hệ trục của từng Phần (Part ViewBox)
  partCoords: {
    x: number;
    y: number;
    width: number;
    height: number;
    door: { x: number; y: number };
  };
  // Tọa độ hình học trong hệ trục bản đồ tổng thể (Master ViewBox 1024x586)
  masterCoords: {
    x: number;
    y: number;
    width: number;
    height: number;
    door: { x: number; y: number };
  };
}

export const TOA_B_COLORS = {
  bgCanvas: '#FAF7F2',        // Nền vải kiến trúc tông ấm
  bgCorridor: '#F3EFEA',      // Nền hành lang sáng sạch
  borderWall: '#4A4540',      // Viền tường than chì kiến trúc
  wallInner: '#5A544E',       // Vách ngăn phòng
  roomPrimary: '#FAF2E6',     // Phòng học tiêu chuẩn màu kem ấm
  roomSecondary: '#C8BEB3',   // Phòng học phụ Taupe
  roomOffice: '#DFC99F',      // Phòng chức năng, Tạp chí, Thư viện, Văn phòng
  stairBg: '#605B55',         // Khối cầu thang bộ
  stairStripe: '#48443F',     // Sọc bậc tam cấp
  wcBg: '#B5C2C9',            // Khu vệ sinh WC Steel Blue
  routeTeal: '#0E434F',       // Tuyến dẫn lối Deep Teal UTH
  routeActive: '#D97706',     // Highlight màu cam hổ phách rực rỡ khi phòng được chọn
  textDark: '#1A1817',        // Chữ đen đậm rõ nét
  textLight: '#FFFFFF',       // Chữ trắng nổi bật trên khối đậm
  doorCut: '#FFFFFF',         // Khe mở cửa sáng rõ (40px)
  doorArc: '#7A736B',         // Cung quay cửa nét đứt
};

export const PART_INFO: Record<BuildingPart, { label: string; subLabel: string; description: string }> = {
  part1: {
    label: 'Phần 1 (Khối Nam)',
    subLabel: 'Khu vực Phòng Lớn, Cầu Thang 1 & Phòng .001 - .003',
    description: 'Nằm ở cánh phía Nam của Tòa B, kết nối trực tiếp cổng vào sân trường và Cầu Thang 1.',
  },
  part2: {
    label: 'Phần 2 (Khối Bắc)',
    subLabel: 'Khu vực WC, Cầu Thang 2 & Phòng .004 - .007',
    description: 'Nằm ở khối giữa của Tòa B, trang bị Cầu Thang 2 và khu vệ sinh chung (WC Nam/Nữ).',
  },
  part3: {
    label: 'Phần 3 (Cánh Đông)',
    subLabel: 'Khu vực Cánh Ngang Đông, Cầu Thang 3, Phòng .008 - .011 & Cầu Thang 4',
    description: 'Khối mở rộng rẽ góc vuông sang hướng Đông, có Cầu Thang 3 ở đầu và Cầu Thang 4 ở cuối.',
  },
};

export const FLOOR_INFO: Record<BuildingFloor, { label: string; code: string; level: number }> = {
  ground: { label: 'Tầng Trệt', code: 'TRET', level: 0 },
  floor1: { label: 'Tầng 1', code: 'T1', level: 1 },
  floor2: { label: 'Tầng 2', code: 'T2', level: 2 },
  floor3: { label: 'Tầng 3', code: 'T3', level: 3 },
};

// ============================================================================
// HÌNH ẢNH GỐC TỪ THƯ MỤC TOAB_2D ĐÃ ĐƯỢC ĐỒNG BỘ
// ============================================================================
export const PART_IMAGE_MAP: Record<BuildingFloor, Record<BuildingPart, string>> = {
  ground: {
    part1: '/toab/2d/Tret_1.jpg',
    part2: '/toab/2d/Tret_2.jpg',
    part3: '/toab/2d/Tret_3.jpg',
  },
  floor1: {
    part1: '/toab/2d/Tang1_1.jpg',
    part2: '/toab/2d/Tang1_2.jpg',
    part3: '/toab/2d/Tang1_3.jpg',
  },
  floor2: {
    part1: '/toab/2d/Tang2_1.jpg',
    part2: '/toab/2d/Tang2_2.jpg',
    part3: '/toab/2d/Tang2_3.jpg',
  },
  floor3: {
    part1: '/toab/2d/Tang3_1.jpg',
    part2: '/toab/2d/Tang3_2.jpg',
    part3: '/toab/2d/Tang3_3.jpg',
  },
};

export const MASTER_FLOOR_IMAGE = '/toab/2d/toab_tong_the.jpg';

// ============================================================================
// DANH MỤC PHÒNG ĐẦY ĐỦ 4 TẦNG X 3 PHẦN
// ============================================================================

export const TOA_B_ROOMS: Record<string, RoomBInfo> = {
  // ==========================================================================
  // 1. TẦNG TRỆT
  // ==========================================================================
  // --- Phần 1 (Khối Nam) ---
  'b_tret_mag': {
    id: 'b_tret_mag',
    code: 'B.2',
    name: 'Tạp chí Khoa học Công nghệ GTVT',
    shortBadge: 'B.2',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'office',
    description: 'Tòa soạn Tạp chí Khoa học Công nghệ Giao thông Vận tải - Trường ĐH GTVT TP.HCM',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Từ cổng Tòa B (sân chính), đi thẳng vào hành lang Phần 1 (Khối Nam).',
        'Đi thẳng 12m về phía cuối cánh Nam.',
        'Phòng B.2 (Tòa soạn Tạp chí KHCN GTVT) nằm ngay bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ chân Cầu Thang 1 (CT1), rẽ phải ra hành lang.',
        'Cửa phòng B.2 nằm ngay cạnh vách Cầu Thang 1.',
      ],
    },
    partCoords: { x: 30, y: 30, width: 330, height: 190, door: { x: 330, y: 220 } },
    masterCoords: { x: 20, y: 100, width: 180, height: 120, door: { x: 190, y: 220 } },
  },
  'b_tret_ct1': {
    id: 'b_tret_ct1',
    code: 'CT1',
    name: 'Cầu Thang Bộ 1',
    shortBadge: 'CT1',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'stairs',
    description: 'Cầu thang bộ trục chính Phần 1, kết nối Tầng Trệt lên Tầng 1, 2, 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Từ sảnh chính Phần 1, đi dọc theo hành lang 10m.',
        'Cầu Thang 1 nằm ngay bên cạnh phòng B.2.',
      ],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 1.'],
    },
    partCoords: { x: 380, y: 30, width: 110, height: 190, door: { x: 435, y: 220 } },
    masterCoords: { x: 205, y: 100, width: 50, height: 120, door: { x: 220, y: 220 } },
  },
  'b_001': {
    id: 'b_001',
    code: 'B.001',
    name: 'Phòng Học B.001',
    shortBadge: 'P.001',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.001 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 14,
    walkingSeconds: 16,
    directions: {
      fromGroundGate: [
        'Từ cổng Tòa B, bước vào hành lang Phần 1.',
        'Đi thẳng qua Cầu Thang 1 khoảng 3m.',
        'Phòng B.001 nằm ngay bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ chân Cầu Thang 1, bước ra hành lang và rẽ trái.',
        'Cửa phòng B.001 là cửa đầu tiên bên tay trái.',
      ],
    },
    partCoords: { x: 510, y: 30, width: 150, height: 190, door: { x: 535, y: 220 } },
    masterCoords: { x: 260, y: 100, width: 70, height: 120, door: { x: 280, y: 220 } },
  },
  'b_002': {
    id: 'b_002',
    code: 'B.002',
    name: 'Phòng Học B.002',
    shortBadge: 'P.002',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.002 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 20,
    walkingSeconds: 24,
    directions: {
      fromGroundGate: [
        'Từ cổng Tòa B, đi vào hành lang Phần 1.',
        'Đi thẳng qua phòng B.001.',
        'Phòng B.002 nằm ngay phòng thứ hai bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1, ra hành lang rẽ trái, đi thẳng 8m.',
        'Phòng B.002 nằm ở giữa phòng B.001 và B.003.',
      ],
    },
    partCoords: { x: 680, y: 30, width: 150, height: 190, door: { x: 705, y: 220 } },
    masterCoords: { x: 335, y: 100, width: 70, height: 120, door: { x: 355, y: 220 } },
  },
  'b_003': {
    id: 'b_003',
    code: 'B.003',
    name: 'Phòng Học B.003',
    shortBadge: 'P.003',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.003 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 26,
    walkingSeconds: 30,
    directions: {
      fromGroundGate: [
        'Từ cổng Tòa B, đi theo hành lang Phần 1 về phía khối giữa.',
        'Đi qua phòng B.002.',
        'Phòng B.003 nằm ở cuối hành lang Phần 1, giáp khu chuyển tiếp Phần 2.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1, rẽ trái đi dọc hành lang 15m.',
        'Phòng B.003 là phòng học thứ ba bên tay trái.',
      ],
    },
    partCoords: { x: 850, y: 30, width: 150, height: 190, door: { x: 875, y: 220 } },
    masterCoords: { x: 410, y: 100, width: 70, height: 120, door: { x: 430, y: 220 } },
  },

  // --- Phần 2 (Khối Bắc) ---
  'b_tret_wc': {
    id: 'b_tret_wc',
    code: 'WC',
    name: 'Nhà Vệ Sinh (WC Nam / Nữ)',
    shortBadge: 'WC',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'restroom',
    description: 'Khu vệ sinh công cộng dành cho cán bộ & sinh viên tại Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.wcBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: [
        'Từ sảnh giữa Tòa B, di chuyển về phía sảnh Cầu Thang 2.',
        'Khu vệ sinh WC nằm ngay góc sảnh chuyển tiếp.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 (CT2), bước ra hành lang rẽ sang tay phải 3m là tới WC.',
      ],
    },
    partCoords: { x: 30, y: 20, width: 130, height: 95, door: { x: 140, y: 115 } },
    masterCoords: { x: 410, y: 40, width: 70, height: 55, door: { x: 450, y: 95 } },
  },
  'b_tret_ct2': {
    id: 'b_tret_ct2',
    code: 'CT2',
    name: 'Cầu Thang Bộ 2',
    shortBadge: 'CT2',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'stairs',
    description: 'Cầu thang trung tâm khối Phần 2, kết nối Tầng Trệt lên các tầng trên',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: [
        'Từ sảnh trung tâm Tòa B, bước vào sảnh hành lang Phần 2.',
        'Cầu Thang 2 nằm ở góc sảnh đầu dãy phòng B.004.',
      ],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 2.'],
    },
    partCoords: { x: 30, y: 125, width: 130, height: 105, door: { x: 140, y: 230 } },
    masterCoords: { x: 490, y: 40, width: 40, height: 75, door: { x: 495, y: 115 } },
  },
  'b_004': {
    id: 'b_004',
    code: 'B.004',
    name: 'Phòng Học B.004',
    shortBadge: 'P.004',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.004 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Từ sảnh trung tâm Tòa B, đi vào hành lang Phần 2.',
        'Phòng B.004 nằm ngay cạnh Cầu Thang 2.',
      ],
      fromNearestStairs: [
        'Từ chân Cầu Thang 2, bước ra hành lang và rẽ phải.',
        'Phòng B.004 là phòng đầu tiên bên tay trái.',
      ],
    },
    partCoords: { x: 180, y: 20, width: 200, height: 210, door: { x: 210, y: 230 } },
    masterCoords: { x: 535, y: 40, width: 70, height: 165, door: { x: 550, y: 205 } },
  },
  'b_005': {
    id: 'b_005',
    code: 'B.005',
    name: 'Phòng Học B.005',
    shortBadge: 'P.005',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.005 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Từ hành lang Phần 2, đi qua phòng B.004.',
        'Phòng B.005 nằm ở gian thứ hai bên tay trái hành lang.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2, ra hành lang rẽ phải, đi thẳng 10m.',
        'Phòng B.005 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 400, y: 20, width: 200, height: 210, door: { x: 430, y: 230 } },
    masterCoords: { x: 610, y: 40, width: 70, height: 165, door: { x: 625, y: 205 } },
  },
  'b_006': {
    id: 'b_006',
    code: 'B.006',
    name: 'Phòng Học B.006',
    shortBadge: 'P.006',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.006 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 26,
    walkingSeconds: 30,
    directions: {
      fromGroundGate: [
        'Từ hành lang Phần 2, đi qua phòng B.005.',
        'Phòng B.006 nằm ở gian thứ ba bên tay trái hành lang.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2, đi thẳng dọc hành lang 18m.',
        'Phòng B.006 nằm cạnh phòng B.007.',
      ],
    },
    partCoords: { x: 620, y: 20, width: 200, height: 210, door: { x: 650, y: 230 } },
    masterCoords: { x: 685, y: 40, width: 70, height: 165, door: { x: 700, y: 205 } },
  },
  'b_007': {
    id: 'b_007',
    code: 'B.007',
    name: 'Phòng Học B.007',
    shortBadge: 'P.007',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.007 Tầng trệt Tòa B (giáp góc rẽ sang Phần 3)',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 34,
    walkingSeconds: 40,
    directions: {
      fromGroundGate: [
        'Đi dọc hết hành lang Phần 2 về phía góc giao với Cánh Đông.',
        'Phòng B.007 nằm cuối dãy Phần 2.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2, đi thẳng hết hành lang Phần 2 khoảng 25m.',
        'Phòng B.007 nằm ngay trước ngã rẽ vào Phần 3.',
      ],
    },
    partCoords: { x: 840, y: 20, width: 200, height: 210, door: { x: 870, y: 230 } },
    masterCoords: { x: 760, y: 40, width: 70, height: 165, door: { x: 775, y: 205 } },
  },

  // --- Phần 3 (Khối Cánh Đông) ---
  'b_tret_goc': {
    id: 'b_tret_goc',
    code: 'B.GÓC',
    name: 'Phòng Chức Năng Góc',
    shortBadge: 'GÓC',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'office',
    description: 'Gian phòng chức năng tại góc ngoặc chuyển tiếp giữa Phần 2 và Cánh Đông Phần 3',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: [
        'Từ sảnh Cánh Đông, đi tới góc ngoặc nối Phần 2 và Phần 3.',
        'Phòng Góc nằm tại vị trí nối hai khối nhà.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 (CT3), rẽ trái ra góc hành lang chuyển tiếp.',
      ],
    },
    partCoords: { x: 30, y: 20, width: 100, height: 95, door: { x: 80, y: 115 } },
    masterCoords: { x: 835, y: 40, width: 145, height: 120, door: { x: 845, y: 165 } },
  },
  'b_tret_ct3': {
    id: 'b_tret_ct3',
    code: 'CT3',
    name: 'Cầu Thang Bộ 3',
    shortBadge: 'CT3',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ đầu Cánh Đông Phần 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: [
        'Từ sân trong Tòa B, bước vào sảnh mở đầu Cánh Đông.',
        'Cầu Thang 3 nằm ngay góc mở của cánh này.',
      ],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 3.'],
    },
    partCoords: { x: 30, y: 125, width: 100, height: 105, door: { x: 110, y: 230 } },
    masterCoords: { x: 865, y: 165, width: 115, height: 75, door: { x: 865, y: 200 } },
  },
  'b_008': {
    id: 'b_008',
    code: 'B.008',
    name: 'Phòng Học B.008',
    shortBadge: 'P.008',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.008 Tầng trệt Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Từ sảnh Cánh Đông, bước vào hành lang.',
        'Phòng B.008 là phòng đầu tiên bên tay trái hành lang Cánh Đông.',
      ],
      fromNearestStairs: [
        'Từ chân Cầu Thang 3, bước ra hành lang rẽ phải.',
        'Phòng B.008 nằm ngay trước mặt bạn.',
      ],
    },
    partCoords: { x: 150, y: 20, width: 190, height: 210, door: { x: 175, y: 230 } },
    masterCoords: { x: 865, y: 245, width: 115, height: 80, door: { x: 860, y: 285 } },
  },
  'b_009': {
    id: 'b_009',
    code: 'B.009',
    name: 'Phòng Học B.009',
    shortBadge: 'P.009',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.009 Tầng trệt Cánh Đông',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 18,
    walkingSeconds: 20,
    directions: {
      fromGroundGate: [
        'Đi dọc theo hành lang Cánh Đông qua phòng B.008.',
        'Phòng B.009 nằm ở phòng thứ hai bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3, đi theo hành lang 10m.',
        'Phòng B.009 nằm giữa phòng B.008 và B.010.',
      ],
    },
    partCoords: { x: 360, y: 20, width: 190, height: 210, door: { x: 385, y: 230 } },
    masterCoords: { x: 865, y: 330, width: 115, height: 80, door: { x: 860, y: 370 } },
  },
  'b_010': {
    id: 'b_010',
    code: 'B.010',
    name: 'Phòng Học B.010',
    shortBadge: 'P.010',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.010 Tầng trệt Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 16,
    walkingSeconds: 18,
    directions: {
      fromGroundGate: [
        'Đi tiếp theo hành lang Cánh Đông về phía Cầu Thang 4.',
        'Phòng B.010 là phòng thứ ba bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 (CT4), đi ngược lên hành lang khoảng 10m.',
        'Phòng B.010 nằm bên tay phải.',
      ],
    },
    partCoords: { x: 570, y: 20, width: 190, height: 210, door: { x: 595, y: 230 } },
    masterCoords: { x: 865, y: 415, width: 115, height: 80, door: { x: 860, y: 455 } },
  },
  'b_011': {
    id: 'b_011',
    code: 'B.011',
    name: 'Phòng Học B.011',
    shortBadge: 'P.011',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.011 Tầng trệt Cánh Đông (cạnh Cầu Thang 4)',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: [
        'Đi xuống tận cùng hành lang Cánh Đông gần Cầu Thang 4.',
        'Phòng B.011 là phòng cuối cùng bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 (CT4), bước ra hành lang rẽ sang tay phải.',
        'Cửa phòng B.011 nằm ngay cạnh cửa Cầu Thang 4.',
      ],
    },
    partCoords: { x: 780, y: 20, width: 190, height: 210, door: { x: 805, y: 230 } },
    masterCoords: { x: 865, y: 500, width: 115, height: 80, door: { x: 860, y: 540 } },
  },
  'b_tret_ct4': {
    id: 'b_tret_ct4',
    code: 'CT4',
    name: 'Cầu Thang Bộ 4',
    shortBadge: 'CT4',
    floor: 'ground',
    floorLabel: 'Tầng Trệt',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ thoát hiểm & lưu thông cuối Cánh Đông Tòa B',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: [
        'Đi hết hành lang Cánh Đông về phía đầu hồi phía Nam của cánh.',
        'Cầu Thang 4 nằm ở góc cuối dãy.',
      ],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 4.'],
    },
    partCoords: { x: 990, y: 125, width: 100, height: 105, door: { x: 990, y: 230 } },
    masterCoords: { x: 830, y: 545, width: 35, height: 35, door: { x: 830, y: 555 } },
  },

  // ==========================================================================
  // 2. TẦNG 1
  // ==========================================================================
  'b_101a': {
    id: 'b_101a',
    code: 'B.101A',
    name: 'TT ĐTTX - Viện ĐTSĐH',
    shortBadge: 'B.101A',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'office',
    description: 'Trung tâm Đào tạo Thường xuyên & Viện Đào tạo Sau Đại học - Tòa B',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Từ sảnh Tầng trệt, đi đến Cầu Thang 1 (CT1).',
        'Đi thang bộ lên Tầng 1.',
        'Bước ra hành lang, rẽ sang phải là phòng B.101A.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 1, bước ra hành lang rẽ phải.',
        'Cửa phòng B.101A nằm ngay bên cạnh cầu thang.',
      ],
    },
    partCoords: { x: 30, y: 30, width: 330, height: 190, door: { x: 330, y: 220 } },
    masterCoords: { x: 20, y: 100, width: 180, height: 120, door: { x: 190, y: 220 } },
  },
  'b_1_ct1': {
    id: 'b_1_ct1',
    code: 'CT1',
    name: 'Cầu Thang Bộ 1',
    shortBadge: 'CT1',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'stairs',
    description: 'Cầu thang bộ trục chính Phần 1 Tầng 1',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Từ Tầng trệt đi thang bộ CT1 lên Tầng 1.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 1 Tầng 1.'],
    },
    partCoords: { x: 380, y: 30, width: 110, height: 190, door: { x: 435, y: 220 } },
    masterCoords: { x: 205, y: 100, width: 50, height: 120, door: { x: 220, y: 220 } },
  },
  'b_101': {
    id: 'b_101',
    code: 'B.101',
    name: 'Phòng Học B.101',
    shortBadge: 'P.101',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.101 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 1.',
        'Bước ra hành lang, rẽ trái.',
        'Phòng B.101 là phòng đầu tiên bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 1, bước ra hành lang rẽ trái.',
        'Cửa phòng B.101 nằm ngay trước mặt.',
      ],
    },
    partCoords: { x: 510, y: 30, width: 150, height: 190, door: { x: 535, y: 220 } },
    masterCoords: { x: 260, y: 100, width: 70, height: 120, door: { x: 280, y: 220 } },
  },
  'b_102': {
    id: 'b_102',
    code: 'B.102',
    name: 'Phòng Học B.102',
    shortBadge: 'P.102',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.102 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 1.',
        'Rẽ trái đi dọc hành lang qua phòng B.101.',
        'Phòng B.102 nằm ở vị trí thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 1, đi theo hành lang 8m.',
        'Phòng B.102 nằm ở giữa phòng B.101 và B.103.',
      ],
    },
    partCoords: { x: 680, y: 30, width: 150, height: 190, door: { x: 705, y: 220 } },
    masterCoords: { x: 335, y: 100, width: 70, height: 120, door: { x: 355, y: 220 } },
  },
  'b_103': {
    id: 'b_103',
    code: 'B.103',
    name: 'Phòng Học B.103',
    shortBadge: 'P.103',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.103 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 24,
    walkingSeconds: 28,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 1.',
        'Đi theo hành lang qua phòng B.102.',
        'Phòng B.103 nằm ở cuối dãy Phần 1 Tầng 1.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 1, đi dọc hành lang 15m.',
        'Phòng B.103 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 850, y: 30, width: 150, height: 190, door: { x: 875, y: 220 } },
    masterCoords: { x: 410, y: 100, width: 70, height: 120, door: { x: 430, y: 220 } },
  },

  // --- Phần 2 (Tầng 1) ---
  'b_1_wc': {
    id: 'b_1_wc',
    code: 'WC',
    name: 'Nhà Vệ Sinh (WC Nam / Nữ)',
    shortBadge: 'WC',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'restroom',
    description: 'Khu vệ sinh công cộng Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.wcBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 2 tới Tầng 1, rẽ phải là khu WC.'],
      fromNearestStairs: ['Từ Cầu Thang 2 Tầng 1, bước ra rẽ phải 3m là tới WC.'],
    },
    partCoords: { x: 30, y: 20, width: 130, height: 95, door: { x: 140, y: 115 } },
    masterCoords: { x: 410, y: 40, width: 70, height: 55, door: { x: 450, y: 95 } },
  },
  'b_1_ct2': {
    id: 'b_1_ct2',
    code: 'CT2',
    name: 'Cầu Thang Bộ 2',
    shortBadge: 'CT2',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'stairs',
    description: 'Cầu thang trung tâm khối Phần 2 Tầng 1',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Đi cầu thang CT2 từ Tầng trệt lên Tầng 1.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 2 Tầng 1.'],
    },
    partCoords: { x: 30, y: 125, width: 130, height: 105, door: { x: 140, y: 230 } },
    masterCoords: { x: 490, y: 40, width: 40, height: 75, door: { x: 495, y: 115 } },
  },
  'b_104': {
    id: 'b_104',
    code: 'B.104',
    name: 'Phòng Học B.104',
    shortBadge: 'P.104',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.104 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 1.',
        'Bước ra hành lang, rẽ sang bên phải.',
        'Phòng B.104 là phòng đầu tiên.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 1, bước ra rẽ phải.',
        'Cửa phòng B.104 nằm ngay cạnh.',
      ],
    },
    partCoords: { x: 180, y: 20, width: 200, height: 210, door: { x: 210, y: 230 } },
    masterCoords: { x: 535, y: 40, width: 70, height: 165, door: { x: 550, y: 205 } },
  },
  'b_105': {
    id: 'b_105',
    code: 'B.105',
    name: 'Phòng Học B.105',
    shortBadge: 'P.105',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.105 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 1.',
        'Đi dọc hành lang qua phòng B.104.',
        'Phòng B.105 nằm ở gian thứ hai bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 1, đi theo hành lang 10m.',
        'Phòng B.105 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 400, y: 20, width: 200, height: 210, door: { x: 430, y: 230 } },
    masterCoords: { x: 610, y: 40, width: 70, height: 165, door: { x: 625, y: 205 } },
  },
  'b_106': {
    id: 'b_106',
    code: 'B.106',
    name: 'Phòng Học B.106',
    shortBadge: 'P.106',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.106 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 26,
    walkingSeconds: 30,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 1.',
        'Đi tiếp hành lang qua phòng B.105.',
        'Phòng B.106 nằm ở gian thứ ba bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 1, đi thẳng dọc hành lang 18m.',
        'Phòng B.106 nằm cạnh phòng B.107.',
      ],
    },
    partCoords: { x: 620, y: 20, width: 200, height: 210, door: { x: 650, y: 230 } },
    masterCoords: { x: 685, y: 40, width: 70, height: 165, door: { x: 700, y: 205 } },
  },
  'b_107': {
    id: 'b_107',
    code: 'B.107',
    name: 'Phòng Học B.107',
    shortBadge: 'P.107',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.107 Tầng 1 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 34,
    walkingSeconds: 40,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 1.',
        'Đi hết hành lang Phần 2 về phía góc giao với Cánh Đông.',
        'Phòng B.107 nằm ở cuối dãy.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 1, đi thẳng hết hành lang Phần 2 khoảng 25m.',
        'Phòng B.107 nằm ngay góc rẽ sang Phần 3.',
      ],
    },
    partCoords: { x: 840, y: 20, width: 200, height: 210, door: { x: 870, y: 230 } },
    masterCoords: { x: 760, y: 40, width: 70, height: 165, door: { x: 775, y: 205 } },
  },

  // --- Phần 3 (Tầng 1) ---
  'b_1_goc': {
    id: 'b_1_goc',
    code: 'B.GÓC',
    name: 'Phòng Chức Năng Góc Tầng 1',
    shortBadge: 'GÓC',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'office',
    description: 'Phòng chức năng góc chuyển tiếp Tầng 1',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 3 tới Tầng 1, rẽ sang góc chuyển tiếp.'],
      fromNearestStairs: ['Từ Cầu Thang 3 Tầng 1, rẽ trái ra góc sảnh.'],
    },
    partCoords: { x: 30, y: 20, width: 100, height: 95, door: { x: 80, y: 115 } },
    masterCoords: { x: 835, y: 40, width: 145, height: 120, door: { x: 845, y: 165 } },
  },
  'b_1_ct3': {
    id: 'b_1_ct3',
    code: 'CT3',
    name: 'Cầu Thang Bộ 3',
    shortBadge: 'CT3',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ đầu Cánh Đông Tầng 1',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT3 từ Tầng trệt lên Tầng 1.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 3 Tầng 1.'],
    },
    partCoords: { x: 30, y: 125, width: 100, height: 105, door: { x: 110, y: 230 } },
    masterCoords: { x: 865, y: 165, width: 115, height: 75, door: { x: 865, y: 200 } },
  },
  'b_108': {
    id: 'b_108',
    code: 'B.108',
    name: 'Phòng Học B.108',
    shortBadge: 'P.108',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.108 Tầng 1 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 1.',
        'Bước ra hành lang Cánh Đông.',
        'Phòng B.108 nằm ngay trước mặt.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 1, bước ra rẽ phải.',
        'Phòng B.108 là phòng đầu tiên.',
      ],
    },
    partCoords: { x: 150, y: 20, width: 190, height: 210, door: { x: 175, y: 230 } },
    masterCoords: { x: 865, y: 245, width: 115, height: 80, door: { x: 860, y: 285 } },
  },
  'b_109': {
    id: 'b_109',
    code: 'B.109',
    name: 'Phòng Học B.109',
    shortBadge: 'P.109',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.109 Tầng 1 Cánh Đông',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 18,
    walkingSeconds: 20,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 1.',
        'Đi dọc hành lang Cánh Đông qua phòng B.108.',
        'Phòng B.109 nằm ở phòng thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 1, đi dọc hành lang 10m.',
        'Phòng B.109 nằm giữa phòng B.108 và B.110.',
      ],
    },
    partCoords: { x: 360, y: 20, width: 190, height: 210, door: { x: 385, y: 230 } },
    masterCoords: { x: 865, y: 330, width: 115, height: 80, door: { x: 860, y: 370 } },
  },
  'b_110': {
    id: 'b_110',
    code: 'B.110',
    name: 'Phòng Học B.110',
    shortBadge: 'P.110',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.110 Tầng 1 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 16,
    walkingSeconds: 18,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 1.',
        'Đi ngược lên hành lang Cánh Đông 10m.',
        'Phòng B.110 nằm bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 1, đi theo hành lang 10m.',
        'Phòng B.110 nằm ở phòng thứ hai tính từ Cầu Thang 4.',
      ],
    },
    partCoords: { x: 570, y: 20, width: 190, height: 210, door: { x: 595, y: 230 } },
    masterCoords: { x: 865, y: 415, width: 115, height: 80, door: { x: 860, y: 455 } },
  },
  'b_111': {
    id: 'b_111',
    code: 'B.111',
    name: 'Phòng Học B.111',
    shortBadge: 'P.111',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.111 Tầng 1 Cánh Đông (cạnh Cầu Thang 4)',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 1.',
        'Bước ra hành lang, rẽ sang phải.',
        'Phòng B.111 nằm ngay cạnh cửa cầu thang.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 1, bước ra rẽ phải.',
        'Cửa phòng B.111 nằm ngay trước mặt bạn.',
      ],
    },
    partCoords: { x: 780, y: 20, width: 190, height: 210, door: { x: 805, y: 230 } },
    masterCoords: { x: 865, y: 500, width: 115, height: 80, door: { x: 860, y: 540 } },
  },
  'b_1_ct4': {
    id: 'b_1_ct4',
    code: 'CT4',
    name: 'Cầu Thang Bộ 4',
    shortBadge: 'CT4',
    floor: 'floor1',
    floorLabel: 'Tầng 1',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ cuối Cánh Đông Tầng 1',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT4 từ Tầng trệt lên Tầng 1.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 4 Tầng 1.'],
    },
    partCoords: { x: 990, y: 125, width: 100, height: 105, door: { x: 990, y: 230 } },
    masterCoords: { x: 830, y: 545, width: 35, height: 35, door: { x: 830, y: 555 } },
  },

  // ==========================================================================
  // 3. TẦNG 2
  // ==========================================================================
  'b_201a': {
    id: 'b_201a',
    code: 'B.201A',
    name: 'Phòng Chuyên Đề',
    shortBadge: 'B.201A',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'office',
    description: 'Phòng Hội Thảo Chuyên Đề & Sinh Hoạt Khoa Học - Tòa B',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Từ sảnh Tầng trệt, lên Cầu Thang 1 tới Tầng 2.',
        'Bước ra hành lang, rẽ sang bên tay phải.',
        'Phòng Chuyên Đề B.201A nằm ngay bên cạnh.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 2, bước ra hành lang rẽ phải.',
        'Cửa phòng B.201A nằm ngay cạnh cầu thang.',
      ],
    },
    partCoords: { x: 30, y: 30, width: 330, height: 190, door: { x: 330, y: 220 } },
    masterCoords: { x: 20, y: 100, width: 180, height: 120, door: { x: 190, y: 220 } },
  },
  'b_2_ct1': {
    id: 'b_2_ct1',
    code: 'CT1',
    name: 'Cầu Thang Bộ 1',
    shortBadge: 'CT1',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'stairs',
    description: 'Cầu thang bộ trục chính Phần 1 Tầng 2',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT1 từ Tầng trệt lên Tầng 2.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 1 Tầng 2.'],
    },
    partCoords: { x: 380, y: 30, width: 110, height: 190, door: { x: 435, y: 220 } },
    masterCoords: { x: 205, y: 100, width: 50, height: 120, door: { x: 220, y: 220 } },
  },
  'b_201': {
    id: 'b_201',
    code: 'B.201',
    name: 'Phòng Học B.201',
    shortBadge: 'P.201',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.201 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 2.',
        'Bước ra hành lang, rẽ trái.',
        'Phòng B.201 là phòng đầu tiên bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 2, bước ra hành lang rẽ trái.',
        'Cửa phòng B.201 nằm ngay trước mặt.',
      ],
    },
    partCoords: { x: 510, y: 30, width: 150, height: 190, door: { x: 535, y: 220 } },
    masterCoords: { x: 260, y: 100, width: 70, height: 120, door: { x: 280, y: 220 } },
  },
  'b_202': {
    id: 'b_202',
    code: 'B.202',
    name: 'Phòng Học B.202',
    shortBadge: 'P.202',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.202 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 2.',
        'Đi theo hành lang qua phòng B.201.',
        'Phòng B.202 nằm ở phòng thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 2, đi dọc hành lang 8m.',
        'Phòng B.202 nằm giữa phòng B.201 và B.203.',
      ],
    },
    partCoords: { x: 680, y: 30, width: 150, height: 190, door: { x: 705, y: 220 } },
    masterCoords: { x: 335, y: 100, width: 70, height: 120, door: { x: 355, y: 220 } },
  },
  'b_203': {
    id: 'b_203',
    code: 'B.203',
    name: 'Phòng Học B.203',
    shortBadge: 'P.203',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.203 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 24,
    walkingSeconds: 28,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 2.',
        'Đi dọc hành lang qua phòng B.202.',
        'Phòng B.203 nằm ở cuối dãy Phần 1 Tầng 2.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 2, đi dọc hành lang 15m.',
        'Phòng B.203 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 850, y: 30, width: 150, height: 190, door: { x: 875, y: 220 } },
    masterCoords: { x: 410, y: 100, width: 70, height: 120, door: { x: 430, y: 220 } },
  },

  // --- Phần 2 (Tầng 2) ---
  'b_2_wc': {
    id: 'b_2_wc',
    code: 'WC',
    name: 'Nhà Vệ Sinh (WC Nam / Nữ)',
    shortBadge: 'WC',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'restroom',
    description: 'Khu vệ sinh công cộng Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.wcBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 2 tới Tầng 2, rẽ phải là khu WC.'],
      fromNearestStairs: ['Từ Cầu Thang 2 Tầng 2, bước ra rẽ phải 3m là tới WC.'],
    },
    partCoords: { x: 30, y: 20, width: 130, height: 95, door: { x: 140, y: 115 } },
    masterCoords: { x: 410, y: 40, width: 70, height: 55, door: { x: 450, y: 95 } },
  },
  'b_2_ct2': {
    id: 'b_2_ct2',
    code: 'CT2',
    name: 'Cầu Thang Bộ 2',
    shortBadge: 'CT2',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'stairs',
    description: 'Cầu thang trung tâm khối Phần 2 Tầng 2',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Đi cầu thang CT2 từ Tầng trệt lên Tầng 2.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 2 Tầng 2.'],
    },
    partCoords: { x: 30, y: 125, width: 130, height: 105, door: { x: 140, y: 230 } },
    masterCoords: { x: 490, y: 40, width: 40, height: 75, door: { x: 495, y: 115 } },
  },
  'b_204': {
    id: 'b_204',
    code: 'B.204',
    name: 'Phòng Học B.204',
    shortBadge: 'P.204',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.204 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 2.',
        'Bước ra hành lang, rẽ sang bên phải.',
        'Phòng B.204 là phòng đầu tiên.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 2, bước ra rẽ phải.',
        'Cửa phòng B.204 nằm ngay cạnh.',
      ],
    },
    partCoords: { x: 180, y: 20, width: 200, height: 210, door: { x: 210, y: 230 } },
    masterCoords: { x: 535, y: 40, width: 70, height: 165, door: { x: 550, y: 205 } },
  },
  'b_205': {
    id: 'b_205',
    code: 'B.205',
    name: 'Phòng Học B.205',
    shortBadge: 'P.205',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.205 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 2.',
        'Đi dọc hành lang qua phòng B.204.',
        'Phòng B.205 nằm ở gian thứ hai bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 2, đi theo hành lang 10m.',
        'Phòng B.205 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 400, y: 20, width: 200, height: 210, door: { x: 430, y: 230 } },
    masterCoords: { x: 610, y: 40, width: 70, height: 165, door: { x: 625, y: 205 } },
  },
  'b_206': {
    id: 'b_206',
    code: 'B.206',
    name: 'Phòng Học B.206',
    shortBadge: 'P.206',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.206 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 26,
    walkingSeconds: 30,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 2.',
        'Đi tiếp hành lang qua phòng B.205.',
        'Phòng B.206 nằm ở gian thứ ba bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 2, đi thẳng dọc hành lang 18m.',
        'Phòng B.206 nằm cạnh phòng B.207.',
      ],
    },
    partCoords: { x: 620, y: 20, width: 200, height: 210, door: { x: 650, y: 230 } },
    masterCoords: { x: 685, y: 40, width: 70, height: 165, door: { x: 700, y: 205 } },
  },
  'b_207': {
    id: 'b_207',
    code: 'B.207',
    name: 'Phòng Học B.207',
    shortBadge: 'P.207',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.207 Tầng 2 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 34,
    walkingSeconds: 40,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 2.',
        'Đi hết hành lang Phần 2 về phía góc giao với Cánh Đông.',
        'Phòng B.207 nằm ở cuối dãy.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 2, đi thẳng hết hành lang Phần 2 khoảng 25m.',
        'Phòng B.207 nằm ngay góc rẽ sang Phần 3.',
      ],
    },
    partCoords: { x: 840, y: 20, width: 200, height: 210, door: { x: 870, y: 230 } },
    masterCoords: { x: 760, y: 40, width: 70, height: 165, door: { x: 775, y: 205 } },
  },

  // --- Phần 3 (Tầng 2) ---
  'b_2_goc': {
    id: 'b_2_goc',
    code: 'B.GÓC',
    name: 'Phòng Chức Năng Góc Tầng 2',
    shortBadge: 'GÓC',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'office',
    description: 'Phòng chức năng góc chuyển tiếp Tầng 2',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 3 tới Tầng 2, rẽ sang góc chuyển tiếp.'],
      fromNearestStairs: ['Từ Cầu Thang 3 Tầng 2, rẽ trái ra góc sảnh.'],
    },
    partCoords: { x: 30, y: 20, width: 100, height: 95, door: { x: 80, y: 115 } },
    masterCoords: { x: 835, y: 40, width: 145, height: 120, door: { x: 845, y: 165 } },
  },
  'b_2_ct3': {
    id: 'b_2_ct3',
    code: 'CT3',
    name: 'Cầu Thang Bộ 3',
    shortBadge: 'CT3',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ đầu Cánh Đông Tầng 2',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT3 từ Tầng trệt lên Tầng 2.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 3 Tầng 2.'],
    },
    partCoords: { x: 30, y: 125, width: 100, height: 105, door: { x: 110, y: 230 } },
    masterCoords: { x: 865, y: 165, width: 115, height: 75, door: { x: 865, y: 200 } },
  },
  'b_208': {
    id: 'b_208',
    code: 'B.208',
    name: 'Phòng Học B.208',
    shortBadge: 'P.208',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.208 Tầng 2 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 2.',
        'Bước ra hành lang Cánh Đông.',
        'Phòng B.208 nằm ngay trước mặt.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 2, bước ra rẽ phải.',
        'Phòng B.208 là phòng đầu tiên.',
      ],
    },
    partCoords: { x: 150, y: 20, width: 190, height: 210, door: { x: 175, y: 230 } },
    masterCoords: { x: 865, y: 245, width: 115, height: 80, door: { x: 860, y: 285 } },
  },
  'b_209': {
    id: 'b_209',
    code: 'B.209',
    name: 'Phòng Học B.209',
    shortBadge: 'P.209',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.209 Tầng 2 Cánh Đông',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 18,
    walkingSeconds: 20,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 2.',
        'Đi dọc hành lang Cánh Đông qua phòng B.208.',
        'Phòng B.209 nằm ở phòng thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 2, đi dọc hành lang 10m.',
        'Phòng B.209 nằm giữa phòng B.208 và B.210.',
      ],
    },
    partCoords: { x: 360, y: 20, width: 190, height: 210, door: { x: 385, y: 230 } },
    masterCoords: { x: 865, y: 330, width: 115, height: 80, door: { x: 860, y: 370 } },
  },
  'b_210': {
    id: 'b_210',
    code: 'B.210',
    name: 'Phòng Học B.210',
    shortBadge: 'P.210',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.210 Tầng 2 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 16,
    walkingSeconds: 18,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 2.',
        'Đi ngược lên hành lang Cánh Đông 10m.',
        'Phòng B.210 nằm bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 2, đi theo hành lang 10m.',
        'Phòng B.210 nằm ở phòng thứ hai tính từ Cầu Thang 4.',
      ],
    },
    partCoords: { x: 570, y: 20, width: 190, height: 210, door: { x: 595, y: 230 } },
    masterCoords: { x: 865, y: 415, width: 115, height: 80, door: { x: 860, y: 455 } },
  },
  'b_211': {
    id: 'b_211',
    code: 'B.211',
    name: 'Phòng Học B.211',
    shortBadge: 'P.211',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.211 Tầng 2 Cánh Đông (cạnh Cầu Thang 4)',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 2.',
        'Bước ra hành lang, rẽ sang phải.',
        'Phòng B.211 nằm ngay cạnh cửa cầu thang.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 2, bước ra rẽ phải.',
        'Cửa phòng B.211 nằm ngay trước mặt bạn.',
      ],
    },
    partCoords: { x: 780, y: 20, width: 190, height: 210, door: { x: 805, y: 230 } },
    masterCoords: { x: 865, y: 500, width: 115, height: 80, door: { x: 860, y: 540 } },
  },
  'b_2_ct4': {
    id: 'b_2_ct4',
    code: 'CT4',
    name: 'Cầu Thang Bộ 4',
    shortBadge: 'CT4',
    floor: 'floor2',
    floorLabel: 'Tầng 2',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ cuối Cánh Đông Tầng 2',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT4 từ Tầng trệt lên Tầng 2.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 4 Tầng 2.'],
    },
    partCoords: { x: 990, y: 125, width: 100, height: 105, door: { x: 990, y: 230 } },
    masterCoords: { x: 830, y: 545, width: 35, height: 35, door: { x: 830, y: 555 } },
  },

  // ==========================================================================
  // 4. TẦNG 3
  // ==========================================================================
  'b_301a': {
    id: 'b_301a',
    code: 'B.301A',
    name: 'TT Thông Tin - Thư Viện',
    shortBadge: 'B.301A',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'office',
    description: 'Trung tâm Thông tin - Thư viện Tòa B (Đại học GTVT TP.HCM)',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Từ sảnh Tầng trệt, lên Cầu Thang 1 tới Tầng 3.',
        'Bước ra hành lang, rẽ sang bên tay phải.',
        'Cửa Trung tâm Thông tin - Thư viện B.301A nằm ngay bên cạnh.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 3, bước ra hành lang rẽ phải.',
        'Cửa phòng B.301A nằm ngay cạnh cầu thang.',
      ],
    },
    partCoords: { x: 30, y: 30, width: 330, height: 190, door: { x: 330, y: 220 } },
    masterCoords: { x: 20, y: 100, width: 180, height: 120, door: { x: 190, y: 220 } },
  },
  'b_3_ct1': {
    id: 'b_3_ct1',
    code: 'CT1',
    name: 'Cầu Thang Bộ 1',
    shortBadge: 'CT1',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'stairs',
    description: 'Cầu thang bộ trục chính Phần 1 Tầng 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT1 từ Tầng trệt lên Tầng 3.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 1 Tầng 3.'],
    },
    partCoords: { x: 380, y: 30, width: 110, height: 190, door: { x: 435, y: 220 } },
    masterCoords: { x: 205, y: 100, width: 50, height: 120, door: { x: 220, y: 220 } },
  },
  'b_301': {
    id: 'b_301',
    code: 'B.301',
    name: 'Phòng Học B.301',
    shortBadge: 'P.301',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.301 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 3.',
        'Bước ra hành lang, rẽ trái.',
        'Phòng B.301 là phòng đầu tiên bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 3, bước ra hành lang rẽ trái.',
        'Cửa phòng B.301 nằm ngay trước mặt.',
      ],
    },
    partCoords: { x: 510, y: 30, width: 150, height: 190, door: { x: 535, y: 220 } },
    masterCoords: { x: 260, y: 100, width: 70, height: 120, door: { x: 280, y: 220 } },
  },
  'b_302': {
    id: 'b_302',
    code: 'B.302',
    name: 'Phòng Học B.302',
    shortBadge: 'P.302',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.302 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 3.',
        'Đi theo hành lang qua phòng B.301.',
        'Phòng B.302 nằm ở phòng thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 3, đi dọc hành lang 8m.',
        'Phòng B.302 nằm giữa phòng B.301 và B.303.',
      ],
    },
    partCoords: { x: 680, y: 30, width: 150, height: 190, door: { x: 705, y: 220 } },
    masterCoords: { x: 335, y: 100, width: 70, height: 120, door: { x: 355, y: 220 } },
  },
  'b_303': {
    id: 'b_303',
    code: 'B.303',
    name: 'Phòng Học B.303',
    shortBadge: 'P.303',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part1',
    partLabel: 'Phần 1 (Khối Nam)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.303 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT1',
    estimatedDistanceMeters: 24,
    walkingSeconds: 28,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 1 tới Tầng 3.',
        'Đi dọc hành lang qua phòng B.302.',
        'Phòng B.303 nằm ở cuối dãy Phần 1 Tầng 3.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 1 Tầng 3, đi dọc hành lang 15m.',
        'Phòng B.303 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 850, y: 30, width: 150, height: 190, door: { x: 875, y: 220 } },
    masterCoords: { x: 410, y: 100, width: 70, height: 120, door: { x: 430, y: 220 } },
  },

  // --- Phần 2 (Tầng 3) ---
  'b_3_wc': {
    id: 'b_3_wc',
    code: 'WC',
    name: 'Nhà Vệ Sinh (WC Nam / Nữ)',
    shortBadge: 'WC',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'restroom',
    description: 'Khu vệ sinh công cộng Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.wcBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 2 tới Tầng 3, rẽ phải là khu WC.'],
      fromNearestStairs: ['Từ Cầu Thang 2 Tầng 3, bước ra rẽ phải 3m là tới WC.'],
    },
    partCoords: { x: 30, y: 20, width: 130, height: 95, door: { x: 140, y: 115 } },
    masterCoords: { x: 410, y: 40, width: 70, height: 55, door: { x: 450, y: 95 } },
  },
  'b_3_ct2': {
    id: 'b_3_ct2',
    code: 'CT2',
    name: 'Cầu Thang Bộ 2',
    shortBadge: 'CT2',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'stairs',
    description: 'Cầu thang trung tâm khối Phần 2 Tầng 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Đi cầu thang CT2 từ Tầng trệt lên Tầng 3.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 2 Tầng 3.'],
    },
    partCoords: { x: 30, y: 125, width: 130, height: 105, door: { x: 140, y: 230 } },
    masterCoords: { x: 490, y: 40, width: 40, height: 75, door: { x: 495, y: 115 } },
  },
  'b_304': {
    id: 'b_304',
    code: 'B.304',
    name: 'Phòng Học B.304',
    shortBadge: 'P.304',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.304 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 3.',
        'Bước ra hành lang, rẽ sang bên phải.',
        'Phòng B.304 là phòng đầu tiên.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 3, bước ra rẽ phải.',
        'Cửa phòng B.304 nằm ngay cạnh.',
      ],
    },
    partCoords: { x: 180, y: 20, width: 200, height: 210, door: { x: 210, y: 230 } },
    masterCoords: { x: 535, y: 40, width: 70, height: 165, door: { x: 550, y: 205 } },
  },
  'b_305': {
    id: 'b_305',
    code: 'B.305',
    name: 'Phòng Học B.305',
    shortBadge: 'P.305',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.305 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 18,
    walkingSeconds: 22,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 3.',
        'Đi dọc hành lang qua phòng B.304.',
        'Phòng B.305 nằm ở gian thứ hai bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 3, đi theo hành lang 10m.',
        'Phòng B.305 nằm bên tay trái.',
      ],
    },
    partCoords: { x: 400, y: 20, width: 200, height: 210, door: { x: 430, y: 230 } },
    masterCoords: { x: 610, y: 40, width: 70, height: 165, door: { x: 625, y: 205 } },
  },
  'b_306': {
    id: 'b_306',
    code: 'B.306',
    name: 'Phòng Học B.306',
    shortBadge: 'P.306',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.306 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 26,
    walkingSeconds: 30,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 3.',
        'Đi tiếp hành lang qua phòng B.305.',
        'Phòng B.306 nằm ở gian thứ ba bên tay trái.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 3, đi thẳng dọc hành lang 18m.',
        'Phòng B.306 nằm cạnh phòng B.307.',
      ],
    },
    partCoords: { x: 620, y: 20, width: 200, height: 210, door: { x: 650, y: 230 } },
    masterCoords: { x: 685, y: 40, width: 70, height: 165, door: { x: 700, y: 205 } },
  },
  'b_307': {
    id: 'b_307',
    code: 'B.307',
    name: 'Phòng Học B.307',
    shortBadge: 'P.307',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part2',
    partLabel: 'Phần 2 (Khối Bắc)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.307 Tầng 3 Tòa B',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT2',
    estimatedDistanceMeters: 34,
    walkingSeconds: 40,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 2 tới Tầng 3.',
        'Đi hết hành lang Phần 2 về phía góc giao với Cánh Đông.',
        'Phòng B.307 nằm ở cuối dãy.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 2 Tầng 3, đi thẳng hết hành lang Phần 2 khoảng 25m.',
        'Phòng B.307 nằm ngay góc rẽ sang Phần 3.',
      ],
    },
    partCoords: { x: 840, y: 20, width: 200, height: 210, door: { x: 870, y: 230 } },
    masterCoords: { x: 760, y: 40, width: 70, height: 165, door: { x: 775, y: 205 } },
  },

  // --- Phần 3 (Tầng 3) ---
  'b_3_goc': {
    id: 'b_3_goc',
    code: 'B.GÓC',
    name: 'Phòng Thư Viện Mở / Góc',
    shortBadge: 'GÓC',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'office',
    description: 'Phòng chức năng đọc sách mở tại góc chuyển tiếp Tầng 3',
    fillColor: TOA_B_COLORS.roomOffice,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 12,
    walkingSeconds: 15,
    directions: {
      fromGroundGate: ['Lên Cầu Thang 3 tới Tầng 3, rẽ sang góc chuyển tiếp.'],
      fromNearestStairs: ['Từ Cầu Thang 3 Tầng 3, rẽ trái ra góc sảnh.'],
    },
    partCoords: { x: 30, y: 20, width: 100, height: 95, door: { x: 80, y: 115 } },
    masterCoords: { x: 835, y: 40, width: 145, height: 120, door: { x: 845, y: 165 } },
  },
  'b_3_ct3': {
    id: 'b_3_ct3',
    code: 'CT3',
    name: 'Cầu Thang Bộ 3',
    shortBadge: 'CT3',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ đầu Cánh Đông Tầng 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT3 từ Tầng trệt lên Tầng 3.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 3 Tầng 3.'],
    },
    partCoords: { x: 30, y: 125, width: 100, height: 105, door: { x: 110, y: 230 } },
    masterCoords: { x: 865, y: 165, width: 115, height: 75, door: { x: 865, y: 200 } },
  },
  'b_308': {
    id: 'b_308',
    code: 'B.308',
    name: 'Phòng Học B.308',
    shortBadge: 'P.308',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.308 Tầng 3 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 10,
    walkingSeconds: 12,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 3.',
        'Bước ra hành lang Cánh Đông.',
        'Phòng B.308 nằm ngay trước mặt.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 3, bước ra rẽ phải.',
        'Phòng B.308 là phòng đầu tiên.',
      ],
    },
    partCoords: { x: 150, y: 20, width: 190, height: 210, door: { x: 175, y: 230 } },
    masterCoords: { x: 865, y: 245, width: 115, height: 80, door: { x: 860, y: 285 } },
  },
  'b_309': {
    id: 'b_309',
    code: 'B.309',
    name: 'Phòng Học B.309',
    shortBadge: 'P.309',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.309 Tầng 3 Cánh Đông',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT3',
    estimatedDistanceMeters: 18,
    walkingSeconds: 20,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 3 tới Tầng 3.',
        'Đi dọc hành lang Cánh Đông qua phòng B.308.',
        'Phòng B.309 nằm ở phòng thứ hai.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 3 Tầng 3, đi dọc hành lang 10m.',
        'Phòng B.309 nằm giữa phòng B.308 và B.310.',
      ],
    },
    partCoords: { x: 360, y: 20, width: 190, height: 210, door: { x: 385, y: 230 } },
    masterCoords: { x: 865, y: 330, width: 115, height: 80, door: { x: 860, y: 370 } },
  },
  'b_310': {
    id: 'b_310',
    code: 'B.310',
    name: 'Phòng Học B.310',
    shortBadge: 'P.310',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.310 Tầng 3 Cánh Đông',
    fillColor: TOA_B_COLORS.roomPrimary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 16,
    walkingSeconds: 18,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 3.',
        'Đi ngược lên hành lang Cánh Đông 10m.',
        'Phòng B.310 nằm bên tay phải.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 3, đi theo hành lang 10m.',
        'Phòng B.310 nằm ở phòng thứ hai tính từ Cầu Thang 4.',
      ],
    },
    partCoords: { x: 570, y: 20, width: 190, height: 210, door: { x: 595, y: 230 } },
    masterCoords: { x: 865, y: 415, width: 115, height: 80, door: { x: 860, y: 455 } },
  },
  'b_311': {
    id: 'b_311',
    code: 'B.311',
    name: 'Phòng Học B.311',
    shortBadge: 'P.311',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học giảng đường B.311 Tầng 3 Cánh Đông (cạnh Cầu Thang 4)',
    fillColor: TOA_B_COLORS.roomSecondary,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 8,
    walkingSeconds: 10,
    directions: {
      fromGroundGate: [
        'Lên Cầu Thang 4 tới Tầng 3.',
        'Bước ra hành lang, rẽ sang phải.',
        'Phòng B.311 nằm ngay cạnh cửa cầu thang.',
      ],
      fromNearestStairs: [
        'Từ Cầu Thang 4 Tầng 3, bước ra rẽ phải.',
        'Cửa phòng B.311 nằm ngay trước mặt bạn.',
      ],
    },
    partCoords: { x: 780, y: 20, width: 190, height: 210, door: { x: 805, y: 230 } },
    masterCoords: { x: 865, y: 500, width: 115, height: 80, door: { x: 860, y: 540 } },
  },
  'b_3_ct4': {
    id: 'b_3_ct4',
    code: 'CT4',
    name: 'Cầu Thang Bộ 4',
    shortBadge: 'CT4',
    floor: 'floor3',
    floorLabel: 'Tầng 3',
    part: 'part3',
    partLabel: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ cuối Cánh Đông Tầng 3',
    fillColor: TOA_B_COLORS.stairBg,
    nearestStairs: 'CT4',
    estimatedDistanceMeters: 5,
    walkingSeconds: 6,
    directions: {
      fromGroundGate: ['Lên thang bộ CT4 từ Tầng trệt lên Tầng 3.'],
      fromNearestStairs: ['Bạn đang đứng tại Cầu Thang 4 Tầng 3.'],
    },
    partCoords: { x: 990, y: 125, width: 100, height: 105, door: { x: 990, y: 230 } },
    masterCoords: { x: 830, y: 545, width: 35, height: 35, door: { x: 830, y: 555 } },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllRooms(): RoomBInfo[] {
  return Object.values(TOA_B_ROOMS);
}

export function getRoomsByFloorAndPart(floor: BuildingFloor, part: BuildingPart): RoomBInfo[] {
  return Object.values(TOA_B_ROOMS).filter(
    (room) => room.floor === floor && room.part === part
  );
}

export function getRoomsByFloor(floor: BuildingFloor): RoomBInfo[] {
  return Object.values(TOA_B_ROOMS).filter((room) => room.floor === floor);
}

export function searchRooms(query: string): RoomBInfo[] {
  if (!query || query.trim() === '') return [];
  const q = query.toLowerCase().trim();
  return Object.values(TOA_B_ROOMS).filter((room) => {
    return (
      room.code.toLowerCase().includes(q) ||
      room.name.toLowerCase().includes(q) ||
      room.shortBadge.toLowerCase().includes(q) ||
      room.description.toLowerCase().includes(q)
    );
  });
}

export function getRoomById(id: string): RoomBInfo | undefined {
  return TOA_B_ROOMS[id];
}

export function getRoomByCode(rawCode: string): RoomBInfo | undefined {
  const cleaned = rawCode.trim().toUpperCase();
  const normalized = !cleaned.includes('.') && /^B\d/.test(cleaned)
    ? `B.${cleaned.slice(1)}`
    : cleaned;
  return Object.values(TOA_B_ROOMS).find(
    (room) => room.code.toUpperCase() === normalized || room.code.toUpperCase() === cleaned
  );
}

export function getRecommendedGateForPart(part: BuildingPart): BuildingBGateId {
  if (part === 'part1') return 'gate1_parking';
  if (part === 'part2') return 'gate2_north_south';
  return 'gate3_north_east';
}
