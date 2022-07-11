<template>
  <transition name="backdrop">
      <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog cookie-settings" v-if="open">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
          <div>
            <div class="close-modal-window">
              <i @click="closeModal" class="fa fa-window-close" aria-hidden="true"></i>
            </div>
            <div>
              <div class="row cookies-selector">
                  <div class="col-10"><h5>Necesarias</h5></div>
                  <div class="col-2">
                    <label class="cookie-comply-switch" title="is required">
                      <input id="performance" type="checkbox" disabled="" value="performance">
                      <span class="cookie-comply-slider cookie-comply-round cookie-comply-required"></span>
                    </label>
                  </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <p>Las imprescindibles para facilitar vuestra conexión. No hay opción de inhabilitarlas, dado que son las necesarias por el funcionamiento del sitio web.</p>
                </div>
              </div>

              <div class="row cookies-selector">
                  <div class="col-10"><h5>Analytics</h5></div>
                  <div class="col-2">
                    <label class="cookie-comply-switch" title="ga">
                      <input id="ga" type="checkbox" value="ga" @click="analyticsActivated = !analyticsActivated">
                      <span class="cookie-comply-slider cookie-comply-round"></span>
                    </label>
                  </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <p>Proporcionan información estadística y permiten mejorar los servicios. Utilizamos cookies de Google Analytics que podéis desactivar instalándoos este plugin.</p>
                </div>
              </div>
            </div>
          </div>

          <footer class="modal-buttons text-center flex">
            <button class="col-6 col-xs-12 cookie-comply__button ma-btn" @click="savePreferences"> {{ _('Accept all') }} </button>
            <button @click="close" class="col-6 col-xs-12 ma-btn close">{{ _('Save and close') }}</button>
          </footer>

      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, inject, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  emits: ['close'],
  setup (props, context) {
    const $store = useStore()
    const analyticsActivated = ref(false)
    const gtag = inject('gtag')

    const open = computed(() => {
      return $store.getters['app/getModals'].cookieSettings.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'cookieSettings', content: { visibility: false } })
    }
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const savePreferences = function (val) {
      // Prevent cookie message appearing next time
      const complied = (val === 'all') ? val : ((analyticsActivated.value) ? ['performance', 'ga'] : ['performance'])
      localStorage['cookie-comply'] = complied
      if (analyticsActivated.value) {
        console.log('opt in')
        // gtag = false
        gtag.optIn()
      } else {
        console.log('opt out')
        // gtag = true
        gtag.optOut()
      }
      console.log(gtag)
    }

    const onAccept = function () {
      savePreferences('all')
    }

    const closeModal = function () {
      return $store.commit('app/setModal', { id: 'cookieSettings', content: { visibility: false } })
    }
    return {
      closeModal,
      mobile,
      open,
      close,
      savePreferences,
      onAccept,
      _
    }
  }
}
</script>

<style lang="scss">
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  // background-color: rgba(0, 0, 0, 0.75);
  background: transparent
}

.dialog.cookie-settings {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
}
.cookie-settings dialog {
  max-width: 50vw;
  max-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 5rem 5rem 3rem 5rem;
  background-color: white;
  border: none;
  overflow:auto;
  position: relative;
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
.cookie-settings button.disabled {
  background: #ccc;
  pointer: not-allowed;
}
.cookie-settings button.download {
  display:flex;
}

.mobile .cookie-settings button {
  margin: 5px;
}
.cookie-settings button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
.cookie-settings button:hover {
  background: $primary-button-background-hover;
  color: #644a0f;
}

// MOBILE
dialog.mobile {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem 1rem 1rem 1rem;
}

dialog.mobile .buttons{
  padding: 5px 10px;
}

.dialog.cookie-settings .modal-buttons{
  justify-content: center;
}
.close-modal {
  position: absolute;
  bottom: 10px;
  right: 0;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}
.cookie-settings .modal-content{
  padding-bottom:0px;
}

.ma-btn::before,
.ma-close-btn::before{
  box-shadow: none;
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
.download-buttons{
  justify-content: center;
  flex-wrap: nowrap;
}
.cookies-selector {
  align-items: center;
}
.fa-window-close{
  font-size: 3em;
  color: $primary-color;
}
.close-modal-window{
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
}

.mobile .close-modal-window{
  top: 5px;
  right: 5px;
  font-size: 0.8em;
}
</style>
