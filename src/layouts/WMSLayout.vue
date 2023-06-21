<template>
  <div v-if="tabIsVisible">
    <q-layout
      :class="mobile ? (expanded ? 'mobile expanded' : 'mobile collapsed') : (expanded ? 'expanded' : 'collapsed')">
      <site-header v-if="!mobile" :expanded="expanded" />
      <left-drawer-wms v-if="loadDrawer" ref="TOC" :expanded="expanded" @toggleLeftDrawer="toggleLeftDrawer"
        @startShareView="startShareView" @firstMapCall="buildSession" @loadWms="loadWms" @layerChange="layerChange"
        @reorderLayers="reorderLayers" @exportImage="exportImage" />

        <q-page-container class="no-padding-top">
          <q-page class='flex'
            :class="mobile ? (expanded ? 'mobile expanded' : 'mobile collapsed') : (expanded ? 'expanded' : 'collapsed')">
            <the-map-wms ref='map' init :viewCode="viewCode" :class="expanded ? 'drawer-expanded' : 'drawer-collapsed'"
              @toggleLeftDrawer="toggleLeftDrawer" @endShareView="endShareView"
              @errorDownloadingModels="errorDownloadingModels" />
          </q-page>
        </q-page-container>

      <modal-share ref="shareModal" :open="shareModalVisible">
        <template v-slot:default>
        </template>
      </modal-share>

      <modal-confirm-logout />

      <modal-info :open="infoModalVisible" buttons="close">
      </modal-info>

      <modal-help :open="helpModalVisible" buttons="close">
      </modal-help>

      <modal-wait />
      <modal-logos />
      <modal-error />
      <modal-cookie-settings />
      <modal-login />
      <modal-cookie-policy />

      <site-footer />
      <cookies-compliance />
    </q-layout>
  </div>
  <router-link v-else to="/">
    <page-error-not-found />
  </router-link>
</template>

<script>
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import ModalCookiePolicy from 'src/components/ModalCookiePolicy.vue'
import CookiesCompliance from 'src/components/CookiesCompliance.vue'
import ModalLogin from 'src/components/ModalLogin.vue'
import ModalConfirmLogout from 'src/components/ModalConfirmLogout.vue'
import ModalLogos from 'src/components/ModalLogos.vue'
import ModalInfo from 'src/components/ModalInfo.vue'
import ModalShare from 'src/components/ModalShare.vue'
import ModalHelp from 'src/components/ModalHelp.vue'
import ModalError from 'src/components/ModalError.vue'
import PageErrorNotFound from 'src/components/PageErrorNotFound.vue'
import ModalWait from 'src/components/ModalWait.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawerWms from 'components/LeftDrawerWms.vue'
import TheMapWms from 'components/TheMapWms.vue'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import MSession from '../js/session.js'
import ShareMapView from '../js/ShareMapView'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
// import moment from 'moment'

export default {
  components: {
    ModalInfo,
    ModalShare,
    ModalHelp,
    ModalError,
    PageErrorNotFound,
    ModalLogin,
    ModalConfirmLogout,
    ModalLogos,
    ModalWait,
    SiteHeader,
    LeftDrawerWms,
    SiteFooter,
    TheMapWms,
    ModalCookieSettings,
    ModalCookiePolicy,
    CookiesCompliance
  },
  setup () {
    let mySession
    const route = useRoute()
    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()
    const loadDrawer = ref(false)
    const $store = useStore()
    const lang = (route.params) ? ((route.params.lang) ? route.params.lang : '') : ''

    async function getInitData () {
      await $store.dispatch('app/setInitData', lang.toLocaleLowerCase())
      loadDrawer.value = true
    }
    $store.commit('timeseries/setGraphIsVisible', false)
    if (lang) {
      getInitData()
    } else {
      loadDrawer.value = true
    }

    const viewCode = (route.params) ? ((route.params.code) ? route.params.code : '') : ''
    const backend = $store.getters['app/getBackend']

    const tabIsVisible = computed(() => {
      const tabs = $store.getters['app/getLeftMenuTabs']
      if (Object.keys(tabs).length) {
        return tabs.distribution.active
      } else {
        return true
      }
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

    const buildSession = function () {
      mySession = new MSession(backend, $store.getters['app/getCsrfToken'])
      mySession.getSession(buildMap)
    }

    const buildMap = function () {
      $store.commit('app/setCsrfToken', mySession.csrfToken)
      const backendUrl = $store.getters['app/getBackend']
      const loadViewUrl = backendUrl + 'api/view/load/'

      // if loading previously shared view
      if (viewCode) {
        const wmsCode = 'W-' + viewCode
        const newView = new ShareMapView(null, {
          url: loadViewUrl + wmsCode + '/',
          csrfToken: $store.getters['app/getCsrfToken']
        })
        newView.load(handleLoadView)
      }
    }

    const handleLoadView = function (data) {
      if (data.status === STATUS_CODES.OK) {
        const viewProperties = JSON.parse(data.view[0].view)
        map.value.fitExtent(viewProperties.extent)
        TOC.value.setForm(viewProperties)
      } else {
        const frontend = $store.getters['app/getFrontendUrl']
        const content = {
          url: frontend + data.status + '/' + $store.getters['app/getLang'],
          visibility: true,
          error: ''
        }
        $store.commit('app/setModal', {
          id: 'share',
          content: content
        })
      }
    }

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

    const endShareView = function (payload) {
      shareModal.value.viewContent = payload
    }

    const loadSharedModel = function (payload) {
      TOC.value.loadSharedModel(payload)
    }

    const errorDownloadingModels = function (payload) {
      TOC.value.errorDownloadingModels(payload)
    }

    const startShareView = function (data) {
      map.value.shareWmsView(data)
    }

    const loadWms = function (data) {
      map.value.loadWmsLayer(data)
    }

    const layerChange = function (payload) {
      map.value.changeLayerProperty(payload)
    }

    const reorderLayers = function (payload) {
      map.value.reorderLayers(payload)
    }

    const exportImage = function () {
      map.value.exportPNG()
    }
    return {
      tabIsVisible,
      exportImage,
      loadDrawer,
      loadWms,
      layerChange,
      reorderLayers,
      errorDownloadingModels,
      loadSharedModel,
      viewCode,
      mobile,
      expanded,
      toggleLeftDrawer,
      shareView,
      shareModal,
      endShareView,
      shareModalVisible,
      infoModalVisible,
      helpModalVisible,
      errorModalVisible,
      map,
      TOC,
      CookiesCompliance,
      buildSession,
      startShareView
    }
  }
}
</script>

<style lang="scss">
.q-page.collapsed {
  margin-left: $left-toolbar-width;
  transition: margin-left ease 1s;
}

.q-page.expanded {
  margin-left: $left-drawer-width;
  transition: margin-left ease 1s;
}

.q-page {
  position: absolute;
  flex-direction: column;
  height: 100%;
  height: calc(100% - 50px);
  // width: 100%;
  right: 0px;
  left: 0px;
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

.toc-layers.collapsed {
  opacity: 0;
  overflow: hidden;
  z-index: -10;
  transition: opacity ease 1s;
}

.toc-layers.expanded {
  opacity: 1;
  z-index: 10;
  overflow: auto;
  transition: opacity ease 0.6s;
}

.q-drawer-left {
  width: $left-drawer-width;
}

aside {
  width: 350px;
}

.q-layout.collapsed aside {
  width: $left-toolbar-width;
  box-shadow: none;
  transition: width ease 1s;
}

.q-layout.expanded aside {
  width: $left-drawer-width;
  box-shadow: none;
  transition: width ease 1s;
}

.q-layout .q-drawer-left {
  width: $left-drawer-width !important;
}

.q-layout.collapsed .q-drawer__content {
  overflow-x: hidden;
}

.ma-btn::before,
.ma-close-btn::before {
  box-shadow: none;
}

button.ma-btn {
  display: flex;
}

button.ma-btn,
button.ma-close-btn,
.ma-close-btn {
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
  border: none;
}

button.ma-btn:hover,
button.ma-close-btn:hover,
.ma-close-btn:hover {
  opacity: 0.7;
}

// MOBILE
.q-page.mobile.collapsed {
  margin-left: 0;
  transition: margin-left ease 1s;
}

.q-page.mobile.expanded {
  margin-left: $left-drawer-width;
  transition: margin-left ease 1s;
}

.q-layout.mobile.collapsed aside {
  width: 0;
  box-shadow: none;
  transition: width ease 1s;
}

.q-layout.mobile.expanded aside {
  width: $left-drawer-width;
  box-shadow: none;
  transition: width ease 1s;
}

.q-layout.mobile.expanded aside {
  width: 100%;
}
.no-padding-top{
    padding: 0px !important;
  }
</style>
