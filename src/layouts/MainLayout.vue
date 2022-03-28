<template>
  <q-layout
    view='hHh lpR fFf'
    :class="expanded?'expanded':'collapsed'"
  >
    <site-header :expanded="expanded"/>
    <left-drawer
      @filterObservations='filterObservations'
      @filterLocations="filterLocations"
      :expanded="expanded"
    />

    <q-page
      class='flex'
      :class="expanded?'expanded':'collapsed'"
    >
      <the-map ref='map'
        @toogleLeftDrawer="toogleLeftDrawer"
      />
      <time-series
        @toggleTimeSeries='resizeMap'
        @dateSelected='filterDate'
      />
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
    const expanded = ref(true)
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
    // const filter = function (data) {
    //   map.value.filter({
    //     type: 'layer',
    //     data: data
    //   })
    // }
    const filterLocations = function (location) {
      map.value.fitFeature(location)
      map.value.filterLocations(location)
    }

    const filterDate = function (date) {
      map.value.filterDate(date.data)
    }

    const filterObservations = function (data) {
      map.value.filterObservations(data)
    }

    const infoModalVisible = computed(() => {
      return $store.getters['app/getModals'].info
    })

    const toogleLeftDrawer = function () {
      expanded.value = !expanded.value
      resizeMap({ start: 0, end: 400 })
    }
    return {
      expanded,
      toogleLeftDrawer,
      filterObservations,
      filterDate,
      filterLocations,
      infoModalVisible,
      map,
      resizeMap
    }
  }
}
</script>

<style lang="scss">
  .q-page.collapsed{
    margin-left:$left-toolbar-width;
    transition: margin-left ease 1s;
  }
  .q-page.expanded{
    margin-left:$left-drawer-width;
    transition: margin-left ease 1s;
  }
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    margin-left: $left-drawer-width;
    overflow: hidden;
  }
  .q-header.collapsed {
    width: $left-toolbar-width;
    transition: width ease 1s;
  }
  .q-header.expanded {
    width: $left-drawer-width;
    transition: width ease 1s;
  }
  .toc-layers.collapsed{
    opacity:0;
    overflow:hidden;
    z-index: -10;
    transition: opacity ease 1s;
  }

  .toc-layers.expanded{
    opacity: 1;
    z-index: 10;
    overflow:auto;
    transition: opacity ease 0.6s;
  }
 .q-drawer-left{
    width: $left-drawer-width;
  }
  aside {
    width: 350px;
  }
  .q-layout.collapsed aside{
    width: $left-toolbar-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout.expanded aside{
    width: $left-drawer-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout .q-drawer-left{
    width: $left-drawer-width !important;
  }
  .q-layout.collapsed .q-drawer__content{
    overflow-x:hidden;
  }
</style>
