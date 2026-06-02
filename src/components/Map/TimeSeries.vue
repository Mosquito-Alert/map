<template>
  <VChart
    ref="chartRef"
    class="block h-full w-full pt-0"
    :option="option"
    :loading="loading"
    autoresize
  />
</template>
<script lang="ts" setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'

use([BarChart, CanvasRenderer, GridComponent, TooltipComponent])

const props = defineProps({
  values: {
    type: Array as () => number[],
    required: true,
  },
  labels: {
    type: Array as () => string[],
    required: true,
  },
  dateFilter: {
    type: Object as () => { start: string | null; end: string | null },
    required: true,
  },
})

const option = computed(() => ({
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels.map((m) => {
      const [year, month] = m.split('-')
      const date = new Date(Number(year), Number(month) - 1, 1)
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    }),
    show: false,
  },
  yAxis: {
    type: 'value',
    show: false,
  },
  grid: {
    // show: false,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    containLabel: false,
  },
  tooltip: {
    trigger: 'item',
    position: (point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) => {
      const position: Record<string, any> = { top: '10%' }
      const isReachingRightEdge = point[0] + size.contentSize[0] > size.viewSize[0]
      position['left'] = isReachingRightEdge ? point[0] - size.contentSize[0] : point[0]
      return position
    },
    formatter: (params: any) => {
      console.log(params)
      const date = new Date(params?.name || '')
      const datePretty = `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}`
      const value = params?.value || 'N/A'

      return `
          <strong>${datePretty}</strong>
          <br/><hr>
          <span>${value} observations</span><br/>
        `
    },
  },
  series: [
    {
      data: props.values.map((m, index) => {
        const [year, month] = props.labels[index]?.split('-') || []
        const date = new Date(Number(year), Number(month) - 1, 1)
        return {
          value: m,
          itemStyle: {
            color:
              date >= new Date(props.dateFilter.start || '') &&
              date <= new Date(props.dateFilter.end || '')
                ? '#2b7fff88'
                : '#d1d5dc88',
          },
        }
      }),
      type: 'bar',
      cursor: 'default',
      showSymbol: false,
      barCategoryGap: '5%',
    },
  ],
}))

// TODO:
const loading = false
</script>
