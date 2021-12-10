<template>
  <q-page class="flex">
    <div id="mapa" class="bg-white">Mapa</div>
    <div :class="timeSeriesClass">
      <div class="toggle-time">
        <q-btn flat round dense icon="schedule" label="Sèrie temporal" @click="toggleTimeSeries"/>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  props: {
    timeSeriesVisible: { type: Boolean }
  },
  setup (props) {
    const timeIsVisible = ref(props.timeSeriesVisible)
    const timeSeriesClass = computed(() => {
      let classes = 'text-black map-footer'
      if (!timeIsVisible.value) {
        timeIsVisible.value = false
      }
      if (timeIsVisible.value) {
        classes += ' visible'
      }
      return classes
    })
    const toggleTimeSeries = function () {
      timeIsVisible.value = !timeIsVisible.value
    }
    return {
      timeSeriesClass,
      toggleTimeSeries
    }
  }
})
</script>

<style scoped lang="scss">

.q-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  height: calc(100vh - 50px);
}
#mapa {
  flex: 1;
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
.map-footer.visible {
  max-height: 200px;
  height: 200px;
  transition: max-height .3s ease-in;
}
</style>
