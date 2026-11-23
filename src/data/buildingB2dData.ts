export interface RoomBInfo {
  id: string;
  code: string;
  name: string;
  section: 'part1' | 'part2' | 'part3' | 'transition';
  sectionName: string;
  category: 'classroom' | 'office' | 'stairs' | 'restroom' | 'corridor' | 'corner';
  description: string;
  fillColor: string;
  doorCoords: { x: number; y: number };
}

export const TOA_B_COLORS = {
  bgCorridor: '#F3EFEA',   // Nền hành lang kem sáng ấm
  wallBorder: '#4A4540',   // Viền tường than chì đậm
  officeMustard: '#CDB07A',// Phòng B.2 Tạp chí / Phòng góc (Vàng mù tạt ấm)
  classroomTaupe: '#A89B8C',// Phòng học B.001-B.003, B.008-B.011 (Taupe ấm)
  classroomIvory: '#FAF2E6',// Phòng học B.104-B.107 (Kem nhạt sang trọng)
  stairsCharcoal: '#605B55',// Cầu thang xám than
  stairsStripe: '#48443F',  // Vân bậc cầu thang
  restroomSteel: '#B5C2C9', // Nhà vệ sinh WC (Xanh xám thép)
  routeTeal: '#0F4C5C',     // Tuyến đường dẫn lối (Deep Teal)
  textDark: '#1A1817',      // Chữ đen đậm rõ nét
  textLight: '#FFFFFF',     // Chữ trắng nổi bật trên nền đậm
};

export const TOA_B_ROOMS: Record<string, RoomBInfo> = {
  // PHẦN 1
  'b_002_mag': {
    id: 'b_002_mag',
    code: 'B.2',
    name: 'Tạp chí Khoa học Công nghệ GTVT',
    section: 'part1',
    sectionName: 'Phần 1 (Cánh Tây)',
    category: 'office',
    description: 'Tạp chí Khoa học Công nghệ Giao thông Vận tải - Trường ĐH Giao thông Vận tải TP.HCM',
    fillColor: TOA_B_COLORS.officeMustard,
    doorCoords: { x: 360, y: 400 },
  },
  'b_stair_1': {
    id: 'b_stair_1',
    code: 'CT1',
    name: 'Cầu Thang Bộ 1',
    section: 'part1',
    sectionName: 'Phần 1 (Cánh Tây)',
    category: 'stairs',
    description: 'Cầu thang bộ kết nối Tầng trệt lên Tầng 1, 2, 3 (Nằm giữa B.2 và B.001)',
    fillColor: TOA_B_COLORS.stairsCharcoal,
    doorCoords: { x: 420, y: 320 },
  },
  'b_001': {
    id: 'b_001',
    code: 'B.001',
    name: 'Phòng B.001',
    section: 'part1',
    sectionName: 'Phần 1 (Cánh Tây)',
    category: 'classroom',
    description: 'Phòng học / Nghiệp vụ Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 500, y: 320 },
  },
  'b_002': {
    id: 'b_002',
    code: 'B.002',
    name: 'Phòng B.002',
    section: 'part1',
    sectionName: 'Phần 1 (Cánh Tây)',
    category: 'classroom',
    description: 'Phòng học / Nghiệp vụ Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 650, y: 320 },
  },
  'b_003': {
    id: 'b_003',
    code: 'B.003',
    name: 'Phòng B.003',
    section: 'part1',
    sectionName: 'Phần 1 (Cánh Tây)',
    category: 'classroom',
    description: 'Phòng học / Nghiệp vụ Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 800, y: 320 },
  },

  // PHẦN CHUYỂN TIẾP (TRANSITION & WC)
  'b_wc': {
    id: 'b_wc',
    code: 'WC',
    name: 'Khu Vệ Sinh (WC)',
    section: 'transition',
    sectionName: 'Khu vực Trung tâm',
    category: 'restroom',
    description: 'Nhà vệ sinh cán bộ / sinh viên Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.restroomSteel,
    doorCoords: { x: 440, y: 150 },
  },
  'b_stair_2': {
    id: 'b_stair_2',
    code: 'CT2',
    name: 'Cầu Thang Bộ 2',
    section: 'part2',
    sectionName: 'Phần 2 (Cánh Bắc)',
    category: 'stairs',
    description: 'Cầu thang bộ trung tâm nối Phần 1 sang Phần 2',
    fillColor: TOA_B_COLORS.stairsCharcoal,
    doorCoords: { x: 80, y: 320 },
  },

  // PHẦN 2
  'b_104': {
    id: 'b_104',
    code: 'B.104',
    name: 'Phòng B.104',
    section: 'part2',
    sectionName: 'Phần 2 (Cánh Bắc)',
    category: 'classroom',
    description: 'Phòng học B.104 Tòa B (Ghi theo sơ đồ gốc mặt bằng)',
    fillColor: TOA_B_COLORS.classroomIvory,
    doorCoords: { x: 200, y: 360 },
  },
  'b_105': {
    id: 'b_105',
    code: 'B.105',
    name: 'Phòng B.105',
    section: 'part2',
    sectionName: 'Phần 2 (Cánh Bắc)',
    category: 'classroom',
    description: 'Phòng học B.105 Tòa B (Ghi theo sơ đồ gốc mặt bằng)',
    fillColor: TOA_B_COLORS.classroomIvory,
    doorCoords: { x: 410, y: 360 },
  },
  'b_106': {
    id: 'b_106',
    code: 'B.106',
    name: 'Phòng B.106',
    section: 'part2',
    sectionName: 'Phần 2 (Cánh Bắc)',
    category: 'classroom',
    description: 'Phòng học B.106 Tòa B (Ghi theo sơ đồ gốc mặt bằng)',
    fillColor: TOA_B_COLORS.classroomIvory,
    doorCoords: { x: 620, y: 360 },
  },
  'b_107': {
    id: 'b_107',
    code: 'B.107',
    name: 'Phòng B.107',
    section: 'part2',
    sectionName: 'Phần 2 (Cánh Bắc)',
    category: 'classroom',
    description: 'Phòng học B.107 Tòa B (Ghi theo sơ đồ gốc mặt bằng)',
    fillColor: TOA_B_COLORS.classroomIvory,
    doorCoords: { x: 830, y: 360 },
  },

  // PHÒNG GÓC (CORNER)
  'b_corner': {
    id: 'b_corner',
    code: 'B.GÓC',
    name: 'Khu Vực Góc Tòa B',
    section: 'transition',
    sectionName: 'Khu vực Góc',
    category: 'corner',
    description: 'Khối phòng góc chuyển tiếp giữa cánh ngang và cánh dọc Tòa B',
    fillColor: TOA_B_COLORS.officeMustard,
    doorCoords: { x: 920, y: 220 },
  },

  // PHẦN 3
  'b_stair_3': {
    id: 'b_stair_3',
    code: 'CT3',
    name: 'Cầu Thang Bộ 3',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ đầu phía Bắc cánh dọc Tòa B',
    fillColor: TOA_B_COLORS.stairsCharcoal,
    doorCoords: { x: 70, y: 320 },
  },
  'b_008': {
    id: 'b_008',
    code: 'B.008',
    name: 'Phòng B.008',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học B.008 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 190, y: 320 },
  },
  'b_009': {
    id: 'b_009',
    code: 'B.009',
    name: 'Phòng B.009',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học B.009 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 390, y: 320 },
  },
  'b_010': {
    id: 'b_010',
    code: 'B.010',
    name: 'Phòng B.010',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học B.010 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 590, y: 320 },
  },
  'b_011': {
    id: 'b_011',
    code: 'B.011',
    name: 'Phòng B.011',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'classroom',
    description: 'Phòng học B.011 Tầng trệt Tòa B',
    fillColor: TOA_B_COLORS.classroomTaupe,
    doorCoords: { x: 790, y: 320 },
  },
  'b_stair_4': {
    id: 'b_stair_4',
    code: 'CT4',
    name: 'Cầu Thang Bộ 4',
    section: 'part3',
    sectionName: 'Phần 3 (Cánh Đông)',
    category: 'stairs',
    description: 'Cầu thang bộ góc Nam (cuối dãy hành lang Tòa B)',
    fillColor: TOA_B_COLORS.stairsCharcoal,
    doorCoords: { x: 950, y: 350 },
  },
};
