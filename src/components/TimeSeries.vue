f.ca<template>
  <div :class="timeSeriesClass">
    <div class="toggle-time">
      <q-btn
        flat dense
        icon="expand_less"
        class="white-text"
        :class="iconStatus"
        :label="_('Time series')"
        @click="toggleTimeSeries"
      >
      <div class="timeseries-filter">
        {{ dateFilter }}
      </div>
      </q-btn>
    </div>
    <div class="body">
      <div class="legend">
        <div v-for="set in chartData.datasets" :key="set.label">
          <img class="symbol" :src="set.icon" height="20" v-if="set.icon">
          <i class="symbol" :class="set.faIcon" v-if="set.faIcon"></i> {{ _(set.label) }}
        </div>
        <div>
          <q-btn
            v-if="dateRange"
            icon="delete"
            class="delete-calendar-button mr-10"
            @click="resetDateFilter"
            :label="_('Delete')"
          />
          <q-btn icon="event_note" class="calendar-button" :label="_('Select')">
            <q-popup-proxy
              @before-show="updateProxy"
              cover
              transition-show="scale"
              transition-hide="scale">
              <q-date
                navigation-min-year-month='2015/01'
                :navigation-max-year-month="getCurrentDate"
                v-model="dateRange"
                range
                class="calendar"
                color="orange-4"
                text-color="black"
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="Cancel" color="red" flat v-close-popup/>
                  <q-btn label="OK" class="ok-button" flat @click="datePicked" v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </div>
      </div>
      <LineChart class="graph-canvas" :chartData="chartData" :height="230" :options="chartOptions" ref="chart" />
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
    const getCurrentDate = ref()
    const dateRange = ref()
    const dateFilter = ref()
    const $store = useStore()
    const timeIsVisible = ref(props.timeSeriesVisible)
    const iconStatus = ref('null')

    const resetDateFilter = function () {
      dateRange.value = null
      dateFilterToString($store.getters['timeseries/getCompleteDatesRange'])
      context.emit('dateSelected', {
        type: 'date',
        data: null
      })
    }
    // Timeseries properties
    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (timeIsVisible.value) {
        classes += ' visible'
      }
      return classes
    })

    function setDate (date) {
      dateRange.value = null
      dateRange.value = {
        from: date.from.replaceAll('-', '/'),
        to: date.to.replaceAll('-', '/')
      }
      $store.commit('map/setMapDates', { dateRange })
      const sDate = dateRange.value.from
      const eDate = dateRange.value.to
      dateFilter.value = moment(sDate).format('DD/MM/YYYY') + ' - ' + moment(eDate).format('DD/MM/YYYY')
    }

    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
      dateRange.value = defaults.dates
      const sDate = dateRange.value.from
      const eDate = dateRange.value.to
      dateFilter.value = moment(sDate).format('DD/MM/YYYY') + ' - ' + moment(eDate).format('DD/MM/YYYY')
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      $store.commit('map/setMapDates', { dateRange })
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
      const date = dateRange.value
      dateFilterToString(date)
      let daysInRange = 0
      if (typeof event === 'string') {
        daysInRange = 1
        dateFilter.value = date
      } else {
        const sDate = dateRange.value.from
        const eDate = dateRange.value.to
        dateFilterToString(date)
        daysInRange = moment(eDate).diff(moment(sDate), 'days')
      }
      $store.commit('timeseries/updateXUnits', daysInRange)
      context.emit('dateSelected', { type: 'date', data: JSON.parse(JSON.stringify(dateRange.value)) })
    }
    const chartOptions = computed(() => {
      return $store.getters['timeseries/getChartOptions']
    })
    // Language function
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const dateFilterToString = function (date) {
      if (typeof date === 'object') {
        const sDate = date.from
        const eDate = date.to
        if (sDate === eDate) {
          dateFilter.value = moment(sDate).format('DD-MM-YYYY')
        } else {
          dateFilter.value = moment(sDate).format('DD-MM-YYYY') + ' - ' + moment(eDate).format('DD-MM-YYYY')
        }
      } else {
        dateFilter.value = moment(date).format('DD-MM-YYYY')
      }
    }

    return {
      _,
      setDate,
      resetDateFilter,
      dateFilterToString,
      getCurrentDate,
      dateFilter,
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
      max-height: $timeseries-height;
      height: $timeseries-height;
      transition: max-height .3s ease-in;
    }
    box-shadow: 7px 0 14px rgba(0,0,0,0.25), 5px 0 5px rgba(0,0,0,0.22);
  }
  .map-footer>div:not(.toggle-time) {
    padding: 10px 15px;
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
  .body{
    overflow-x: auto;
    display:flex;
    flex-direction: column;
  }
  .legend {
    margin-left: 30px;
    display: flex;
    justify-content: space-between;
  }
  .legend,
  .legend>div {
    display: flex;
    // margin-right: 10px;
    margin-right: 10px;
    white-space:nowrap;
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
    border:0px;
    box-shadow: none;
  }
  button::before{
    box-shadow: none;
  }
  .mr-10{
    margin-right: 10px;
  }
  .legend div{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-height: 16px;     /* fallback */
    max-height: 32px;      /* fallback */
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
  .timeseries-filter{
    margin-left:20px;
    font-weight:300;
  }
  .legend button{
    background: $primary-color;
    color:white;
    border-radius:8px;
    border:none;
  }
  .legend .delete-calendar-button{
    background: #ccc;
    color:white;
    border-radius:8px;
    border:none;
    font-size: .8em;
  }
</style>
