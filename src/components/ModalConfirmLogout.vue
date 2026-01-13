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
          <h5 class="text-h5 text-orange q-my-md">{{ $t('confirm_logout_title') }}</h5>
        </div>
          <!-- <p v-html="$t('confirm_logout_message')"></p> -->

          <div class="logout row">
            <button class="logout q-mt-md" @click="logout">{{ $t('confirm_logout') }}</button>
            <button class="logout q-mt-xs" @click="close">{{ $t('Cancel') }}</button>
          </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

export default {
  emits: ['close'],
  setup (props, context) {
    const $store = useStore()
    const backendUrl = $store.getters['app/getBackend']

    const open = computed(() => {
      return $store.getters['app/getModals'].confirmLogout.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'confirmLogout', content: { visibility: false } })
    }
    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const logout = () => {
      const registeredWeb = $store.getters['app/getRegisteredWebUrl']
      axios(backendUrl + 'logout/', {
        withCredentials: true
      })
        .then((resp) => {
          if (resp.status === STATUS_CODES.OK) {
            console.log(resp)
            $store.commit('app/setAuthorized', false)
            document.location = registeredWeb
          } else {
            console.log(resp.status)
          }
        })
    }

    return {
      mobile,
      logout,
      open,
      close,
      trans
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
