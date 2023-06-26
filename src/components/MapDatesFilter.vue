<!--
  SHOWS DATES SELECTION ON MAP
  GETS DATA FROM PROPS
-->

<template>
  <div>
    <div
      class = "date-box"
      @click="calendarClicked"
    >
      <div>
        <q-btn
          size="0.95em" padding="2px 5px 2px 3px"
          icon="event_note"
          class="calendar-button"
        >
        </q-btn>
      </div>
      <div
        v-if="dFrom"
        class="date-from"
        :class="dTo?'':'loading'">
          {{ dFrom }}
      </div>
      <div v-if="dTo" class="date-to">{{ dTo }}</div>
    </div>
    <q-menu
      class="calendar-position"
    >
      <q-date
        navigation-min-year-month="2014/06"
        :navigation-max-year-month="getCurrentDate"
        v-model="calendarValue"
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
    </q-menu>
  </div>
</template>
<script>

import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/appStore'
import { useMapStore } from '../stores/mapStore'
import { useTimeSeriesStore } from '../stores/timeseriesStore'
import moment from 'moment'

export default {
  props: ['dateFrom', 'dateTo'],
  emits: ['calendarClicked', 'dateSelected'],
  setup (props, context) {
    const appStore = useAppStore()
    const mapStore = useMapStore()
    const timeseriesStore = useTimeSeriesStore()
    const enableButton = ref(false)
    const calendarValue = ref()
    const calendarBtn = ref()
    const rangeStartValue = ref(false)
    const rangeEndValue = ref(false)
    const getCurrentDate = ref()

    const trans = function (text) {
      return appStore.getText(text)
    }

    const dFrom = computed(() => {
      if (props.dateFrom !== undefined && props.dateTo !== undefined) {
        return (props.dateFrom !== props.dateTo) ? moment(props.dateFrom, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''
      } else {
        return trans('Loading...')
      }
    })

    const dTo = computed(() => {
      if (props.dateFrom !== undefined && props.dateTo !== undefined) {
        return (props.dateFrom === '' && props.dateTo === '') ? '' : moment(props.dateTo, 'YYYY-MM-DD').format('DD/MM/YYYY')
      } else {
        return ''
      }
    })

    const calendarClicked = function () {
      context.emit('calendarClicked', {})
    }

    function spinner (visibility = true) {
      if (visibility) {
        reloading.value = false
      }
      appStore.setModal({
        id: 'wait',
        content: {
          visibility: visibility
        }
      })
    }

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

    const resetDateFilter = function () {
      rangeStartValue.value = false
      rangeEndValue.value = false
      calendarValue.value = null

      context.emit('dateSelected', {
        type: 'date',
        data: {
          from: '',
          to: ''
        }
      })
    }

    const mapDates = computed(() => {
      return mapStore.getMapDates
    })

    onMounted(function () {
      reloading.value = true
      const defaultDates = JSON.parse(JSON.stringify(appStore.getDefaults.dates[0]))
      timeseriesStore.setAnimationOptions({
        onComplete: function (chart) {
          // By default chart has one label
          // If chart is really drawn (that is more than one label)
          // then reloading is true
          if (timeseriesStore.getGraphIsVisible) {
            reloading.value = false
            spinner(false)
          }
          if (!mapStore.getIndexingOn) {
            spinner(false)
          }
        }
      })
      defaultDates.from = moment(defaultDates.from, 'YYYY-MM-DD').format('YYYY/MM/DD')
      defaultDates.to = moment(defaultDates.to, 'YYYY-MM-DD').format('YYYY/MM/DD')
      calendarValue.value = [defaultDates]
      let subtitle = moment(defaultDates.from, 'YYYY-MM-DD').format('DD/MM/YYYY')
      subtitle += ' - ' + moment(defaultDates.to, 'YYYY-MM-DD').format('DD/MM/YYYY')
      appStore.setCalendarSubtitle(subtitle)

      const d = new Date(Date.now())
      const monthIn2Digit = String(d.getMonth() + 1).padStart(2, '0')
      getCurrentDate.value = d.getFullYear() + '/' + monthIn2Digit
      mapStore.setMapDates({ defaultDates })
    })

    const applyButtonClass = function () {
      if (calendarValue.value) {
        enableButton.value = true
      } else {
        enableButton.value = false
      }
    }

    const datePicked = function (event) {
      let daysInRange = 0
      let sDate
      let eDate
      let date
      rangeStartValue.value = false
      rangeEndValue.value = false

      if (typeof calendarValue.value === 'string') {
        const day = calendarValue.value
        daysInRange = 1
        date = {
          from: moment(day).format('YYYY-MM-DD'),
          to: moment(day).format('YYYY-MM-DD')
        }
        appStore.setCalendarSubtitle(moment(day).format('DD/MM/YYYY'))
      } else {
        // In some extreme cases calendarValue.value.from is null after pan on graph
        if (calendarValue.value) {
          sDate = calendarValue.value.from
          eDate = calendarValue.value.to

          // dateFilterToString(date)
          daysInRange = moment(eDate, 'YYYY/MM/DD').diff(moment(sDate, 'YYYY/MM/DD'), 'days')

          // Format date must be YYYY-MM-DD
          sDate = moment(calendarValue.value.from, 'YYYY/MM/DD').format('YYYY-MM-DD')
          eDate = moment(calendarValue.value.to, 'YYYY/MM/DD').format('YYYY-MM-DD')
          date = {
            from: sDate,
            to: eDate
          }
          // Set calendar subtitle
          let subtitle = moment(calendarValue.value.from, 'YYYY/MM/DD').format('DD/MM/YYYY')
          subtitle += ' - ' + moment(calendarValue.value.to, 'YYYY/MM/DD').format('DD/MM/YYYY')
          appStore.setCalendarSubtitle(subtitle)
        }
      }

      mapStore.setMapDates(date)
      timeseriesStore.updateXUnits(daysInRange)
      context.emit('dateSelected', {
        type: 'date',
        data: date
      })
    }

    const showCalendar = function () {
      calendarBtn.value.$el.click()
    }

    const setCalendarValue = function (date) {
      const data = JSON.stringify(date).split('-').join('/')
      calendarValue.value = JSON.parse(data)
    }

    return {
      trans,
      enableButton,
      applyButtonClass,
      dFrom,
      dTo,
      rangeEnd,
      rangeStart,
      calendarClicked,
      setCalendarValue,
      showCalendar,
      calendarValue,
      calendarBtn,
      resetDateFilter,
      getCurrentDate,
      datePicked,
      mapDates
    }
  }
}
</script>

<style lang="scss">
.date-box {
  align-items:baseline;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 10px;
  right: 10px;
  background:#efa501;
  color:white;
  border-radius: 10px;
  z-index: 30;
  height: 40px;
  line-height: 40px;
  font-family: $font-family;
  font-size: 1em;
  font-weight: bold;
  width: auto;
  min-width: 40px;
  cursor: pointer;
  // padding: 0 7px 0 3px;
  box-shadow: $box-shadow;
}
.date-box:hover{
  background: $primary-button-background-hover;
  color: $primary-button-text-hover;
  box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
  transition: all .6s cubic-bezier(.25,.8,.25,1);
}
.date-from::not(.loading)::after{
  content: '-';
  margin-left:10px;
}
.date-from.loading{
  margin-right: 10px;
}
.date-to{
  padding-left: 10px;
  padding-right: 7px;
}

// .date-box button:hover {
//   color: $primary-color;
// }

.data-box,
.data-box::before{
  box-shadow: none;
}

.calendar-button::before{
  box-shadow: none;
}

.calendar-button span.q-btn__content i.q-icon{
  font-size: 2em;
}

.q-menu.calendar-position[style]{
  top:60px !important;
  right: 10px !important;
  left: unset !important;
}
</style>
