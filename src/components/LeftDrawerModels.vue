<template>
  <q-drawer
    class="content-models-drawer"
    show-if-above
    side="left"
    behavior="desktop"
    width=""
    v-touch-swipe.mouse.left="toggleLeftDrawer"
  >
    <!-- Main menu -->
    <left-menu item="models" />

    <!-- Drawer content -->
    <div class="toc-models"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile">
        <q-icon
          name="close"
          class="close-menu"
          @click="toggleLeftDrawer"
        />
      </div>

      <div>
        <button @click="applyfilter('europe')">
          Europa
        </button>
        <button @click="applyfilter('america')">
          América
        </button>
        <button @click="applyfilter('africa')">
          Africa
        </button>
        <button @click="applyfilter('asia')">
          Asia
        </button>
        <button @click="applyfilter('oceania')">
          Oceanía
        </button>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'

export default {
  components: { LeftMenu },
  props: ['expanded'],
  setup (props, context) {
    const $store = useStore()

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const applyfilter = function (continent) {
      const dataUrl = $store.getters['app/getModelsServerPath']
      const backendUrl = $store.getters['app/getBackend']
      let layer
      if (continent === 'europe') {
        layer = 'api/tiles/nuts3/{z}/{x}/{y}/'
      } else {
        layer = 'api/tiles/gadm/' + continent + '/{z}/{x}/{y}/'
      }

      context.emit('loadModel', {
        esp: 'tig',
        region: 'europe',
        year: 2022,
        month: 8,
        modelUrl: dataUrl + continent + '.csv',
        nutsUrl: backendUrl + layer
      })
    }

    return {
      mobile,
      toggleLeftDrawer,
      applyfilter
    }
  }
}
</script>

<style lang="scss">
.content-models-drawer{
  display:flex;
  flex-direction: raw;
}
.toc-models{
  padding: 20px;
  z-index: 1200;
}
.q-drawer {
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  .q-toolbar {
    box-shadow: 2px 0 4px rgba(0,0,0,0.25), 1px 0 1px rgba(0,0,0,0.22);
    background: white;
    height: 100%;
    width: 60px;
    top: 0px;
    bottom: 0px;
    flex-direction: column;
    .q-toolbar__title {
      padding: 28px;
      border-top: 1px solid $grey-color;
    }
  }
}

.toc-models::-webkit-scrollbar {
    height: 12px;
    width: 4px;
    background: #ccc;
}

.toc-models::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}

</style>