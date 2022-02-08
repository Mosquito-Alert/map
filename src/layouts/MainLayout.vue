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

    <base-modal :open="infoModalVisible" buttons="close">
      <template v-slot:default>
        <p><img src="~/assets/img/mosquitoalert_logo.png"></p>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feu-giat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
        <p>Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tatilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. </p>
      </template>
      <!-- <template v-slot:buttons>
        <button >Hola</button>
      </template> -->
    </base-modal>

    <site-footer/>
  </q-layout>
</template>

<script>
import BaseModal from 'components/BaseModal.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawer from 'components/LeftDrawer.vue'
import TheMap from 'components/TheMap.vue'
import TimeSeries from 'components/TimeSeries.vue'
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  components: { BaseModal, SiteHeader, LeftDrawer, SiteFooter, TheMap, TimeSeries },
  setup () {
    const map = ref('null')
    const $store = useStore()
    const resizeMap = function (args) {
      if (args.start < args.end) {
        map.value.map.updateSize()
        setTimeout(() => {
          args.start += 1
          resizeMap(args)
        }, 1)
      }
    }
    onMounted(() => {
      if ($store.getters['app/getDefaults'].INFO_OPEN) {
        $store.commit('app/setModal', { id: 'info', visible: true })
      }
    })
    const filter = function (data) {
      map.value.filter(data)
      // timeseries.value.filter(data.type, data.code);
    }
    const infoModalVisible = computed(() => {
      return $store.getters['app/getModals'].info
    })
    return {
      infoModalVisible,
      map,
      resizeMap,
      filter
    }
  }
}
</script>

<style scoped>
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    margin-left: 350px;
  }
  :deep(.q-drawer), :deep(.q-header) {
    width: 350px;
  }
</style>
