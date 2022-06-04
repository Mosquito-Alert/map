<template>
  <q-layout
    :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
  >
    <site-header v-if="!mobile" :expanded="expanded"/>
    <left-drawer ref="TOC"
      :expanded="expanded"
      @toggleSamplingEffort='toggleSamplingEffort'
      @filterObservations='filterObservations'
      @filterLocations="filterLocations"
      @clearLocations="clearLocations"
      @filterTags="filterTags"
      @toogleLeftDrawer="toogleLeftDrawer"
    />

    <q-page
      class='flex'
      :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
    >
      <the-map ref='map'
        init
        :sharedView="viewCode"
        class="fit"
        :class="expanded?'drawer-expanded':'drawer-collapsed'"
        @toogleLeftDrawer="toogleLeftDrawer"
        @workerFinishedIndexing="workerFinishedIndexing"
        @mapViewSaved="mapViewSaved"
        @timeSeriesChanged="timeSeriesChanged"
        @tagsChanged="tagsChanged"
        @locationChanged="locationChanged"
        @loadUserFixes="loadUserFixes"
        @calendarClicked="calendarClicked"
      />
      <time-series
        ref="timeseries"
        @toggleTimeSeries='resizeMap'
        @dateSelected='filterDate'
      />
    </q-page>

    <modal-base :open="infoModalVisible" buttons="close">
      <template v-slot:default>
        <p><img src="~/assets/img/mosquitoalert_logo.png"></p>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feu-giat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
        <p>Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tinci-dunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tatilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. </p>
      </template>
    </modal-base>

    <modal-download
      :open="downloadModalVisible"
      @startDownload="startDownload"
    >
      <template v-slot:default>
      </template>
    </modal-download>

    <modal-share
      ref="shareModal"
      :open="shareModalVisible"
      @shareView="shareView"
    >
      <template v-slot:default>
      </template>
    </modal-share>

    <modal-reports
      ref="reportModal"
      :open="reportModalVisible"
      @newReport="newReport"
    >
      <template v-slot:default>
      </template>
    </modal-reports>

    <modal-wait>
    </modal-wait>

    <modal-error>
    </modal-error>

    <site-footer/>
  </q-layout>
</template>

<script>
import ModalBase from 'src/components/ModalBase.vue'
import ModalDownload from 'components/ModalDownload.vue'
import ModalShare from 'src/components/ModalShare.vue'
import ModalReports from 'src/components/ModalReports.vue'
import ModalError from 'src/components/ModalError.vue'
import ModalWait from 'src/components/ModalWait.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawer from 'components/LeftDrawer.vue'
import TheMap from 'components/TheMap.vue'
import TimeSeries from 'components/TimeSeries.vue'
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  components: {
    ModalBase,
    ModalError,
    ModalWait,
    ModalDownload,
    ModalShare,
    ModalReports,
    SiteHeader,
    LeftDrawer,
    SiteFooter,
    TheMap,
    TimeSeries
  },
  setup () {
    const route = useRoute()
    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()
    const timeseries = ref()
    const $store = useStore()

    window.addEventListener('load', function () {
      setTimeout(function () {
        // Hide the address bar:
        window.scrollTo(0, 1)
      }, 0)
    })
    const resizeMap = function (args) {
      if (args.start < args.end) {
        map.value.map.updateSize()
        setTimeout(() => {
          args.start += 15
          resizeMap(args)
        }, 5)
      } else {
        // Ending resizing
        if (pendingView.value.extent !== null) {
          map.value.setPendingView(pendingView.value.extent)
        }
      }
    }

    const viewCode = (route.params) ? ((route.params.code) ? route.params.code : '') : ''

    onMounted(() => {
      if ($store.getters['app/getDefaults'].INFO_OPEN) {
        $store.commit('app/setModal', { id: 'info', content: { visibility: true } })
      }
    })

    const pendingView = computed(() => {
      return $store.getters['app/getPendingView']
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const expanded = ref(!mobile.value)

    const startDownload = function (format) {
      map.value.handleDownload(format)
    }

    const shareView = function () {
      map.value.shareView()
    }

    const filterLocations = function (location) {
      map.value.clearAdministrativeFeatures()
      if (location !== null) {
        // TOC.value.searchLocation.loading = true
        map.value.fitFeature(location)
      }
      map.value.filterLocations(location)
    }

    const clearLocations = function () {
      map.value.clearAdministrativeFeatures()
    }

    const filterTags = function (tags) {
      // if (filteringLocations()) {
      //   TOC.value.searchLocation.loading = true
      // }
      map.value.filterTags(tags)
    }

    const filterDate = function (payload) {
      // if (filteringLocations()) {
      //   TOC.value.searchLocation.loading = true
      // }
      map.value.filterDate(payload)
      // If samplingEffort layer is active then refresh it
      const samplingIsActive = $store.getters['map/getActiveLayers'].some(l => {
        return l.type === 'sampling-effort'
      })
      if (samplingIsActive) {
        map.value.resetUserfixesTileIndex()
        map.value.checkSamplingEffort({
          status: true,
          dates: [payload.data]
        })
      } else {
        map.value.resetUserfixesTileIndex()
      }
    }

    // const filteringLocations = function () {
    //   return map.value.mapFilters.locations.length
    // }

    const filterObservations = function (data) {
      // if (filteringLocations()) {
      //   TOC.value.searchLocation.loading = true
      // }
      map.value.filterObservations(data)
    }

    const toggleSamplingEffort = function (payload) {
      map.value.checkSamplingEffort(payload)
    }

    const infoModalVisible = computed(() => {
      return $store.getters['app/getModals'].info.visibility
    })

    const downloadModalVisible = computed(() => {
      return $store.getters['app/getModals'].download.visibility
    })

    const shareModalVisible = computed(() => {
      return $store.getters['app/getModals'].share.visibility
    })

    const reportModalVisible = computed(() => {
      return $store.getters['app/getModals'].report.visibility
    })

    const errorModalVisible = computed(() => {
      return $store.getters['app/getModals'].error.visibility
    })

    const frontendUrl = computed(() => {
      return $store.getters['app/getFrontendUrl']
    })

    const toogleLeftDrawer = function () {
      expanded.value = !expanded.value
      resizeMap({ start: 0, end: 400 })
    }

    const workerFinishedIndexing = function (payload) {
      $store.commit('app/setModal', {
        id: 'wait',
        content: {
          visibility: false
        }
      })
      if (payload.mapFilters.locations.length) {
        TOC.value.searchLocation.loading = false
      }
    }

    const mapViewSaved = function (payload) {
      shareModal.value.success = payload.status
      if (payload.status === 'ok') {
        shareModal.value.newUrl = frontendUrl.value + payload.code
      }
    }

    const newReport = function () {
      map.value.newReport()
    }

    const timeSeriesChanged = function (date) {
      timeseries.value.calendarDate = date
    }

    const tagsChanged = function (tags) {
      TOC.value.setTags(tags)
    }

    const locationChanged = function (name) {
      TOC.value.setLocationName(name)
    }

    const loadUserFixes = function (payload) {
      TOC.value.toggleSamplingEffort(payload)
    }

    const calendarClicked = function (e) {
      timeseries.value.showCalendar()
    }

    return {
      mobile,
      calendarClicked,
      viewCode,
      shareView,
      newReport,
      expanded,
      startDownload,
      toggleSamplingEffort,
      workerFinishedIndexing,
      mapViewSaved,
      timeSeriesChanged,
      tagsChanged,
      locationChanged,
      toogleLeftDrawer,
      filterObservations,
      filterDate,
      filterLocations,
      clearLocations,
      filterTags,
      infoModalVisible,
      downloadModalVisible,
      shareModalVisible,
      reportModalVisible,
      errorModalVisible,
      map,
      TOC,
      timeseries,
      resizeMap,
      shareModal,
      loadUserFixes
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

  // MOBILE
  .q-page.mobile.collapsed{
    margin-left:0;
    transition: margin-left ease 1s;
  }
  .q-page.mobile.expanded{
    margin-left:$left-drawer-width;
    transition: margin-left ease 1s;
  }
  .q-layout.mobile.collapsed aside{
      width: 0;
      box-shadow: none;
      transition:width ease 1s;
    }
  .q-layout.mobile.expanded aside{
    width: $left-drawer-width;
    box-shadow: none;
    transition:width ease 1s;
  }

  .q-layout.mobile.expanded aside{
    width: 100%;
  }

</style>
