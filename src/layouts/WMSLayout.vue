<template>
  <div>
    <q-layout
      :class="mobile ? (expanded ? 'mobile expanded' : 'mobile collapsed') : (expanded ? 'expanded' : 'collapsed')">
      <site-header v-if="!mobile" :expanded="expanded" />
      <left-drawer-wms ref="TOC"
        :expanded="expanded"
        :species-code="mapSpeciesCode"
        @toggleLeftDrawer="toggleLeftDrawer"
        @startShareView="startShareView"
        @speciesCodeChange="handleSpeciesCodeChange"
        @visibilityChange="handleVisibilityChange"
        @opacityChange="handleOpacityChange"/>

      <q-page class='flex'
        :class="mobile ? (expanded ? 'mobile expanded' : 'mobile collapsed') : (expanded ? 'expanded' : 'collapsed')">
        <the-map-wms ref='map' init
          :species-code="mapSpeciesCode"
          :visible="mapIsVisible"
          :opacity="mapOpacity"
          :lon="mapLon"
          :lat="mapLat"
          :zoom="mapZoom"
          @move="handleMapChange"
          @toggleLeftDrawer="toggleLeftDrawer"/>
      </q-page>

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
      <modal-login />
      <modal-cookie-settings />
      <modal-cookie-policy />

      <site-footer />
      <cookies-compliance />
    </q-layout>
  </div>
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
import ModalWait from 'src/components/ModalWait.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawerWms from 'components/LeftDrawerWms.vue'
import TheMapWms from 'components/TheMapWms.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

export default {
  components: {
    ModalInfo,
    ModalShare,
    ModalHelp,
    ModalError,
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
  props: {
    speciesCode: {
      type: String
    },
    lang: {
      type: String
    }
  },
  setup (props) {
    const route = useRoute()
    const router = useRouter()
    const $store = useStore()

    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })
    const expanded = ref(!mobile.value)

    // Map props
    const mapSpeciesCode = ref(props.speciesCode || $store.getters['app/getEarlyWarningSpecieCode'])

    const mapIsVisible = ref(true)
    const mapOpacity = ref()

    const mapLon = ref($store.getters['map/getCurrents'].CENTER[0])
    const mapLat = ref($store.getters['map/getCurrents'].CENTER[1])
    const mapZoom = ref(mobile.value ? $store.getters['map/getCurrents'].MOBILEZOOM : $store.getters['map/getCurrents'].ZOOM)

    watch(mapSpeciesCode, (newValue, oldValue) => {
      $store.commit('app/setEarlyWarningSpecieCode', newValue)
    })

    watch([mapSpeciesCode, mapLon, mapLat, mapZoom], () => {
      updateRouterQuery()
    })

    onMounted(() => {
      if (props.lang) {
        $store.dispatch('app/setInitData', props.lang.toLocaleLowerCase())
      }

      // Parse initial values from route query
      if (route.query.lon) mapLon.value = parseFloat(route.query.lon)
      if (route.query.lat) mapLat.value = parseFloat(route.query.lat)
      if (route.query.zoom) mapZoom.value = parseFloat(route.query.zoom)
    })

    const updateRouterQuery = () => {
      router.push({
        query: {
          lon: mapLon.value?.toFixed(5),
          lat: mapLat.value?.toFixed(5),
          zoom: mapZoom.value
        },
        params: {
          speciesCode: mapSpeciesCode.value
        }
      })
    }

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

    const startShareView = function (data) {
      const payload = {
        url: new URL(route.fullPath, window.location.origin).href,
        visibility: true,
        error: ''
      }
      $store.commit('app/setModal', {
        id: 'share',
        content: payload
      })
      shareModal.value.viewContent = payload
    }

    const handleSpeciesCodeChange = (value) => {
      mapSpeciesCode.value = value
    }

    const handleOpacityChange = (value) => {
      mapOpacity.value = value
    }

    const handleVisibilityChange = (value) => {
      mapIsVisible.value = value
    }

    const handleMapChange = (newPosition) => {
      mapLon.value = newPosition.center[0]
      mapLat.value = newPosition.center[1]
      mapZoom.value = newPosition.zoom

      $store.commit('map/setCurrents', {
        zoom: mapZoom.value,
        center: [mapLon.value, mapLat.value]
      })
    }

    return {
      mapOpacity,
      mapSpeciesCode,
      mapIsVisible,
      mapLon,
      mapLat,
      mapZoom,
      mobile,
      expanded,
      toggleLeftDrawer,
      startShareView,
      handleSpeciesCodeChange,
      handleOpacityChange,
      handleVisibilityChange,
      handleMapChange,
      shareModal,
      shareModalVisible,
      infoModalVisible,
      helpModalVisible,
      errorModalVisible,
      map,
      TOC,
      CookiesCompliance
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
</style>
