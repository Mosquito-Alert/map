<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open" @click="close">
      <dialog open>
        <slot></slot>
          <div class="modal-title">{{ _('Reports modal title') }}</div>
          <p>{{ _('Report with the observations displayed in the current map view (maximum: 300 observations)') }}</p>
          <p>{{ _('Verify this by looking at the map point counter') }}</p>
        <div class="error-message" v-if="!nFeatures">
          {{ _('No features to download') }}
        </div>
        <div class="buttons">
          <div class="download-buttons">
            <button @click="newReport">{{ _('Continue') }}</button>
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
  emits: ['close', 'newReport'],
  setup (props, context) {
    const $store = useStore()
    const newReport = function () {
      context.emit('newReport')
    }

    const nFeatures = computed(() => {
      return $store.getters['app/getModals'].report.n
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'report', content: { visibility: false } })
    }
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    return {
      nFeatures,
      newReport,
      close,
      hasCloseButton,
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
.modal-title{
  font-size: 1.5em;
  padding-bottom: 10px;
}
</style>