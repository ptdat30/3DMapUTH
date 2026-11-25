import { NavigationStep, QrNodeData, RoomData, Vector3Tuple } from '@/types/navigation';
import {
  BUILDING_B_GATES,
  getRecommendedGateForPart,
  getRoomByCode,
} from '@/data/buildingB2dData';

/**
 * ============================================================================
 * CS1 OUTDOOR QR STATIONS & BUILDING ENTRANCE ROUTING ENGINE
 * ============================================================================
 * 2 physical QR stations marked by user on CS1 campus:
 *   - QR 1 (cs1_qr_1): Khu vực lối vào giữa Tòa A & sảnh mái xanh Tòa B
 *   - QR 2 (cs1_qr_2): Khu vực sảnh bậc tam cấp phía Đông (Tòa A – Tòa E)
 */

export interface BuildingEntranceInfo {
  buildingCode: string;
  buildingName: string;
  entranceName: string;
  coordinates: Vector3Tuple;
  cameraPos: Vector3Tuple;
  has2DMap: boolean;
}

export const CS1_QR_STATIONS: QrNodeData[] = [
  {
    id: 'qr_cs1_pos_1',
    code: 'cs1_qr_1',
    name: 'QR 1 • Lối Vào Sảnh Tòa A – B',
    campusId: 'campus_cs1',
    buildingId: null,
    floorLevel: null,
    coordinates: [-16.2, 0.25, 16.2],
    initialCameraPos: [-4, 24, 34],
    initialCameraTarget: [-14, 2, 10],
  },
  {
    id: 'qr_cs1_pos_2',
    code: 'cs1_qr_2',
    name: 'QR 2 • Sảnh Trung Tâm (Tòa A – E)',
    campusId: 'campus_cs1',
    buildingId: null,
    floorLevel: null,
    coordinates: [16.8, 0.25, 14.5],
    initialCameraPos: [28, 24, 32],
    initialCameraTarget: [10, 2, 6],
  },
];

export const CS1_BUILDING_ENTRANCES: Record<string, BuildingEntranceInfo> = {
  toa_a: {
    buildingCode: 'toa_a',
    buildingName: 'Tòa Nhà A',
    entranceName: 'Sảnh chính Tòa Nhà A (hướng sân trường)',
    coordinates: [2.0, 0.35, 13.4],
    cameraPos: [2, 20, 28],
    has2DMap: false,
  },
  toa_b: {
    buildingCode: 'toa_b',
    buildingName: 'Tòa Nhà B',
    entranceName: 'Cửa vào Sảnh mái xanh Tòa Nhà B',
    coordinates: [-20.4, 0.35, 13.8],
    cameraPos: [-6, 22, 28],
    has2DMap: true,
  },
  toa_c: {
    buildingCode: 'toa_c',
    buildingName: 'Tòa Nhà C',
    entranceName: 'Sảnh vào Cánh Đông Tòa Nhà C',
    coordinates: [11.0, 0.35, 2.2],
    cameraPos: [22, 22, 18],
    has2DMap: false,
  },
  toa_d: {
    buildingCode: 'toa_d',
    buildingName: 'Tòa Nhà D',
    entranceName: 'Lối vào sảnh giữa Tòa Nhà D',
    coordinates: [-3.6, 0.35, -14.2],
    cameraPos: [10, 26, 8],
    has2DMap: false,
  },
  toa_e: {
    buildingCode: 'toa_e',
    buildingName: 'Tòa Nhà E',
    entranceName: 'Sảnh bậc tam cấp Tòa Nhà E',
    coordinates: [20.6, 0.35, 14.2],
    cameraPos: [30, 20, 26],
    has2DMap: false,
  },
  toa_f: {
    buildingCode: 'toa_f',
    buildingName: 'Tòa Nhà F',
    entranceName: 'Lối vào góc Tây Bắc Tòa Nhà F',
    coordinates: [-16.4, 0.35, -12.4],
    cameraPos: [-4, 26, 8],
    has2DMap: false,
  },
};

// Normalize room codes between CS1 search data ("B301", "B003") and BuildingB2DNavigator ("B.301", "B.003")
export function normalizeBuildingBRoomCode(rawCode: string): string {
  const cleaned = rawCode.trim().toUpperCase();
  if (cleaned.includes('.')) return cleaned;
  if (/^B\d/.test(cleaned)) {
    return `B.${cleaned.slice(1)}`;
  }
  return cleaned;
}

function calcPathDistanceMeters(points: Vector3Tuple[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dz = points[i + 1][2] - points[i][2];
    total += Math.hypot(dx, dz);
  }
  return Math.max(8, Math.round(total * 1.35));
}

/**
 * Compute clean courtyard walkway path from a scanned QR station to target building entrance.
 */
function buildWalkwayPoints(origin: Vector3Tuple, entrance: Vector3Tuple, targetCode: string): Vector3Tuple[] {
  const y = 0.4;
  const start: Vector3Tuple = [origin[0], y, origin[2]];
  const end: Vector3Tuple = [entrance[0], y, entrance[2]];

  const directDist = Math.hypot(end[0] - start[0], end[2] - start[2]);
  if (directDist <= 8.5) {
    return [start, end];
  }

  // Courtyard central walkway corridor (Z = 10.5 runs cleanly in front of Tòa A between B and E)
  const midSouthZ = 10.5;
  const points: Vector3Tuple[] = [start];

  if (targetCode === 'toa_b' || targetCode === 'toa_a' || targetCode === 'toa_e') {
    points.push([start[0], y, midSouthZ]);
    points.push([end[0], y, midSouthZ]);
    points.push(end);
    return points;
  }

  // Going deeper north into campus (Tòa C, Tòa D, Tòa F) via central courtyard spine X = -3.0 or X = 8.0
  const spineX = targetCode === 'toa_c' ? 8.5 : -3.5;
  points.push([start[0], y, midSouthZ]);
  points.push([spineX, y, midSouthZ]);
  points.push([spineX, y, end[2] + 3.0]);
  points.push(end);
  return points;
}

/**
 * Build a clean 1-step prompt highlighting the target building on the 3D campus.
 * No outdoor path tube needed — user simply walks to the highlighted building,
 * confirms arrival, then confirms going up to the target floor (if floor > 0) before opening 2D map.
 */
export function buildCs1OutdoorRoute(
  _originQr: QrNodeData | null,
  targetRoom: RoomData
): NavigationStep[] {
  const buildingCode = targetRoom.buildingCode ?? 'toa_b';
  const entrance = CS1_BUILDING_ENTRANCES[buildingCode] ?? CS1_BUILDING_ENTRANCES.toa_b;
  const floorLabel =
    targetRoom.floorLevel === undefined || targetRoom.floorLevel === 0
      ? 'Tầng Trệt'
      : `Tầng ${targetRoom.floorLevel}`;

  let gateHint = '';
  if (buildingCode === 'toa_b') {
    const matchedRoomB = getRoomByCode(targetRoom.code);
    if (matchedRoomB) {
      const recGate = BUILDING_B_GATES[getRecommendedGateForPart(matchedRoomB.part)];
      gateHint = ` • Thuộc ${matchedRoomB.partLabel}, gần ${recGate.name}`;
    }
  }

  return [
    {
      id: `highlight_building_${buildingCode}_${targetRoom.code}`,
      stepOrder: 1,
      stage: 'OUTDOOR',
      instruction: `Hãy di chuyển tới ${entrance.buildingName}`,
      subText: `Phòng ${targetRoom.code} nằm ở ${floorLabel}${gateHint}.`,
      directionType: 'ARRIVED',
      viewMode: 'OVERALL_CAMPUS',
      buildingCode,
      floorLevel: targetRoom.floorLevel,
      pathPoints: [],
      cameraPos: entrance.cameraPos,
      cameraTarget: entrance.coordinates,
    },
  ];
}
