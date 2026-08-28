import type { Feature } from 'ol';

export interface ReportAnalyticsStats {
  total: number;
  colorCounts: Record<string, number>;
  histogramCounts: Record<string, number>;
  recentFeatures: Feature[];
}
