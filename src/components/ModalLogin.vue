<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-first" v-if="open">
      <dialog open class="modal-first q-pa-xl q-pb-sm" :class="mobile?'mobile':''">
        <slot></slot>
        <q-form
         @submit="onSubmit">
        <div class="column">
          <div class="row content-center">
            <h5 class="text-h5 text-orange q-my-md">Mosquito Alert</h5>
          </div>
          <q-input
            filled
            name="username"
            v-model="username"
            label="Username *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          ></q-input>

          <q-input
            class="q-mt-md"
            v-model="password"
            name="password"
            label="Password *"
            filled :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
            >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="row">
            <button class="ma-btn" @click="onSubmit">Login</button>
            <button class="ma-btn" @click="close">{{ _('Close')}} </button>
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
    const submitResult = ref([])
    const $store = useStore()

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
      const formData = new FormData(evt.target)
      const data = []

      for (const [name, value] of formData.entries()) {
        data.push({
          name,
          value
        })
      }
      console.log(data)
      submitResult.value = data
    }

    return {
      onSubmit,
      username: ref(''),
      password: ref(''),
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
</style>
