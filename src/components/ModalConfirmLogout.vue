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
        <div class="row content-center">
          <h5 class="text-h5 text-orange q-my-md">{{ _('Confirm Logout Title') }}</h5>
        </div>
          <!-- <p v-html="_('Confirm Logout Message')"></p> -->

          <div class="logout row">
            <button class="logout q-mt-md" @click="logout">{{ _('Confirm Logout') }}</button>
            <button class="logout q-mt-xs" @click="close">{{ _('Cancel') }}</button>
          </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  emits: ['close'],
  setup (props, context) {
    const $store = useStore()

    const open = computed(() => {
      return $store.getters['app/getModals'].confirmLogout.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'confirmLogout', content: { visibility: false } })
    }
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const logout = () => {
      const registeredWeb = $store.getters['app/getRegisteredWebUrl']
      fetch('http://localhost:8000/api/logout/', {
        credentials: 'include'
      })
        .then((data) => {
          console.log(data)
          $store.commit('app/setAuthorized', false)
          document.location = registeredWeb
          // this.getCSRF()
        })
        .catch((err) => {
          console.log(err)
        })
    }

    return {
      mobile,
      logout,
      open,
      close,
      _
    }
  }
}
</script>

<style scoped lang="scss">
.content-center{
  justify-content: center;
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

.logout button{
  display: flex;
  width: 100%;
  justify-content: center;
  color: white;
  padding: 4px 0px;
  border-radius: 4px;
  text-transform: uppercase;
  vertical-align: middle;
}
</style>
