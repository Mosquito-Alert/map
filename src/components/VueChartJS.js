/****
vue-chart-3 source code (v 3.1.2)
******/
/*
ADAPTED SO WHEN CHART DATA IS REMOVE, CHART IS ADAPTED INSTEAD OF DESTROYED
*/
const __defProp = Object.defineProperty
const __defProps = Object.defineProperties
const __getOwnPropDescs = Object.getOwnPropertyDescriptors
const __getOwnPropSymbols = Object.getOwnPropertySymbols
const __hasOwnProp = Object.prototype.hasOwnProperty
const __propIsEnum = Object.prototype.propertyIsEnumerable
const __defNormalProp = (obj, key, value) => {
  if (key in obj) {
    __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value })
  } else {
    obj[key] = value
  }
}
const __spreadValues = (a, b) => {
  for (const prop in b || (b = {})) {
    if (__hasOwnProp.call(b, prop)) {
      __defNormalProp(a, prop, b[prop])
    }
  }
  if (__getOwnPropSymbols) {
    for (const prop3 of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop3)) {
        __defNormalProp(a, prop3, b[prop3])
      }
    }
  }
  return a
}
const __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b))
// const __objRest = (source, exclude) => {
//   const target = {}
//   for (const prop in source) {
//     if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) {
//       target[prop] = source[prop]
//     }
//   }
//   if (source != null && __getOwnPropSymbols)
//     for (const prop2 of __getOwnPropSymbols(source)) {
//       if (exclude.indexOf(prop2) < 0 && __propIsEnum.call(source, prop2)) {
//         target[prop2] = source[prop2]
//       }
//     }
//   return target
// }

// src/core/component.builder.ts
import * as Chartjs from 'chart.js'
import { cloneDeep, isEqual } from 'lodash-es'

// src/utils/format.utils.ts
function pascalCase (str) {
  return (str.match(/[a-zA-Z0-9]+/g) || []).map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
}

// src/core/component.builder.ts
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  ref as ref2,
  unref,
  shallowRef,
  watch
} from 'vue'

const defineChartComponent = (chartName, chartType) => {
  const propsDefs = {
    chartData: { type: Object, required: true },
    options: { type: Object, required: false },
    chartId: { default: chartName, type: String },
    width: { default: 400, type: Number },
    height: { default: 400, type: Number },
    cssClasses: { type: String, default: '' },
    styles: { type: Object },
    plugins: { type: Array, default: () => [] },
    onLabelsUpdate: { type: Function },
    onChartUpdate: { type: Function },
    onChartDestroy: { type: Function },
    onChartRender: { type: Function }
  }
  const componentName = pascalCase(chartName)
  return defineComponent({
    name: componentName,
    props: propsDefs,
    emits: {
      'labels:update': () => true,
      'chart:update': (chartInstance) => true,
      'chart:destroy': () => true,
      'chart:render': (chartInstance) => true
    },
    setup (props, { emit, expose }) {
      const canvasRef = ref(null)
      const canvasId = `${props.chartId}`
      const chartInstance = shallowRef(null)
      watch(() => props.chartData, watchHandler, { deep: true })
      watch(() => props.options, (newOptions, oldOptions) => {
        if (chartInstance.value && newOptions && !isEqual(chartInstance.value.options, oldOptions)) {
          chartInstance.value.options = cloneDeep(newOptions)
          oldOptions = cloneDeep(newOptions)
          handleChartUpdate()
        }
      }, { deep: true })
      function watchHandler (newData, oldData) {
        if (oldData && chartInstance.value) {
          const chart = chartInstance.value
          if (!isEqual(newData, oldData) && oldData.datasets.length === newData.datasets.length) {
            newData.datasets.forEach((dataset, i) => {
              const oldDatasetKeys = Object.keys(oldData.datasets[i])
              const newDatasetKeys = Object.keys(dataset)
              const deletionKeys = oldDatasetKeys.filter((key) => {
                return key !== '_meta' && newDatasetKeys.indexOf(key) === -1
              })
              deletionKeys.forEach((deletionKey) => {
                if (chart.data.datasets[i]) {
                  delete chart.data.datasets[i][deletionKey]
                }
              })
              for (const attribute in dataset) {
                const attrValue = dataset[attribute]
                if (Object.prototype.hasOwnProperty.call(dataset, attribute) && attrValue != null && chart) {
                  chart.data.datasets[i][attribute] = attrValue
                }
              }
            })
            if (newData.labels) {
              chart.data.labels = newData.labels
              handleLabelsUpdate()
            }
          } else {
            chart.data = newData
            // chart.data.datasets.forEach((val, index) => {
            //   if (index in newData.datasets) {
            //     if (chart.data.datasets[index].data.length === newData.datasets[index].data.length) {
            //       chart.data.datasets[index] = cloneDeep(newData.datasets[index])
            //     } else {
            //       const baseData = chart.data.datasets[index].data
            //       const _a = newData.datasets[index], { data } = _a, rest = __objRest(_a, ['data'])
            //       chart.data.datasets[index].data.push(20)
            //       if (baseData.length > data.length) {
            //         baseData.splice(data.length - 1, baseData.length - data.length)
            //       } else {
            //         baseData.push(...data.slice(baseData.length - 1, data.length - baseData.length))
            //       }
            //     }
            //   }
            // })
          }
          handleChartUpdate()
        } else {
          if (chartInstance.value) {
            handleChartDestroy()
          }
          renderChart()
        }
      }
      function renderChart () {
        if (canvasRef.value) {
          chartInstance.value = new Chartjs.Chart(canvasRef.value, {
            data: cloneDeep(props.chartData),
            type: chartType,
            options: cloneDeep(props.options),
            plugins: props.plugins
          })
          handleChartRender()
        } else {
          console.error(`Error on component ${componentName}, canvas cannot be rendered. Check if the render appends server-side`)
        }
      }
      function handleLabelsUpdate () {
        emit('labels:update')
        props.onLabelsUpdate && props.onLabelsUpdate()
      }
      function handleChartRender () {
        if (chartInstance.value) {
          emit('chart:render', chartInstance.value)
          props.onChartRender && props.onChartRender(chartInstance.value)
        }
      }
      function handleChartUpdate () {
        if (chartInstance.value) {
          chartInstance.value.update()
          emit('chart:update', chartInstance.value)
          props.onChartUpdate && props.onChartUpdate(chartInstance.value)
        }
      }
      function handleChartDestroy () {
        chartInstance.value && chartInstance.value.destroy()
        emit('chart:destroy')
        props.onChartDestroy && props.onChartDestroy()
      }
      onMounted(renderChart)
      onBeforeUnmount(() => {
        if (chartInstance.value) {
          chartInstance.value.destroy()
        }
      })
      expose({
        canvasRef,
        renderChart,
        chartInstance,
        canvasId,
        update: handleChartUpdate
      })
      return () => h('div', {
        style: __spreadProps(__spreadValues({
          maxWidth: '100%'
        }, props.styles), {
          position: 'relative'
        }),
        class: props.cssClasses
      }, [
        h('canvas', {
          style: {
            maxWidth: '100%',
            maxHeight: '100%'
          },
          id: canvasId,
          width: props.width,
          height: props.height,
          ref: canvasRef
        })
      ])
    }
  })
}

// src/hooks/hooks.builder.ts

const defineChartHook = (chartType) => {
  return (params) => {
    const CHART_REF_NAME = `${chartType}ChartRef`
    const _struct = {
      [CHART_REF_NAME]: ref2()
    }
    const reactiveProps = computed(() => __spreadProps(__spreadValues(__spreadValues(__spreadValues({}, params), params.jsx && {
      ref: _struct[CHART_REF_NAME]
    }), !params.jsx && {
      ref: CHART_REF_NAME
    }), {
      chartData: unref(params.chartData),
      options: unref(params.options)
    }))
    function update () {
      let _a
      const chartComponentRef = _struct[CHART_REF_NAME].value
      if (chartComponentRef) {
        (_a = chartComponentRef == null ? void 0 : chartComponentRef.chartInstance.value) == null ? void 0 : _a.update()
      } else {
        console.warn(`No chartInstance to update (use${pascalCase(chartType)}Chart)`)
      }
    }
    return {
      [`${chartType}ChartProps`]: reactiveProps,
      [CHART_REF_NAME]: _struct[CHART_REF_NAME],
      update
    }
  }
}

// src/exports/component.exports.ts
const BarChart = defineChartComponent('bar-chart', 'bar')
const DoughnutChart = defineChartComponent('doughnut-chart', 'doughnut')
const LineChart = defineChartComponent('line-chart', 'line')
const PieChart = defineChartComponent('pie-chart', 'pie')
const PolarAreaChart = defineChartComponent('polar-chart', 'polarArea')
const RadarChart = defineChartComponent('radar-chart', 'radar')
const BubbleChart = defineChartComponent('bubble-chart', 'bubble')
const ScatterChart = defineChartComponent('scatter-chart', 'scatter')

// src/exports/hooks.exports.ts
const useDoughnutChart = defineChartHook('doughnut')
const useBarChart = defineChartHook('bar')
const useLineChart = defineChartHook('line')
const usePieChart = defineChartHook('pie')
const usePolarAreaChart = defineChartHook('polarArea')
const useRadarChart = defineChartHook('radar')
const useBubbleChart = defineChartHook('bubble')
const useScatterChart = defineChartHook('scatter')
export {
  BarChart,
  BubbleChart,
  DoughnutChart,
  LineChart,
  PieChart,
  PolarAreaChart,
  RadarChart,
  ScatterChart,
  defineChartComponent,
  defineChartHook,
  useBarChart,
  useBubbleChart,
  useDoughnutChart,
  useLineChart,
  usePieChart,
  usePolarAreaChart,
  useRadarChart,
  useScatterChart
}
