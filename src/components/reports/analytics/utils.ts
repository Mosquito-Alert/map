import type { ReportAnalyticsStats } from './types';

export function getHistogramDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function createEmptyReportAnalyticsStats(): ReportAnalyticsStats {
  return {
    total: 0,
    colorCounts: {},
    histogramCounts: {},
    recentFeatures: [],
  };
}
