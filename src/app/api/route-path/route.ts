import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  MOCK_QR_NODES,
  MOCK_ROOMS,
  MOCK_STEPS_CS1_TO_B302,
  MOCK_ROUTE_CS3_H_TO_J,
} from '@/data/mockNavigationData';
import {
  NavigationStep,
  DirectionType,
  ViewMode,
  Vector3Tuple,
} from '@/types/navigation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originBuildingCode, targetBuildingCode, originQrCode, targetRoomCode } = body;

    // Handle Inter-building navigation (e.g. Tòa H -> Tòa J)
    if (originBuildingCode && targetBuildingCode) {
      // 1. Try querying cloud database first
      try {
        const fromBuilding = await prisma.building.findFirst({
          where: { code: originBuildingCode },
        });
        const toBuilding = await prisma.building.findFirst({
          where: { code: targetBuildingCode },
        });

        if (fromBuilding && toBuilding) {
          const segment = await prisma.routeSegment.findFirst({
            where: {
              fromBuildingId: fromBuilding.id,
              toBuildingId: toBuilding.id,
              type: 'OUTDOOR_HUB_TO_HUB',
            },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
          });

          if (segment && segment.steps.length > 0) {
            const steps: NavigationStep[] = segment.steps.map((st) => ({
              id: st.id,
              stepOrder: st.stepOrder,
              stage: 'OUTDOOR' as const,
              instruction: st.instruction,
              directionType: st.directionType as unknown as DirectionType,
              viewMode: st.viewMode as unknown as ViewMode,
              buildingCode: st.buildingCode || undefined,
              floorLevel: st.floorLevel || undefined,
              pathPoints: st.pathPoints as unknown as Vector3Tuple[],
              cameraPos: st.cameraPos as unknown as Vector3Tuple,
              cameraTarget: st.cameraTarget as unknown as Vector3Tuple,
              landmarkPhotoUrl: st.landmarkPhotoUrl || undefined,
            }));

            const flatPathPoints = steps.flatMap((s) => s.pathPoints);
            return NextResponse.json({
              success: true,
              source: 'database',
              route: {
                originBuildingCode,
                targetBuildingCode,
                totalDistance: 75.5,
                estimatedMinutes: 1.2,
                fullPathPoints: flatPathPoints,
                steps,
              },
              steps,
              totalSteps: steps.length,
            });
          }
        }
      } catch {
        // Fallback to offline mock below if DB query fails
      }

      // 2. Offline fallback if database unreachable
      if (originBuildingCode === 'toa_h' && targetBuildingCode === 'toa_j') {
        return NextResponse.json({
          success: true,
          source: 'OFFLINE_FALLBACK',
          route: MOCK_ROUTE_CS3_H_TO_J,
          steps: MOCK_ROUTE_CS3_H_TO_J.steps,
          totalSteps: MOCK_ROUTE_CS3_H_TO_J.steps.length,
        });
      }
    }

    if (!originQrCode && !targetRoomCode && !targetBuildingCode) {
      return NextResponse.json(
        { success: false, error: 'originBuildingCode/targetBuildingCode or originQrCode/targetRoomCode are required' },
        { status: 400 }
      );
    }

    // Try DB query first
    try {
      const originQr = await prisma.qrNode.findUnique({
        where: { code: originQrCode },
      });
      const targetRoom = await prisma.room.findFirst({
        where: { code: targetRoomCode },
        include: { floor: { include: { building: true } } },
      });

      if (originQr && targetRoom) {
        const isSameBuilding =
          originQr.buildingId &&
          originQr.buildingId === targetRoom.floor.buildingId;

        const steps: NavigationStep[] = [];

        if (isSameBuilding) {
          // Direct indoor route
          const indoorSegment = await prisma.routeSegment.findFirst({
            where: {
              type: 'INDOOR_HUB_TO_ROOM',
              toRoomId: targetRoom.id,
            },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
          });

          if (indoorSegment) {
            steps.push(
              ...indoorSegment.steps.map((st, idx) => ({
                id: st.id,
                stepOrder: idx + 1,
                stage: 'INDOOR' as const,
                instruction: st.instruction,
                directionType: st.directionType as unknown as DirectionType,
                viewMode: st.viewMode as unknown as ViewMode,
                buildingCode: st.buildingCode || undefined,
                floorLevel: st.floorLevel || undefined,
                pathPoints: st.pathPoints as unknown as Vector3Tuple[],
                cameraPos: st.cameraPos as unknown as Vector3Tuple,
                cameraTarget: st.cameraTarget as unknown as Vector3Tuple,
                landmarkPhotoUrl: st.landmarkPhotoUrl || undefined,
              }))
            );
          }
        } else {
          // 2-Stage Route Concatenation
          // Stage 1: Outdoor QR to Target Building Hub
          const outdoorSegment = await prisma.routeSegment.findFirst({
            where: {
              type: 'OUTDOOR_QR_TO_HUB',
              fromQrId: originQr.id,
              toBuildingId: targetRoom.floor.buildingId,
            },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
          });

          // Stage 2: Indoor Hub to Target Room
          const indoorSegment = await prisma.routeSegment.findFirst({
            where: {
              type: 'INDOOR_HUB_TO_ROOM',
              toRoomId: targetRoom.id,
            },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
          });

          let currentOrder = 1;
          if (outdoorSegment) {
            for (const st of outdoorSegment.steps) {
              steps.push({
                id: st.id,
                stepOrder: currentOrder++,
                stage: 'OUTDOOR',
                instruction: st.instruction,
                directionType: st.directionType as unknown as DirectionType,
                viewMode: st.viewMode as unknown as ViewMode,
                buildingCode: st.buildingCode || undefined,
                floorLevel: st.floorLevel || undefined,
                pathPoints: st.pathPoints as unknown as Vector3Tuple[],
                cameraPos: st.cameraPos as unknown as Vector3Tuple,
                cameraTarget: st.cameraTarget as unknown as Vector3Tuple,
                landmarkPhotoUrl: st.landmarkPhotoUrl || undefined,
              });
            }
          }

          if (indoorSegment) {
            for (const st of indoorSegment.steps) {
              steps.push({
                id: st.id,
                stepOrder: currentOrder++,
                stage: 'INDOOR',
                instruction: st.instruction,
                directionType: st.directionType as unknown as DirectionType,
                viewMode: st.viewMode as unknown as ViewMode,
                buildingCode: st.buildingCode || undefined,
                floorLevel: st.floorLevel || undefined,
                pathPoints: st.pathPoints as unknown as Vector3Tuple[],
                cameraPos: st.cameraPos as unknown as Vector3Tuple,
                cameraTarget: st.cameraTarget as unknown as Vector3Tuple,
                landmarkPhotoUrl: st.landmarkPhotoUrl || undefined,
              });
            }
          }
        }

        if (steps.length > 0) {
          return NextResponse.json({
            success: true,
            source: 'database',
            steps,
            totalSteps: steps.length,
          });
        }
      }
    } catch {
      // DB not connected; fallback to mock logic
    }

    // Default mock response
    if (targetRoomCode === 'B302') {
      return NextResponse.json({
        success: true,
        source: 'mock',
        steps: MOCK_STEPS_CS1_TO_B302,
        totalSteps: MOCK_STEPS_CS1_TO_B302.length,
      });
    }

    const matchedRoom =
      MOCK_ROOMS.find((r) => r.code === targetRoomCode) || MOCK_ROOMS[0];
    const matchedQr =
      MOCK_QR_NODES.find((q) => q.code === originQrCode) || MOCK_QR_NODES[0];

    // Fallback dynamic 2-step route
    const fallbackSteps: NavigationStep[] = [
      {
        id: 'mock_step_1',
        stepOrder: 1,
        stage: 'OUTDOOR',
        instruction: `Từ ${matchedQr.name}, đi thẳng đến sảnh ${matchedRoom.buildingName ?? 'Tòa nhà'}`,
        subText: 'Chặng 1: Di chuyển qua sân trường',
        directionType: 'STRAIGHT',
        viewMode: 'OVERALL_CAMPUS',
        pathPoints: [
          matchedQr.coordinates,
          [matchedRoom.doorCoordinates[0], 0.2, matchedRoom.doorCoordinates[2] + 10],
        ],
        cameraPos: [0, 22, 38],
        cameraTarget: [0, 1, 0],
        distanceMeters: 40,
      },
      {
        id: 'mock_step_2',
        stepOrder: 2,
        stage: 'INDOOR',
        instruction: `Vào bên trong và tiến đến cửa phòng ${matchedRoom.code} - ${matchedRoom.name}`,
        subText: `Chặng 2: ${matchedRoom.buildingName ?? 'Tòa B'} - Tầng ${matchedRoom.floorLevel ?? 1}`,
        directionType: 'ARRIVED',
        viewMode: 'BUILDING_FLOOR',
        buildingCode: matchedRoom.buildingCode,
        floorLevel: matchedRoom.floorLevel,
        pathPoints: [
          [matchedRoom.doorCoordinates[0], 0.2, matchedRoom.doorCoordinates[2] + 10],
          matchedRoom.doorCoordinates,
        ],
        cameraPos: [
          matchedRoom.doorCoordinates[0] + 5,
          (matchedRoom.floorLevel ?? 1) * 3 + 4,
          matchedRoom.doorCoordinates[2] + 8,
        ],
        cameraTarget: matchedRoom.doorCoordinates,
        distanceMeters: 15,
      },
    ];

    return NextResponse.json({
      success: true,
      source: 'mock_generated',
      steps: fallbackSteps,
      totalSteps: fallbackSteps.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
