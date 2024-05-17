<!--
  MAIN MENU TOOLS
    - Observations view
    - Models view
    - Sharing views (observations and models)
    - Show app info (include cookies policy)
    - Show app help
    - Lang selection
    - Login form
-->

<template>
    <q-toolbar>
      <!-- First tab is always visible -->
      <fa-thin-button-router
        name="fa-thin fa-map-location-dot"
        :label="trans('Reports')"
        :class="active_item=='layers'?'active':''"
        route-name="reports"
        item="reports"
        id="reports"
      >
      </fa-thin-button-router>

      <fa-thin-button-router
        name="fa-thin fa-triangle-exclamation"
        :label="trans('Early warning')"
        :class="active_item=='ew'?'active':''"
        route-name="early_warning"
        item="ew"
        id="ew"
      >
      </fa-thin-button-router>

      <fa-thin-button-router
        name="fa-thin fa-chart-mixed"
        :label="trans('Encounter probability')"
        :class="active_item=='models'?'active':''"
        route-name="models"
        item="models"
        id="estimations"
      >
      </fa-thin-button-router>

      <q-toolbar-title></q-toolbar-title>

      <fa-thin-button
        name="fa-thin fa-share-nodes"
        :label="trans('Share')"
        @click="startShareView"
        id="shareView"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-circle-info"
        :label="trans('Info')"
        @click="showInfo"
        id="showInfo"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-square-question"
        :label="trans('Help')"
        @click="showHelp"
        id="help"
      ></fa-thin-button>

      <fa-thin-button-menu name="fa-thin fa-globe" :label="trans('Lang')">
        <div class="lang-wrapper">
          <div class="lang-container">
            <a v-for="item in LANGS" :key="item.code"
              :id="item.code"
              class="main-menu-item"
              :class="lang==item.code?'menuItem active':'menuItem'" @click.prevent="clickLanguageSelector(item.code, $event)" ref="item.code">
              <span>{{ item.label }}</span>
          </a>

              <!-- <div :class="lang=='es'?'menuItem active':'menuItem'" @click="clickLanguageSelector('es', $event)" ref="es">
                <span>Castellano</span>
              </div>

              <div :class="lang=='en'?'menuItem active':'menuItem'" @click="clickLanguageSelector('en', $event)" ref="en">
                <span>English</span>
              </div>-->
          </div>
        </div>
      </fa-thin-button-menu>
      <fa-thin-button name="fa-thin fa-user" :label="loginLabel" @click="processLogin" id="login"></fa-thin-button>
    </q-toolbar>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { onMounted, ref, computed } from 'vue'
import FaThinButton from 'components/FaThinButton.vue'
import FaThinButtonRouter from 'components/FaThinButtonRouter.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'
import { useCookies } from 'vue3-cookies'
import { useRoute, useRouter } from 'vue-router'

export default {
  components: { FaThinButton, FaThinButtonRouter, FaThinButtonMenu },
  emits: [
    'filterObservations',
    'filterLocations',
    'clearLocations',
    'toggleSamplingEffort',
    'leftMenuMounted',
    'startShareView'
  ],
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
    const LANGS = $store.getters['app/getAllowedLangs']

    const router = useRouter()
    const route = useRoute()

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }
    const showInfo = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true } })
    }

    const showHelp = function () {
      $store.commit('app/setModal', { id: 'help', content: { visibility: true } })
    }

    const processLogin = function () {
      document.location = 'http://webserver.mosquitoalert.com/private_map'
      // if ($store.getters['app/getAuthorized']) {
      //   $store.commit('app/setModal', { id: 'confirmLogout', content: { visibility: true } })
      // } else {
      //   $store.commit('app/setModal', { id: 'login', content: { visibility: true } })
      // }
    }

    const startShareView = function () {
      context.emit('startShareView', {})
    }

    const lang = computed(() => {
      return $store.getters['app/getLang']
    })

    const clickLanguageSelector = (lang, event) => {
      setLanguage(lang, event.target)
    }

    const setLanguage = async function (lang, object) {
      router.push({
        params: {
          ...route.params,
          lang: lang
        },
        query: route.query
      })

      await $store.dispatch('app/setInitData', lang)
      cookies.set('lang', lang)
      if (object) {
        object.parentNode.querySelectorAll('.menuItem').forEach(item => {
          item.classList.remove('active')
        })
        object.classList.add('active')
      }
      // NASTY
      let qLang = lang
      if (qLang === 'en') qLang = 'en-US'
      import('quasar/lang/' + qLang).then(({ default: messages }) => {
        $q.lang.set(messages)
      })
    }

    onMounted(async function () {
      lang.value = $store.getters['app/getLang']
      setLanguage(lang.value)
      context.emit('leftMenuMounted', {})
    })

    const frontendUrl = computed(() => {
      return $store.getters['app/getFrontendUrl']
    })

    const linkModels = computed(() => {
      return $store.getters['app/getFrontendUrl'] + 'models'
    })

    const loginLabel = computed(() => {
      if ($store.getters['app/getAuthorized']) {
        return trans('Log out')
      } else {
        return trans('Log in')
      }
    })

    return {
      trans,
      loginLabel,
      lang,
      LANGS,
      ca,
      es,
      en,
      frontendUrl,
      linkModels,
      showInfo,
      showHelp,
      startShareView,
      processLogin,
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
  .menuItem:not(.active){
    color: $primary-color;
  }
  .menuItem:not(.active):hover {
    background: $grey-color;
    transition: all 0.3s ease-in;
    box-shadow: 6px 0 12px rgba(0,0,0,0.25), 4px 0 4px rgba(0,0,0,0.22);
  }
</style>
