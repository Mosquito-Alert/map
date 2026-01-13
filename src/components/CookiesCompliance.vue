<!--
  THIS COMPONENT SHOWS COOKIES ADVICE FIRT TIME PAGE IS VISITED
 -->

<template>
  <transition name="cookies">
    <div class="cookie-comply-container" v-if="complyVisible">
      <div class="flex">
        <div class="col-8 col-sm-12 col-xs-12 q-mr-xl">
          <div>
            <h6>{{ $t('cookies_comply_title') }}</h6>
          </div>
          <div>
            <p>
              {{ $t('la_web_de_mosquito_alert_utiliza_cookies_propias_y_de_terceros_con_finalidades_tecnicas_y_analiticas_para_administrarlas_utilice_el_gestor_si_desea_mas_informacion_acceda_a_la_politica_de_cookies') }}
            </p>
            <p>
              {{ $t('escoge_que_tipos_de_galletas_aceptas_que_mosquito_alert_pueda_guardar_en_tu_navegador') }}
            </p>
            <p>
              <a href="#" @click.stop="openPolicy">{{ $t("cookies_policy") }}</a>
            </p>
          </div>
        </div>
        <div class="col-2 col-sm-6 col-xs-12 q-mr-md">
          <button class="ma-btn" @click="openSettings">{{ $t('manage_cookies') }}</button>
        </div>
        <div class="col-2 col-sm-6 col-xs-12">
          <button class="ma-btn" @click="acceptAll">{{ $t('accept_all') }}</button>
        </div>
      </div>
    </div>
  </transition>

  <modal-cookie-settings ref="cookiesSettings">
  </modal-cookie-settings>
</template>

<script>
import { computed, ref } from 'vue'
// import { inject } from 'vue'
import { useStore } from 'vuex'
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import { useCookies } from 'vue3-cookies'
import { useGtm } from '@gtm-support/vue-gtm'

export default {
  components: ['ModalCookieSettings'],
  setup (props, context) {
    const cookiesSettings = ref('null')
    const analyticsActivated = ref(false)
    const $store = useStore()

    // const gtag = inject('gtag')
    const gtm = useGtm()
    const { cookies } = useCookies()

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    // SHOW INFO IF REQUIRED
    const complyVisible = computed(() => {
      return !$store.getters['app/getCookiesComply']
    })

    // OPEN COOKIE SETTINGS MODAL
    const openSettings = function () {
      $store.commit('app/setModal', { id: 'cookieSettings', content: { visibility: true } })
    }

    // OPEN COOKIE POLICY MODAL INFO
    const openPolicy = function () {
      $store.commit('app/setModal', { id: 'cookiePolicy', content: { visibility: true } })
    }

    // ACCEPT ALL COOKIES
    const acceptAll = function () {
      cookies.set('cookie-comply', 'all')
      $store.commit('app/setCookiesComply', true)
      // gtag.optIn()
      gtm.enable = true
    }

    return {
      trans,
      cookiesSettings,
      acceptAll,
      openSettings,
      openPolicy,
      complyVisible,
      analyticsActivated,
      ModalCookieSettings
    }
  }
}
</script>

<style scoped lang="scss">
.cookie-comply-container{
  z-index: 1900;
  position: fixed;
  bottom: 60px;
  border-radius: 4px;
  width: auto;
  padding: 10px;
  margin: 0 10px;
  background: #EAEDED;
}

.cookie-comply-container .flex{
  align-items: flex-end
}

.cookie-comply-container h6{
  margin: 10px 0px;
}
.cookies-enter-from{
  opacity: 0;
  transform: translateY(260px);
}
.cookies-enter-to{
  opacity: 1;
  transform: translateY(0);
}
.cookies-enter-active{
  transition: all 1s ease;
}

// animation leave classes
.cookies-leave-from{
  opacity: 1;
  transform: translateY(0px);
}
.cookies-leave-to{
  opacity: 0;
  transform: translateY(260px);
}
.cookies-leave-active{
  transition: all 3s ease;
}
</style>
