export const COLORS = {
  corridor: '#e59cf5',  // Màu hồng: Hành lang
  wall: '#c5cdd4',      // Màu xám: Tường bê tông
  steps: '#2b2b2b',     // Màu đen: Bậc thang
  restroom: '#b8f566',  // Xanh lá cây: Nhà vệ sinh
  stairs: '#2db2ff',    // Xanh nước biển: Cầu thang bộ
  classroom: '#ffdd55', // Màu vàng: Phòng học
  borderDash: '#1e293b' // Viền nét đứt phòng học & nhà vệ sinh
};

export const FLOOR_META: Record<number, { name: string; short: string; subtitle: string }> = {
  0: { name: 'Tầng trệt', short: 'Trệt', subtitle: 'Cổng vào chính • 6 Phòng học • Nhà vệ sinh • 3 Cầu thang bộ' },
  1: { name: 'Tầng 1', short: 'Tầng 1', subtitle: 'Phòng học lớn 101 (Hội trường) • Hành lang Đông • 2 Cầu thang bộ' },
  2: { name: 'Tầng 2', short: 'Tầng 2', subtitle: 'Phòng học trung tâm 201 • Hành lang vòng • Nhà vệ sinh • 3 Cầu thang bộ' },
  3: { name: 'Tầng 3', short: 'Tầng 3', subtitle: 'Phòng học chữ L 301 • Hành lang vòng • 2 Cầu thang bộ' }
};

export interface RectDoor {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FloorGeometry {
  corridors: { x: number; y: number; w: number; h: number }[];
  steps: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    orientation: 'horizontal' | 'vertical';
    label: string;
    labelX: number;
    labelY: number;
  }[];
  restrooms: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    sublabel: string;
    door?: RectDoor;
  }[];
  stairs: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    shortLabel: string;
    dir: 'left' | 'right';
  }[];
  classrooms: {
    id: string;
    shape: 'rect' | 'polygon';
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    points?: string;
    centerX?: number;
    centerY?: number;
    label: string;
    sublabel?: string;
    door?: RectDoor;
    doors?: RectDoor[];
  }[];
}

export const FLOOR_GEOMETRY: Record<number, FloorGeometry> = {
  0: {
    corridors: [{ x: 16, y: 18, w: 966, h: 364 }],
    steps: [
      { id: 'g_ent_south', x: 455, y: 382, w: 445, h: 18, orientation: 'horizontal', label: 'Bậc thang cổng Nam', labelX: 678, labelY: 394 },
      { id: 'g_ent_east', x: 982, y: 84, w: 18, h: 220, orientation: 'vertical', label: 'Bậc thang cổng Đông', labelX: 991, labelY: 194 }
    ],
    restrooms: [
      { id: 'g_wc', x: 16, y: 18, w: 44, h: 150, label: 'WC', sublabel: 'Trệt', door: { x: 60, y: 80, w: 4, h: 26 } }
    ],
    stairs: [
      { id: 'g_stair_sw', x: 16, y: 300, w: 44, h: 68, label: 'Cầu thang Tây-Nam', shortLabel: 'CT Tây-Nam', dir: 'right' },
      { id: 'g_stair_ne', x: 902, y: 18, w: 78, h: 66, label: 'Cầu thang Đông-Bắc', shortLabel: 'CT Đông-Bắc', dir: 'left' },
      { id: 'g_stair_se', x: 902, y: 300, w: 78, h: 68, label: 'Cầu thang Đông-Nam', shortLabel: 'CT Đông-Nam', dir: 'left' }
    ],
    classrooms: [
      { id: 'g_p001', shape: 'rect', x: 88, y: 18, w: 182, h: 150, label: 'Phòng 001', sublabel: 'Lớp học', door: { x: 164, y: 166, w: 30, h: 5 } },
      { id: 'g_p002', shape: 'rect', x: 272, y: 18, w: 181, h: 150, label: 'Phòng 002', sublabel: 'Lớp học', door: { x: 347, y: 166, w: 30, h: 5 } },
      { id: 'g_p003', shape: 'rect', x: 455, y: 18, w: 182, h: 150, label: 'Phòng 003', sublabel: 'Lớp học', door: { x: 531, y: 166, w: 30, h: 5 } },
      { id: 'g_p004', shape: 'rect', x: 639, y: 18, w: 181, h: 150, label: 'Phòng 004', sublabel: 'Lớp học', door: { x: 715, y: 166, w: 30, h: 5 } },
      { id: 'g_p005', shape: 'rect', x: 88, y: 210, w: 182, h: 158, label: 'Phòng 005', sublabel: 'Lớp học', door: { x: 164, y: 208, w: 30, h: 5 } },
      { id: 'g_p006', shape: 'rect', x: 272, y: 210, w: 181, h: 158, label: 'Phòng 006', sublabel: 'Lớp học', door: { x: 347, y: 208, w: 30, h: 5 } }
    ]
  },
  1: {
    corridors: [{ x: 68, y: 18, w: 914, h: 364 }],
    steps: [],
    restrooms: [],
    stairs: [
      { id: 'f1_stair_ne', x: 906, y: 18, w: 76, h: 68, label: 'Cầu thang Đông-Bắc', shortLabel: 'CT Đông-Bắc', dir: 'left' },
      { id: 'f1_stair_se', x: 906, y: 314, w: 76, h: 68, label: 'Cầu thang Đông-Nam', shortLabel: 'CT Đông-Nam', dir: 'left' }
    ],
    classrooms: [
      {
        id: 'f1_p101',
        shape: 'rect',
        x: 68,
        y: 18,
        w: 758,
        h: 364,
        label: 'Phòng học 101',
        sublabel: 'Giảng đường / Hội trường Tầng 1',
        door: { x: 824, y: 182, w: 5, h: 36 }
      }
    ]
  },
  2: {
    corridors: [{ x: 26, y: 18, w: 950, h: 358 }],
    steps: [],
    restrooms: [
      { id: 'f2_wc', x: 26, y: 18, w: 44, h: 154, label: 'WC', sublabel: 'Tầng 2', door: { x: 68, y: 82, w: 5, h: 26 } }
    ],
    stairs: [
      { id: 'f2_stair_sw', x: 26, y: 306, w: 44, h: 70, label: 'Cầu thang Tây-Nam', shortLabel: 'CT Tây-Nam', dir: 'right' },
      { id: 'f2_stair_ne', x: 900, y: 18, w: 76, h: 70, label: 'Cầu thang Đông-Bắc', shortLabel: 'CT Đông-Bắc', dir: 'left' },
      { id: 'f2_stair_se', x: 900, y: 306, w: 76, h: 70, label: 'Cầu thang Đông-Nam', shortLabel: 'CT Đông-Nam', dir: 'left' }
    ],
    classrooms: [
      {
        id: 'f2_p201',
        shape: 'rect',
        x: 98,
        y: 46,
        w: 722,
        h: 302,
        label: 'Phòng học 201',
        sublabel: 'Phòng học trung tâm Tầng 2',
        doors: [
          { x: 442, y: 44, w: 34, h: 5 },
          { x: 442, y: 346, w: 34, h: 5 },
          { x: 818, y: 180, w: 5, h: 34 }
        ]
      }
    ]
  },
  3: {
    corridors: [{ x: 26, y: 24, w: 950, h: 360 }],
    steps: [],
    restrooms: [],
    stairs: [
      { id: 'f3_stair_ne', x: 900, y: 24, w: 76, h: 70, label: 'Cầu thang Đông-Bắc', shortLabel: 'CT Đông-Bắc', dir: 'left' },
      { id: 'f3_stair_se', x: 900, y: 318, w: 76, h: 66, label: 'Cầu thang Đông-Nam', shortLabel: 'CT Đông-Nam', dir: 'left' }
    ],
    classrooms: [
      {
        id: 'f3_p301',
        shape: 'polygon',
        points: '26,52 822,52 822,360 98,360 98,182 26,182',
        centerX: 460,
        centerY: 206,
        label: 'Phòng học 301',
        sublabel: 'Phòng học chuyên đề chữ L • Tầng 3',
        doors: [
          { x: 442, y: 50, w: 34, h: 5 },
          { x: 820, y: 189, w: 5, h: 34 },
          { x: 96, y: 263, w: 5, h: 34 }
        ]
      }
    ]
  }
};

export interface GraphNode {
  id: string;
  floor: number;
  x: number;
  y: number;
  poi?: boolean;
  category?: 'entrance' | 'classroom' | 'restroom' | 'stairs';
  name?: string;
  stairGroup?: string;
}

export const GRAPH_NODES: Record<string, GraphNode> = {
  // Floor 0
  g_ent_south:   { id: 'g_ent_south',   floor: 0, x: 678, y: 391, poi: true, category: 'entrance',  name: 'Bậc thang cổng Nam (Lối vào chính)' },
  g_ent_east:    { id: 'g_ent_east',    floor: 0, x: 991, y: 194, poi: true, category: 'entrance',  name: 'Bậc thang cổng Đông (Lối vào phụ)' },
  g_wc:          { id: 'g_wc',          floor: 0, x: 38,  y: 93,  poi: true, category: 'restroom',  name: 'Nhà vệ sinh Tầng trệt' },
  g_stair_sw:    { id: 'g_stair_sw',    floor: 0, x: 38,  y: 334, poi: true, category: 'stairs',    name: 'Cầu thang Tây-Nam (Trệt)', stairGroup: 'SW' },
  g_stair_ne:    { id: 'g_stair_ne',    floor: 0, x: 941, y: 51,  poi: true, category: 'stairs',    name: 'Cầu thang Đông-Bắc (Trệt)', stairGroup: 'NE' },
  g_stair_se:    { id: 'g_stair_se',    floor: 0, x: 941, y: 334, poi: true, category: 'stairs',    name: 'Cầu thang Đông-Nam (Trệt)', stairGroup: 'SE' },
  g_p001:        { id: 'g_p001',        floor: 0, x: 179, y: 93,  poi: true, category: 'classroom', name: 'Phòng học 001' },
  g_p002:        { id: 'g_p002',        floor: 0, x: 362, y: 93,  poi: true, category: 'classroom', name: 'Phòng học 002' },
  g_p003:        { id: 'g_p003',        floor: 0, x: 546, y: 93,  poi: true, category: 'classroom', name: 'Phòng học 003' },
  g_p004:        { id: 'g_p004',        floor: 0, x: 730, y: 93,  poi: true, category: 'classroom', name: 'Phòng học 004' },
  g_p005:        { id: 'g_p005',        floor: 0, x: 179, y: 289, poi: true, category: 'classroom', name: 'Phòng học 005' },
  g_p006:        { id: 'g_p006',        floor: 0, x: 362, y: 289, poi: true, category: 'classroom', name: 'Phòng học 006' },

  g_c_nw:           { id: 'g_c_nw',           floor: 0, x: 74,  y: 93 },
  g_c_w_mid:        { id: 'g_c_w_mid',        floor: 0, x: 74,  y: 189 },
  g_c_sw:           { id: 'g_c_sw',           floor: 0, x: 74,  y: 334 },
  g_c_p001:         { id: 'g_c_p001',         floor: 0, x: 179, y: 189 },
  g_c_p002:         { id: 'g_c_p002',         floor: 0, x: 362, y: 189 },
  g_c_p003:         { id: 'g_c_p003',         floor: 0, x: 546, y: 189 },
  g_c_p004:         { id: 'g_c_p004',         floor: 0, x: 730, y: 189 },
  g_c_e_mid:        { id: 'g_c_e_mid',        floor: 0, x: 861, y: 189 },
  g_c_ne:           { id: 'g_c_ne',           floor: 0, x: 861, y: 51 },
  g_c_se:           { id: 'g_c_se',           floor: 0, x: 861, y: 334 },
  g_c_east_landing: { id: 'g_c_east_landing', floor: 0, x: 941, y: 194 },
  g_c_lobby_nw:     { id: 'g_c_lobby_nw',     floor: 0, x: 546, y: 280 },
  g_c_lobby_center: { id: 'g_c_lobby_center', floor: 0, x: 678, y: 280 },
  g_c_lobby_ne:     { id: 'g_c_lobby_ne',     floor: 0, x: 730, y: 280 },
  g_c_lobby_se:     { id: 'g_c_lobby_se',     floor: 0, x: 861, y: 280 },
  g_c_south_lobby:  { id: 'g_c_south_lobby',  floor: 0, x: 678, y: 350 },

  // Floor 1
  f1_p101:     { id: 'f1_p101',     floor: 1, x: 447, y: 200, poi: true, category: 'classroom', name: 'Phòng học 101 (Hội trường)' },
  f1_stair_ne: { id: 'f1_stair_ne', floor: 1, x: 944, y: 52,  poi: true, category: 'stairs',    name: 'Cầu thang Đông-Bắc (Tầng 1)', stairGroup: 'NE' },
  f1_stair_se: { id: 'f1_stair_se', floor: 1, x: 944, y: 348, poi: true, category: 'stairs',    name: 'Cầu thang Đông-Nam (Tầng 1)', stairGroup: 'SE' },
  f1_c_ne:     { id: 'f1_c_ne',     floor: 1, x: 866, y: 52 },
  f1_c_mid:    { id: 'f1_c_mid',    floor: 1, x: 866, y: 200 },
  f1_c_se:     { id: 'f1_c_se',     floor: 1, x: 866, y: 348 },

  // Floor 2
  f2_wc:       { id: 'f2_wc',       floor: 2, x: 48,  y: 95,  poi: true, category: 'restroom',  name: 'Nhà vệ sinh Tầng 2' },
  f2_stair_sw: { id: 'f2_stair_sw', floor: 2, x: 48,  y: 341, poi: true, category: 'stairs',    name: 'Cầu thang Tây-Nam (Tầng 2)', stairGroup: 'SW' },
  f2_stair_ne: { id: 'f2_stair_ne', floor: 2, x: 938, y: 53,  poi: true, category: 'stairs',    name: 'Cầu thang Đông-Bắc (Tầng 2)', stairGroup: 'NE' },
  f2_stair_se: { id: 'f2_stair_se', floor: 2, x: 938, y: 341, poi: true, category: 'stairs',    name: 'Cầu thang Đông-Nam (Tầng 2)', stairGroup: 'SE' },
  f2_p201:     { id: 'f2_p201',     floor: 2, x: 459, y: 197, poi: true, category: 'classroom', name: 'Phòng học 201' },

  f2_c_nw:       { id: 'f2_c_nw',       floor: 2, x: 84,  y: 32 },
  f2_c_wc:       { id: 'f2_c_wc',       floor: 2, x: 84,  y: 95 },
  f2_c_w_mid:    { id: 'f2_c_w_mid',    floor: 2, x: 84,  y: 197 },
  f2_c_sw_stair: { id: 'f2_c_sw_stair', floor: 2, x: 84,  y: 341 },
  f2_c_sw:       { id: 'f2_c_sw',       floor: 2, x: 84,  y: 362 },
  f2_c_top_mid:  { id: 'f2_c_top_mid',  floor: 2, x: 459, y: 32 },
  f2_c_bot_mid:  { id: 'f2_c_bot_mid',  floor: 2, x: 459, y: 362 },
  f2_c_ne:       { id: 'f2_c_ne',       floor: 2, x: 860, y: 32 },
  f2_c_ne_stair: { id: 'f2_c_ne_stair', floor: 2, x: 860, y: 53 },
  f2_c_e_mid:    { id: 'f2_c_e_mid',    floor: 2, x: 860, y: 197 },
  f2_c_se_stair: { id: 'f2_c_se_stair', floor: 2, x: 860, y: 341 },
  f2_c_se:       { id: 'f2_c_se',       floor: 2, x: 860, y: 362 },

  // Floor 3
  f3_stair_ne: { id: 'f3_stair_ne', floor: 3, x: 938, y: 59,  poi: true, category: 'stairs',    name: 'Cầu thang Đông-Bắc (Tầng 3)', stairGroup: 'NE' },
  f3_stair_se: { id: 'f3_stair_se', floor: 3, x: 938, y: 351, poi: true, category: 'stairs',    name: 'Cầu thang Đông-Nam (Tầng 3)', stairGroup: 'SE' },
  f3_p301:     { id: 'f3_p301',     floor: 3, x: 460, y: 206, poi: true, category: 'classroom', name: 'Phòng học 301 (Chữ L)' },

  f3_c_nw:       { id: 'f3_c_nw',       floor: 3, x: 62,  y: 38 },
  f3_c_top_mid:  { id: 'f3_c_top_mid',  floor: 3, x: 460, y: 38 },
  f3_c_ne:       { id: 'f3_c_ne',       floor: 3, x: 861, y: 38 },
  f3_c_ne_stair: { id: 'f3_c_ne_stair', floor: 3, x: 861, y: 59 },
  f3_c_e_mid:    { id: 'f3_c_e_mid',    floor: 3, x: 861, y: 206 },
  f3_c_se_stair: { id: 'f3_c_se_stair', floor: 3, x: 861, y: 351 },
  f3_c_se:       { id: 'f3_c_se',       floor: 3, x: 861, y: 372 },
  f3_c_bot_mid:  { id: 'f3_c_bot_mid',  floor: 3, x: 460, y: 372 },
  f3_c_sw:       { id: 'f3_c_sw',       floor: 3, x: 62,  y: 372 },
  f3_c_sw_lobby: { id: 'f3_c_sw_lobby', floor: 3, x: 62,  y: 280 },
  f3_p301_in_sw: { id: 'f3_p301_in_sw', floor: 3, x: 180, y: 280 }
};

export const GRAPH_EDGES: [string, string, number?][] = [
  // Floor 0
  ['g_wc', 'g_c_nw'],
  ['g_c_nw', 'g_c_w_mid'],
  ['g_c_w_mid', 'g_c_sw'],
  ['g_c_sw', 'g_stair_sw'],
  ['g_c_w_mid', 'g_c_p001'],
  ['g_c_p001', 'g_c_p002'],
  ['g_c_p002', 'g_c_p003'],
  ['g_c_p003', 'g_c_p004'],
  ['g_c_p004', 'g_c_e_mid'],
  ['g_p001', 'g_c_p001'],
  ['g_p002', 'g_c_p002'],
  ['g_p003', 'g_c_p003'],
  ['g_p004', 'g_c_p004'],
  ['g_p005', 'g_c_p001'],
  ['g_p006', 'g_c_p002'],
  ['g_c_p003', 'g_c_lobby_nw'],
  ['g_c_p004', 'g_c_lobby_ne'],
  ['g_c_lobby_nw', 'g_c_lobby_center'],
  ['g_c_lobby_center', 'g_c_lobby_ne'],
  ['g_c_lobby_ne', 'g_c_lobby_se'],
  ['g_c_lobby_center', 'g_c_south_lobby'],
  ['g_c_south_lobby', 'g_ent_south'],
  ['g_c_ne', 'g_c_e_mid'],
  ['g_c_e_mid', 'g_c_lobby_se'],
  ['g_c_lobby_se', 'g_c_se'],
  ['g_c_ne', 'g_stair_ne'],
  ['g_c_se', 'g_stair_se'],
  ['g_c_e_mid', 'g_c_east_landing'],
  ['g_c_east_landing', 'g_ent_east'],

  // Floor 1
  ['f1_stair_ne', 'f1_c_ne'],
  ['f1_c_ne', 'f1_c_mid'],
  ['f1_c_mid', 'f1_c_se'],
  ['f1_c_se', 'f1_stair_se'],
  ['f1_c_mid', 'f1_p101'],

  // Floor 2
  ['f2_wc', 'f2_c_wc'],
  ['f2_c_nw', 'f2_c_wc'],
  ['f2_c_wc', 'f2_c_w_mid'],
  ['f2_c_w_mid', 'f2_c_sw_stair'],
  ['f2_c_sw_stair', 'f2_stair_sw'],
  ['f2_c_sw_stair', 'f2_c_sw'],
  ['f2_c_nw', 'f2_c_top_mid'],
  ['f2_c_top_mid', 'f2_c_ne'],
  ['f2_c_sw', 'f2_c_bot_mid'],
  ['f2_c_bot_mid', 'f2_c_se'],
  ['f2_c_ne', 'f2_c_ne_stair'],
  ['f2_c_ne_stair', 'f2_stair_ne'],
  ['f2_c_ne_stair', 'f2_c_e_mid'],
  ['f2_c_e_mid', 'f2_c_se_stair'],
  ['f2_c_se_stair', 'f2_stair_se'],
  ['f2_c_se_stair', 'f2_c_se'],
  ['f2_c_top_mid', 'f2_p201'],
  ['f2_c_bot_mid', 'f2_p201'],
  ['f2_c_e_mid', 'f2_p201'],

  // Floor 3
  ['f3_c_nw', 'f3_c_top_mid'],
  ['f3_c_top_mid', 'f3_c_ne'],
  ['f3_c_ne', 'f3_c_ne_stair'],
  ['f3_c_ne_stair', 'f3_stair_ne'],
  ['f3_c_ne_stair', 'f3_c_e_mid'],
  ['f3_c_e_mid', 'f3_c_se_stair'],
  ['f3_c_se_stair', 'f3_stair_se'],
  ['f3_c_se_stair', 'f3_c_se'],
  ['f3_c_se', 'f3_c_bot_mid'],
  ['f3_c_bot_mid', 'f3_c_sw'],
  ['f3_c_sw', 'f3_c_sw_lobby'],
  ['f3_c_top_mid', 'f3_p301'],
  ['f3_c_e_mid', 'f3_p301'],
  ['f3_c_sw_lobby', 'f3_p301_in_sw'],
  ['f3_p301_in_sw', 'f3_p301'],

  // Multi-floor staircase vertical edges
  ['g_stair_ne', 'f1_stair_ne', 220],
  ['f1_stair_ne', 'f2_stair_ne', 220],
  ['f2_stair_ne', 'f3_stair_ne', 220],

  ['g_stair_se', 'f1_stair_se', 220],
  ['f1_stair_se', 'f2_stair_se', 220],
  ['f2_stair_se', 'f3_stair_se', 220],

  ['g_stair_sw', 'f2_stair_sw', 420]
];

// Precomputed adjacency list
const adjacency: Record<string, { to: string; weight: number }[]> = {};
Object.keys(GRAPH_NODES).forEach((id) => {
  adjacency[id] = [];
});
GRAPH_EDGES.forEach(([u, v, customWeight]) => {
  const nu = GRAPH_NODES[u];
  const nv = GRAPH_NODES[v];
  if (!nu || !nv) return;
  const dist = customWeight !== undefined ? customWeight : Math.hypot(nv.x - nu.x, nv.y - nu.y);
  adjacency[u].push({ to: v, weight: dist });
  adjacency[v].push({ to: u, weight: dist });
});

export function findShortestPath(startId: string, endId: string): string[] | null {
  if (!GRAPH_NODES[startId] || !GRAPH_NODES[endId]) return null;
  if (startId === endId) return [startId];

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  Object.keys(GRAPH_NODES).forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });
  dist[startId] = 0;

  while (true) {
    let u: string | null = null;
    let minDist = Infinity;
    for (const id of Object.keys(GRAPH_NODES)) {
      if (!visited.has(id) && dist[id] < minDist) {
        minDist = dist[id];
        u = id;
      }
    }
    if (u === null || u === endId) break;
    visited.add(u);

    for (const edge of adjacency[u] || []) {
      if (visited.has(edge.to)) continue;
      const alt = dist[u] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
      }
    }
  }

  if (dist[endId] === Infinity) return null;

  const path: string[] = [];
  let curr: string | null = endId;
  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path;
}

export interface RouteStep {
  floor: number;
  targetFloor?: number;
  icon: 'start' | 'end' | 'walk' | 'stairs-up' | 'stairs-down' | 'turn-left' | 'turn-right' | 'flag';
  title: string;
  detail: string;
  nodeId: string;
}

export interface SimTimelineSegment {
  type: 'walk' | 'stairs';
  floor: number;
  nextFloor?: number;
  from: GraphNode;
  to: GraphNode;
  startDist: number;
  endDist: number;
  label: string;
}

export interface CalculatedRoute {
  nodeIds: string[];
  totalMeters: number;
  walkMinutes: number;
  floorChanges: number;
  steps: RouteStep[];
  segmentsByFloor: Record<number, GraphNode[][]>;
  simTimeline: SimTimelineSegment[];
  totalTimelineDist: number;
}

export function calculateRoute(startId: string, endId: string): CalculatedRoute | null {
  const nodeIds = findShortestPath(startId, endId);
  if (!nodeIds || nodeIds.length === 0) return null;

  const segmentsByFloor: Record<number, GraphNode[][]> = { 0: [], 1: [], 2: [], 3: [] };
  let currentSeg: GraphNode[] = [];
  let totalMeters = 0;
  let floorChanges = 0;

  const simTimeline: SimTimelineSegment[] = [];
  let accumDist = 0;

  for (let i = 0; i < nodeIds.length; i++) {
    const curr = GRAPH_NODES[nodeIds[i]];
    if (i === 0) {
      currentSeg = [curr];
    } else {
      const prev = GRAPH_NODES[nodeIds[i - 1]];
      if (prev.floor === curr.floor) {
        const pxDist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const meters = pxDist * 0.06;
        totalMeters += meters;
        currentSeg.push(curr);

        simTimeline.push({
          type: 'walk',
          floor: curr.floor,
          from: prev,
          to: curr,
          startDist: accumDist,
          endDist: accumDist + meters,
          label: `Đang đi bộ tại ${FLOOR_META[curr.floor]?.name || ''}`
        });
        accumDist += meters;
      } else {
        if (currentSeg.length > 0) {
          segmentsByFloor[prev.floor].push(currentSeg);
        }
        currentSeg = [curr];

        const floorsDiff = Math.abs(curr.floor - prev.floor);
        const stairMeters = floorsDiff * 14;
        totalMeters += stairMeters;
        floorChanges += floorsDiff;

        const dirText = curr.floor > prev.floor ? 'Lên' : 'Xuống';
        simTimeline.push({
          type: 'stairs',
          floor: prev.floor,
          nextFloor: curr.floor,
          from: prev,
          to: curr,
          startDist: accumDist,
          endDist: accumDist + stairMeters,
          label: `${dirText} ${FLOOR_META[curr.floor]?.name || ''} qua ${prev.name?.split(' (')[0] || 'Cầu thang'}`
        });
        accumDist += stairMeters;
      }
    }
  }

  if (currentSeg.length > 0) {
    segmentsByFloor[currentSeg[0].floor].push(currentSeg);
  }

  // Turn-by-turn steps
  const steps = generateSteps(nodeIds);
  const walkMinutes = Math.max(1, Math.ceil(totalMeters / 65));

  return {
    nodeIds,
    totalMeters: Math.round(totalMeters),
    walkMinutes,
    floorChanges,
    steps,
    segmentsByFloor,
    simTimeline,
    totalTimelineDist: Math.max(accumDist, 1)
  };
}

function generateSteps(nodeIds: string[]): RouteStep[] {
  const startNode = GRAPH_NODES[nodeIds[0]];
  const endNode = GRAPH_NODES[nodeIds[nodeIds.length - 1]];

  if (nodeIds.length === 1) {
    return [{
      floor: startNode.floor,
      icon: 'flag',
      title: `Bạn đang ở ngay tại ${startNode.name}`,
      detail: `${FLOOR_META[startNode.floor]?.name} • Khoảng cách 0m`,
      nodeId: startNode.id
    }];
  }

  const steps: RouteStep[] = [];
  steps.push({
    floor: startNode.floor,
    icon: 'start',
    title: `Xuất phát từ ${startNode.name}`,
    detail: `${FLOOR_META[startNode.floor]?.name} • Đi ra hành lang`,
    nodeId: startNode.id
  });

  let legMeters = 0;
  for (let i = 1; i < nodeIds.length; i++) {
    const prev = GRAPH_NODES[nodeIds[i - 1]];
    const curr = GRAPH_NODES[nodeIds[i]];

    if (prev.floor !== curr.floor) {
      if (legMeters >= 2) {
        steps.push({
          floor: prev.floor,
          icon: 'walk',
          title: `Đi theo hành lang tới ${prev.name?.split(' (')[0] || ''}`,
          detail: `${FLOOR_META[prev.floor]?.name} • Khoảng ${Math.round(legMeters)}m`,
          nodeId: prev.id
        });
        legMeters = 0;
      }
      const isUp = curr.floor > prev.floor;
      const stairCleanName = prev.name?.split(' (')[0] || 'Cầu thang';
      steps.push({
        floor: prev.floor,
        targetFloor: curr.floor,
        icon: isUp ? 'stairs-up' : 'stairs-down',
        title: `${isUp ? 'Đi lên' : 'Đi xuống'} ${FLOOR_META[curr.floor]?.name} bằng ${stairCleanName}`,
        detail: `Chuyển từ ${FLOOR_META[prev.floor]?.name} sang ${FLOOR_META[curr.floor]?.name}`,
        nodeId: curr.id
      });
      continue;
    }

    const segM = Math.hypot(curr.x - prev.x, curr.y - prev.y) * 0.06;
    legMeters += segM;

    if (i < nodeIds.length - 1) {
      const next = GRAPH_NODES[nodeIds[i + 1]];
      if (next.floor === curr.floor) {
        const v1x = curr.x - prev.x;
        const v1y = curr.y - prev.y;
        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);

        if (len1 > 10 && len2 > 10) {
          const cross = (v1x * v2y - v1y * v2x) / (len1 * len2);
          const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);

          if (dot < 0.65 && legMeters >= 3) {
            const turnDir = cross > 0 ? 'Rẽ phải' : 'Rẽ trái';
            const landmark = next.poi
              ? `vào ${next.name}`
              : (next.y < curr.y - 20 ? 'về phía hành lang Bắc' : next.y > curr.y + 20 ? 'về phía hành lang Nam' : next.x > curr.x + 20 ? 'dọc hành lang hướng Đông' : 'dọc hành lang hướng Tây');

            steps.push({
              floor: curr.floor,
              icon: cross > 0 ? 'turn-right' : 'turn-left',
              title: `Đi thẳng ${Math.round(legMeters)}m, sau đó ${turnDir.toLowerCase()} ${landmark}`,
              detail: `${FLOOR_META[curr.floor]?.name}`,
              nodeId: curr.id
            });
            legMeters = 0;
          }
        }
      }
    }
  }

  const arrivalDistText = legMeters >= 1 ? `Đi tiếp ${Math.round(legMeters)}m • ` : '';
  steps.push({
    floor: endNode.floor,
    icon: 'end',
    title: `Đến nơi: ${endNode.name}`,
    detail: `${arrivalDistText}${FLOOR_META[endNode.floor]?.name}`,
    nodeId: endNode.id
  });

  return steps;
}
