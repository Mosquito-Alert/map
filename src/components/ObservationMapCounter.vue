<!--
  SHOW OBSERVATIONS COUNTER ON MAP
  GETS INFO FROM PROP
-->

<template>
  <div class = "point-counter">
    <div v-if="!mobile || visible" class="counter" v-html="npoints"></div>
    <div v-if="!mobile || visible"
      class="counter-label"
      :class="mobile?'mobile':''"
      v-html="$t('shown_points')">
      </div>
    <div v-if="mobile"
      class="unfold"
      v-html="foldingIcon"
      @click="unfold"
    ></div>
  </div>
</template>
<script>

import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['nPoints'],
  setup (props, context) {
    const $store = useStore()
    const visible = ref(false)
    const foldingIcon = ref('<')
    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const npoints = computed(() => {
      // Format number
      if (parseInt(props.nPoints) > 0) {
        return props.nPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      }
      return 0
    })

    function unfold () {
      visible.value = !visible.value
      if (visible.value) {
        foldingIcon.value = '>'
      } else {
        foldingIcon.value = '<'
      }
    }
    return {
      visible,
      unfold,
      foldingIcon,
      npoints,
      mobile
    }
  }
}
</script>

<style lang="scss">
.point-counter {
  display: inline-block;
  position: absolute;
  top: 60px;
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

.counter-label.mobile{
  margin-right: 5px;
}

.unfold{
  display:inline;
  cursor:pointer;
}
</style>
