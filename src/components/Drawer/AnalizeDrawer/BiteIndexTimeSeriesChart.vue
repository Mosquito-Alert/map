<template>
  <div class="mt-3 bg-white rounded-borders">
    <div class="timeseries-header">
      <h6 class="q-my-sm q-ml-sm text-weight-regular" style="color: #333">Time Series</h6>
      <div class="timeseries-selector q-mr-md">
        <button
          v-for="option in chartDaysSelector"
          :key="option.value"
          class="timeseries-selector-option"
          @click="timeseriesSelectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <v-chart style="height: 330px" :option="option" :loading="loading" autoresize />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useAnalizeStore } from '../../../stores/analizeStore'
import { metricsApi, regionsApi } from '../../../services/apiService'
import type { Metric, MetricTrend, PaginatedMetricList } from 'metrics'
import { LineChart, ScatterChart } from 'echarts/charts'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

const analizeStore = useAnalizeStore()

use([
  TooltipComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  GridComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
])

const biteIndexMetrics = shallowRef<PaginatedMetricList | null>(null)
const biteIndexTrendRaw = shallowRef<MetricTrend | null>(null)
const biteIndexTrend = computed(() => {
  const data = biteIndexTrendRaw?.value?.trend || []
  return trendDataCorrection(data, new Date(lastMetricWithPrediction.value?.date || ''))
})
const lastMetricWithPrediction = computed(() => {
  if (!biteIndexMetrics.value) return null
  // Find the last metric that has a non-null value and a non-null prediction
  for (let i = biteIndexMetrics.value.results.length - 1; i >= 0; i--) {
    const metric = biteIndexMetrics.value.results[i]
    if (metric && metric.value !== null && metric.predicted_value !== null) {
      return metric
    }
  }
  return null
})

const dataLoading = ref(false)
const trendDataLoading = ref(false)
const loading = computed(() => dataLoading.value || biteIndexMetrics.value === null)

const startDataZoom = ref(365 * 2) // Default to the last 2 years
const updateDataZoom = ref(0.23) // Dummy ref to trigger reactivity
const percentageLastMonth = computed(() => {
  return 100 - (startDataZoom.value / (biteIndexMetrics.value?.results.length || 1)) * 100 // Assuming the last month has 30 days
})
const chartDaysSelector = computed(() => [
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
  { label: '3Y', value: 1095 },
  { label: 'Max', value: biteIndexMetrics.value?.results.length || 0 },
])

const timeseriesSelectOption = (value: number) => {
  startDataZoom.value = value
  updateDataZoom.value = Math.random()
}

const fetchBiteIndexMetrics = async (city: string) => {
  try {
    dataLoading.value = true
    const response = await regionsApi.list({
      regionName: city,
      pageSize: 1,
      ordering: 'name',
    })
    const regionCode = response.data?.results[0]?.code
    if (regionCode) {
      const pageSize = 10000000 // Large page size to fetch all the metrics
      const daysSince = 10 * 365 // 10 years
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - daysSince)
      const metricsResponse = await metricsApi.list({
        regionCode,
        dateFrom: dateFrom.toISOString().split('T')[0], // Format as YYYY-MM-DD
        page: 1,
        pageSize,
        ordering: 'date',
      })
      if (metricsResponse.status === 200 && metricsResponse.data.results.length > 0) {
        biteIndexMetrics.value = metricsResponse.data
      } else {
        throw new Error('No metrics data found for the selected region.')
      }
    } else {
      throw new Error('Region code not found for the selected region.')
    }
  } catch (error) {
    console.error('Error fetching metrics data:', error)
  } finally {
    dataLoading.value = false
  }
}

const fetchBiteIndexTrend = async (city: string) => {
  try {
    trendDataLoading.value = true
    const id = lastMetricWithPrediction.value?.id || ''
    if (!id) {
      throw new Error('No valid metric found to fetch the trend.')
    }
    const response = await metricsApi.trendRetrieve({ id })
    if (response.status === 200 && response.data) {
      biteIndexTrendRaw.value = response.data
    } else {
      throw new Error('Failed to fetch trend for the selected region')
    }
  } catch (error) {
    console.error('Error fetching bite index trend:', error)
  } finally {
    trendDataLoading.value = false
  }
}

/**
 * Corrects the trend data by associating each value with its corresponding date,
 * given the last date in the trend.
 * @param trendData
 * @return An array of objects containing the value and date for each entry in the trend data.
 */
const trendDataCorrection = (trend: number[], lastDate: Date): { value: number; date: Date }[] => {
  // Map each trend value with a date given the last date in the trend
  return trend.map((item: number, index: number): { date: Date; value: number } => {
    // Number of days until the trend date given the index of the current trend value
    const daysUntilTrendDate = trend.length - 1 - index
    // Calculate the date for each trend value
    const date = new Date(lastDate)
    date.setDate(date.getDate() - daysUntilTrendDate)
    return { date, value: Number(item) * 100 }
  })
}

onMounted(async () => {
  const selectedRegionAddress = analizeStore.selectedRegion?.features[0]?.properties?.address || {}
  const selectedRegionAddressType =
    analizeStore.selectedRegion?.features[0]?.properties?.addresstype || ''
  const city = selectedRegionAddress[selectedRegionAddressType] || ''

  await fetchBiteIndexMetrics(city)
  await fetchBiteIndexTrend(city)
})

const option = computed(() => {
  if (!biteIndexMetrics.value) return {}
  updateDataZoom.value // Trigger reactivity
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#ccc',
          borderColor: '#aaa',
          borderWidth: 1,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          color: '#222',
        },
      },
      formatter: (params: any) => {
        const date = params[0]?.name || 'Unknown Date'
        const value = params[0]?.value ? `${params[0].value.toFixed(2)}%` : 'N/A'
        const lowerBound = params[1]?.value ? `${params[1].value.toFixed(2)}%` : 'N/A'
        const upperBound =
          params[1].value && params[2]?.value
            ? `${(params[1].value + params[2].value).toFixed(2)}%`
            : 'N/A'
        const trend = params[4]?.value ? `${params[4].value.toFixed(2)}%` : 'N/A'
        // TODO: Conditionally show trend depending if it is disabled or not in the UI
        return `
          <strong>${date}</strong>
          <br/><hr>
          <span>Value: ${value}</span><br/>
          <span>Lower bound: ${lowerBound}</span><br/>
          <span>Upper bound: ${upperBound}</span><br/>
          <span>Trend: ${trend}</span><br/>
        `
      },
    },
    legend: {
      top: 0,
      data: [
        {
          name: 'Actuals',
          itemStyle: {
            color: '#909090',
          },
        },
        {
          name: 'Trend',
          itemStyle: {
            color: '#006400',
          },
        },
        {
          name: 'Confidence band',
          icon: 'rect',
          itemStyle: {
            color: '#6dad6d66',
          },
        },
        {
          name: 'Daily Anomalies',
          icon: 'circle',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [
                {
                  offset: 0.49,
                  color: '#ff795b',
                },
                {
                  offset: 0.5,
                  color: '#85b0d5BE',
                },
              ],
              global: false, // default is false
            },
            borderWidth: 0.25,
          },
        },
      ],
      selected: {
        Trend: false,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: biteIndexMetrics.value.results.map((item) => item.date), // TODO: date.formatDate(item.date, 'YYYY-MM-DD')),
      boundaryGap: false,
    },
    yAxis: {
      name: 'Bite Probability',
      // min: 0, // Sets the minimum value to 0
      axisLabel: {
        formatter: (val: any) => val.toFixed(0) + '%', // Converts fractions to percentages
      },
      axisPointer: {
        label: {
          formatter: (params: any) => params.value.toFixed(2) + '%', // Converts fractions to percentages
        },
      },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: percentageLastMonth.value,
        end: 100,
        // Change background color to red
        backgroundColor: '#a8a8a809',
        fillerColor: '#a8a8a844',
        dataBackground: {
          lineStyle: {
            color: '#a8a8a8',
          },
          areaStyle: {
            color: '#a8a8a866',
          },
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#a8a8a8',
          },
          areaStyle: {
            color: '#000',
          },
        },
        moveHandleStyle: { color: '#a8a8a8aa' },
        emphasis: { moveHandleStyle: { color: '#a8a8a8' } },
      },
      {
        type: 'inside',
        xAxisIndex: [0],
      },
    ],
    series: [
      {
        name: 'Actuals',
        type: 'line',
        lineStyle: {
          color: '#a8a8a8',
          width: 1.2,
        },
        data: biteIndexMetrics.value.results.map((item: Metric) => ({
          value: (item.value || 0) * 100,
        })),
        showSymbol: false,
        // markLine: {
        //   animation: false,
        //   // animationDuration: 100,
        //   data: [
        //     {
        //       name: "Today's mark",
        //       xAxis: indexes.value.indexToday,
        //       label: {
        //         padding: [0, 58, 0, 0],
        //         formatter: () => date.formatDate(uiStore.getDate, 'MMM D, YYYY'),
        //         color: '#605158',
        //       },
        //       lineStyle: {
        //         color: '#909198',
        //         width: 1,
        //       },
        //     },
        //     {
        //       name: 'Beggining of the year',
        //       xAxis: indexes.value.indexLastYearFirstDay,
        //       label: { formatter: () => '' },
        //       lineStyle: {
        //         color: '#d1d1d1',
        //         width: 1,
        //         type: 'dotted',
        //       },
        //     },
        //   ],
        //   symbol: ['none', 'none'],
        // },
      },
      {
        name: 'Uncertainty interval lower bound',
        type: 'line',
        data: biteIndexMetrics.value.results.map((item) => (item.lower_value || 0) * 100),
        lineStyle: {
          opacity: 0,
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'Confidence band',
        type: 'line',
        data: biteIndexMetrics.value.results.map(
          (item) => (item.upper_value || 0) * 100 - (item.lower_value || 0) * 100,
        ),
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: '#6dad6d66',
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'Daily Anomalies',
        type: 'scatter',
        // Put this above the confidence band
        z: 10,
        symbolSize: (value: any, params: any) => {
          const anomalyDegree = params.data.anomalyDegree || 0
          if (anomalyDegree === 0) return 0 // Don't show symbols for non-anomalies
          return 6
        },
        itemStyle: {
          color: '#909090',
          width: 1,
          borderColor: '#333333',
          borderWidth: 0.25,
          opacity: 1,
        },
        data: biteIndexMetrics.value.results
          // .filter((item: Metric) => item.anomaly_degree !== null && item.anomaly_degree !== 0)
          .map((item: Metric) => ({
            value: (item.value as number) * 100,
            anomalyDegree: item.anomaly_degree,
            itemStyle: {
              color: (item.anomaly_degree as number) > 0 ? '#ff795b' : '#85b0d5BE',
            },
          })),
        showSymbol: false,
      },
      {
        name: 'Trend',
        type: 'line',
        data: biteIndexTrend.value?.map((item) => item.value * 1.0) || [],
        itemStyle: {
          color: '#9c27b0',
        },
        lineStyle: {
          color: '#006400',
          width: 2,
          opacity: 0.8,
          type: 'dashed',
        },
        showSymbol: false,
      },
    ],
  }
})
</script>
<style lang="scss">
.timeseries-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  .timeseries-selector {
    .timeseries-selector-option {
      width: 1.7rem;
      height: 1.7rem;
      font-size: 0.7rem;
      margin-left: 0.55rem;
      padding: 0;
      border: 0px solid transparent;
      border-radius: 0.3rem;
      color: #444;
      font-weight: 600;
      background-color: #f0f0f0;

      cursor: pointer;
      &:hover {
        background-color: #f3c954;
        transition: background-color 0.3s ease;
      }
    }
  }
}
</style>
