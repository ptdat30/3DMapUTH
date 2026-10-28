import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  MOCK_CAMPUSES,
  MOCK_BUILDINGS,
  MOCK_QR_NODES,
  MOCK_ROOMS,
} from '@/data/mockNavigationData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusCode = searchParams.get('campus') || 'cs1';
    const qrCode = searchParams.get('qr') || 'cs1_qr_cong_chinh';

    // Attempt to query database if available
    try {
      const dbCampus = await prisma.campus.findUnique({
        where: { code: campusCode },
        include: {
          buildings: {
            include: { floors: true },
          },
          qrNodes: true,
        },
      });

      if (dbCampus) {
        const originQr = dbCampus.qrNodes.find((q) => q.code === qrCode);
        const rooms = await prisma.room.findMany({
          where: {
            floor: {
              building: {
                campusId: dbCampus.id,
              },
            },
          },
          include: {
            floor: {
              include: { building: true },
            },
          },
        });

        return NextResponse.json({
          success: true,
          source: 'database',
          campus: dbCampus,
          originQr: originQr || dbCampus.qrNodes[0],
          rooms,
        });
      }
    } catch {
      // Database offline or not configured yet; seamlessly fallback to mock data
    }

    // Fallback to local mock data
    const matchedQr =
      MOCK_QR_NODES.find((node) => node.code === qrCode) || MOCK_QR_NODES[0];
    const matchedCampus =
      MOCK_CAMPUSES.find((c) => c.code === campusCode) || MOCK_CAMPUSES[0];

    return NextResponse.json({
      success: true,
      source: 'mock',
      campus: matchedCampus,
      buildings: MOCK_BUILDINGS,
      originQr: matchedQr,
      rooms: MOCK_ROOMS,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
