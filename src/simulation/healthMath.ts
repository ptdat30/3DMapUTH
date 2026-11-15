import { HealthStatus, WifiMetrics } from '@/types/wifiTwin';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Tính điểm Health Score H theo phương trình trọng số chuẩn hóa trong PRD
 */
export function calculateHealthScore(
  rssiDbm: number,
  latencyMs: number,
  packetLossPercent: number,
  channelUtilizationPercent: number,
  interferencePercent: number,
  isOnline = true
): number {
  if (!isOnline) return 0;

  const sSignal = clamp(((rssiDbm - (-90)) / (-45 - (-90))) * 100, 0, 100);
  const sLatency = clamp(100 - ((latencyMs - 5) / (150 - 5)) * 100, 0, 100);
  const sLoss = clamp(100 - packetLossPercent * 18, 0, 100);
  const sLoad = clamp(100 - Math.max(0, channelUtilizationPercent - 30) * 1.4, 0, 100);
  const sInterference = clamp(100 - interferencePercent * 1.5, 0, 100);

  const h =
    0.25 * sSignal +
    0.25 * sLatency +
    0.20 * sLoss +
    0.15 * sLoad +
    0.15 * sInterference;

  return Math.round(clamp(h, 0, 100));
}

/**
 * Phân loại trạng thái sức khỏe mạng theo 5 cấp độ chuẩn
 */
export function getHealthStatus(healthScore: number, isOnline = true): HealthStatus {
  if (!isOnline || healthScore < 40) return 'CRITICAL';
  if (healthScore < 60) return 'POOR';
  if (healthScore < 75) return 'FAIR';
  if (healthScore < 90) return 'GOOD';
  return 'EXCELLENT';
}

/**
 * Màu sắc trạng thái theo Semantic Status Colors
 */
export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'EXCELLENT':
      return '#10B981'; // Emerald
    case 'GOOD':
      return '#06B6D4'; // Cyan
    case 'FAIR':
      return '#F59E0B'; // Amber
    case 'POOR':
      return '#F97316'; // Orange
    case 'CRITICAL':
      return '#EF4444'; // Crimson
  }
}

export const getStatusColorToken = getStatusColor;

export function getStatusBgClass(status: HealthStatus): string {
  switch (status) {
    case 'EXCELLENT':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'GOOD':
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    case 'FAIR':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'POOR':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'CRITICAL':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
  }
}

export function getStatusLabelVi(status: HealthStatus): string {
  switch (status) {
    case 'EXCELLENT':
      return 'Xuất sắc';
    case 'GOOD':
      return 'Tốt';
    case 'FAIR':
      return 'Trung bình';
    case 'POOR':
      return 'Kém';
    case 'CRITICAL':
      return 'Nghiêm trọng';
  }
}
