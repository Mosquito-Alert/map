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
        <q-form
         @submit.prevent="onSubmit">
        <div class="column">
          <div class="row content-center">
            <h5 class="text-h5 text-orange q-my-md">Mosquito Alert</h5>
          </div>
          <q-input
            filled
            color="orange"
            name="username"
            v-model="username"
            :label="$t('username')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('field_required') ]"
          ></q-input>

          <q-input
            class="q-mt-md"
            color="orange"
            v-model="password"
            name="password"
            :label="$t('password')"
            filled :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('field_required')]"
            >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div v-if="loginError" class="login-error">
            {{ $t('Invalid login') }}
          </div>
          <div class="login row">
            <button class="q-mt-md" @click.prevent="onSubmit">{{ $t('log_in') }}</button>
            <button class="q-mt-xs" @click.prevent="close">{{ $t('close')}} </button>
          </div>
        </div>
        </q-form>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  setup (props, context) {
    const username = ref('')
    const password = ref('')
    const $store = useStore()
    const loginError = ref()

    const open = computed(() => {
      return $store.getters['app/getModals'].login.visibility
    })

    const close = function () {
      loginError.value = false
      $store.commit('app/setModal', { id: 'login', content: { visibility: false } })
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const onSubmit = function (evt) {
      if (username.value && password.value) {
        const controller = new AbortController()
        const { signal } = controller
        const authenticateUrl = $store.getters['app/getAuthenticateUrl']
        const registeredWeb = $store.getters['app/getRegisteredWebUrl']

        const formData = new FormData()
        formData.append('username', username.value)
        formData.append('password', password.value)

        fetch(`${authenticateUrl}`, {
          // credentials: 'include',
          signal: signal,
          method: 'POST', // or 'PUT'
          body: formData
        })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              document.location = registeredWeb
            } else {
              loginError.value = true
              console.log('Not authenticated')
              // setTimeout(function () {
              //   success.value = true
              // }, 5000)
            }
          })
      }
    }

    return {
      onSubmit,
      username,
      password,
      isPwd: ref(true),
      mobile,
      open,
      close,
      loginError,
      trans
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
.login-error{
  font-style:italic;
  color: red;
  font-weight: 600;
  text-align: center;
}
</style>
