<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open" @click="close">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
          <div class="modal-title"> {{ _('Share modal title') }} </div>
          <p v-if="success==''">{{ _('Share this map view') }}</p>
          <p v-if="success=='error'">{{ _('Share map view error') }}</p>
          <div v-if="success=='ok'">
            <div v-if="copied">
              <transition name="toast">
                <p>{{ _('Url has been copied') }}</p>
              </transition>
            </div>
            <p v-else>{{ _('Map view shared successfully') }}</p>
            <p>{{ _('This is the new view url') }}</p>
            <p><input type="text" v-model="newUrl"></p>
            <p class="viewshare"><i
              class="fas fa-copy"
              :title="_('Copy url to clipboard')"
              @click="copyToClipboard"
            ></i></p>
          </div>
        <div class="buttons">
          <div class="download-buttons">
            <button v-if="success==''" @click.stop="shareView">{{ _('Share view') }}</button>
            <button @click="close" class="close">{{ _('Close') }}</button>
          </div>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>

import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['open', 'buttons'],
  emits: ['close', 'shareView'],
  setup (props, context) {
    const success = ref('')
    const copied = ref(false)
    const newUrl = ref('')
    const $store = useStore()
    const shareView = function () {
      context.emit('shareView')
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const close = function () {
      success.value = ''
      $store.commit('app/setModal', { id: 'share', content: { visibility: false } })
    }

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const copyToClipboard = function () {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        copied.value = true
        return navigator.clipboard.writeText(newUrl.value)
      }
      return Promise.reject('The Clipboard API is not available.')
    }

    return {
      mobile,
      copyToClipboard,
      copied,
      success,
      newUrl,
      shareView,
      close,
      _
    }
  }
}
</script>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.75);
}

.dialog {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}
dialog {
  max-width: 50vw;
  max-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 5rem 5rem 3rem 5rem;
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
button.disabled {
  background: #ccc;
  cursor: not-allowed;
}
button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
button:hover {
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
.viewshare{
  text-align: center;
  color: $primary-color;
}

// Animation enter classes
.toast-enter-from{
  opacity: 0;
  transform: translateY(-60px);
}
.toast-enter-to{
  opacity: 1;
  transform: translateY(0);
}
.toast-enter-active{
  transition: all 0.3s ease;
}

// animation leave classes
.toast-leave-from{
  opacity: 1;
  transform: translateY(0px);
}
.toast-leave-to{
  opacity: 0;
  transform: translateY(-60px);
}
.toast-leave-active{
  transition: all 3s ease;
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
</style>
