<template>
  <div class = "date-box">
    <div>
      <q-btn
        size="0.95em" padding="2px 5px 2px 3px"
        icon="event_note"
        class="calendar-button"
        @click="calendarClicked"
      >
      </q-btn>
    </div>
    <div v-if="dFrom" class="date-from" v-html="dFrom"></div>
    <div v-if="dTo" class="date-to" v-html="dTo"></div>
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

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const dFrom = computed(() => {
      return (props.dateFrom !== props.dateTo) ? moment(props.dateFrom).format('DD/MM/YYYY') : ''
    })

    const dTo = computed(() => {
      return (props.dateFrom === '' && props.dateTo === '') ? '' : moment(props.dateTo).format('DD/MM/YYYY')
    })

    const calendarClicked = function () {
      context.emit('calendarClicked', {})
    }

    return {
      _,
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
  justify-content: bottom;
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 1px 10px;
  background: $primary-color;
  color:white;
  border-radius: 25px;
  z-index: 10;
  font-family: $font-family;
  font-size: 0.85em;
  box-shadow: $box-shadow;
  width: auto;
}

.date-from::after{
  content: '-';
  margin-left:10px;
}

.date-to{
  padding-left: 10px;
}

.date-box button:hover {
  color: $primary-color;
}

.data-box,
.data-box::before{
  box-shadow: none;
}

.calendar-button::before{
  box-shadow: none;
}

</style>
