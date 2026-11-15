import {
  BuildingNode,
  FloorNode,
  FunctionalArea,
  AccessPointNode,
  NetworkAlert,
  ScenarioDefinition,
  ScenarioId,
  TimeSeriesPoint,
  WifiMetrics,
} from '@/types/wifiTwin';
import { createPRNG, seededRandomInt, seededRandomRange } from './prng';
import { calculateHealthScore, getHealthStatus, clamp } from './healthMath';

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'NORMAL_DAY',
    name: 'Ngày Thường (Baseline)',
    description: 'Lưu lượng mạng học tập & nghiên cứu phân bổ đồng đều toàn trường.',
    timeDefault: 8.0,
    impactSummary: '74/75 AP trực tuyến, độ trễ trung bình 18ms, chất lượng dịch vụ đạt 92%.',
  },
  {
    id: 'PEAK_SHIFT_CHANGE',
    name: 'Giờ Cao Điểm Chuyển Ca (09:30)',
    description: 'Sinh viên di chuyển giữa các ca học, đổ dồn vào Tòa B và hành lang.',
    timeDefault: 9.5,
    impactSummary: 'Tòa B quá tải cục bộ, độ trễ tăng lên 68ms, 890 clients kết nối.',
  },
  {
    id: 'ONLINE_EXAM_SURGE',
    name: 'Thi Trực Tuyến & Mất Nguồn PoE (10:15)',
    description: 'Thi trắc nghiệm tập trung tại Phòng Lab Tòa C, 1 AP tầng 4 mất nguồn PoE.',
    timeDefault: 10.25,
    impactSummary: 'Tòa C ở trạng thái CRITICAL (36 điểm), AP-C4-02 ngắt kết nối.',
  },
  {
    id: 'COURTYARD_FESTIVAL',
    name: 'Lễ Hội Sân Trường & Chào Tân SV (15:00)',
    description: 'Sự kiện ngoài trời tại Sân Trung tâm và khu vực Cổng chính Số 2 Võ Oanh.',
    timeDefault: 15.0,
    impactSummary: 'Khu F & Cổng chính tăng đột biến 650 clients, cần tối ưu Fast Roaming.',
  },
  {
    id: 'AP_POWER_OUTAGE',
    name: 'Sự Cố Điện Tầng 4 Tòa C',
    description: 'Port PoE Switch trung tâm tầng 4 ngắt điện đột ngột gây gián đoạn đường truyền.',
    timeDefault: 11.0,
    impactSummary: 'Cảnh báo đỏ P1, khuyến nghị chuyển tải sang AP-C4-03.',
  },
];

// Fixed Building Blueprint Metadata aligned with CS1 Layout
interface BuildingMeta {
  id: string;
  code: string;
  name: string;
  shortDesc: string;
  center3D: [number, number, number];
  dimensions3D: [number, number, number];
  floorsCount: number;
  roofColor: string;
  baseHealth: number;
  baseRssi: number;
  baseLatency: number;
  baseLoss: number;
  baseThroughput: number;
  baseClients: number;
  baseUtil: number;
  baseInterf: number;
  primaryIssue: string;
  recommendation: string;
}

const BUILDINGS_META: BuildingMeta[] = [
  {
    id: 'bldg-A',
    code: 'toa_a',
    name: 'Tòa Nhà A (Central Dome)',
    shortDesc: 'Tòa Hành chính & Hội trường lớn (Mái vòm vàng, 3 tầng)',
    center3D: [2.0, 4.3, 18.2],
    dimensions3D: [35.6, 8.5, 8.3],
    floorsCount: 3,
    roofColor: '#f59e0b',
    baseHealth: 93,
    baseRssi: -52,
    baseLatency: 9,
    baseLoss: 0.1,
    baseThroughput: 680,
    baseClients: 145,
    baseUtil: 22,
    baseInterf: 8,
    primaryIssue: 'Hoạt động ổn định, tải nhẹ toàn thời gian.',
    recommendation: 'Duy trì cấu hình hiện tại.',
  },
  {
    id: 'bldg-B',
    code: 'toa_b',
    name: 'Tòa Nhà B (Left L-Wing)',
    shortDesc: 'Khối Giảng đường lý thuyết chữ L mái xanh dương (4 tầng)',
    center3D: [-18.9, 4.25, 8.0],
    dimensions3D: [24.7, 9.5, 42.0],
    floorsCount: 4,
    roofColor: '#3b82f6',
    baseHealth: 52,
    baseRssi: -68,
    baseLatency: 68,
    baseLoss: 2.8,
    baseThroughput: 420,
    baseClients: 890,
    baseUtil: 78,
    baseInterf: 36,
    primaryIssue: 'Quá tải cục bộ tầng 2–3 giờ chuyển ca, nghẽn kênh truyền.',
    recommendation: 'Bật Load Balancing; giới hạn băng thông video 4K.',
  },
  {
    id: 'bldg-C',
    code: 'toa_c',
    name: 'Tòa Nhà C (North Tower)',
    shortDesc: 'Trung tâm CNTT, Phòng Lab máy tính & Thư viện (6 tầng)',
    center3D: [11.9, 4.05, -2],
    dimensions3D: [22.3, 8.5, 26.6],
    floorsCount: 6,
    roofColor: '#ef4444',
    baseHealth: 36,
    baseRssi: -79,
    baseLatency: 138,
    baseLoss: 5.4,
    baseThroughput: 210,
    baseClients: 640,
    baseUtil: 86,
    baseInterf: 52,
    primaryIssue: '1 AP tầng 4 mất nguồn PoE; nghẽn kênh thi online.',
    recommendation: 'Chuyển tải sang AP-C4-03; kiểm tra port PoE Switch tầng 4.',
  },
  {
    id: 'bldg-D',
    code: 'toa_d',
    name: 'Tòa Nhà D (Right L-Wing)',
    shortDesc: 'Khối Khoa/Viện nghiên cứu & Văn phòng giảng viên (4 tầng)',
    center3D: [-3.6, 4.0, -21.5],
    dimensions3D: [9.6, 8.0, 15.3],
    floorsCount: 4,
    roofColor: '#64748b',
    baseHealth: 82,
    baseRssi: -58,
    baseLatency: 19,
    baseLoss: 0.4,
    baseThroughput: 540,
    baseClients: 310,
    baseUtil: 38,
    baseInterf: 16,
    primaryIssue: 'Suy hao sóng nhẹ ở góc khuất hành lang chữ L.',
    recommendation: 'Tăng công suất phát (Tx Power) thêm +2dBm tại 2 AP góc.',
  },
  {
    id: 'bldg-E',
    code: 'toa_e',
    name: 'Tòa Nhà E (Far-Right Block)',
    shortDesc: 'Khối Thực hành, Nhà thi đấu & Căn tin (3 tầng)',
    center3D: [25.9, 4.25, 14.7],
    dimensions3D: [8.3, 8.5, 28.9],
    floorsCount: 3,
    roofColor: '#0ea5e9',
    baseHealth: 66,
    baseRssi: -66,
    baseLatency: 44,
    baseLoss: 1.8,
    baseThroughput: 390,
    baseClients: 415,
    baseUtil: 62,
    baseInterf: 31,
    primaryIssue: 'Nhiễu giao thoa băng tần 2.4GHz tại Căn tin tầng 1.',
    recommendation: 'Quy hoạch lại kênh 1-6-11; bật Band Steering ưu tiên 5GHz.',
  },
  {
    id: 'zone-F',
    code: 'toa_f',
    name: 'Khu F & Cổng Chính Số 2 Võ Oanh',
    shortDesc: 'Khối Giảng đường Tây Bắc & Sân Trung tâm tổ chức sự kiện (4 tầng)',
    center3D: [-19.9, 3.5, -17.3],
    dimensions3D: [20.5, 7.0, 8.3],
    floorsCount: 4,
    roofColor: '#10b981',
    baseHealth: 78,
    baseRssi: -61,
    baseLatency: 24,
    baseLoss: 0.8,
    baseThroughput: 480,
    baseClients: 180,
    baseUtil: 41,
    baseInterf: 12,
    primaryIssue: 'Roaming trễ khi sinh viên đi từ cổng vào Tòa A.',
    recommendation: 'Tinh chỉnh ngưỡng 802.11k/v/r Fast Roaming.',
  },
];

export interface CampusSimulationData {
  buildings: BuildingNode[];
  accessPoints: AccessPointNode[];
  alerts: NetworkAlert[];
  timeSeries: TimeSeriesPoint[];
  kpiSummary: {
    campusHealthScore: number;
    onlineAps: number;
    totalAps: number;
    activeClients: number;
    avgLatencyMs: number;
    totalThroughputGbps: number;
  };
  kpis: {
    campusHealthScore: number;
    onlineAps: number;
    totalAps: number;
    activeClients: number;
    avgLatencyMs: number;
    totalThroughputGbps: number;
  };
}

export function generateCampusTwinData(
  scenario: ScenarioId = 'ONLINE_EXAM_SURGE',
  resolvedAlertIds: string[] = [],
  currentHour: number = 9.5
): CampusSimulationData {
  const prng = createPRNG(42); // Deterministic seed

  // Generate 75 Access Points distribution
  const apDistribution: Record<string, number> = {
    'bldg-A': 12,
    'bldg-B': 18,
    'bldg-C': 20,
    'bldg-D': 10,
    'bldg-E': 9,
    'zone-F': 6,
  };

  const accessPoints: AccessPointNode[] = [];
  const buildings: BuildingNode[] = [];

  BUILDINGS_META.forEach((meta) => {
    let health = meta.baseHealth;
    let latency = meta.baseLatency;
    let clients = meta.baseClients;
    let throughput = meta.baseThroughput;
    let interf = meta.baseInterf;
    let loss = meta.baseLoss;
    let util = meta.baseUtil;

    // Apply scenario dynamic modifiers
    if (scenario === 'NORMAL_DAY') {
      health = Math.min(95, health + 20);
      latency = Math.max(8, latency * 0.4);
      loss = Math.max(0.1, loss * 0.3);
      interf = Math.max(8, interf * 0.5);
    } else if (scenario === 'PEAK_SHIFT_CHANGE') {
      if (meta.id === 'bldg-B') {
        clients = 1120;
        latency = 82;
        util = 89;
        health = 46;
      }
    } else if (scenario === 'ONLINE_EXAM_SURGE' || scenario === 'AP_POWER_OUTAGE') {
      if (meta.id === 'bldg-C') {
        if (!resolvedAlertIds.includes('alert-poe-c4-02')) {
          health = 36;
          latency = 138;
          loss = 5.4;
          interf = 52;
          util = 86;
        } else {
          // After Auto-Fix, instant recovery to GOOD/EXCELLENT
          health = 86;
          latency = 22;
          loss = 0.3;
          interf = 14;
          util = 42;
          throughput = 650;
        }
      }
    } else if (scenario === 'COURTYARD_FESTIVAL') {
      if (meta.id === 'zone-F' || meta.id === 'bldg-A') {
        clients = 680;
        latency = 38;
        util = 65;
      }
    }

    const bMetrics: WifiMetrics = {
      healthScore: health,
      status: getHealthStatus(health),
      rssiDbm: meta.baseRssi,
      snrDb: Math.round(seededRandomRange(prng, 24, 38)),
      latencyMs: latency,
      jitterMs: Math.round(latency * 0.28),
      packetLossPercent: Number(loss.toFixed(1)),
      throughputMbps: throughput,
      clientCount: clients,
      apLoadPercent: util,
      channelUtilizationPercent: util,
      interferencePercent: interf,
      coveragePercent: Math.round(seededRandomRange(prng, 86, 99)),
      roamingQualityPercent: Math.round(seededRandomRange(prng, 75, 96)),
    };

    // Floors & Areas
    const floors: FloorNode[] = [];
    const apCountForBuilding = apDistribution[meta.id] || 8;
    const apsPerFloor = Math.max(1, Math.round(apCountForBuilding / meta.floorsCount));

    let apCounter = 1;

    for (let f = 1; f <= meta.floorsCount; f++) {
      const floorHealth = clamp(health + seededRandomInt(prng, -6, 6), 15, 100);
      const floorMetrics: WifiMetrics = {
        ...bMetrics,
        healthScore: floorHealth,
        status: getHealthStatus(floorHealth),
        latencyMs: Math.round(latency + seededRandomRange(prng, -4, 8)),
      };

      // Generate Areas per floor
      const areas: FunctionalArea[] = [
        {
          id: `area-${meta.code}-f${f}-left`,
          name: f === 1 ? 'Sảnh đón & Tiếp sinh viên' : `Phòng Học Chuyên Đề ${meta.code.toUpperCase()}${f}01`,
          type: f === 1 ? 'ADMIN' : 'LECTURE_HALL',
          floorNumber: f,
          buildingId: meta.id,
          capacity: 80,
          bounds2D: [-meta.dimensions3D[0] / 4, 0, meta.dimensions3D[0] / 2, meta.dimensions3D[2]],
          metrics: floorMetrics,
        },
        {
          id: `area-${meta.code}-f${f}-right`,
          name: meta.id === 'bldg-C' && f >= 3 ? `Phòng Lab Thực Hành AI C${f}02` : `Giảng Đường ${meta.code.toUpperCase()}${f}02`,
          type: meta.id === 'bldg-C' ? 'COMPUTER_LAB' : 'LECTURE_HALL',
          floorNumber: f,
          buildingId: meta.id,
          capacity: 120,
          bounds2D: [meta.dimensions3D[0] / 4, 0, meta.dimensions3D[0] / 2, meta.dimensions3D[2]],
          metrics: floorMetrics,
        },
      ];

      floors.push({
        id: `floor-${meta.id}-${f}`,
        floorNumber: f,
        label: `Tầng ${f}`,
        elevationY: (f - 1) * 2.8 + 1.2,
        buildingId: meta.id,
        areas,
        metrics: floorMetrics,
      });

      // Generate Access Points for this floor
      for (let k = 0; k < apsPerFloor && accessPoints.length < 75; k++) {
        const apId = `AP-${meta.code.toUpperCase().replace('TOA_', '')}${f}-0${k + 1}`;
        const isProblematicAp = apId === 'AP-C4-02';
        const isFixed = resolvedAlertIds.includes('alert-poe-c4-02');
        const isOnline = isProblematicAp ? isFixed : true;

        const apHealth = isProblematicAp
          ? (isFixed ? 88 : 0)
          : clamp(floorHealth + seededRandomInt(prng, -8, 8), 25, 99);

        const offsetX = seededRandomRange(prng, -meta.dimensions3D[0] * 0.35, meta.dimensions3D[0] * 0.35);
        const offsetZ = seededRandomRange(prng, -meta.dimensions3D[2] * 0.35, meta.dimensions3D[2] * 0.35);

        const apMetrics: WifiMetrics = {
          ...floorMetrics,
          healthScore: apHealth,
          status: getHealthStatus(apHealth, isOnline),
          rssiDbm: isProblematicAp && !isFixed ? -92 : Math.round(seededRandomRange(prng, -48, -74)),
          snrDb: isProblematicAp && !isFixed ? 4 : Math.round(seededRandomRange(prng, 22, 42)),
          latencyMs: isProblematicAp && !isFixed ? 240 : Math.round(latency + seededRandomRange(prng, -6, 12)),
          clientCount: isProblematicAp && !isFixed ? 0 : Math.round(clients / apCountForBuilding + seededRandomInt(prng, -8, 24)),
          throughputMbps: isProblematicAp && !isFixed ? 0 : Math.round(seededRandomRange(prng, 150, 680)),
        };

        const apNode: AccessPointNode = {
          id: apId,
          name: `Access Point ${apId}`,
          buildingId: meta.id,
          floorNumber: f,
          areaId: areas[k % areas.length].id,
          position3D: [
            meta.center3D[0] + offsetX,
            (f - 1) * 2.8 + 1.8,
            meta.center3D[2] + offsetZ,
          ],
          band: k % 3 === 0 ? 'DUAL' : '5GHz',
          channel24: (k % 3 === 0 ? 1 : k % 3 === 1 ? 6 : 11) as 1 | 6 | 11,
          channel5: [36, 44, 149, 157][k % 4] as 36 | 40 | 44 | 48 | 149 | 153 | 157 | 161,
          txPowerDbm: 20,
          isOnline,
          metrics: apMetrics,
        };

        accessPoints.push(apNode);
        apCounter++;
      }
    }

    buildings.push({
      id: meta.id,
      code: meta.code,
      name: meta.name,
      shortDesc: meta.shortDesc,
      meshNames: [meta.code],
      center3D: meta.center3D,
      dimensions3D: meta.dimensions3D,
      roofColor: meta.roofColor,
      floors,
      metrics: bMetrics,
      primaryIssue: meta.primaryIssue,
      recommendation: meta.recommendation,
    });
  });

  // Ensure exact total 75 APs
  while (accessPoints.length < 75) {
    const extraIdx = accessPoints.length + 1;
    accessPoints.push({
      ...accessPoints[0],
      id: `AP-EXT-${extraIdx}`,
      name: `Access Point Extra ${extraIdx}`,
      position3D: [seededRandomRange(prng, -10, 10), 2.5, seededRandomRange(prng, -10, 10)],
    });
  }

  // Network Alerts List
  const alerts: NetworkAlert[] = [
    {
      id: 'alert-poe-c4-02',
      timestamp: '10:14:28',
      severity: 'CRITICAL',
      category: 'POE_POWER_LOSS',
      buildingId: 'bldg-C',
      floorNumber: 4,
      apId: 'AP-C4-02',
      title: 'AP-C4-02 mất nguồn PoE Switch Tòa C',
      metricTrigger: 'Trạng thái: OFFLINE (0 Mbps, 0 Clients, SNR: 0dB)',
      recommendation: 'Chuyển tải tự động sang AP-C4-03 & kiểm tra port PoE Switch 24.',
      acknowledged: resolvedAlertIds.includes('alert-poe-c4-02'),
    },
    {
      id: 'alert-overload-b2',
      timestamp: '09:32:10',
      severity: 'WARNING',
      category: 'CLIENT_OVERLOAD',
      buildingId: 'bldg-B',
      floorNumber: 2,
      apId: 'AP-B2-01',
      title: 'Quá tải 128 clients kết nối giờ chuyển ca Tòa B',
      metricTrigger: 'Kênh truyền: 89% Utilization, Latency: 78ms',
      recommendation: 'Kích hoạt Load Balancing phân tải sang AP-B2-02 lân cận.',
      acknowledged: resolvedAlertIds.includes('alert-overload-b2'),
    },
    {
      id: 'alert-interf-e1',
      timestamp: '08:45:00',
      severity: 'WARNING',
      category: 'CHANNEL_CONGESTION',
      buildingId: 'bldg-E',
      floorNumber: 1,
      apId: 'AP-E1-01',
      title: 'Nhiễu đồng kênh 2.4GHz khu Căn tin Tòa E',
      metricTrigger: 'Nhiễu giao thoa: 42%, Packet Loss: 3.2%',
      recommendation: 'Bật Band Steering ưu tiên chuyển các máy học sang băng tần 5GHz.',
      acknowledged: resolvedAlertIds.includes('alert-interf-e1'),
    },
  ];

  // 24-Hour Time Series Points
  const timeSeries: TimeSeriesPoint[] = [];
  for (let h = 0; h < 24; h += 0.5) {
    const hourInt = Math.floor(h);
    const minuteStr = h % 1 === 0 ? '00' : '30';
    const timeLabel = `${hourInt.toString().padStart(2, '0')}:${minuteStr}`;

    // Traffic curve: peak at 9:00 - 11:30 and 14:00 - 16:30
    let trafficFactor = 0.15;
    if (h >= 7 && h <= 18) {
      trafficFactor = 0.6 + 0.35 * Math.sin(((h - 7) / 11) * Math.PI);
      if ((h >= 9 && h <= 11) || (h >= 14 && h <= 16)) trafficFactor += 0.2;
    }
    trafficFactor = clamp(trafficFactor, 0.1, 1.0);

    const isAlertTime = h >= 9.5 && h <= 11.5 && !resolvedAlertIds.includes('alert-poe-c4-02');
    const health = isAlertTime ? Math.round(58 - trafficFactor * 18) : Math.round(92 - trafficFactor * 22);
    const latency = isAlertTime ? Math.round(48 + trafficFactor * 65) : Math.round(12 + trafficFactor * 32);
    const jitter = Math.round(latency * 0.26);
    const throughput = Math.round(180 + trafficFactor * 720);
    const clients = Math.round(350 + trafficFactor * 2200);

    timeSeries.push({
      timeLabel,
      hourDecimal: h,
      targetId: 'CAMPUS',
      healthScore: health,
      latencyMs: latency,
      jitterMs: jitter,
      throughputMbps: throughput,
      clientCount: clients,
      interferencePercent: Math.round(12 + trafficFactor * 28),
    });
  }

  // Calculate Campus Overall KPI
  const onlineAps = accessPoints.filter((a) => a.isOnline).length;
  const totalClients = buildings.reduce((acc, b) => acc + b.metrics.clientCount, 0);
  const avgHealth = Math.round(
    buildings.reduce((acc, b) => acc + b.metrics.healthScore, 0) / buildings.length
  );
  const avgLatency = Math.round(
    buildings.reduce((acc, b) => acc + b.metrics.latencyMs, 0) / buildings.length
  );
  const totalThroughputGbps = Number(
    (buildings.reduce((acc, b) => acc + b.metrics.throughputMbps, 0) / 1000).toFixed(2)
  );

  const kpis = {
    campusHealthScore: avgHealth,
    onlineAps,
    totalAps: 75,
    activeClients: totalClients,
    avgLatencyMs: avgLatency,
    totalThroughputGbps,
  };

  return {
    buildings,
    accessPoints,
    alerts,
    timeSeries,
    kpiSummary: kpis,
    kpis,
  };
}

export function generateCampusSimulation(
  scenario: ScenarioId = 'ONLINE_EXAM_SURGE',
  currentHour: number = 9.5,
  resolvedAlertIds: string[] = []
): CampusSimulationData {
  return generateCampusTwinData(scenario, resolvedAlertIds, currentHour);
}
