<!--
  SHOWS DATES SELECTION ON MAP
  GETS DATA FROM PROPS
-->

<template>
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
</template>
<script>

import { computed } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'

export default {
  props: ['dateFrom', 'dateTo'],
  emits: ['calendarClicked'],
  setup (props, context) {
    const $store = useStore()

    const trans = function (text) {
      return $store.getters['app/getText'](text)
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

    return {
      trans,
      dFrom,
      dTo,
      calendarClicked
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
</style>
