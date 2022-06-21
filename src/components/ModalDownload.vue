<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-download" v-if="open" @click="close">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
          <div class="modal-title">{{ _('Download') }}</div>
          <p>{{ _('Only data displayed in the current map view will be downloaded. Verify your current active layers, temporal filters and zoom.') }}</p>
          <p>{{ _('Once verified, press the download button.') }}</p>
          <p>
            {{ _('For the Mosquito Alert complete dataset, with advanced options, go to Mosquito Alert portal:') }}
            <a :href="_('Mosquito portal URL')" target="_blank">
            {{ _('Mosquito portal URL') }}
            </a>
          </p>
        <div class="error-message" v-if="!nFeatures">
          {{ _('No features to download') }}
        </div>
        <div class="buttons">
          <div class="modal-content download-buttons">
            <button
              class="download"
              :class="!nFeatures?'disabled':''"
              @click="download('gpkg')"
            >
              <i class="fa-solid fa-download"></i>
                <div class="q-pl-sm">{{ _('Download geopackage') }}</div>
            </button>

            <button
              class="download"
              :class="!nFeatures?'disabled':''"
              @click="download('xlsx')"
            >
                <i class="fa-solid fa-download"></i>
                <div class="q-pl-sm">{{ _('Download excel') }}</div>
            </button>
          </div>
          <div class="close-modal download-buttons">
            <button @click="close" class="close">{{ _('Close') }}</button>
          </div>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['open', 'buttons'],
  emits: ['close', 'startDownload'],
  setup (props, context) {
    const $store = useStore()
    const download = function (format) {
      context.emit('startDownload', { format })
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const nFeatures = computed(() => {
      return $store.getters['app/getModals'].download.n
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'download', content: { visibility: false } })
    }
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    return {
      nFeatures,
      mobile,
      download,
      close,
      hasCloseButton,
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

.dialog.modal-download {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}
.modal-download dialog {
  max-width: 50vw;
  max-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 5rem 5rem 3rem 5rem;
  background-color: white;
  z-index: 2001;
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
.modal-download button.disabled {
  background: #ccc;
  pointer: not-allowed;
}
.modal-download button.download {
  display:flex;
}
.modal-download button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
.modal-download button:hover {
  background: $primary-button-background-hover;
  color: #644a0f;
}
.download-buttons{
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
.modal-download .modal-content{
  padding-bottom:40px;
}
</style>
