<template>
    <q-toolbar>
      <fa-thin-button
        name="fa-thin fa-layer-group"
        :label="_('Layers')"
        :class="active_item=='layers'?'active':''"
        :link="frontendUrl"
      >
      </fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-chart-scatter"
        :label="_('Models')"
        :class="active_item=='models'?'active':''"
        :link="linkModels"
      >
      </fa-thin-button>

      <q-toolbar-title></q-toolbar-title>

      <fa-thin-button
        name="fa-thin fa-share-nodes"
        :label="_('Share')"
        @click="showShareUrl"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-circle-info"
        :label="_('Info')"
        @click="showInfo"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-square-question"
        :label="_('Help')"
        @click="showHelp"
      ></fa-thin-button>

      <fa-thin-button-menu name="fa-thin fa-globe" :label="_('Lang')">
        <div class="lang-wrapper">
          <div class="lang-container">
            <div class="menuItem" @click="clickLanguageSelector('ca', $event)" ref="ca">
              <span>Català</span>
            </div>
            <div class="menuItem" @click="clickLanguageSelector('es', $event)" ref="es">
              <span>Castellano</span>
            </div>
            <div class="menuItem" @click="clickLanguageSelector('en', $event)" ref="en">
              <span>English</span>
            </div>
          </div>
        </div>
      </fa-thin-button-menu>
      <fa-thin-button name="fa-thin fa-user" :label="_('Log in')" @click="showLogin"></fa-thin-button>
    </q-toolbar>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { onMounted, ref, computed } from 'vue'
import FaThinButton from 'components/FaThinButton.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'
import { useCookies } from 'vue3-cookies'

export default {
  components: { FaThinButton, FaThinButtonMenu },
  emits: ['filterObservations', 'filterLocations', 'clearLocations', 'toggleSamplingEffort'],
  props: ['expanded', 'item'],
  computed: {
    active_item (props) {
      return `${props.item}`
    }
  },
  setup (props, context) {
    const ca = ref(null)
    const es = ref(null)
    const en = ref(null)
    const $q = useQuasar()
    const { cookies } = useCookies()
    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const showInfo = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true } })
    }

    const showHelp = function () {
      $store.commit('app/setModal', { id: 'help', content: { visibility: true } })
    }

    const showLogin = function () {
      $store.commit('app/setModal', { id: 'login', content: { visibility: true } })
    }

    const showShareUrl = function () {
      $store.commit('app/setModal', { id: 'share', content: { visibility: true } })
    }

    const clickLanguageSelector = (lang, event) => {
      let object = event.target
      if (!object.classList.contains('menuItem')) object = object.parentNode
      setLanguage(lang, object)
    }

    const setLanguage = (lang, object) => {
      $store.dispatch('app/setLanguage', lang)
      console.log(lang)
      cookies.set('lang', lang)
      object.parentNode.querySelectorAll('.menuItem').forEach(item => {
        item.classList.remove('active')
      })
      object.classList.add('active')
      // NASTY
      if (lang === 'en') lang = 'en-US'
      import('quasar/lang/' + lang).then(({ default: messages }) => {
        $q.lang.set(messages)
      })
    }

    function initLanguage () {
      const lang = $store.getters['app/getLang']
      let object = ca.value
      if (lang === 'es') object = es.value
      else if (lang === 'en') object = en.value
      setLanguage(lang, object)
    }

    onMounted(function () {
      initLanguage()
    })

    return {
      _,
      ca,
      es,
      en,
      frontendUrl: computed(() => $store.getters['app/getFrontendUrl']),
      linkModels: computed(() => $store.getters['app/getFrontendUrl'] + 'models'),
      showInfo,
      showHelp,
      showShareUrl,
      showLogin,
      clickLanguageSelector
    }
  }
}
</script>

<style lang="scss">
  .border-bottom{
    border-bottom: 1px solid $grey-color;
  }
  a{
    text-decoration: none;
  }
  a button.fa-thin-button {
    color: $toolbar-icons-color;
  }
  a button.fa-thin-button.active {
    color: $primary-color;
  }
  .lang-wrapper{
    position: relative;
  }
  .menuItem {
    z-index: 100;
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
</style>
