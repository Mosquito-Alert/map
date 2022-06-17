<template>
  <q-layout
    :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
  >
    <site-header v-if="!mobile" :expanded="expanded"/>
    <left-drawer-models ref="TOC"
      :expanded="expanded"
      @loadModel="loadModel"
      @toggleLeftDrawer="toggleLeftDrawer"
    />

    <q-page
      class='flex'
      :class="mobile?(expanded?'mobile expanded':'mobile collapsed'):(expanded?'expanded':'collapsed')"
    >
      <the-map-models ref='map'
        init
        :class="expanded?'drawer-expanded':'drawer-collapsed'"
        @toggleLeftDrawer="toggleLeftDrawer"
        @workerFinishedIndexing="workerFinishedIndexing"
      />
    </q-page>

    <modal-info :open="infoModalVisible" buttons="close">
    </modal-info>

    <modal-help :open="helpModalVisible" buttons="close">
    </modal-help>

    <modal-wait>
    </modal-wait>

    <modal-error>
    </modal-error>

    <site-footer/>
  </q-layout>
</template>

<script>
import ModalInfo from 'src/components/ModalInfo.vue'
import ModalHelp from 'src/components/ModalHelp.vue'
import ModalError from 'src/components/ModalError.vue'
import ModalWait from 'src/components/ModalWait.vue'
import SiteHeader from 'components/SiteHeader.vue'
import SiteFooter from 'components/SiteFooter.vue'
import LeftDrawerModels from 'components/LeftDrawerModels.vue'
import TheMapModels from 'components/TheMapModels.vue'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
// import { useRoute } from 'vue-router'
// import moment from 'moment'

export default {
  components: {
    ModalInfo,
    ModalHelp,
    ModalError,
    ModalWait,
    SiteHeader,
    LeftDrawerModels,
    SiteFooter,
    TheMapModels
  },
  setup () {
    // const route = useRoute()
    const map = ref('null')
    const TOC = ref()
    const timeseries = ref()
    const $store = useStore()

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

    const loadModel = function (payload) {
      map.value.loadModel(payload)
    }

    onMounted(() => {
      const dataUrl = $store.getters['app/getBackend']
      fetch(dataUrl + 'api/models/available/', {
        method: 'GET'
      })
        .then((response) => {
          return response.json()
        })
        .then(json => {
          console.log(json)
        }).catch((error) => {
          console.log(error)
        })
    })

    return {
      mobile,
      expanded,
      workerFinishedIndexing,
      toggleLeftDrawer,
      infoModalVisible,
      helpModalVisible,
      errorModalVisible,
      map,
      TOC,
      timeseries,
      resizeMap,
      loadModel
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
