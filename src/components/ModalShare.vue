<template>
  <transition name="backdrop">
    <div class="backdrop-modal-share" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog-share" v-if="open" @click="close">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
          <div class="modal-title"> {{ _('Share modal title') }} </div>
          <p v-if="status.status=='error'">{{ status.msg }}</p>
          <div class="modal-content" v-if="status.status=='ok'">
            <transition name="toast">
              <div v-if="copied" class="toast-msg">
                {{ _('Url has been copied') }}
              </div>
            </transition>
            <!-- <p v-else>{{ _('Map view shared successfully') }}</p> -->
            <div class="row q-my-lg new-url-wrapper">
              <div class="col text-center">
                <span
                  class="url-text"
                  v-html="newUrl"
                  @click.stop
                />
                <span class="viewshare cursor-pointer"><i
                  class="q-ml-md fas fa-copy"
                  @click.stop="copyToClipboard"
                ></i></span>
              </div>

            </div>
          </div>
        <div class="buttons close-modal">
          <div class="download-buttons">
            <button class="q-btn ma-share-btn" @click="close">{{ _('Close') }}</button>
          </div>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>

import { ref, computed, onUpdated } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['open', 'buttons'],
  emits: ['close', 'shareView'],
  setup (props, context) {
    const status = ref('')
    const copied = ref(false)
    const newUrl = ref('')
    const $store = useStore()

    const shareView = function () {
      // Check if model is loaded
      context.emit('shareView')
    }

    onUpdated(() => {
      if ($store.getters['app/getModals'].share.visibility) {
        shareView()
      }
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const close = function () {
      status.value = ''
      copied.value = false
      $store.commit('app/setModal', { id: 'share', content: { visibility: false } })
    }

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const copyToClipboard = function () {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        copied.value = true
        setTimeout(hide, 3000)
        return navigator.clipboard.writeText(newUrl.value)
      }
      return Promise.reject('The Clipboard API is not available.')
    }

    function hide () {
      copied.value = false
    }

    return {
      mobile,
      copyToClipboard,
      copied,
      status,
      newUrl,
      shareView,
      close,
      _
    }
  }
}
</script>

<style lang="scss">
.backdrop-modal-share {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  background-color: transparent;
}

.dialog-share {
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
  // max-width: 50vw;
  // max-height: 80vh;
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

// .download-buttons button.disabled {
//   background: #ccc;
//   cursor: not-allowed;
// }
// .download-buttons button {
//   background: $primary-button-background;
//   border: none;
//   color: white;
//   text-transform: uppercase;
//   padding: 15px 50px;
//   cursor: pointer;
//   font-weight: bold;
//   margin: 10px;
// }
// .download-buttons button:hover {
//   background: $primary-button-background-hover;
//   color: #644a0f;
// }
// .download-buttons{
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
// }
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
.toast-msg{
  color: white;
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  display:flex;
  justify-content:center;
  background-color: $filter-grey;
  padding: 5px;
  margin: 0 15px;
  border-radius: 5px;
}
.toast-enter-from{
  opacity: 0;
  transform: translateY(-60px);
}
.toast-enter-to{
  opacity: 1;
  transform: translateY(0);
}
.toast-enter-active{
  transition: all 1s ease;
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

.url-text{
  border:0px;
  border-bottom: 1px solid $primary-color;
  margin: 0 10px;
  padding: 0 10px;
}

.new-url-wrapper{
  display: flex;
}
.close-modal{
  position: absolute;
  bottom: 10px;
  right: 0;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}
.modal-content{
  padding-bottom: 60px;
}

.ma-share-btn::before,
.ma-close-btn::before{
  box-shadow: none;
}
.ma-share-btn{
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
}

.ma-close-btn{
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
  margin-bottom: 10px;
}
.ma-share-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}
</style>
