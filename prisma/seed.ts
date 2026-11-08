import { PrismaClient, SegmentType, ViewMode } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface RealRoomJson {
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
}

async function main() {
  console.log('Seeding real UTH multi-campus navigation data to Aiven PostgreSQL...');

  // 1. Clean existing records (Idempotency guarantee)
  await prisma.routeStep.deleteMany({});
  await prisma.routeSegment.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.qrNode.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.campus.deleteMany({});

  // 2. Create Campuses
  const cs1 = await prisma.campus.create({
    data: {
      code: 'cs1',
      name: 'Cơ sở 1 - Số 2 Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM',
      overviewModelUrl: '/models/cs1/cs1_overview.glb',
    },
  });

  await prisma.campus.create({
    data: {
      code: 'cs2',
      name: 'Cơ sở 2 - Trương Văn Hải, P.Tăng Nhơn Phú B, TP.Thủ Đức',
      overviewModelUrl: '/models/cs2/cs2_overview.glb',
    },
  });

  const cs3 = await prisma.campus.create({
    data: {
      code: 'cs3',
      name: 'Cơ sở 3 - Nguyễn Tri Phương, P.14, Quận 10',
      overviewModelUrl: '/models/cs3/cs3_overview.glb',
    },
  });

  console.log('✔ Campuses created: CS1, CS2, CS3');

  // 3. Create Buildings in CS1
  await prisma.building.create({
    data: {
      code: 'toa_a',
      name: 'Tòa Nhà A (Hiệu Bộ & Đào Tạo)',
      campusId: cs1.id,
      hubCoordinates: [-15, 0, 5],
    },
  });

  const bldB = await prisma.building.create({
    data: {
      code: 'toa_b',
      name: 'Tòa Nhà B (Khoa CNTT & Lab)',
      campusId: cs1.id,
      hubCoordinates: [12, 0, -8],
    },
  });

  await prisma.building.create({
    data: {
      code: 'toa_c',
      name: 'Tòa Nhà C (Giảng Đường Tổng Hợp)',
      campusId: cs1.id,
      hubCoordinates: [0, 0, -25],
    },
  });

  // 4. Create Buildings in CS3
  const bldH = await prisma.building.create({
    data: {
      code: 'toa_h',
      name: 'Tòa Nhà H (Hành Chính & Giảng Đường 7 Tầng)',
      campusId: cs3.id,
      hubCoordinates: [-4.5, 0, 7],
    },
  });

  const bldILon = await prisma.building.create({
    data: {
      code: 'toa_i_lon',
      name: 'Tòa Nhà I Lớn (Khu Giảng Đường 5 Tầng)',
      campusId: cs3.id,
      hubCoordinates: [-13.5, 0, -15.4],
    },
  });

  const bldK = await prisma.building.create({
    data: {
      code: 'toa_k',
      name: 'Tòa Nhà K (Viện Nghiên Cứu & Đào Tạo)',
      campusId: cs3.id,
      hubCoordinates: [15.0, 0, 4.2],
    },
  });

  const bldOto = await prisma.building.create({
    data: {
      code: 'xuong_oto',
      name: 'Tòa I Nhỏ (Xưởng Thực Hành Ô Tô - Cơ Khí Động Lực)',
      campusId: cs3.id,
      hubCoordinates: [-24.0, 0, 3.5],
    },
  });

  const bldJ = await prisma.building.create({
    data: {
      code: 'toa_j',
      name: 'Tòa Nhà J (Khu Giảng Đường 6 Tầng)',
      campusId: cs3.id,
      hubCoordinates: [13.5, 0, -12],
    },
  });

  await prisma.building.create({
    data: {
      code: 'toa_i_duong',
      name: 'Nhà I (Khu Đất Phụ Trợ & Dịch Vụ)',
      campusId: cs3.id,
      hubCoordinates: [-21.5, 0, -15.4],
    },
  });

  await prisma.building.create({
    data: {
      code: 'nha_da_nang',
      name: 'Nhà Thi Đấu Đa Năng (Thể Thao & Sự Kiện)',
      campusId: cs3.id,
      hubCoordinates: [22.8, 0, 14.6],
    },
  });

  const bldL = await prisma.building.create({
    data: {
      code: 'toa_l',
      name: 'Tòa Nhà L (Trung Tâm Thể Thao UTH Fitness)',
      campusId: cs3.id,
      hubCoordinates: [9.5, 0, 23.5],
    },
  });

  console.log('✔ Buildings created for CS1 & CS3 (including Tòa H, Tòa I Lớn, Tòa K, Tòa I Nhỏ)');

  // 5. Create Floors
  // CS1 - Tòa B
  const flrB1 = await prisma.floor.create({
    data: {
      level: 1,
      name: 'Tầng 1 (Sảnh & VP Khoa)',
      modelUrl: '/models/cs1/toa_b_t1.glb',
      buildingId: bldB.id,
    },
  });

  const flrB2 = await prisma.floor.create({
    data: {
      level: 2,
      name: 'Tầng 2 (Phòng Máy & Thực Hành)',
      modelUrl: '/models/cs1/toa_b_t2.glb',
      buildingId: bldB.id,
    },
  });

  const flrB3 = await prisma.floor.create({
    data: {
      level: 3,
      name: 'Tầng 3 (Lab Chuyên Sâu & AI)',
      modelUrl: '/models/cs1/toa_b_t3.glb',
      buildingId: bldB.id,
    },
  });

  // CS3 - Tòa H (7 tầng: Trệt level 0, Tầng 1-6 level 1-6)
  const floorMapH = new Map<number, string>();
  for (let lvl = 0; lvl <= 6; lvl++) {
    const fName = lvl === 0 ? 'Tầng Trệt' : `Tầng ${lvl}`;
    const flr = await prisma.floor.create({
      data: {
        level: lvl,
        name: `${fName} (Tòa Nhà H)`,
        modelUrl: `/models/cs3/toa_h_t${Math.min(lvl + 1, 5)}.glb`,
        buildingId: bldH.id,
      },
    });
    floorMapH.set(lvl, flr.id);
  }

  // CS3 - Tòa I Lớn (5 tầng: Trệt level 0, Tầng 1-4 level 1-4)
  const floorMapILon = new Map<number, string>();
  for (let lvl = 0; lvl <= 4; lvl++) {
    const fName = lvl === 0 ? 'Tầng Trệt' : `Tầng ${lvl}`;
    const flr = await prisma.floor.create({
      data: {
        level: lvl,
        name: `${fName} (Tòa I Lớn)`,
        modelUrl: `/models/cs3/toa_i_t${lvl + 1}.glb`,
        buildingId: bldILon.id,
      },
    });
    floorMapILon.set(lvl, flr.id);
  }

  // CS3 - Tòa K (4 tầng: Trệt level 0, Tầng 1-3 level 1-3)
  const floorMapK = new Map<number, string>();
  for (let lvl = 0; lvl <= 3; lvl++) {
    const fName = lvl === 0 ? 'Tầng Trệt' : `Tầng ${lvl}`;
    const flr = await prisma.floor.create({
      data: {
        level: lvl,
        name: `${fName} (Tòa K)`,
        modelUrl: `/models/cs3/toa_k_t${lvl + 1}.glb`,
        buildingId: bldK.id,
      },
    });
    floorMapK.set(lvl, flr.id);
  }

  // CS3 - Tòa I Nhỏ / Xưởng Ô Tô (Trệt level 0)
  const flrOto = await prisma.floor.create({
    data: {
      level: 0,
      name: 'Tầng Trệt (Xưởng Ô Tô - Tòa I Nhỏ)',
      modelUrl: '/models/cs3/xuong_oto.glb',
      buildingId: bldOto.id,
    },
  });

  // CS3 - Tòa J (6 tầng)
  for (let lvl = 1; lvl <= 6; lvl++) {
    await prisma.floor.create({
      data: {
        level: lvl,
        name: `Tầng ${lvl} (Khu phòng học lý thuyết Lầu ${lvl - 1})`,
        modelUrl: `/models/cs3/toa_j_t${lvl}.glb`,
        buildingId: bldJ.id,
      },
    });
  }

  // CS3 - Tòa L
  const flrL1 = await prisma.floor.create({
    data: {
      level: 1,
      name: 'Tầng 1 (Khu Tập Gym & Thể Thao UTH Fitness)',
      modelUrl: '/models/cs3/toa_l.glb',
      buildingId: bldL.id,
    },
  });

  console.log('✔ Floors created for all buildings');

  // 6. Create QR Nodes
  const qrCongChinhCS1 = await prisma.qrNode.create({
    data: {
      code: 'cs1_qr_cong_chinh',
      name: 'Cổng Chính Cơ Sở 1 (Đường Võ Oanh)',
      campusId: cs1.id,
      buildingId: null,
      floorLevel: null,
      coordinates: [0, 0, 28],
      initialCameraPos: [0, 18, 48],
      initialCameraTarget: [0, 2, 10],
    },
  });

  await prisma.qrNode.create({
    data: {
      code: 'cs1_qr_toa_b_sanh',
      name: 'Sảnh Chính Tòa Nhà B (Tầng 1)',
      campusId: cs1.id,
      buildingId: bldB.id,
      floorLevel: 1,
      coordinates: [12, 0.2, -8],
      initialCameraPos: [12, 8, 4],
      initialCameraTarget: [12, 1, -8],
    },
  });

  await prisma.qrNode.create({
    data: {
      code: 'cs3_qr_toa_h_sanh',
      name: 'Sảnh Chính Tòa Nhà H (Cơ Sở 3)',
      campusId: cs3.id,
      buildingId: bldH.id,
      floorLevel: 0,
      coordinates: [-4.5, 0.2, 7.0],
      initialCameraPos: [10, 24, 25],
      initialCameraTarget: [-4.5, 1, 7.0],
    },
  });

  await prisma.qrNode.create({
    data: {
      code: 'cs3_qr_toa_j_sanh',
      name: 'Sảnh Chính Tòa Nhà J (Cơ Sở 3)',
      campusId: cs3.id,
      buildingId: bldJ.id,
      floorLevel: 1,
      coordinates: [13.5, 0.2, -12.0],
      initialCameraPos: [20, 18, -5],
      initialCameraTarget: [13.5, 1, -12.0],
    },
  });

  console.log('✔ QR Nodes created');

  // 7. Create Rooms
  // CS1 Rooms
  const roomB302 = await prisma.room.create({
    data: {
      code: 'B302',
      name: 'Phòng Lab AI & Robotics B302',
      roomType: 'CLASSROOM',
      searchKeywords: 'lab ai, robotics, tri tue nhan tao, b302, cntt',
      floorId: flrB3.id,
      doorCoordinates: [16, 7.2, -14],
    },
  });

  await prisma.room.create({
    data: {
      code: 'B301',
      name: 'Phòng Hội Thảo Chuyên Đề B301',
      roomType: 'HALL',
      searchKeywords: 'hoi thao, seminar, b301',
      floorId: flrB3.id,
      doorCoordinates: [9, 7.2, -14],
    },
  });

  await prisma.room.create({
    data: {
      code: 'B201',
      name: 'Phòng Máy Tính Thực Hành B201',
      roomType: 'CLASSROOM',
      searchKeywords: 'thuc hanh, may tinh, b201',
      floorId: flrB2.id,
      doorCoordinates: [10, 3.8, -12],
    },
  });

  await prisma.room.create({
    data: {
      code: 'B101',
      name: 'Văn Phòng Khoa Công Nghệ Thông Tin B101',
      roomType: 'OFFICE',
      searchKeywords: 'van phong khoa, giao vu, cntt, it office, b101',
      floorId: flrB1.id,
      doorCoordinates: [14, 0.4, -6],
    },
  });

  // CS3 - Load and Seed ALL 108 Real Rooms
  const realRoomsJsonPath = path.resolve('src/data/realRoomsData.json');
  const realRooms: RealRoomJson[] = JSON.parse(
    fs.readFileSync(realRoomsJsonPath, 'utf-8')
  );

  let insertedCount = 0;
  for (const r of realRooms) {
    let floorId: string | undefined;

    if (r.buildingCode === 'toa_h') {
      floorId = floorMapH.get(r.floorLevel);
    } else if (r.buildingCode === 'toa_i_lon') {
      floorId = floorMapILon.get(r.floorLevel);
    } else if (r.buildingCode === 'toa_k') {
      floorId = floorMapK.get(r.floorLevel);
    } else if (r.buildingCode === 'xuong_oto') {
      floorId = flrOto.id;
    }

    if (!floorId) {
      console.warn(`Floor not found for room ${r.code} (${r.buildingCode} - ${r.floorLevel})`);
      continue;
    }

    await prisma.room.create({
      data: {
        code: r.code,
        name: r.name,
        roomType: r.roomType,
        notes: r.notes || null,
        searchKeywords: r.searchKeywords,
        floorId,
        doorCoordinates: r.doorCoordinates,
      },
    });
    insertedCount++;
  }

  // CS3 - UTH Fitness
  await prisma.room.create({
    data: {
      code: 'L_FITNESS',
      name: 'Trung Tâm Thể Thao & Gym UTH Fitness (Tòa L)',
      roomType: 'WORKSHOP',
      searchKeywords: 'fitness, gym, the duc, the thao, toa l, cs3, tap gym',
      floorId: flrL1.id,
      doorCoordinates: [9.5, 0.4, 25.5],
    },
  });

  console.log(`✔ Real Rooms seeded: ${insertedCount} CS3 rooms + CS1 rooms successfully!`);

  // 8. Create Route Segments
  // Route 1: CS1 Outdoor (Cổng Chính -> Sảnh Tòa B)
  await prisma.routeSegment.create({
    data: {
      type: SegmentType.OUTDOOR_QR_TO_HUB,
      fromQrId: qrCongChinhCS1.id,
      toBuildingId: bldB.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            instruction: 'Từ Cổng chính, đi thẳng qua sân trường về hướng Tòa Nhà B',
            directionType: 'STRAIGHT',
            viewMode: ViewMode.OVERALL_CAMPUS,
            pathPoints: [
              [0, 0.2, 28],
              [0, 0.2, 14],
              [4, 0.2, 2],
            ],
            cameraPos: [0, 24, 38],
            cameraTarget: [4, 1, 8],
            landmarkPhotoUrl: '/landmarks/cs1_san_truong.jpg',
          },
          {
            stepOrder: 2,
            instruction: 'Rẽ phải và tiến thẳng vào sảnh chính Tòa B (Building Hub)',
            directionType: 'RIGHT',
            viewMode: ViewMode.OVERALL_CAMPUS,
            pathPoints: [
              [4, 0.2, 2],
              [9, 0.2, -3],
              [12, 0.2, -8],
            ],
            cameraPos: [10, 15, 12],
            cameraTarget: [12, 2, -8],
            landmarkPhotoUrl: '/landmarks/cs1_sanh_toa_b.jpg',
          },
        ],
      },
    },
  });

  // Route 2: CS1 Indoor (Sảnh Tòa B -> Phòng B302)
  await prisma.routeSegment.create({
    data: {
      type: SegmentType.INDOOR_HUB_TO_ROOM,
      fromBuildingId: bldB.id,
      toRoomId: roomB302.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            instruction: 'Vào sảnh Tòa B, di chuyển đến Cầu thang bộ và lên Tầng 3',
            directionType: 'STAIRS_UP',
            viewMode: ViewMode.BUILDING_FLOOR,
            buildingCode: 'toa_b',
            floorLevel: 3,
            pathPoints: [
              [12, 0.3, -8],
              [14, 0.3, -11],
              [15, 3.8, -12],
              [15, 7.2, -12],
            ],
            cameraPos: [19, 14, -4],
            cameraTarget: [14, 7, -12],
            landmarkPhotoUrl: '/landmarks/cs1_cau_thang_toa_b.jpg',
          },
          {
            stepOrder: 2,
            instruction: 'Tại hành lang Tầng 3, rẽ phải 10m tới Cửa Phòng Lab AI & Robotics B302',
            directionType: 'ARRIVED',
            viewMode: ViewMode.BUILDING_FLOOR,
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
          },
        ],
      },
    },
  });

  // Route 3: CS3 Inter-building (Tòa H -> Tòa J)
  await prisma.routeSegment.create({
    data: {
      type: SegmentType.OUTDOOR_HUB_TO_HUB,
      fromBuildingId: bldH.id,
      toBuildingId: bldJ.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            instruction: 'Từ sảnh Tòa H, đi thẳng ra trục đường chính sân trường',
            directionType: 'STRAIGHT',
            viewMode: ViewMode.OVERALL_CAMPUS,
            buildingCode: 'toa_h',
            pathPoints: [
              [-4.5, 0.2, 7.0],
              [-2.0, 0.2, 7.0],
              [0.0, 0.2, 3.5],
            ],
            cameraPos: [10, 24, 25],
            cameraTarget: [0, 0, 3.5],
          },
          {
            stepOrder: 2,
            instruction: 'Rẽ trái theo đường nội bộ hướng về phía Tòa Nhà J',
            directionType: 'LEFT',
            viewMode: ViewMode.OVERALL_CAMPUS,
            buildingCode: 'toa_j',
            pathPoints: [
              [0.0, 0.2, 3.5],
              [4.0, 0.2, -2.0],
              [8.0, 0.2, -6.0],
            ],
            cameraPos: [15, 22, 10],
            cameraTarget: [6, 0, -4],
          },
          {
            stepOrder: 3,
            instruction: 'Tiến thẳng vào sảnh chính Tòa Nhà J (Khu Giảng Đường 6 Tầng)',
            directionType: 'ARRIVED',
            viewMode: ViewMode.OVERALL_CAMPUS,
            buildingCode: 'toa_j',
            pathPoints: [
              [8.0, 0.2, -6.0],
              [11.0, 0.2, -10.0],
              [13.5, 0.2, -12.0],
            ],
            cameraPos: [20, 18, -5],
            cameraTarget: [13.5, 1, -12.0],
          },
        ],
      },
    },
  });

  console.log('✔ Route segments and steps created (CS1 & CS3 Tòa H -> Tòa J)');
  console.log('All real seeding operations completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
