<template>
  <div :class="timeSeriesClass">
    <div class="toggle-time">
      <q-btn flat round dense icon="expand_more" :class="iconStatus" :label="_('Time series')" @click="toggleTimeSeries"/>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'TimeSeries',
  emits: ['toggleTimeSeries'],
  props: {
    timeSeriesVisible: { type: Boolean }
  },
  setup (props, { emit }) {
    const $store = useStore()
    const timeIsVisible = ref(props.timeSeriesVisible)
    const iconStatus = ref('null')
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    // Timeseries properties
    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (timeIsVisible.value) {
        classes += ' visible'
      }
      return classes
    })
    const toggleTimeSeries = function () {
      timeIsVisible.value = !timeIsVisible.value
      iconStatus.value = (timeIsVisible.value) ? 'open' : 'closed'
      emit('toggleTimeSeries', { isVisible: timeIsVisible.value, start: 0, end: 400 })
    }
    return {
      _,
      iconStatus,
      timeSeriesClass,
      toggleTimeSeries,
      timeIsVisible
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
</style>
