<template>
  <q-drawer
      show-if-above
      side="left"
      behavior="desktop"
      :width="350"
      no-swipe-close>
    <!-- Main menu -->
    <q-toolbar>
      <fa-thin-button name="fa-layer-group" :label="_('Layers')" class="active"></fa-thin-button>
      <fa-thin-button name="fa-chart-scatter" :label="_('Models')"></fa-thin-button>
      <q-toolbar-title></q-toolbar-title>
      <fa-thin-button-menu name="fa-globe" :label="_('Lang')">
        <div class="menuItem">
          <!-- <i class="fa-thin fa-globe"></i> -->
          <span>Català</span>
        </div>
        <div class="menuItem">
          <!-- <i class="fa-thin fa-globe"></i> -->
          <span>Castellano</span>
        </div>
        <div class="menuItem">
          <!-- <i class="fa-thin fa-globe"></i> -->
          <span>English</span>
        </div>
      </fa-thin-button-menu>
      <fa-thin-button name="fa-share-nodes" :label="_('Share')"></fa-thin-button>
      <fa-thin-button name="fa-circle-info" :label="_('Help')"></fa-thin-button>
      <fa-thin-button name="fa-user" :label="_('Log in')"></fa-thin-button>
    </q-toolbar>
    <!-- Drawer content -->
    <div class="toc-layers">
      <ul>
        <li v-for="layer, code in observations" :key="code" :class="initialClass(layer, code)">
          <a href="#" @click="filterData" data-type="observations" :data-code="code">{{ layer }}</a>
        </li>
      </ul>
    </div>
  </q-drawer>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import FaThinButton from 'components/FaThinButton.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'

export default {
  components: { FaThinButton, FaThinButtonMenu },
  emits: ['filter'],
  setup (props, context) {
    const $store = useStore()
    const filterData = function (event) {
      context.emit('filter', { type: event.target.dataset.type, code: event.target.dataset.code })
      if (event.target.parentNode.classList.contains('active')) {
        event.target.parentNode.classList.remove('active')
      } else {
        event.target.parentNode.classList.add('active')
      }
    }
    const initialClass = function (_, code) {
      const initialLayers = JSON.parse(JSON.stringify($store.getters['app/initialLayers']))
      const isInitial = initialLayers.find(layer => {
        return layer.code === code
      })
      if (isInitial) return 'active'
    }
    const observations = computed(() => {
      return $store.getters['app/layers'].observations
    })
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    return {
      initialClass,
      filterData,
      observations,
      _
    }
  }
}
</script>

<style scoped lang="scss">
.menuItem {
  border: 1px solid $grey-color;
  border-left: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 84px;
  background: #dfdfdf;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
}
.menuItem:hover {
  background: $grey-color;
  transition: all 0.3s ease-in;
  box-shadow: 6px 0 12px rgba(0,0,0,0.25), 4px 0 4px rgba(0,0,0,0.22);
}
.q-drawer {
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  .q-toolbar {
    box-shadow: 2px 0 4px rgba(0,0,0,0.25), 1px 0 1px rgba(0,0,0,0.22);
    background: white;
    height: 100%;
    width: 56px;
    top: 0px;
    bottom: 0px;
    flex-direction: column;
    .q-toolbar__title {
      padding: 28px;
      border-top: 1px solid $grey-color;
    }
  }
}
:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
}
.toc-layers ul li.active {
  font-weight: bold;
}
</style>
