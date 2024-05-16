<template>
  <div>
    <q-layout
      :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
    >
      <site-header v-if="!mobile" :expanded="expanded"/>
      <left-drawer-models ref="TOC"
        :expanded="expanded"
        :species-code="mapSpeciesCode"
        :date="mapDate"
        :opacity="mapOpacity"
        :visible="mapIsVisible"
        :palette="mapPalette"
        :filters="mapFilters"
        :lang="lang"
        @toggleLeftDrawer="toggleLeftDrawer"
        @startShareView="startShareView"
        @speciesCodeChange="handleSpeciesCodeChange"
        @dateChange="handleDateChange"
        @opacityChange="handleOpacityChange"
        @visiblitiyChange="handleVisibilityChange"
        @filtersLazyChange="handleFiltersChange"
      />

      <q-page
        class='flex'
        :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
      >
        <the-map-models ref='map' init
          :species-code="mapSpeciesCode"
          :date="mapDate"
          :visible="mapIsVisible"
          :display-choropleth="mapDisplayChoropleth"
          :opacity="mapOpacity"
          :filters="mapFilters"
          :palette="mapPalette"
          :lon="mapLon"
          :lat="mapLat"
          :zoom="mapZoom"
          @move="handleMapChange"
          @toggleLeftDrawer="toggleLeftDrawer"
        />
      </q-page>

      <modal-share
        ref="shareModal"
        :open="shareModalVisible"
      >
        <template v-slot:default>
        </template>
      </modal-share>

      <modal-confirm-logout/>

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
import LeftDrawerModels from 'components/LeftDrawerModels.vue'
import TheMapModels from 'components/TheMapModels.vue'
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
    LeftDrawerModels,
    SiteFooter,
    TheMapModels,
    ModalCookieSettings,
    ModalCookiePolicy,
    CookiesCompliance
  },
  props: {
    speciesCode: {
      type: String
    },
    year: {
      type: Number
    },
    month: {
      type: Number
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
  setup (props) {
    const router = useRouter()
    const route = useRoute()
    const $store = useStore()

    const map = ref('null')
    const shareModal = ref()
    const TOC = ref()

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })
    const expanded = ref(!mobile.value)

    // Map props
    const mapSpeciesCode = ref(props.speciesCode || $store.getters['app/getEncounterProbabilitySpecieCode'])
    const mapDate = ref(
      [props.year, props.month].every(item => item !== undefined)
        ? new Date(props.year, props.month - 1)
        : $store.getters['app/getEncounterProbabilityDate'] || undefined
    )
    watch(mapDate, (newValue) => {
      $store.commit('app/setEncounterProbabilityDate', newValue)
    })

    const mapPalette = ref(['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'])

    const mapIsVisible = ref(true)
    const mapOpacity = ref(1)
    const mapFilters = ref({
      certaintyRange: {
        min: route.query.min_certainty || 0,
        max: route.query.max_certainty || 1
      }
    })

    const mapDisplayChoropleth = computed(() => {
      return [mapSpeciesCode.value, mapDate.value].every(item => item !== undefined)
    })

    const mapLon = ref($store.getters['map/getCurrents'].CENTER[0])
    const mapLat = ref($store.getters['map/getCurrents'].CENTER[1])
    const mapZoom = ref(mobile.value ? $store.getters['map/getCurrents'].MOBILEZOOM : $store.getters['map/getCurrents'].ZOOM)

    watch([mapSpeciesCode, mapDate, mapLon, mapLat, mapZoom, mapFilters], () => {
      updateRouterQuery()
    }, { deep: true })

    watch(mapSpeciesCode, (newValue, oldValue) => {
      $store.commit('app/setEncounterProbabilitySpecieCode', newValue)
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
          zoom: mapZoom.value,
          min_certainty: mapFilters.value?.certaintyRange.min !== 0 ? mapFilters.value?.certaintyRange.min : undefined,
          max_certainty: mapFilters.value?.certaintyRange.max !== 1 ? mapFilters.value?.certaintyRange.max : undefined
        },
        params: {
          speciesCode: mapSpeciesCode.value,
          month: (mapDate.value ? (mapDate.value.getMonth() + 1).toString().padStart(2, '0') : undefined),
          year: mapDate.value?.getFullYear()
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

    const startShareView = function () {
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

    const handleDateChange = (value) => {
      mapDate.value = value
    }

    const handleOpacityChange = (value) => {
      mapOpacity.value = value
    }

    const handleVisibilityChange = (value) => {
      mapIsVisible.value = value
    }

    const handleFiltersChange = (value) => {
      mapFilters.value = value
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
      mapSpeciesCode,
      mapDate,
      mapOpacity,
      mapIsVisible,
      mapFilters,
      mapDisplayChoropleth,
      mapPalette,
      mapLon,
      mapLat,
      mapZoom,
      expanded,
      mobile,
      toggleLeftDrawer,
      startShareView,
      handleSpeciesCodeChange,
      handleDateChange,
      handleOpacityChange,
      handleVisibilityChange,
      handleFiltersChange,
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
