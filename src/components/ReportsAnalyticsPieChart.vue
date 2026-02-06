<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import VChart from "vue-echarts"

import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { PieDataItemOption } from "echarts/types/src/chart/pie/PieSeries.js"

use([TooltipComponent, PieChart, CanvasRenderer])

import { computed } from 'vue'
import type { Feature } from "ol"
import type { CallbackDataParams } from "echarts/types/dist/shared"

const props = defineProps<{
  features?: Feature[]
}>()

const data = computed<PieDataItemOption[]>(() => {
  if (!props.features) return []
  return Object.values(props.features.reduce((acc, obj) => {
    const key = obj.get('color') as string;
    if (!acc[key]) {
      acc[key] = { value: 0, itemStyle: { color: obj.get('color') } }
    }
    acc[key].value = (acc[key].value as number) + 1;
    return acc;
  }, {} as Record<string, PieDataItemOption>))
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
        }
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '30',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      data: data.value
    }
  ]
}))

</script>

<style scoped>
.chart {
  width: 100%;
  height: 20vh;
  min-height: 180px;
}
</style>
