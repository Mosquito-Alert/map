<!--
  MODAL WINDOW TO SHOW LOGIN FORM
-->

<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-first" v-if="open">
      <dialog open class="modal-first q-pa-xl q-pb-sm" :class="mobile?'mobile':''">
        <slot></slot>
        <!-- <q-form
         @submit.prevent="onSubmit"> -->
        <div class="column">
          <div class="row content-center">
            <h5 class="text-h5 text-orange q-my-md">Mosquito Alert</h5>
          </div>
          <q-input
            filled
            color="orange"
            name="username"
            v-model="username"
            :label="_('Username *')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || _('Field required') ]"
          ></q-input>

          <q-input
            class="q-mt-md"
            color="orange"
            v-model="password"
            name="password"
            :label="_('Password *')"
            filled :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[ val => val && val.length > 0 || _('Field required')]"
            >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="login row">
            <button class="q-mt-md" @click="onSubmit">{{ _('Log in') }}</button>
            <button class="q-mt-xs" @click="close">{{ _('Close')}} </button>
          </div>
        </div>
        <!-- </q-form> -->
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { observations as privateLayers } from '../store/app/privateTOC'
import { observations as publicLayers } from '../store/app/publicTOC'
import MSession from '../js/session.js'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

export default {
  emits: [
    'resetTOC'
  ],
  setup (props, context) {
    let mySession
    const username = ref('')
    const password = ref('')
    const $store = useStore()
    const backendUrl = $store.getters['app/getBackend']

    const open = computed(() => {
      return $store.getters['app/getModals'].login.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'login', content: { visibility: false } })
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const onSubmit = function (evt) {
      if (username.value && password.value) {
        axios(backendUrl + 'api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': $store.getters['app/getCsrfToken']
          },
          withCredentials: true,
          // body: formData
          data: JSON.stringify({ username: username.value, password: password.value })
        })
          .then((resp) => {
            if (resp.status === STATUS_CODES.OK) {
              mySession = new MSession(backendUrl, null)
              mySession.getSession(resetTOC)
            } else {
              console.log(resp.status)
              this.setState({ error: 'Wrong username or password.' })
              console.log('Not authenticated')
              $store.commit('app/setLayers', publicLayers)
            }
          })
      }
    }

    function resetTOC () {
      $store.commit('app/setCsrfToken', mySession.csrfToken)
      $store.commit('app/setAuthorized', true)
      $store.commit('app/setLayers', privateLayers)
      $store.commit('app/setModal', { id: 'login', content: { visibility: false } })
      context.emit('resetTOC', {})
    }

    return {
      onSubmit,
      username,
      password,
      isPwd: ref(true),
      mobile,
      open,
      close,
      _
    }
  }
}
</script>

<style lang="scss">
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

.login button{
  display: flex;
  width: 100%;
  justify-content: center;
  color: white;
  padding: 4px 0px;
  border-radius: 4px;
  text-transform: uppercase;
}
</style>
