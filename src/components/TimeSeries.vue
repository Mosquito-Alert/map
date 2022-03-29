<template>
  <div :class="timeSeriesClass">
    <div class="toggle-time">
      <q-btn flat round dense icon="expand_more" class="white-text" :class="iconStatus" :label="_('Time series')" @click="toggleTimeSeries"/>
    </div>
    <div class="body">
      <div class="legend">
        <div v-for="set in chartData.datasets" :key="set.label">
          <img class="symbol" :src="set.icon" height="20" v-if="set.icon">
          <i class="symbol" :class="set.faIcon" v-if="set.faIcon"></i> {{ _(set.label) }}
        </div>
        <q-btn icon="event" class="calendar-button" :label="_('Select')">
          <q-popup-proxy
            @before-show="updateProxy"
            cover
            transition-show="scale"
            transition-hide="scale">
            <q-date v-model="dateRange" range class="calendar" color="orange-4" text-color="black">
              <div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Cancel" color="red" flat v-close-popup />
                <q-btn label="OK" class="ok-button" flat @click="datePicked" v-close-popup />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </div>
      <LineChart :chartData="chartData" :height="150" :options="chartOptions" ref="chart" />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
// import { LineChart } from 'vue-chart-3'
import { LineChart } from './VueChartJS.js'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-moment'
import moment from 'moment'

Chart.register(...registerables)

export default defineComponent({
  name: 'TimeSeries',
  components: { LineChart },
  emits: ['toggleTimeSeries', 'dateSelected'],
  props: {
    timeSeriesVisible: { type: Boolean }
  },
  setup (props, context) {
    // $q.lang.set('es') // returns a string
    // console.log($q.lang.getLocale()) // returns a string

    const chart = ref()
    const dateRange = ref()
    const $store = useStore()
    const timeIsVisible = ref(props.timeSeriesVisible)
    const iconStatus = ref('null')
    // Timeseries properties
    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (timeIsVisible.value) {
        classes += ' visible'
      }
      return classes
    })

    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
      dateRange.value = defaults.DATES
    })

    const toggleTimeSeries = function () {
      timeIsVisible.value = !timeIsVisible.value
      iconStatus.value = (timeIsVisible.value) ? 'open' : 'closed'
      context.emit('toggleTimeSeries', { isVisible: timeIsVisible.value, start: 0, end: 400 })
    }
    const getData = () => {
      const rawData = $store.getters['timeseries/getData']
      const layers = $store.getters['app/getLayers']
      const datasets = Object.keys(rawData).map(layer => {
        const cat = Object.keys(layers).find(category => {
          return layer in layers[category]
        })
        const color = layers[cat][layer].color
        const result = {
          label: _(layers[cat][layer].common_name),
          borderColor: color,
          backgroundColor: color,
          fill: false,
          data: Array.from(rawData[layer]),
          pointHitRadius: 200
        }
        if ('faIcon' in layers[cat][layer]) {
          result.faIcon = layers[cat][layer].faIcon
        } else {
          result.icon = layers[cat][layer].icon
        }
        return result
      })
      const data = {
        labels: $store.getters['timeseries/getDates'],
        datasets: datasets
      }
      moment.locale($store.getters['app/getLang'])
      return data
    }
    const chartData = computed(() => {
      let data = getData()
      // If the data is empty, the chart crashes and can't be updated.
      // To avoid this, a dummy record is added when there is no data
      if (!data.labels.length || !data.datasets.length) {
        data = {
          labels: [moment().format('YYYY-MM-DD')],
          datasets: [{
            borderColor: '#FFFFFF',
            data: [0]
          }]
        }
      }
      return data
    })
    const datePicked = function (event) {
      context.emit('dateSelected', { type: 'date', data: JSON.parse(JSON.stringify(dateRange.value)) })
      // $store.dispatch(
      //   'app/setFilter',
      //   { type: 'date', data: JSON.parse(JSON.stringify(dateRange.value)) }
      // )
    }
    const chartOptions = computed(() => {
      return $store.getters['timeseries/getChartOptions']
    })
    // Language function
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    return {
      _,
      chart,
      chartOptions,
      chartData,
      datePicked,
      dateRange,
      iconStatus,
      timeSeriesClass,
      timeIsVisible,
      toggleTimeSeries
    }
  }
})
</script>

<style scoped lang="scss">
  :deep(.q-btn.open span i){
    transform: rotate(-180deg);
    transition: ease all 1s;
  }
  :deep(.q-btn.closed span i){
    transform: rotate(0deg);
    transition: ease all 1s;
  }

  .map-footer {
    flex: 1;
    width: 100%;
    max-height: 0px;
    height: 0px;
    position: relative;
    background-color: $color-pestanya;
    color: $color-pestanya-text;
    transition: max-height .3s ease-out;
    border-top: 1px solid $line-color;
    &.visible {
      max-height: 200px;
      height: 200px;
      transition: max-height .3s ease-in;
    }
    box-shadow: 7px 0 14px rgba(0,0,0,0.25), 5px 0 5px rgba(0,0,0,0.22);
  }
  .map-footer>div:not(.toggle-time) {
    padding: 10px 50px 0px;
    height: 100%;
  }
  .toggle-time {
    position: absolute;
    top: -35px;
    padding: 0 10px 0 5px;
    background-color: $primary-button-background;
    color: $primary-button-text;
    border-top: 1px solid $line-color;
    border-right: 1px solid $line-color;
    border-top-right-radius: 10px;
  }
  .legend {
    margin-left: 30px;
    display: flex;
    justify-content: space-between;
  }
  .legend,
  .legend>div {
    display: flex;
    margin-right: 10px;
  }
  .legend>div .symbol {
    margin-right: 10px;
  }
  .calendar-button {
    background: white;
    border: 1px solid black;
    box-shadow: none;
    text-transform: none;
    border-radius: 0px;
    font-size: .8em;
  }
  .calendar :deep(.q-date__header) {
    background: $primary-color;
  }
  .ok-button {
    background: $primary-color;
    color: white;
  }
  .bites,
  .breeding {
    padding: 8px 6px;
    font-size: 1.2rem;
    height: 20px;
    width: 20px;
    font-size: 10px;
    line-height: 5px;
  }
  .bites {
    background-color: $color-bites;
    color: $text-color-bites;
    border-radius: 50%;
  }
  .breeding {
    background-color: $color-breeding;
    color: $text-color-breeding;
    border-radius: 2px;
  }
  .white-text{
    color:white;
  }
</style>
