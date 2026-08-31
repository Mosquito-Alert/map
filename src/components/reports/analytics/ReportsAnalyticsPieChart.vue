<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'

import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries.js'

use([TooltipComponent, PieChart, CanvasRenderer])

import { computed } from 'vue'
import type { CallbackDataParams } from 'echarts/types/dist/shared'
import type { ReportAnalyticsStats } from 'src/components/reports/analytics/types'

const props = defineProps<{
  stats?: ReportAnalyticsStats
}>()

const data = computed<PieDataItemOption[]>(() => {
  if (!props.stats) return []
  return Object.entries(props.stats.colorCounts).map(([color, value]) => ({
    value,
    itemStyle: { color },
  }))
})

const option = computed(() => ({
  series: [
    {
      type: 'pie',
      radius: ['40%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
        formatter: (item: CallbackDataParams) => {
          return item.value
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '30',
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      data: data.value,
    },
  ],
}))
</script>

<style scoped>
.chart {
  width: 100%;
  height: 20vh;
  min-height: 180px;
}
</style>
