/**
 * 3D Campus WiFi Digital Twin & NOC Command Center Types
 * Technical Specification Definitions
 */

export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export type ScenarioId =
  | 'NORMAL_DAY'
  | 'PEAK_SHIFT_CHANGE'
  | 'ONLINE_EXAM_SURGE'
  | 'COURTYARD_FESTIVAL'
  | 'AP_POWER_OUTAGE';

export type IssueCategory =
  | 'CHANNEL_CONGESTION'
  | 'SIGNAL_DEADZONE'
  | 'CLIENT_OVERLOAD'
  | 'POE_POWER_LOSS'
  | 'ROAMING_FAILURE';

export interface WifiMetrics {
  healthScore: number;               // 0 - 100
  status: HealthStatus;
  rssiDbm: number;                   // -35 dBm đến -92 dBm
  snrDb: number;                     // 5 dB đến 45 dB
  latencyMs: number;                 // 4 ms đến 250 ms
  jitterMs: number;                  // 1 ms đến 60 ms
  packetLossPercent: number;         // 0% đến 15%
  throughputMbps: number;            // 10 Mbps đến 950 Mbps
  clientCount: number;               // Số thiết bị kết nối
  apLoadPercent: number;             // 0% đến 100%
  channelUtilizationPercent: number; // 0% đến 100%
  interferencePercent: number;       // 0% đến 85%
  coveragePercent: number;           // 0% đến 100%
  roamingQualityPercent: number;     // 0% đến 100%
}

export interface AccessPointNode {
  id: string;
  name: string;
  buildingId: string;
  floorNumber: number;
  areaId: string;
  position3D: [number, number, number]; // Tọa độ trong Three.js
  band: '2.4GHz' | '5GHz' | 'DUAL';
  channel24: 1 | 6 | 11;
  channel5: 36 | 40 | 44 | 48 | 149 | 153 | 157 | 161;
  txPowerDbm: number;
  isOnline: boolean;
  metrics: WifiMetrics;
}

export interface FunctionalArea {
  id: string;
  name: string;
  type: 'LECTURE_HALL' | 'COMPUTER_LAB' | 'LIBRARY' | 'CORRIDOR' | 'CANTEEN' | 'ADMIN' | 'OUTDOOR';
  floorNumber: number;
  buildingId: string;
  capacity: number;
  bounds2D: [number, number, number, number]; // [x, z, width, depth]
  metrics: WifiMetrics;
}

export interface FloorNode {
  id: string;
  floorNumber: number;
  label: string;
  elevationY: number; // Cao độ mặt cắt Y trong Three.js
  buildingId: string;
  areas: FunctionalArea[];
  metrics: WifiMetrics;
}

export interface BuildingNode {
  id: string;
  code: string;
  name: string;
  shortDesc: string;
  meshNames: string[];
  center3D: [number, number, number];
  dimensions3D: [number, number, number];
  roofColor: string;
  floors: FloorNode[];
  metrics: WifiMetrics;
  primaryIssue: string;
  recommendation: string;
}

export interface TimeSeriesPoint {
  timeLabel: string; // "07:00", "07:30", ...
  hourDecimal: number;
  targetId: string;  // 'CAMPUS' hoặc buildingId
  healthScore: number;
  latencyMs: number;
  jitterMs: number;
  throughputMbps: number;
  clientCount: number;
  interferencePercent: number;
}

export interface NetworkAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: IssueCategory;
  buildingId: string;
  floorNumber?: number;
  apId?: string;
  title: string;
  metricTrigger: string;
  recommendation: string;
  acknowledged: boolean;
}

export interface TwinLayers {
  heatmap: boolean;
  apBeacons: boolean;
  buildingLabels: boolean;
  xraySlices: boolean;
  alertPillars: boolean;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  timeDefault: number; // e.g. 9.5 for 09:30
  impactSummary: string;
}
