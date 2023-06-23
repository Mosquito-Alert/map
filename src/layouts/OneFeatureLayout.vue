<template>
  <q-layout
    class="expanded"
    :class="mobile?'mobile':''"
  >
  <q-page-container>
    <q-page
      class="flex expanded"
      :class="mobile?'mobile':''"
    >
      <div class="ma-logo" :title="trans('Mosquito Alert')">
        <a href="//webserver.mosquitoalert.com/">
          <img src="~assets/img/logo_mosquito_alert.png">
        </a>
      </div>
      <one-feature-map ref='map'
        init
        :observationId="observationId"
        :popup="mobile?'false':'true'"
        :clickable="mobile?'true':'false'"
      />
    </q-page>
  </q-page-container>

  <modal-cookie-settings/>
  <modal-error/>
  <modal-cookie-policy/>
  <cookies-compliance/>

  </q-layout>
</template>

<script>
import OneFeatureMap from 'components/OneFeatureMap.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
// import { useStore } from 'vuex'
import { useAppStore } from '../stores/appStore.js'

import ModalError from 'src/components/ModalError.vue'
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import ModalCookiePolicy from 'src/components/ModalCookiePolicy.vue'
import CookiesCompliance from 'src/components/CookiesCompliance.vue'

export default {
  components: {
    OneFeatureMap,
    ModalError,
    ModalCookiePolicy,
    ModalCookieSettings,
    CookiesCompliance
  },
  setup () {
    const route = useRoute()
    const observationId = (route.params) ? ((route.params.code) ? route.params.code : '') : ''
    // const $store = useStore()
    const appStore = useAppStore()
    const langCookie = appStore.getLang
    const lang = (route.params) ? ((route.params.lang) ? route.params.lang : langCookie) : langCookie

    if (lang) {
      appStore.setInitData(lang.toLowerCase())
    }

    const mobile = computed(() => {
      return appStore.getIsMobile
    })

    const trans = function (text) {
      return appStore.getText(text)
    }

    return {
      trans,
      mobile,
      observationId
    }
  }
}
</script>

<style lang="scss">
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    overflow: hidden;
  }

  .ol-attribution {
    position: absolute;
    top: auto;
    left: auto;
    bottom: 4px;
    right: 10px;
    z-index: 9;
    background: #33333342;
    font-size: 10px;
    color: white;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }
  .ma-logo{
    position: absolute;
    top:5px;
    left: 5px;
    z-index:100;
    transform: scale(0.8);
  }
</style>
