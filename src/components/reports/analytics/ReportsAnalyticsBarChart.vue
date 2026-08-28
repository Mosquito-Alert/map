<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import VChart from 'vue-echarts';

import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

import { colors } from 'quasar';
import { computed } from 'vue';

import type { BarDataItemOption } from 'echarts/types/src/chart/bar/BarSeries.js';
import type { ReportAnalyticsStats } from 'src/components/reports/analytics/types';

const props = defineProps<{
  stats?: ReportAnalyticsStats;
}>();

const data = computed<BarDataItemOption[]>(() => {
  if (!props.stats) return [];
  return Object.entries(props.stats.histogramCounts)
    .map(([key, value]) => ({
      name: key,
      value: Number(value),
    }))
    .sort((a, b) => {
      return a.name < b.name ? -1 : 1;
    });
});

const option = computed(() => {
  return {
    tooltip: {
      show: true,
    },
    xAxis: {
      type: 'category',
      data: data.value.map((item) => item.name),
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    },
    yAxis: {
      show: false,
      type: 'value',
    },

    series: [
      {
        data: data.value.map((item) => item.value),
        type: 'bar',
        itemStyle: {
          color: colors.getPaletteColor('grey-7'),
        },
      },
    ],
  };
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 40vh;
  min-height: 250px;
}
</style>
