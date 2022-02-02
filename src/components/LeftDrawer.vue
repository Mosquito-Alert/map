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
        <div class="menuItem" @click="clickLanguageSelector('ca', $event)" ref="ca">
          <span>Català</span>
        </div>
        <div class="menuItem" @click="clickLanguageSelector('es', $event)" ref="es">
          <span>Castellano</span>
        </div>
        <div class="menuItem" @click="clickLanguageSelector('en', $event)" ref="en">
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
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import FaThinButton from 'components/FaThinButton.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'

export default {
  components: { FaThinButton, FaThinButtonMenu },
  emits: ['filter'],
  setup (props, context) {
    const ca = ref(null)
    const es = ref(null)
    const en = ref(null)
    const $store = useStore()
    const filterData = function (event) {
      context.emit('filter', {
        type: event.target.dataset.type,
        code: event.target.dataset.code
      })
      const classes = event.target.parentNode.classList
      if (classes.contains('active')) {
        classes.remove('active')
      } else {
        classes.add('active')
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
    // Language functions
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const clickLanguageSelector = (lang, event) => {
      let object = event.target
      if (!object.classList.contains('menuItem')) object = object.parentNode
      setLanguage(lang, object)
    }
    const setLanguage = (lang, object) => {
      $store.dispatch('app/setLanguage', lang)
      object.parentNode.querySelectorAll('.menuItem').forEach(item => {
        item.classList.remove('active')
      })
      object.classList.add('active')
    }
    onMounted(function () {
      initLanguage()
    })
    function initLanguage () {
      const lang = $store.getters['app/getLang']
      let object = ca.value
      if (lang === 'es') object = es.value
      else if (lang === 'en') object = en.value
      setLanguage(lang, object)
    }
    return {
      ca,
      es,
      en,
      clickLanguageSelector,
      initialClass,
      filterData,
      observations,
      _
    }
  }
}
</script>

<style scoped lang="scss">
button.fa-thin-button, button.fa-thin-button-menu {
  color: $dark-grey;
}
button.fa-thin-button.active, button.fa-thin-button-menu.active {
  color: $primary-color;
}
.menuItem {
  border: 1px solid $grey-color;
  border-left: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 84px;
  background: #efefef;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
}
.menuItem.active {
  background: white;
  transition: all 0.3s ease-in;
  font-weight: bold;
  color: $primary-color;
}
.menuItem:not(.active):hover {
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
