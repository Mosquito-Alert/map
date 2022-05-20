<template>
  <div class = "point-counter">
    <div class="counter" v-html="npoints"></div>
    <div class="counter-label" v-html="_('Shown points')"></div>
  </div>
</template>
<script>

import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['nPoints'],
  setup (props, context) {
    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const npoints = computed(() => {
      return props.nPoints
    })

    return {
      _,
      npoints
    }
  }
}
</script>

<style lang="scss">
.point-counter {
  display: inline-block;
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  background: white;
  border-radius: 25px;
  z-index: 10;
  font-family: $font-family;
  box-shadow: $box-shadow;
}
.counter-label{
  font-size: 0.85em;
  padding-left: 5px;
}
.counter,
.counter-label{
  display: inline;
}
</style>
