import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial UTH multi-campus navigation data...');

  // 1. Clean existing records
  await prisma.routeStep.deleteMany({});
  await prisma.routeSegment.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.qrNode.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.campus.deleteMany({});

  // 2. Create Campus CS1
  const cs1 = await prisma.campus.create({
    data: {
      code: 'cs1',
      name: 'Cơ sở 1 - Số 2 Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM',
      overviewModelUrl: '/models/cs1/cs1_overview.glb',
    },
  });

  // Campuses CS2 & CS3
  await prisma.campus.create({
    data: {
      code: 'cs2',
      name: 'Cơ sở 2 - Trương Văn Hải, P.Tăng Nhơn Phú B, TP.Thủ Đức',
      overviewModelUrl: '/models/cs2/cs2_overview.glb',
    },
  });

  await prisma.campus.create({
    data: {
      code: 'cs3',
      name: 'Cơ sở 3 - Nguyễn Tri Phương, P.14, Quận 10',
      overviewModelUrl: '/models/cs3/cs3_overview.glb',
    },
  });

  // 3. Create Buildings in CS1
  const bldA = await prisma.building.create({
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
      name: 'Tòa Nhà B (Khoa CNTT & Phòng Lab)',
      campusId: cs1.id,
      hubCoordinates: [12, 0, -8],
    },
  });

  // 4. Create Floors for Tòa B
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

  // 5. Create QR Nodes
  const qrCongChinh = await prisma.qrNode.create({
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

  const qrSanhToaB = await prisma.qrNode.create({
    data: {
      code: 'cs1_qr_toa_b_sanh',
      name: 'Sảnh Chính Tòa Nhà B',
      campusId: cs1.id,
      buildingId: bldB.id,
      floorLevel: 1,
      coordinates: [12, 0.2, -8],
      initialCameraPos: [12, 8, 4],
      initialCameraTarget: [12, 1, -8],
    },
  });

  // 6. Create Rooms
  const roomB302 = await prisma.room.create({
    data: {
      code: 'B302',
      name: 'Phòng Lab AI & Robotics B302',
      searchKeywords: 'lab ai, robotics, tri tue nhan tao, b302, cntt',
      floorId: flrB3.id,
      doorCoordinates: [16, 7.2, -14],
    },
  });

  await prisma.room.create({
    data: {
      code: 'B301',
      name: 'Phòng Hội Thảo Chuyên Đề B301',
      searchKeywords: 'hoi thao, seminar, b301',
      floorId: flrB3.id,
      doorCoordinates: [9, 7.2, -14],
    },
  });

  await prisma.room.create({
    data: {
      code: 'B201',
      name: 'Phòng Máy Tính Thực Hành B201',
      searchKeywords: 'thuc hanh, may tinh, b201',
      floorId: flrB2.id,
      doorCoordinates: [10, 3.8, -12],
    },
  });

  // 7. Create 2-Stage Route Segments
  // Stage 1: Outdoor (Cổng Chính -> Sảnh Tòa B)
  const outdoorSegment = await prisma.routeSegment.create({
    data: {
      type: 'OUTDOOR_QR_TO_HUB',
      fromQrId: qrCongChinh.id,
      toBuildingId: bldB.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            instruction: 'Từ Cổng chính, đi thẳng qua sân trường về hướng Tòa Nhà B',
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
          },
          {
            stepOrder: 2,
            instruction: 'Rẽ phải và tiến thẳng vào sảnh chính Tòa B (Building Hub)',
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
          },
        ],
      },
    },
  });

  // Stage 2: Indoor (Sảnh Tòa B -> Phòng B302)
  const indoorSegment = await prisma.routeSegment.create({
    data: {
      type: 'INDOOR_HUB_TO_ROOM',
      fromBuildingId: bldB.id,
      toRoomId: roomB302.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            instruction: 'Vào sảnh Tòa B, di chuyển đến Cầu thang bộ và lên Tầng 3',
            directionType: 'STAIRS_UP',
            viewMode: 'BUILDING_FLOOR',
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
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
