<!--
  MODAL WINDOW BEFORE REPORTS (INFO MESSAGE)
-->

<template>
  <transition name="backdrop">
    <div class="backdrop-modal-reports" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-reports" v-if="open" @click="close">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
          <div class="modal-title">{{ trans('Reports modal title') }}</div>
          <p>{{ trans('Report with the observations displayed in the current map view (maximum: 300 observations)') }}</p>
          <p>{{ trans('Verify this by looking at the map point counter') }}</p>
          <p class="popup-blocking-warning" v-if="browser==='safari'">
            {{ trans('If you are using Safari, please Check that your pop-up windows block is not blocking the list of observations') }}
          </p>
        <div class="error-message" v-if="tooManyFeatures">
          {{ trans('Reports limit exceeded') }}
        </div>
        <div class="modal-close buttons">
          <div class="report-buttons flex">
            <div>
              <button v-if="!tooManyFeatures" class="gtm-report-detailed ma-btn q-mr-sm" @click="newReport">
                {{ trans('Continue') }}
              </button>
            </div>
            <div>
              <button @click="close" class="ma-btn q-ml-sm">{{ trans('Close') }}</button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useGtm } from '@gtm-support/vue-gtm'

export default {
  props: ['open', 'buttons'],
  emits: ['close', 'newReport'],
  setup (props, context) {
    const $store = useStore()

    function doDataLayer (activeLayers) {
      const dict = {}
      activeLayers.forEach(layer => {
        dict[layer] = true
      })
      return dict
    }

    const newReport = function () {
      context.emit('newReport')
      const mapLayers = $store.getters['app/getLayers']
      const activeLayers = []
      for (const group in mapLayers) {
        for (const category in mapLayers[group]) {
          if (mapLayers[group][category].active) {
            activeLayers.push(category)
          }
        }
      }
      // [ "tiger", "yellow", "japonicus", "koreicus", "culex", "unidentified", "other", "bite", "with_water", "without_water", "other_water" ]
      const gtm = useGtm()
      // window.dataLayer.push({
      //   pageCategory: 'home',
      //   visitorType: 'Developerssss'
      // })
      // window.dataLayer.push({
      //   event: 'detailedReport',
      //   tiger: activeLayers.includes('tiger'),
      //   yellow: activeLayers.includes('yellow'),
      //   japonicus: activeLayers.includes('japonicus'),
      //   culex: activeLayers.includes('culex'),
      //   unidentified: activeLayers.includes('unidentified'),
      //   other: activeLayers.includes('other'),
      //   bite: activeLayers.includes('bite'),
      //   with_water: activeLayers.includes('with_water'),
      //   without_water: activeLayers.includes('without_water'),
      //   other_water: activeLayers.includes('other_water')
      // })
      const dl = doDataLayer(activeLayers)
      dl.event = 'detailedReport'
      dl.action = 'click'
      gtm.trackEvent(dl)
    }

    const maxReports = $store.getters['app/getReportsLimit']
    const tooManyFeatures = computed(() => {
      return ($store.getters['app/getModals'].report.n > maxReports)
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'report', content: { visibility: false } })
    }

    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const browser = computed(() => {
      return $store.getters['app/getBrowser']
    })

    return {
      browser,
      mobile,
      tooManyFeatures,
      newReport,
      close,
      hasCloseButton,
      trans
    }
  }
}
</script>

<style lang="scss">
.backdrop-modal-reports {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  background: transparent
}

.dialog.modal-reports {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}
.modal-reports dialog {
  max-width: 50vw;
  max-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 5rem 5rem 2rem 5rem;
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
.backdrop-enter-active,
.backdrop-leave-active {
  transition: all .25s ease-in;
}
.modal-enter-from {
  opacity: 0;
  top: -5vh;
}
.modal-enter-active,
.modal-leave-active {
  transition: all .25s ease-in;
}
.modal-leave-to {
  opacity: 0;
  top: 5vh;
}
.modal-reports button.disabled {
  background: #ccc;
  pointer: not-allowed;
}
.modal-reports button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
.modal-reports button:hover {
  background: $primary-button-background-hover;
  color: #644a0f;
}
.report-buttons{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.error-message{
  color: crimson;
  text-align: center;
  font-weight: bold;
}
.modal-title{
  font-size: 1.5em;
  padding-bottom: 10px;
}

// MOBILE
dialog.mobile {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem 1rem 1rem 1rem;
}

dialog.mobile button{
  padding: 5px 10px;
}

.ma-btn::before,
.ma-close-btn::before{
  box-shadow: none;
}

.ma-btn:active{
  text-decoration: none;
  color: #fff;
  background-color: $grey-color;
  text-align: center;
  letter-spacing: .5px;
  transition: all .3s ease-out;
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
}
button.ma-btn:hover,
button.ma-close-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}

.popup-blocking-warning{
  font-weight: 500;
}
</style>
