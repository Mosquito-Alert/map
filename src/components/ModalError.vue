<!--
  MODAL WINDOW TO SHOW ERRORS
  ERORS MSG COMES FROM PROP
-->

<template>
  <transition name="backdrop">
      <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
        <div class="text-center">
          <q-icon name="warning" color="white" size="4rem" class="text-center"/>
        </div>
          <div class="modal-title text-center">{{ $t('Error') }}</div>
          <p class="modal-error-message" v-html="$t(msg)"></p>
          <div v-if="link">
            <p>{{ $t('More info') }}</p>
            <a :href="link">{{ link }} </a>
          </div>
        <div class="buttons">
          <div class="download-buttons" v-if="redirection">
            <router-link class="main-menu-item" to="/">
              <button @click="close" class="close">{{ $t('close') }}</button>
            </router-link>
          </div>
          <div class="download-buttons" v-else>
             <button @click="close" class="close">{{ $t('close') }}</button>
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
  emits: ['close', 'newReport'],
  setup (props, context) {
    const $store = useStore()

    const open = computed(() => {
      return $store.getters['app/getModals'].error.visibility
    })

    const msg = computed(() => {
      return $store.getters['app/getModals'].error.msg
    })

    const link = computed(() => {
      return $store.getters['app/getModals'].error.link
    })

    const redirection = computed(() => {
      return $store.getters['app/getModals'].error.redirection
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'error', content: { visibility: false } })
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    return {
      mobile,
      open,
      close,
      msg,
      link,
      redirection
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
  // background-color: rgba(0, 0, 0, 0.75);
  background: transparent
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
  padding: 3rem 5rem 3rem 5rem;
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
  background: $warning;
  color: white;
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
  pointer: not-allowed;
}
button {
  background: white;
  border: none;
  // color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
button:hover {
  // background: $primary-button-background-hover;
  background: $grey-color;
  color: #644a0f;
}
.download-buttons{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.modal-error-message{
  text-align: center;
  font-size: 1.2em;
}
.modal-title{
  font-size: 1.5em;
  padding-bottom: 10px;
  color: white;
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
