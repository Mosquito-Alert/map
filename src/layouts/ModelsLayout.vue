<template>
  <q-layout
    :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
  >
    <site-header v-if="!mobile" :expanded="expanded"/>
    <left-drawer-models ref="TOC"
      :expanded="expanded"
      @loadModel="loadModel"
      @clearModel="clearModel"
      @toggleLeftDrawer="toggleLeftDrawer"
      @showShareUrl="showShareUrl"
      @checkModelEstimation="checkModelEstimation"
      @checkModelUncertainty="checkModelUncertainty"
      @estimationTransparency="estimationTransparency"
      @uncertaintyTransparency="uncertaintyTransparency"
      @estimationColorsChanged="estimationColorsChanged"
      @uncertaintyColorsChanged="uncertaintyColorsChanged"
    />

    <q-page
      class='flex'
      :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
    >
      <the-map-models ref='map'
        init
        :viewCode="viewCode"
        :class="expanded?'drawer-expanded':'drawer-collapsed'"
        @toggleLeftDrawer="toggleLeftDrawer"
        @workerFinishedIndexing="workerFinishedIndexing"
        @mapViewSaved="mapViewSaved"
        @setModelDate="setModelDate"
        @loadSharedModel="loadSharedModel"
        @errorDownloadingModels="errorDownloadingModels"
      />
    </q-page>

    <modal-share
      ref="shareModal"
      :open="shareModalVisible"
      @shareView="shareView"
    >
      <template v-slot:default>
      </template>
    </modal-share>

    <modal-info :open="infoModalVisible" buttons="close">
    </modal-info>

    <modal-help :open="helpModalVisible" buttons="close">
    </modal-help>

    <modal-wait/>
    <modal-logos/>
    <modal-error/>
    <modal-cookie-settings/>
    <modal-login/>
    <modal-cookie-policy/>

    <site-footer/>
    <cookies-compliance/>
  </q-layout>
</template>

<script>
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import ModalCookiePolicy from 'src/components/ModalCookiePolicy.vue'
import CookiesCompliance from 'src/components/CookiesCompliance.vue'
import ModalLogin from 'src/components/ModalLogin.vue'
import ModalLogos from 'src/components/ModalLogos.vue'
import ModalInfo from 'src/components/ModalInfo.vue'
import ModalShare from 'src/components/ModalShare.vue'
import ModalHelp from 'src/components/ModalHelp.vue'
import ModalError from 'src/components/ModalError.vue'
import ModalWait from 'src/components/ModalWait.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawerModels from 'components/LeftDrawerModels.vue'
import TheMapModels from 'components/TheMapModels.vue'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

// import moment from 'moment'

export default {
  components: {
    ModalInfo,
    ModalShare,
    ModalHelp,
    ModalError,
    ModalLogin,
    ModalLogos,
    ModalWait,
    SiteHeader,
    LeftDrawerModels,
    SiteFooter,
    TheMapModels,
    ModalCookieSettings,
    ModalCookiePolicy,
    CookiesCompliance
  },
  setup () {
    const route = useRoute()
    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()
    const timeseries = ref()
    const $store = useStore()
    const lang = (route.params) ? ((route.params.lang) ? route.params.lang : '') : ''

    $store.commit('timeseries/setGraphIsVisible', false)
    if (lang) {
      $store.dispatch('app/setLanguage', lang.toLocaleLowerCase())
    }

    const viewCode = (route.params) ? ((route.params.code) ? route.params.code : '') : ''

    const frontendUrl = computed(() => {
      return $store.getters['app/getFrontendUrl']
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const expanded = ref(!mobile.value)

    const infoModalVisible = computed(() => {
      return $store.getters['app/getModals'].info.visibility
    })

    const helpModalVisible = computed(() => {
      return $store.getters['app/getModals'].help.visibility
    })

    const errorModalVisible = computed(() => {
      return $store.getters['app/getModals'].error.visibility
    })

    const shareModalVisible = computed(() => {
      return $store.getters['app/getModals'].share.visibility
    })

    const shareView = function () {
      map.value.shareModelView()
    }

    const toggleLeftDrawer = function () {
      expanded.value = !expanded.value
      resizeMap({ start: 0, end: 400 })
    }

    const resizeMap = function (args) {
      if (args.start < args.end) {
        map.value.map.updateSize()
        setTimeout(() => {
          args.start += 5
          resizeMap(args)
        }, 5)
      }
    }

    const mapViewSaved = function (payload) {
      shareModal.value.status = payload
      if (payload.status === 'ok') {
        shareModal.value.newUrl = frontendUrl.value + payload.code
      }
    }

    const workerFinishedIndexing = function (payload) {
      // $store.commit('app/setModal', {
      //   id: 'wait',
      //   content: {
      //     visibility: false,
      //     seamless: true
      //   }
      // })
      if (payload.mapFilters.locations.length) {
        TOC.value.searchLocation.loading = false
      }
    }

    const loadModel = function (payload) {
      map.value.loadModel(payload)
    }

    const clearModel = function () {
      map.value.clearModel()
    }

    const setModelDate = function (payload) {
      TOC.value.inputDate = payload
    }

    const checkModelEstimation = function (payload) {
      map.value.estimationVisibility(payload.status)
    }

    const checkModelUncertainty = function (payload) {
      map.value.uncertaintyVisibility(payload.status)
    }

    const estimationTransparency = function (payload) {
      $store.commit('app/setEstimationTransparency', payload.transparency)
      const t = 1 - (payload.transparency / 100)
      map.value.estimationOpacity(t)
    }

    const uncertaintyTransparency = function (payload) {
      $store.commit('app/setUncertaintyTransparency', payload.transparency)
      const t = 1 - (payload.transparency / 100)
      map.value.uncertaintyOpacity(t)
    }

    const loadSharedModel = function (payload) {
      TOC.value.loadSharedModel(payload)
    }

    const errorDownloadingModels = function (payload) {
      TOC.value.errorDownloadingModels(payload)
    }

    const estimationColorsChanged = function () {
      map.value.estimationRefresh()
    }

    const uncertaintyColorsChanged = function () {
      map.value.uncertaintyRefresh()
    }

    return {
      errorDownloadingModels,
      estimationColorsChanged,
      uncertaintyColorsChanged,
      loadSharedModel,
      checkModelEstimation,
      checkModelUncertainty,
      estimationTransparency,
      uncertaintyTransparency,
      viewCode,
      mobile,
      expanded,
      workerFinishedIndexing,
      toggleLeftDrawer,
      shareView,
      shareModal,
      mapViewSaved,
      shareModalVisible,
      infoModalVisible,
      helpModalVisible,
      errorModalVisible,
      map,
      TOC,
      timeseries,
      resizeMap,
      loadModel,
      clearModel,
      setModelDate,
      CookiesCompliance
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
    height: calc(100% - 50px);
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
  .ma-btn::before,
  .ma-close-btn::before{
    box-shadow: none;
  }

  button.ma-btn{
    display: flex;
  }
  button.ma-btn,
  button.ma-close-btn,
  .ma-close-btn{
    padding: 8px 10px;
    border-radius: 3px;
    background: $primary-color;
    box-shadow: none;
    color: white;
    border: none;
  }
  button.ma-btn:hover,
  button.ma-close-btn:hover,
  .ma-close-btn:hover{
    opacity:0.7;
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
