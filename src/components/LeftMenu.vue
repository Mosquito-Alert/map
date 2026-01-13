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
        :label="$t('observations')"
        :class="active_item=='layers'?'active':''"
        link="/"
        item="observations"
        id="observations"
      >
      </fa-thin-button-router>

      <fa-thin-button-router
        name="fa-thin fa-radar"
        :label="$t('discoveries')"
        :class="(wmsVisibility?(active_item=='wms'?'active':''):'disabled')"
        link="/discoveries"
        item="wms"
        id="wms"
      >
      </fa-thin-button-router>

      <fa-thin-button-router
        name="fa-thin fa-chart-mixed"
        :label="$t('estimates')"
        :class="(estimationsVisibility?(active_item=='models'?'active':''):'disabled')"
        link="/models"
        item="models"
        id="estimations"
      >
      </fa-thin-button-router>

      <q-toolbar-title></q-toolbar-title>

      <fa-thin-button
        name="fa-thin fa-share-nodes"
        :label="$t('share')"
        @click="startShareView"
        id="shareView"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-circle-info"
        :label="$t('Info')"
        @click="showInfo"
        id="showInfo"
      ></fa-thin-button>

      <fa-thin-button
        name="fa-thin fa-square-question"
        :label="$t('help')"
        @click="showHelp"
        id="help"
      ></fa-thin-button>

      <fa-thin-button-menu name="fa-thin fa-globe" :label="$t('lang')">
        <div class="lang-wrapper">
          <div class="lang-container">
            <a v-for="(item, index) in localeOptions" :key="index"
              href="#"
              class="main-menu-item"
              :class="locale === item.value?'menuItem active':'menuItem'" @click.prevent="clickLanguageSelector(item.value, $event)" ref="item.code">
              <span>{{ item.label }}</span>
          </a>
          </div>
        </div>
      </fa-thin-button-menu>
      <!-- <fa-thin-button name="fa-thin fa-user" :label="loginLabel" @click="processLogin" id="login"></fa-thin-button>-->
    </q-toolbar>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { onMounted, computed, watch } from 'vue'
import FaThinButton from 'components/FaThinButton.vue'
import FaThinButtonRouter from 'components/FaThinButtonRouter.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'
import { useCookies } from 'vue3-cookies'

import languages from 'quasar/lang/index.json'
import { useI18n } from 'vue-i18n'
import enabledlanguages from 'src/i18n/index.js'

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
    const $q = useQuasar()
    const { cookies } = useCookies()
    const $store = useStore()

    const { t, locale } = useI18n({ useScope: 'global' })

    watch(locale, (newValue, oldValue) => {
      // Both vue-i18n and quasar app must be set.
      import(`../../node_modules/quasar/lang/${newValue}.js`).then(lang => {
        $q.lang.set(lang.default)
      })
    })

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
      let object = event.target
      locale.value = lang
      const nextURL = $store.getters['app/getFrontendUrl'] + lang
      const nextTitle = 'MosquitoAlert'
      const nextState = { additionalInformation: 'Updated the URL with JS' }
      window.history.pushState(nextState, nextTitle, nextURL)
      window.history.replaceState(nextState, nextTitle, nextURL)

      if (!object.classList.contains('menuItem')) object = object.parentNode
      setLanguage(lang, object)
    }

    const setLanguage = async function (lang, object) {
      await $store.dispatch('app/setInitData', lang)
      cookies.set('lang', lang)
      object.parentNode.querySelectorAll('.menuItem').forEach(item => {
        item.classList.remove('active')
      })
      object.classList.add('active')
      // NASTY
      let qLang = lang
      if (qLang === 'en') qLang = 'en-US'
      import('quasar/lang/' + qLang).then(({ default: messages }) => {
        $q.lang.set(messages)
      })
    }

    onMounted(async function () {
      lang.value = $store.getters['app/getLang']
      context.emit('leftMenuMounted', {})
    })

    const wmsVisibility = computed(() => {
      return true
    })

    const estimationsVisibility = computed(() => {
      return true
    })

    const frontendUrl = computed(() => {
      return $store.getters['app/getFrontendUrl']
    })

    const linkModels = computed(() => {
      return $store.getters['app/getFrontendUrl'] + 'models'
    })

    const loginLabel = computed(() => {
      if ($store.getters['app/getAuthorized']) {
        return t('log_out')
      } else {
        return t('log_in')
      }
    })

    return {
      wmsVisibility,
      estimationsVisibility,
      loginLabel,
      lang,
      locale,
      localeOptions: Object.keys(enabledlanguages).map(isoName => ({
        value: isoName, label: languages.filter(lang => lang.isoName === isoName)[0].nativeName
      })),
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
