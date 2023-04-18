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
      @toggleLeftDrawer="toggleLeftDrawer"
      @firstMapCall="buildSession"
      @startShareView="startShareView"
    />

    <q-page
      class='flex'
      :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
    >
      <the-map ref='map'
        init
        :sharedView="viewCode"
        :class="expanded?'drawer-expanded':'drawer-collapsed'"
        @toggleLeftDrawer="toggleLeftDrawer"
        @workerFinishedIndexing="workerFinishedIndexing"
        @workerStartedIndexing="workerStartedIndexing"
        @timeSeriesChanged="timeSeriesChanged"
        @tagsChanged="tagsChanged"
        @locationChanged="locationChanged"
        @loadUserFixes="loadUserFixes"
        @calendarClicked="calendarClicked"
        @endShareView="endShareView"
      />
      <time-series
        ref="timeseries"
        @toggleTimeSeries='toggleGraphic'
        @dateSelected='filterDate'
      />
    </q-page>

    <modal-first :open="firstModalVisible" buttons="close">
    </modal-first>

    <modal-info :open="infoModalVisible" buttons="close">
    </modal-info>

    <modal-help :open="helpModalVisible" buttons="close">
    </modal-help>

    <modal-confirm-logout/>

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

    <modal-wait/>
    <modal-logos/>
    <modal-error/>
    <modal-login/>
    <modal-cookie-settings/>
    <modal-cookie-policy/>

    <site-footer/>
    <cookies-compliance/>
  </q-layout>
</template>

<script>
import CookiesCompliance from 'src/components/CookiesCompliance.vue'
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import ModalCookiePolicy from 'src/components/ModalCookiePolicy.vue'
import ModalFirst from 'src/components/ModalFirst.vue'
import ModalInfo from 'src/components/ModalInfo.vue'
import ModalLogin from 'src/components/ModalLogin.vue'
import ModalConfirmLogout from 'src/components/ModalConfirmLogout.vue'
import ModalHelp from 'src/components/ModalHelp.vue'
import ModalLogos from 'src/components/ModalLogos.vue'
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
import moment from 'moment'
import MSession from '../js/session.js'
import { useCookies } from 'vue3-cookies'

export default {
  components: {
    ModalInfo,
    ModalHelp,
    ModalError,
    ModalWait,
    ModalLogos,
    ModalCookieSettings,
    ModalCookiePolicy,
    ModalDownload,
    ModalShare,
    ModalLogin,
    ModalConfirmLogout,
    ModalFirst,
    ModalReports,
    SiteHeader,
    LeftDrawer,
    SiteFooter,
    TheMap,
    TimeSeries,
    CookiesCompliance
  },
  setup () {
    let mySession
    const route = useRoute()
    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()
    const timeseries = ref()
    const $store = useStore()
    const { cookies } = useCookies()
    const backend = $store.getters['app/getBackend']
    const lang = (route.params) ? ((route.params.lang) ? route.params.lang : '') : ''

    // const resetTOC = function () {
    //   map.value.initMap()
    // }

    const resizeMap = function (args, mode) {
      if (args.start < args.end) {
        map.value.map.updateSize()
        setTimeout(() => {
          args.start += 5
          resizeMap(args, mode)
        }, 5)
      } else {
        // Ending resizing
        if (mode === 'timeseries') {
          $store.commit('timeseries/setToggling', false)
          if ($store.getters['timeseries/getGraphIsVisible']) {
            $store.commit('timeseries/updateDataFromCache')
          }
        } else {
          $store.commit('map/setLeftMenuToggling', false)
        }
        map.value.updateMap()
        if (pendingView.value.extent !== null) {
          map.value.setPendingView(pendingView.value.extent)
        }
      }
    }

    const viewCode = (route.params) ? ((route.params.code) ? route.params.code : '') : ''

    onMounted(() => {
      if (lang) {
        $store.dispatch('app/setLanguage', lang.toLowerCase())
        cookies.set('lang', lang.toLocaleLowerCase())
      }
      if ($store.getters['app/getDefaults'].INFO_OPEN) {
        $store.commit('app/setModal', { id: 'info', content: { visibility: true } })
      }
    })

    const startShareView = function () {
      map.value.shareView()
    }

    const buildSession = function () {
      mySession = new MSession(backend, $store.getters['app/getCsrfToken'])
      mySession.getSession(buildMap)
    }

    const buildMap = function () {
      $store.commit('app/setCsrfToken', mySession.csrfToken)
      if (!viewCode) {
        map.value.firstCall()
      } else {
        map.value.preLoadView(viewCode)
      }
    }

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
      const samplingIsActive = $store.getters['app/getLayers'].sampling_effort.sampling.active
      if (samplingIsActive) {
        let mapDate = {}
        if (payload.data.from === '') {
          mapDate.from = '2014-01-01'
          mapDate.to = moment().format('YYYY-MM-DD')
        } else {
          mapDate = payload.data
        }
        map.value.resetUserfixesTileIndex()
        map.value.checkSamplingEffort({
          status: true,
          dates: [mapDate]
        })
      } else {
        map.value.resetUserfixesTileIndex()
      }
    }

    const filterObservations = function (data) {
      map.value.filterObservations(data)
    }

    const toggleSamplingEffort = function (payload) {
      map.value.checkSamplingEffort(payload)
    }

    const firstModalVisible = computed(() => {
      return $store.getters['app/getModals'].first.visibility
    })

    const infoModalVisible = computed(() => {
      return $store.getters['app/getModals'].info.visibility
    })

    const helpModalVisible = computed(() => {
      return $store.getters['app/getModals'].help.visibility
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

    // const frontendUrl = computed(() => {
    //   return $store.getters['app/getFrontendUrl']
    // })

    const toggleLeftDrawer = function () {
      $store.commit('app/toggleLeftDrawerStatus')
      $store.commit('map/setLeftMenuToggling', true)
      expanded.value = !expanded.value
      resizeMap({ start: 0, end: 400 }, 'leftDrawer')
    }

    const toggleGraphic = function (args) {
      map.value.closePopup()
      $store.commit('timeseries/setToggling', true)
      $store.commit('timeseries/setGraphIsVisible', args.isVisible)
      if ($store.getters['timeseries/getGraphIsVisible']) {
        // map.value.spinner(false)
        $store.commit('timeseries/updateDData', {
          data: [],
          dates: []
        })
      }
      resizeMap({ start: 0, end: 400 }, 'timeseries')
    }

    const workerFinishedIndexing = function (payload) {
      $store.commit('map/setIndexingOn', false)
      if (!$store.getters['timeseries/getGraphIsVisible']) {
        $store.commit('app/setModal', {
          id: 'wait',
          content: {
            visibility: false,
            seamless: false
          }
        })
      }
      if (payload.mapFilters.locations.length) {
        TOC.value.searchLocation.loading = false
      }
    }

    const workerStartedIndexing = function () {
      $store.commit('map/setIndexingOn', true)
    }

    const endShareView = function (payload) {
      shareModal.value.viewContent = payload
    }

    const newReport = function () {
      map.value.newReport()
    }

    const timeSeriesChanged = function (date) {
      timeseries.value.calendarDate = [{
        from: moment(date[0].from).format('YYYY/MM/DD'),
        to: moment(date[0].to).format('YYYY/MM/DD')
      }]
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
      newReport,
      expanded,
      startDownload,
      toggleSamplingEffort,
      workerFinishedIndexing,
      workerStartedIndexing,
      endShareView,
      timeSeriesChanged,
      tagsChanged,
      locationChanged,
      toggleLeftDrawer,
      toggleGraphic,
      filterObservations,
      filterDate,
      filterLocations,
      clearLocations,
      filterTags,
      firstModalVisible,
      infoModalVisible,
      helpModalVisible,
      downloadModalVisible,
      shareModalVisible,
      reportModalVisible,
      errorModalVisible,
      CookiesCompliance,
      map,
      TOC,
      timeseries,
      resizeMap,
      shareModal,
      loadUserFixes,
      buildSession,
      // resetTOC,
      startShareView
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
    position:absolute;
    flex-direction: column;
    height: 100%;
    height: calc(100% - 49px);
    // width: 100%;
    right:0px;
    left:0px;
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
  .q-drawer-container aside {
    width: 350px;
  }
  .q-layout.collapsed aside{
    width: $left-toolbar-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout.expanded aside{
    // width: $left-drawer-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout .q-drawer-left{
    width: $left-drawer-width !important;
    overflow-x: hidden;
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
