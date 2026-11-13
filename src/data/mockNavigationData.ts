import { CampusData, BuildingData, FloorData, QrNodeData, RoomData, NavigationStep, NavigationRouteResult } from '@/types/navigation';
import realRoomsJson from './realRoomsData.json';

export const MOCK_CAMPUSES: CampusData[] = [
  {
    id: 'campus_cs1',
    code: 'cs1',
    name: 'Cơ sở 1 - Số 2 Võ Oanh, P.25, Bình Thạnh',
    overviewModelUrl: '/models/cs1/cs1_overview.glb',
  },
  {
    id: 'campus_cs2',
    code: 'cs2',
    name: 'Cơ sở 2 - Trương Văn Hải, Tăng Nhơn Phú B, TP. Thủ Đức',
    overviewModelUrl: '/models/cs2/cs2_overview.glb',
  },
  {
    id: 'campus_cs3',
    code: 'cs3',
    name: 'Cơ sở 3 - Nguyễn Tri Phương, P.14, Quận 10',
    overviewModelUrl: '/models/cs3/cs3_overview.glb',
  },
];

export const MOCK_BUILDINGS: BuildingData[] = [
  {
    id: 'bld_toa_a',
    code: 'toa_a',
    name: 'Tòa Nhà A (Hiệu Bộ & Đào Tạo)',
    campusId: 'campus_cs1',
    hubCoordinates: [2.0, 0, 18.2],
  },
  {
    id: 'bld_toa_b',
    code: 'toa_b',
    name: 'Tòa Nhà B (Khoa CNTT & Lab)',
    campusId: 'campus_cs1',
    hubCoordinates: [-17.8, 0, -8.7],
  },
  {
    id: 'bld_toa_c',
    code: 'toa_c',
    name: 'Tòa Nhà C (Giảng Đường Tổng Hợp)',
    campusId: 'campus_cs1',
    hubCoordinates: [8.7, 0, -8.7],
  },
  {
    id: 'bld_toa_d',
    code: 'toa_d',
    name: 'Tòa Nhà D (Giảng Đường Chuyên Đề)',
    campusId: 'campus_cs1',
    hubCoordinates: [-3.6, 0, -21.5],
  },
  {
    id: 'bld_toa_e',
    code: 'toa_e',
    name: 'Tòa Nhà E (Viện Đào Tạo Quốc Tế)',
    campusId: 'campus_cs1',
    hubCoordinates: [25.9, 0, 14.7],
  },
  {
    id: 'bld_toa_f',
    code: 'toa_f',
    name: 'Tòa Nhà F (Khu Giảng Đường Tây Bắc)',
    campusId: 'campus_cs1',
    hubCoordinates: [-19.9, 0, -17.3],
  },
  {
    id: 'bld_toa_h',
    code: 'toa_h',
    name: 'Tòa Nhà H (Hành Chính & Giảng Đường 7 Tầng)',
    campusId: 'campus_cs3',
    hubCoordinates: [-4.5, 0, 7],
  },
  {
    id: 'bld_toa_i_lon',
    code: 'toa_i_lon',
    name: 'Tòa Nhà I Lớn (Khu Giảng Đường 5 Tầng)',
    campusId: 'campus_cs3',
    hubCoordinates: [-13.5, 0, -15.4],
  },
  {
    id: 'bld_toa_k',
    code: 'toa_k',
    name: 'Tòa Nhà K (Viện Nghiên Cứu & Đào Tạo)',
    campusId: 'campus_cs3',
    hubCoordinates: [15.0, 0, 4.2],
  },
  {
    id: 'bld_xuong_oto',
    code: 'xuong_oto',
    name: 'Tòa I Nhỏ (Xưởng Thực Hành Ô Tô - Cơ Khí Động Lực)',
    campusId: 'campus_cs3',
    hubCoordinates: [-24.0, 0, 3.5],
  },
  {
    id: 'bld_toa_j',
    code: 'toa_j',
    name: 'Tòa Nhà J (Khu Giảng Đường 6 Tầng)',
    campusId: 'campus_cs3',
    hubCoordinates: [13.5, 0, -12],
  },
  {
    id: 'bld_toa_i_duong',
    code: 'toa_i_duong',
    name: 'Nhà I (Khu Đất Phụ Trợ & Dịch Vụ)',
    campusId: 'campus_cs3',
    hubCoordinates: [-21.5, 0, -15.4],
  },
  {
    id: 'bld_nha_da_nang',
    code: 'nha_da_nang',
    name: 'Nhà Thi Đấu Đa Năng (Thể Thao & Sự Kiện)',
    campusId: 'campus_cs3',
    hubCoordinates: [22.8, 0, 14.6],
  },
  {
    id: 'bld_toa_l',
    code: 'toa_l',
    name: 'Tòa Nhà L (Trung Tâm Thể Thao UTH Fitness)',
    campusId: 'campus_cs3',
    hubCoordinates: [9.5, 0, 23.5],
  },
];

export const MOCK_FLOORS: FloorData[] = [
  // CS1 Tòa B
  {
    id: 'flr_b_1',
    level: 1,
    name: 'Tầng 1 (Sảnh & VP Khoa)',
    modelUrl: '/models/cs1/toa_b_t1.glb',
    buildingId: 'bld_toa_b',
  },
  {
    id: 'flr_b_2',
    level: 2,
    name: 'Tầng 2 (Phòng Máy & Thực Hành)',
    modelUrl: '/models/cs1/toa_b_t2.glb',
    buildingId: 'bld_toa_b',
  },
  {
    id: 'flr_b_3',
    level: 3,
    name: 'Tầng 3 (Lab Chuyên Sâu & AI)',
    modelUrl: '/models/cs1/toa_b_t3.glb',
    buildingId: 'bld_toa_b',
  },

  // CS3 Tòa H (7 Tầng: Trệt level 0, Tầng 1-6 level 1-6)
  { id: 'flr_h_0', level: 0, name: 'Tầng Trệt (Phòng chức năng H001 - H013 & WC)', modelUrl: '/models/cs3/toa_h_t1.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_1', level: 1, name: 'Tầng 1 (Phòng học H101 - H108 & WC)', modelUrl: '/models/cs3/toa_h_t2.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_2', level: 2, name: 'Tầng 2 (Phòng học H201 - H208 & WC)', modelUrl: '/models/cs3/toa_h_t3.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_3', level: 3, name: 'Tầng 3 (Phòng học H301 - H308 & WC)', modelUrl: '/models/cs3/toa_h_t4.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_4', level: 4, name: 'Tầng 4 (Phòng học H401 - H408 & WC)', modelUrl: '/models/cs3/toa_h_t5.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_5', level: 5, name: 'Tầng 5 (Phòng học H501 - H508 & WC)', modelUrl: '/models/cs3/toa_h_t5.glb', buildingId: 'bld_toa_h' },
  { id: 'flr_h_6', level: 6, name: 'Tầng 6 (Phòng học H601 - H608 & WC)', modelUrl: '/models/cs3/toa_h_t5.glb', buildingId: 'bld_toa_h' },

  // CS3 Tòa I Lớn (5 Tầng: Trệt level 0, Tầng 1-4 level 1-4)
  { id: 'flr_i_lon_0', level: 0, name: 'Tầng Trệt (Phòng học I001, I002 & WC)', modelUrl: '/models/cs3/toa_i_t1.glb', buildingId: 'bld_toa_i_lon' },
  { id: 'flr_i_lon_1', level: 1, name: 'Tầng 1 (Phòng học I101, I102 & WC)', modelUrl: '/models/cs3/toa_i_t2.glb', buildingId: 'bld_toa_i_lon' },
  { id: 'flr_i_lon_2', level: 2, name: 'Tầng 2 (Phòng học I201, I202 & WC)', modelUrl: '/models/cs3/toa_i_t3.glb', buildingId: 'bld_toa_i_lon' },
  { id: 'flr_i_lon_3', level: 3, name: 'Tầng 3 (Phòng học I301, I302 & WC)', modelUrl: '/models/cs3/toa_i_t4.glb', buildingId: 'bld_toa_i_lon' },
  { id: 'flr_i_lon_4', level: 4, name: 'Tầng 4 (Phòng học I401, I402 & WC)', modelUrl: '/models/cs3/toa_i_t5.glb', buildingId: 'bld_toa_i_lon' },

  // CS3 Tòa K (4 Tầng: Trệt level 0, Tầng 1-3 level 1-3)
  { id: 'flr_k_0', level: 0, name: 'Tầng Trệt (Viện Đèo Cả, Viện CNTT, Viện Cơ khí, VP Trưởng & Đào tạo)', modelUrl: '/models/cs3/toa_k_t1.glb', buildingId: 'bld_toa_k' },
  { id: 'flr_k_1', level: 1, name: 'Tầng 1 (Trung tâm Thông tin Thư viện K101)', modelUrl: '/models/cs3/toa_k_t2.glb', buildingId: 'bld_toa_k' },
  { id: 'flr_k_2', level: 2, name: 'Tầng 2 (Hội trường Kỹ năng K201)', modelUrl: '/models/cs3/toa_k_t3.glb', buildingId: 'bld_toa_k' },
  { id: 'flr_k_3', level: 3, name: 'Tầng 3 (Hội trường Kỹ năng K301)', modelUrl: '/models/cs3/toa_k_t4.glb', buildingId: 'bld_toa_k' },

  // CS3 Tòa I Nhỏ / Xưởng Ô Tô (Trệt level 0)
  { id: 'flr_oto_0', level: 0, name: 'Tầng Trệt (Xưởng Ô Tô - Tòa I Nhỏ)', modelUrl: '/models/cs3/xuong_oto.glb', buildingId: 'bld_xuong_oto' },

  // CS3 Tòa L
  {
    id: 'flr_l_1',
    level: 1,
    name: 'Tầng 1 (Khu Tập Gym & Thể Thao UTH Fitness)',
    modelUrl: '/models/cs3/toa_l.glb',
    buildingId: 'bld_toa_l',
  },
];

export const MOCK_QR_NODES: QrNodeData[] = [
  {
    id: 'qr_cs1_cong_chinh',
    code: 'cs1_qr_cong_chinh',
    name: 'Cổng Chính Cơ Sở 1 (Đường Võ Oanh)',
    campusId: 'campus_cs1',
    buildingId: null,
    floorLevel: null,
    coordinates: [0, 0, 28],
    initialCameraPos: [0, 18, 48],
    initialCameraTarget: [0, 2, 10],
  },
  {
    id: 'qr_cs1_sanh_toa_b',
    code: 'cs1_qr_toa_b_sanh',
    name: 'Sảnh Chính Tòa Nhà B (Tầng 1)',
    campusId: 'campus_cs1',
    buildingId: 'bld_toa_b',
    floorLevel: 1,
    coordinates: [12, 0.2, -8],
    initialCameraPos: [12, 8, 4],
    initialCameraTarget: [12, 1, -8],
  },
  {
    id: 'qr_cs1_sanh_toa_a',
    code: 'cs1_qr_toa_a_sanh',
    name: 'Sảnh Đón Tòa Nhà A (Khu Hiệu Bộ)',
    campusId: 'campus_cs1',
    buildingId: 'bld_toa_a',
    floorLevel: 1,
    coordinates: [-15, 0.2, 5],
    initialCameraPos: [-15, 8, 16],
    initialCameraTarget: [-15, 1, 5],
  },
  {
    id: 'qr_cs3_sanh_toa_h',
    code: 'cs3_qr_toa_h_sanh',
    name: 'Sảnh Chính Tòa Nhà H (Cơ Sở 3)',
    campusId: 'campus_cs3',
    buildingId: 'bld_toa_h',
    floorLevel: 0,
    coordinates: [-4.5, 0.2, 7.0],
    initialCameraPos: [10, 24, 25],
    initialCameraTarget: [-4.5, 1, 7.0],
  },
  {
    id: 'qr_cs3_sanh_toa_j',
    code: 'cs3_qr_toa_j_sanh',
    name: 'Sảnh Chính Tòa Nhà J (Cơ Sở 3)',
    campusId: 'campus_cs3',
    buildingId: 'bld_toa_j',
    floorLevel: 1,
    coordinates: [13.5, 0.2, -12.0],
    initialCameraPos: [20, 18, -5],
    initialCameraTarget: [13.5, 1, -12.0],
  },
];

const CS1_ROOMS: RoomData[] = [
  {
    id: 'room_b302',
    code: 'B302',
    name: 'Phòng Lab AI & Robotics B302',
    searchKeywords: 'lab ai, robotics, tri tue nhan tao, b302, b 302, khoa cntt, máy tính',
    floorId: 'flr_b_3',
    doorCoordinates: [16, 7.2, -14],
    buildingCode: 'toa_b',
    buildingName: 'Tòa Nhà B',
    floorLevel: 3,
    roomType: 'CLASSROOM',
  },
  {
    id: 'room_b301',
    code: 'B301',
    name: 'Phòng Hội Thảo Chuyên Đề B301',
    searchKeywords: 'hoi thao, b301, seminar, toa b',
    floorId: 'flr_b_3',
    doorCoordinates: [9, 7.2, -14],
    buildingCode: 'toa_b',
    buildingName: 'Tòa Nhà B',
    floorLevel: 3,
    roomType: 'HALL',
  },
  {
    id: 'room_b201',
    code: 'B201',
    name: 'Phòng Máy Tính Thực Hành B201',
    searchKeywords: 'thuc hanh tin hoc, may tinh, lab cntt, b201',
    floorId: 'flr_b_2',
    doorCoordinates: [10, 3.8, -12],
    buildingCode: 'toa_b',
    buildingName: 'Tòa Nhà B',
    floorLevel: 2,
    roomType: 'CLASSROOM',
  },
  {
    id: 'room_b101',
    code: 'B101',
    name: 'Văn Phòng Khoa Công Nghệ Thông Tin B101',
    searchKeywords: 'van phong khoa, giao vu, cntt, it office, b101',
    floorId: 'flr_b_1',
    doorCoordinates: [14, 0.4, -6],
    buildingCode: 'toa_b',
    buildingName: 'Tòa Nhà B',
    floorLevel: 1,
    roomType: 'OFFICE',
  },
  {
    id: 'room_a101',
    code: 'A101',
    name: 'Hội Trường Lớn Cơ Sở 1 A101',
    searchKeywords: 'hoi truong, a101, su kien, toa a',
    floorId: 'flr_a_1',
    doorCoordinates: [-15, 0.4, 2],
    buildingCode: 'toa_a',
    buildingName: 'Tòa Nhà A',
    floorLevel: 1,
    roomType: 'HALL',
  },
];

const CS3_REAL_ROOMS: RoomData[] = (realRoomsJson as unknown as Array<{
  id: string;
  code: string;
  name: string;
  roomType: string;
  notes?: string;
  buildingCode: string;
  buildingName: string;
  floorLevel: number;
  floorName: string;
  searchKeywords: string;
  doorCoordinates: [number, number, number];
}>).map((r) => ({
  id: r.id,
  code: r.code,
  name: r.name,
  roomType: r.roomType,
  notes: r.notes,
  buildingCode: r.buildingCode,
  buildingName: r.buildingName,
  floorLevel: r.floorLevel,
  floorId: `flr_${r.buildingCode}_${r.floorLevel}`,
  searchKeywords: r.searchKeywords,
  doorCoordinates: r.doorCoordinates,
}));

export const MOCK_ROOMS: RoomData[] = [
  ...CS1_ROOMS,
  ...CS3_REAL_ROOMS,
  {
    id: 'room_l_fitness',
    code: 'L_FITNESS',
    name: 'Trung Tâm Thể Thao & Gym UTH Fitness (Tòa L)',
    searchKeywords: 'fitness, gym, the duc, the thao, toa l, cs3, tap gym, u-fitness, phong the chat',
    floorId: 'flr_l_1',
    doorCoordinates: [9.5, 0.4, 25.5],
    buildingCode: 'toa_l',
    buildingName: 'Tòa Nhà L (UTH Fitness)',
    floorLevel: 1,
    roomType: 'WORKSHOP',
  },
];

// Pre-baked Route: Cổng Chính CS1 -> B302 (4 bước phối hợp 2 chặng)
export const MOCK_STEPS_CS1_TO_B302: NavigationStep[] = [
  {
    id: 'step_1',
    stepOrder: 1,
    stage: 'OUTDOOR',
    instruction: 'Từ Cổng chính, đi thẳng qua sân trường về hướng Tòa Nhà B',
    subText: 'Khoảng 45 mét - Sân trung tâm Cơ sở 1',
    directionType: 'STRAIGHT',
    viewMode: 'OVERALL_CAMPUS',
    pathPoints: [
      [0, 0.2, 28],
      [0, 0.2, 14],
      [4, 0.2, 2],
    ],
    cameraPos: [0, 24, 38],
    cameraTarget: [4, 1, 8],
    landmarkPhotoUrl: '/landmarks/cs1_san_truong.jpg',
    distanceMeters: 45,
  },
  {
    id: 'step_2',
    stepOrder: 2,
    stage: 'OUTDOOR',
    instruction: 'Rẽ phải và tiến thẳng vào sảnh chính Tòa B (Building Hub)',
    subText: 'Khoảng 20 mét - Cửa kính sảnh Tòa B',
    directionType: 'RIGHT',
    viewMode: 'OVERALL_CAMPUS',
    pathPoints: [
      [4, 0.2, 2],
      [9, 0.2, -3],
      [12, 0.2, -8],
    ],
    cameraPos: [10, 15, 12],
    cameraTarget: [12, 2, -8],
    landmarkPhotoUrl: '/landmarks/cs1_sanh_toa_b.jpg',
    distanceMeters: 20,
  },
  {
    id: 'step_3',
    stepOrder: 3,
    stage: 'INDOOR',
    instruction: 'Vào sảnh Tòa B, di chuyển đến Cầu thang bộ và lên Tầng 3',
    subText: 'Lên 2 tầng lầu - Cầu thang cánh Đông',
    directionType: 'STAIRS_UP',
    viewMode: 'BUILDING_FLOOR',
    buildingCode: 'toa_b',
    floorLevel: 3,
    pathPoints: [
      [12, 0.3, -8],
      [14, 0.3, -11],
      [15, 3.8, -12], // Lên tầng 2
      [15, 7.2, -12], // Lên tầng 3
    ],
    cameraPos: [19, 14, -4],
    cameraTarget: [14, 7, -12],
    landmarkPhotoUrl: '/landmarks/cs1_cau_thang_toa_b.jpg',
    distanceMeters: 25,
  },
  {
    id: 'step_4',
    stepOrder: 4,
    stage: 'INDOOR',
    instruction: 'Tại hành lang Tầng 3, rẽ phải 10m tới Cửa Phòng Lab AI & Robotics B302',
    subText: 'Đã đến đích - Phòng B302 bên tay phải',
    directionType: 'ARRIVED',
    viewMode: 'BUILDING_FLOOR',
    buildingCode: 'toa_b',
    floorLevel: 3,
    pathPoints: [
      [15, 7.2, -12],
      [15, 7.2, -14],
      [16, 7.2, -14],
    ],
    cameraPos: [14, 11, -10],
    cameraTarget: [16, 7.2, -14],
    landmarkPhotoUrl: '/landmarks/cs1_phong_b302.jpg',
    distanceMeters: 12,
  },
];

export const MOCK_STEPS_CS3_H_TO_J: NavigationStep[] = [
  {
    id: 'step_cs3_h_j_1',
    stepOrder: 1,
    stage: 'OUTDOOR',
    instruction: 'Từ sảnh Tòa H, đi thẳng ra trục đường chính sân trường',
    subText: 'Đi thẳng 25m qua sân trước Tòa H',
    directionType: 'STRAIGHT',
    viewMode: 'OVERALL_CAMPUS',
    buildingCode: 'toa_h',
    pathPoints: [
      [-4.5, 0.2, 7.0],
      [-2.0, 0.2, 7.0],
      [0.0, 0.2, 3.5],
    ],
    cameraPos: [10, 24, 25],
    cameraTarget: [0, 0, 3.5],
    distanceMeters: 25,
  },
  {
    id: 'step_cs3_h_j_2',
    stepOrder: 2,
    stage: 'OUTDOOR',
    instruction: 'Rẽ trái theo đường nội bộ hướng về phía Tòa Nhà J',
    subText: 'Đi theo vỉa hè qua vòng xuyến nội khu 30m',
    directionType: 'LEFT',
    viewMode: 'OVERALL_CAMPUS',
    pathPoints: [
      [0.0, 0.2, 3.5],
      [4.0, 0.2, -2.0],
      [8.0, 0.2, -6.0],
    ],
    cameraPos: [15, 22, 10],
    cameraTarget: [6, 0, -4],
    distanceMeters: 30,
  },
  {
    id: 'step_cs3_h_j_3',
    stepOrder: 3,
    stage: 'OUTDOOR',
    instruction: 'Tiến thẳng vào sảnh chính Tòa Nhà J (Khu Giảng Đường 6 Tầng)',
    subText: 'Đã đến sảnh chính Tòa J bên tay phải',
    directionType: 'ARRIVED',
    viewMode: 'OVERALL_CAMPUS',
    buildingCode: 'toa_j',
    pathPoints: [
      [8.0, 0.2, -6.0],
      [11.0, 0.2, -10.0],
      [13.5, 0.2, -12.0],
    ],
    cameraPos: [20, 18, -5],
    cameraTarget: [13.5, 1, -12.0],
    distanceMeters: 20.5,
  },
];

export const MOCK_ROUTE_CS3_H_TO_J: NavigationRouteResult = {
  originBuildingCode: 'toa_h',
  targetBuildingCode: 'toa_j',
  totalDistance: 75.5,
  estimatedMinutes: 1.2,
  fullPathPoints: [
    [-4.5, 0.2, 7.0],
    [-2.0, 0.2, 7.0],
    [0.0, 0.2, 3.5],
    [4.0, 0.2, -2.0],
    [8.0, 0.2, -6.0],
    [11.0, 0.2, -10.0],
    [13.5, 0.2, -12.0],
  ],
  steps: MOCK_STEPS_CS3_H_TO_J,
};
