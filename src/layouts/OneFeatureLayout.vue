<template>
  <q-layout view='hHh lpR fFf'>

    <q-page class='flex' >

      <one-feature-map ref='map'
        init
        :observationId="observationId"
      />

    </q-page>

  </q-layout>
</template>

<script>
import OneFeatureMap from 'components/OneFeatureMap.vue'
import { useRoute } from 'vue-router'

export default {
  components: { OneFeatureMap },
  setup () {
    const route = useRoute()
    const observationId = (route.params) ? ((route.params.code) ? route.params.code : '') : ''
    return {
      observationId
    }
  }
}
</script>

<style lang="scss">
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    overflow: hidden;
  }

  .ol-attribution {
    position: absolute;
    top: auto;
    left: auto;
    bottom: 4px;
    right: 10px;
    z-index: 9;
    background: #33333342;
    font-size: 10px;
    color: white;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }
</style>
