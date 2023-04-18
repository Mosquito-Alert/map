<!--
  COMPONENT TO DRAW CHART
-->

<template>
  <div :class="timeSeriesClass">
    <div
      class="toggle-time"
      :class="mobile?'mobile':''"
    >
      <q-btn
        flat dense
        icon="expand_less"
        class="white-text"
        :class="iconStatus"
        :label="trans('Time series')"
        @click="toggleTimeSeries"
      >

      </q-btn>
    </div>
    <div class="body" :class="reloading?'reloading':''">
      <div v-if="reloading" id="reloading">
        <span>{{ trans('reloading graph') }}</span>
      </div>
      <div v-if="mobile" class="flex-right" :class="zoomed?'spaceBetween':'flexRight'">
        <q-btn v-if="zoomed" class="timeseries-close ma-btn" @click="resetGraph">
          <i class="mobile reset-zoom fa-solid fa-backward q-mr-md"></i>
        </q-btn>
        <q-btn :label="trans('Close')" class="timeseries-close ma-btn" @click="toggleTimeSeries"/>
      </div>
      <div class="legend" :class="mobile?'row mobile':'no-row'">
        <i v-if="zoomed && !mobile" :title="trans('Reset zoom graph')" class="reset-zoom fa-solid fa-backward q-mr-md" @click="resetGraph"></i>
        <div :class="mobile?'col-12':''">
          <div class="flex" :class="mobile?'row':''">
            <template v-for="set in chartData.datasets" :key="set.label">
              <div class="col-6" :class="mobile?'q-py-xs':''">
                <div class="no-wrap">
                  <img v-if="set.icon"
                    class="symbol"
                    :src="set.icon"
                    :height=20
                    :class="(set.opacity)?' possible':''"
                  >
                  <i  v-if="set.faIcon" class="symbol" :class="set.faIcon"></i>
                  {{ trans(set.label) }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <div>
          <q-btn
            ref="calendarBtn"
            icon="event_note"
            class="no-pointer-events calendar-button"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
            <!-- QUASAR CALENDAR -->
              <q-date
                navigation-min-year-month="2014/06"
                :navigation-max-year-month="getCurrentDate"
                v-model="calendarDate"
                :subtitle="rangeEndValue?rangeEndValue:(rangeStartValue?rangeStartValue:calendarSubtitle)"
                range
                :years-in-month-view=true
                class="calendar"
                color="orange-4"
                text-color="black"
                @range-start="rangeStart"
                @range-end="rangeEnd"
                @update:model-value="applyButtonClass"
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn :label="trans('Select all')" class="ma-btn"
                    flat
                    v-close-popup
                    @click="resetDateFilter"
                  />
                  <q-btn
                    :label="trans('Apply calendar')"
                    :class="enableButton?'ma-btn':'ma-btn disabled'"
                    flat v-close-popup
                    @click="datePicked"
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </div>
      </div>
      <!-- CHART -->
      <LineChart
        ref="chart"
        class="graph-canvas"
        :chartData="chartData"
        :height="graphicHeight"
        :options="chartOptions"
        @wheel="handleWheel"
        />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onUpdated, onMounted } from 'vue'
import { useStore } from 'vuex'
import { LineChart } from './VueChartJS.js'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-moment'
import moment from 'moment'
import zoomPlugin from 'chartjs-plugin-zoom'
import * as Hammer from 'hammerjs'

window.Hammer = Hammer.default
Chart.register(...registerables)
Chart.register(zoomPlugin)

export default defineComponent({
  name: 'TimeSeries',
  components: { LineChart },
  emits: ['toggleTimeSeries', 'dateSelected'],
  props: {
    timeSeriesVisible: { type: Boolean }
  },
  setup (props, context) {
    const chart = ref()
    const reloading = ref(true)
    const zoomed = ref(false)
    const panned = ref(false)
    const enableButton = ref(false)
    let currentYTickMax = null
    const getCurrentDate = ref()
    const calendarDate = ref()
    const graphicHeight = ref()
    const calendarBtn = ref()
    const rangeStartValue = ref(false)
    const rangeEndValue = ref(false)
    const $store = useStore()
    const timeIsVisible = ref(props.timeSeriesVisible)
    const iconStatus = ref('null')
    let mapDatesBeforeZoom = null

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    graphicHeight.value = mobile.value ? 400 : 230

    const resetDateFilter = function () {
      rangeStartValue.value = false
      rangeEndValue.value = false
      calendarDate.value = null

      context.emit('dateSelected', {
        type: 'date',
        data: {
          from: '',
          to: ''
        }
      })
    }

    const mapDates = computed(() => {
      return $store.getters['map/getMapDates']
    })

    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (mobile.value) {
        classes += ' mobile'
      }
      if (timeIsVisible.value) {
        classes += ' visible'
      } else {
        classes += ' no-visible'
      }
      if ($store.getters['map/getLeftMenuToggling'] && (!$store.getters['timeseries/getGraphIsVisible'])) {
        classes += ' display-none'
      }
      return classes
    })

    onMounted(function () {
      reloading.value = true
      const defaultDates = JSON.parse(JSON.stringify($store.getters['app/getDefaults'])).dates[0]
      $store.commit('timeseries/setAnimationOptions', {
        onComplete: function (chart) {
          // By default chart has one label
          // If chart is really drawn (that is more than one label)
          // then reloading is true
          if ($store.getters['timeseries/getGraphIsVisible']) {
            reloading.value = false
            spinner(false)
          }
          if (!$store.getters['map/getIndexingOn']) {
            spinner(false)
          }
        }
      })
      defaultDates.from = moment(defaultDates.from, 'YYYY-MM-DD').format('YYYY/MM/DD')
      defaultDates.to = moment(defaultDates.to, 'YYYY-MM-DD').format('YYYY/MM/DD')
      calendarDate.value = [defaultDates]

      let subtitle = moment(defaultDates.from, 'YYYY-MM-DD').format('DD/MM/YYYY')
      subtitle += ' - ' + moment(defaultDates.to, 'YYYY-MM-DD').format('DD/MM/YYYY')
      $store.commit('app/setCalendarSubtitle', subtitle)

      const d = new Date(Date.now())
      const monthIn2Digit = String(d.getMonth() + 1).padStart(2, '0')
      getCurrentDate.value = d.getFullYear() + '/' + monthIn2Digit
      $store.commit('map/setMapDates', { defaultDates })
    })

    function spinner (visibility = true) {
      if (visibility) {
        reloading.value = false
      }
      $store.commit('app/setModal', {
        id: 'wait',
        content: {
          visibility: visibility
        }
      })
    }

    onUpdated(function () {
      // Define callbacks when pan on chart starts
      $store.commit('timeseries/setChartOnPanStart', function ({ chart }) {
        if (!zoomed.value && !panned.value) {
          setMapBeforeZoom()
        }

        if (!panned.value) {
          panned.value = true
          const labels = chart.scales.y._labelItems
          currentYTickMax = parseInt(labels[labels.length - 1].label)
          $store.commit('timeseries/setYTickSuggetedMax', currentYTickMax)
        }
      })

      // Define callbacks when pan on chart ends
      $store.commit('timeseries/setChartOnPanComplete', function ({ chart }) {
        if (!zoomed.value) {
          setMapBeforeZoom()
        }
        zoomed.value = true
        const start = moment(new Date(chart.boxes[4].min)).format('YYYY/MM/DD')
        const end = moment(new Date(chart.boxes[4].max)).format('YYYY/MM/DD')
        const draggedFormatted = {
          from: start,
          to: end
        }
        calendarDate.value = draggedFormatted
        datePicked()
      })

      // Define callback when zoom on chart starts
      $store.commit('timeseries/setChartOnZoomStart', function ({ chart }) {
        $store.commit('timeseries/setYTickSuggetedMax', null)
        if (!zoomed.value && !panned.value) {
          setMapBeforeZoom()
        }
      })

      // Define callback when zoom on chart ends
      $store.commit('timeseries/setChartOnZoomComplete', function ({ chart }) {
        zoomed.value = true
        const start = new Date(chart.boxes[4].min)
        const end = new Date(chart.boxes[4].max)
        const draggedFormatted = {
          from: moment(start, 'YYYY-MM-DD').format('YYYY/MM/DD'),
          to: moment(end, 'YYYY-MM-DD').format('YYYY/MM/DD')
        }
        calendarDate.value = draggedFormatted
        datePicked()
      })
    })

    const setMapBeforeZoom = function () {
      if ($store.getters['map/getMapDates'].from !== '') {
        mapDatesBeforeZoom = JSON.parse(JSON.stringify($store.getters['map/getMapDates']))
        mapDatesBeforeZoom.from = moment(mapDatesBeforeZoom.from, 'YYYY-MM-DD').format('YYYY/MM/DD')
        mapDatesBeforeZoom.to = moment(mapDatesBeforeZoom.to, 'YYYY-MM-DD').format('YYYY/MM/DD')
      } else {
        mapDatesBeforeZoom = null
      }
    }
    // Redraw chart with init data
    const resetGraph = function () {
      zoomed.value = false
      panned.value = false
      if (mapDatesBeforeZoom !== null) {
        calendarDate.value = mapDatesBeforeZoom
        datePicked()
      } else {
        resetDateFilter()
      }
    }

    const calendarSubtitle = computed(() => {
      return $store.getters['app/getCalendarSubtitle']
    })

    const toggleTimeSeries = function () {
      timeIsVisible.value = !timeIsVisible.value
      iconStatus.value = (timeIsVisible.value) ? 'open' : 'closed'
      context.emit('toggleTimeSeries', { isVisible: timeIsVisible.value, start: 0, end: 400 })
    }

    // Get Chart data from store
    const getData = () => {
      reloading.value = true
      const rawData = $store.getters['timeseries/getDData']
      const layers = JSON.parse(JSON.stringify($store.getters['app/getLayers']))
      const datasets = Object.keys(rawData.data).map(code => {
        const cat = Object.keys(layers).find(category => {
          return code in layers[category]
        })

        const color = layers[cat][code].color
        const result = {
          label: trans(layers[cat][code].common_name),
          borderColor: color,
          backgroundColor: color,
          fill: false,
          data: Array.from(rawData.data[code]),
          pointHitRadius: 200,
          opacity: (code.indexOf('_probable') > -1)
        }
        if ('faIcon' in layers[cat][code]) {
          result.faIcon = layers[cat][code].faIcon
        } else {
          result.icon = layers[cat][code].icon
        }
        return result
      })
      const data = {
        labels: rawData.dates,
        datasets: datasets
      }
      moment.locale($store.getters['app/getLang'])
      return data
    }

    // Prepare chart data to create chart
    const chartData = computed(() => {
      let data = getData()
      // If the data is empty, the chart crashes and can't be updated.
      // To avoid this, a dummy record is added when there is no data
      if (!data.labels.length || !data.datasets.length) {
        data = {
          labels: [moment(new Date(Date.now())).format('YYYY-MM-DD')],
          datasets: [{
            borderColor: '#FFFFFF',
            data: [0]
          }]
        }
      }
      return data
    })

    const rangeStart = function (range) {
      const sDate = moment(range.year + '/' + range.month + '/' + range.day, 'YYYY/MM/DD')
      rangeStartValue.value = moment(sDate).format('DD/MM/YYYY')
    }

    const rangeEnd = function (range) {
      const start = range.from.year + '/' + range.from.month + '/' + range.from.day
      const end = range.to.year + '/' + range.to.month + '/' + range.to.day

      const sDate = moment(start, 'YYYY/MM/DD')
      const eDate = moment(end, 'YYYY/MM/DD')

      if (start === end) {
        rangeEndValue.value = moment(sDate).format('DD/MM/YYYY')
      } else {
        rangeEndValue.value = moment(sDate).format('DD/MM/YYYY') + ' - ' + moment(eDate).format('DD/MM/YYYY')
      }
    }

    // Called when apply button is clicked
    const datePicked = function (event) {
      let daysInRange = 0
      let sDate
      let eDate
      let date
      rangeStartValue.value = false
      rangeEndValue.value = false

      if (typeof calendarDate.value === 'string') {
        const day = calendarDate.value
        daysInRange = 1
        date = {
          from: moment(day).format('YYYY-MM-DD'),
          to: moment(day).format('YYYY-MM-DD')
        }
        $store.commit('app/setCalendarSubtitle', moment(day).format('DD/MM/YYYY'))
      } else {
        // In some extreme cases calendarDate.value.from is null after pan on graph
        if (calendarDate.value) {
          sDate = calendarDate.value.from
          eDate = calendarDate.value.to

          // dateFilterToString(date)
          daysInRange = moment(eDate, 'YYYY/MM/DD').diff(moment(sDate, 'YYYY/MM/DD'), 'days')

          // Format date must be YYYY-MM-DD
          sDate = moment(calendarDate.value.from, 'YYYY/MM/DD').format('YYYY-MM-DD')
          eDate = moment(calendarDate.value.to, 'YYYY/MM/DD').format('YYYY-MM-DD')
          date = {
            from: sDate,
            to: eDate
          }
          // Set calendar subtitle
          let subtitle = moment(calendarDate.value.from, 'YYYY/MM/DD').format('DD/MM/YYYY')
          subtitle += ' - ' + moment(calendarDate.value.to, 'YYYY/MM/DD').format('DD/MM/YYYY')
          $store.commit('app/setCalendarSubtitle', subtitle)
        }
      }

      $store.commit('map/setMapDates', date)
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
    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const showCalendar = function () {
      calendarBtn.value.$el.click()
    }

    const handleWheel = function (e) {
      if ((zoomed.value || panned.value) && (e.deltaY < 0)) {
        resetGraph()
      }
    }

    const applyButtonClass = function () {
      if (calendarDate.value) {
        enableButton.value = true
      } else {
        enableButton.value = false
      }
    }

    return {
      trans,
      enableButton,
      applyButtonClass,
      reloading,
      handleWheel,
      zoomed,
      resetGraph,
      rangeStartValue,
      rangeEndValue,
      rangeStart,
      rangeEnd,
      calendarSubtitle,
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
  .map-footer:not(.mobile) {
    transition: max-height .5s ease-out;
    position: relative;
  }

  .map-footer.mobile {
    transition: max-height .7s ease-out;
    position:absolute;
    bottom: 0px;
  }
  .map-footer {
    flex: 1;
    width: 100%;
    max-height: 0px;
    height: 0px;
    background-color: $color-pestanya;
    color: $color-pestanya-text;
    border-top: 1px solid $line-color;
    &.visible:not(.mobile) {
      max-height: $timeseries-height;
      height: $timeseries-height;
    }
    &.mobile.visible {
      max-height: 100%;
      height: 100%;
    }
    &.mobile.no-visible{
      height:0px;
      z-index: 300;
      position: absolute;
      bottom: 0px;
      transition: all .7s ease;
    }
    box-shadow: 7px 0 14px rgba(0,0,0,0.25), 5px 0 5px rgba(0,0,0,0.22);
  }
  .map-footer.visible .toggle-time{
    box-sizing: inherit;
  }
  .map-footer.mobile.no-visible div.body,
  .map-footer.display-none div.body{
    display: none;
  }
  .map-footer>div:not(.toggle-time) {
    padding: 5px 15px;
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
  .toggle-time:hover{
    background: $primary-button-background-hover;
    color: $primary-button-text-hover;
    box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
    transition: all .6s cubic-bezier(.25,.8,.25,1);
  }
  .body{
    overflow-x: auto;
    display:flex;
    flex-direction: column;
  }
  .legend {
    display: flex;
  }
  .legend,
  .legend .no-row,
  .legend .no-row .no-row{
    display: flex;
    margin-right: 10px;
    white-space:wrap;
  }
  .legend div:not{
    margin-right: 10px;
    margin-left: 3px;
  }
  .legend .no-row div{
    margin-right: 8px;
  }
  .legend .no-row div div{
    margin-left: 3px;
  }
  .legend>div .symbol {
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
  .legend.row.mobile {
    overflow: auto;
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
  .legend .no-row div,
  .legend div{
    // text-overflow: ellipsis;
    display: flex;
    flex-wrap: wrap;
    line-height: 16px;     /* fallback */
    max-height: 42px;      /* fallback */
    // -webkit-line-clamp: 2; /* number of lines to show */
    // -webkit-box-orient: vertical;
  }
  .legend div{
    overflow: hidden;
  }
  .legend.no-row div{
    overflow-y: auto;
  }
  .legend.mobile div{
    max-height:unset;
    white-space: break-spaces;
  }
  .legend div img{
    height: 20px;
  }
  .legend div .symbol{
    margin: 0px 5px;
  }

  img.symbol.possible{
    opacity: (1 - $graph-possible-transparency);
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

  // MOBILE
  .map-footer.mobile.visible .toggle-time.mobile{
    display:none;
  }
  .mobile .graph-canvas{
    display: flex;
    align-items: center;
  }
  .graph-canvas{
    flex-grow:1
  }
  .map-footer.mobile:not(.visible){
    // transition: max-height 1s ease;
    max-height: 0px;
    height:0px;
    // position: relative;
  }
  .map-footer.mobile.visible{
    // transition: max-height 1s ease-out;
    max-height: 100%;
    height: 100%;
    z-index: 2000;
    position: absolute;
    bottom: 0px;
  }
  .legend.mobile .row div{
    padding: 0 10px 7px 3px;
  }

  .mobile.legend{
    display: flex;
    margin-left: 0px;
    margin-right: 0px;
    flex-wrap:wrap;
  }
  .legend.mobile .row{
    overflow: hidden;
    display: flex;
    flex-grow: 1;
    line-height: 16px;
    align-items: center;
  }
  .ma-btn{
    margin: 0 5px;;
  }
  .flex-right{
    display:flex;
    justify-content: space-between;
  }
  .flexRight{
    justify-content: right;
  }
  .spaceBetween{
    justify-content: space-between;
  }
  div:not(-mobile) .no-wrap{
    white-space: nowrap;
    display: inline;
  }
  .timeseries-close{
    margin: 10px 0px;
  }
  .reset-zoom{
    cursor: pointer;
    color: $primary-color;
  }
  .mobile.reset-zoom{
    color: white;
  }
  .reset-zoom:hover{
    opacity: 0.7;
  }
  :deep(button.q-btn.disabled) {
    opacity: 0.3 !important;
    background: $grey-color;
  }
  .reloading div#reloading{
    position: absolute;
    display:flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center ;
    z-index: 10;
  }
  .reloading div#reloading span{
    padding: 5px;
    background: white;
  }
  .body.reloading{
    opacity: .7
  }
</style>
