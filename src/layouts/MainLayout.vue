<template>
  <q-layout view='hHh lpR fFf'>
    <site-header/>
    <left-drawer @filter='filter'/>
    <!-- <q-page-container>
      <router-view />
    </q-page-container> -->
    <q-page class='flex'>
      <the-map ref='map'/>
      <time-series @toggleTimeSeries='resizeMap'/>
    </q-page>

    <site-footer/>
  </q-layout>
</template>

<script>
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawer from 'components/LeftDrawer.vue'
import TheMap from 'components/TheMap.vue'
import TimeSeries from 'components/TimeSeries.vue'
import { ref } from 'vue'

export default {
  components: { SiteHeader, LeftDrawer, SiteFooter, TheMap, TimeSeries },
  setup () {
    const map = ref('null')
    const resizeMap = function (args) {
      if (args.start < args.end) {
        map.value.map.updateSize()
        setTimeout(() => {
          args.start += 1
          resizeMap(args)
        }, 1)
      }
    }
    const filter = function (data) {
      map.value.filter(data)
      // timeseries.value.filter(data.type, data.code);
    }
    return {
      map,
      resizeMap,
      filter
    }
  }
}
</script>

<style scoped lang="scss">
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    margin-left: $left-drawer-width;
  }
  :deep(.q-drawer), :deep(.q-header) {
    width: $left-drawer-width;
  }
</style>
