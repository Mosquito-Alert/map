
import { defineStore } from 'pinia'

export const useTimeSeriesStore = defineStore('timeseries', {
  state: () => ({
    toggling: false,
    graphIsVisible: false,
    completeDatesRange: {},
    // dates: [],
    // data: [],
    cache: {
      dates: [],
      data: []
    },
    Data: {
      dates: [],
      data: []
    },
    chart: {
      options: {
        animation: {},
        responsive: true,
        plugins: {
          legend: { display: false },
          zoom: {
            pan: {
              modifierKey: 'shift',
              enabled: true,
              mode: 'x'
            },
            zoom: {
              mode: 'x',
              drag: {
                enabled: true,
                backgroundColor: 'rgba(239, 165, 1, 0.3)'
              },
              pinch: {
                enabled: true
              }
            }
          }
        },
        elements: {
          point: {
            borderWidth: 0,
            radius: 0
          }
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              lineWidth: 0.5
            }
          },
          x: {
            bounds: 'data',
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false
              // autoSkip: true
            },
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM YY',
                day: 'DD MMM YY'
              }
            }
          }
        }
      }
    }
  }),

  getters: {
    getData (state) {
      return state.data
    },
    getDData (state) {
      return state.Data
    },
    getDates (state) {
      return Object.values(state.dates)
    },
    getChartOptions (state) {
      return state.chart.options
    },
    getCompleteDatesRange (state) {
      return state.completeDatesRange
    },
    getActiveLayers (state) {
      return state.activeLayers
    },
    getGraphIsVisible (state) {
      return state.graphIsVisible
    },
    getYTickSuggestedMax (state) {
      return state.chart.options.scales.y.suggestedMax
    },
    getToggling (state) {
      return state.toggling
    }
  },

  actions: {
    setCompleteDatesRange (payload) {
      this.completeDatesRange = payload
    },
    updateDates (payload) {
      this.dates = payload
    },
    updateDData (payload) {
      this.Data = payload
    },
    updateCache (payload) {
      this.cache = payload
    },
    updateDataFromCache () {
      this.Data = this.cache
    },
    updateXUnits (days) {
      if (days < 40) {
        this.chart.options.scales.x.time.unit = 'day'
      } else {
        this.chart.options.scales.x.time.unit = 'month'
      }
    },
    setChartOptions (options) {
      this.chart.options = options
    },
    setGraphIsVisible (visibility) {
      this.graphIsVisible = visibility
    },
    setChartOnZoomComplete (options) {
      this.chart.options.plugins.zoom.zoom.onZoomComplete = options
    },
    setChartOnZoomStart (options) {
      this.chart.options.plugins.zoom.zoom.onZoomStart = options
    },
    setChartOnPanStart (options) {
      this.chart.options.plugins.zoom.pan.onPanStart = options
    },
    setChartOnPanComplete (options) {
      this.chart.options.plugins.zoom.pan.onPanComplete = options
    },
    setYTickSuggetedMax (max) {
      this.chart.options.scales.y.suggestedMax = max
    },
    setToggling (payload) {
      this.toggling = payload
    },
    setAnimationOptions (payload) {
      this.chart.options.animation = payload
    },
    // updateData (payload) {
    //   this.data = payload
    // },
    updateData (data) {
      this.updateDates(data.dates)
      this.updateData(data.data)
    }
  }
})
