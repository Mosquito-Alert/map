<!--
  MODAL WINDOW TO SHOW SPINNER AND PREVENT USER INTERACTION WHILE MAP IS WORKING
-->

<template>
  <transition name="modal">
    <q-dialog
      v-model="open"
      class="wait"
      :class="diaglogClass"
      :seamless="seamless">
      <!-- <slot></slot> -->
        <q-spinner-oval
          color="orange"
          size="5.5em"
        />
    </q-dialog>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  setup (props, context) {
    const $store = useStore()

    const open = computed(() => {
      return $store.getters['app/getModals'].wait.visibility
    })

    const seamless = computed(() => {
      return $store.getters['app/getModals'].wait.seamless
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const leftDrawerStatus = computed(() => {
      return $store.getters['app/getLeftDrawerStatus']
    })

    const diaglogClass = computed(() => {
      return ($store.getters['app/getLeftDrawerStatus'] ? 'expanded' : '') + ' ' + (mobile.value ? 'mobile' : '')
    })

    return {
      diaglogClass,
      seamless,
      leftDrawerStatus,
      mobile,
      open,
      _
    }
  }
}
</script>

<style lang="scss">
.backdrop-modal-wait {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
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
  pointer: not-allowed;
}
button {
  background: $primary-button-background;
  border: none;
  cursor: pointer;
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
.modal-title{
  font-size: 1.5em;
  padding-bottom: 10px;
}
.modal-box{
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.modal-box.expanded:not(.mobile){
  padding-left: $left-drawer-width;
}

.q-dialog.expanded:not(.mobile) .q-dialog__inner{
  margin-left: $left-drawer-width;
}
// MOBILE
dialog.mobile {
}
.q-dialog.wait .q-dialog__backdrop{
  background: transparent;
}
.q-date__today{
  box-shadow: none;
}
button.disabled{
  background: none
}
</style>
