<template>
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
      <!-- <div class="timeseries-filter">
        {{ dateFilter }}
      </div> -->
      </q-btn>
    </div>
    <div class="body">
      <div class="legend" :class="mobile?'mobile':''">
        <div v-for="set in chartData.datasets" :key="set.label">
          <img class="symbol" :src="set.icon" height="20" v-if="set.icon">
          <i class="symbol" :class="set.faIcon" v-if="set.faIcon"></i>
            <div v-if="!mobile">{{ _(set.label) }}
            </div>
        </div>
        <div>
          <q-btn
            ref="calendarBtn"
            icon="event_note"
            class="no-pointer-events calendar-button"
          >
            <q-popup-proxy
              @before-show="updateProxy"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                navigation-min-year-month='2015/01'
                :navigation-max-year-month="getCurrentDate"
                v-model="calendarDate"
                range
                class="calendar"
                color="orange-4"
                text-color="black"
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn :label="_('Delete calendar')" color="grey"
                    flat
                    v-close-popup
                    @click="resetDateFilter"
                  />
                  <q-btn :label="_('Apply calendar')" class="ok-button" flat v-close-popup @click="datePicked"/>
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </div>
      </div>
      <LineChart class="graph-canvas" :chartData="chartData" :height="graphicHeight" :options="chartOptions" ref="chart" />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from 'vue'
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

    const chart = ref()
    const getCurrentDate = ref()
    // const dateFilter = ref()
    const calendarDate = ref()
    const graphicHeight = ref()
    const calendarBtn = ref()
    const $store = useStore()
    const timeIsVisible = ref(props.timeSeriesVisible)
    const iconStatus = ref('null')

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    graphicHeight.value = mobile.value ? '280' : '230'
    console.log(graphicHeight.value)

    const resetDateFilter = function () {
      calendarDate.value = null
      $store.commit('map/setMapDates', {
        from: datesRange.value.from,
        to: datesRange.value.to
      })
      // calendarDate.value = null
      context.emit('dateSelected', {
        type: 'date',
        data: {
          from: '',
          to: ''
        }
      })
      $store.commit('map/setMapDates', { from: '', to: '' })
    }
    // Timeseries properties

    const datesRange = computed(() => {
      return $store.getters['map/getDatesRange']
    })

    const mapDates = computed(() => {
      return $store.getters['map/getMapDates']
    })

    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (timeIsVisible.value) {
        classes += ' visible'
      }
      return classes
    })

    onMounted(function () {
      const defaultDates = JSON.parse(JSON.stringify($store.getters['app/getDefaults'])).dates[0]
      defaultDates.from = moment(defaultDates.from).format('YYYY/MM/DD')
      defaultDates.to = moment(defaultDates.to).format('YYYY/MM/DD')
      calendarDate.value = [defaultDates]
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      $store.commit('map/setMapDates', { defaultDates })
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
      console.log('picked')
      let daysInRange = 0
      let sDate
      let eDate
      let date

      // If only one day is selected
      if (typeof calendarDate.value === 'string') {
        const day = calendarDate.value
        daysInRange = 1
        date = {
          from: moment(day).format('YYYY-MM-DD'),
          to: moment(day).format('YYYY-MM-DD')
        }
      } else {
        sDate = calendarDate.value.from
        eDate = calendarDate.value.to
        // dateFilterToString(date)
        daysInRange = moment(eDate).diff(moment(sDate), 'days')

        // Format date must be YYYY-MM-DD
        sDate = moment(calendarDate.value.from).format('YYYY-MM-DD')
        eDate = moment(calendarDate.value.to).format('YYYY-MM-DD')
        date = {
          from: sDate,
          to: eDate
        }
      }
      $store.commit('map/setMapDates', date)
      // dateFilterToString(date)
      $store.commit('timeseries/updateXUnits', daysInRange)
      context.emit('dateSelected', {
        type: 'date',
        data: date
      })
    }

    const chartOptions = computed(() => {
      return $store.getters['timeseries/getChartOptions']
    })

    // Language function
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    // const dateFilterToString = function (date) {
    //   if (typeof date === 'object') {
    //     const sDate = date.from
    //     const eDate = date.to
    //     if (sDate === eDate) {
    //       dateFilter.value = moment(sDate).format('DD-MM-YYYY')
    //     } else {
    //       dateFilter.value = moment(sDate).format('DD-MM-YYYY') + ' - ' + moment(eDate).format('DD-MM-YYYY')
    //     }
    //   } else {
    //     dateFilter.value = moment(date).format('DD-MM-YYYY')
    //   }
    // }

    const showCalendar = function () {
      calendarBtn.value.$el.click()
    }

    return {
      _,
      mobile,
      graphicHeight,
      showCalendar,
      calendarDate,
      calendarBtn,
      resetDateFilter,
      // dateFilterToString,
      getCurrentDate,
      // dateFilter,
      chart,
      chartOptions,
      chartData,
      datePicked,
      mapDates,
      datesRange,
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
  .map-footer.visible .toggle-time{
    box-sizing: inherit;
  }
  .map-footer>div:not(.toggle-time) {
    padding: 10px 15px;
    height: 100%;
  }
  .toggle-time {
    box-sizing: content-box;
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
    vertical-align: bottom;
  }
  .calendar-button {
    background: white;
    border: 1px solid black;
    box-shadow: none;
    text-transform: none;
    border-radius: 0px;
    font-size: .8em;
    opacity: 0;
  }
  .calendar :deep(.q-date__header) {
    background: $primary-color;
  }
  .calendar :deep(.q-date__main) {
    // flex-direction: row-reverse;
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
    display: inline;
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
  .graph-canvas{
    flex-grow:1
  }
</style>
