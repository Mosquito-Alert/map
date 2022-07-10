<template>
<!-- G-ZLD12V4W3V -->
  <transition name="cookies">
    <div class="cookie-comply-container" v-if="complyVisible">
      <div class="flex">
        <div class="col-8 col-sm-12 col-xs-12 q-mr-xl">
          <div>
            <h6>{{ _('Cookies comply title') }}</h6>
          </div>
          <div>
            <p>
              {{ _('La web de Mosquito Alert utiliza cookies propias y de terceros con finalidades técnicas y analíticas. Para administrarlas utilice el gestor. Si desea más información acceda a la Política de cookies') }}
            </p>
            <p>
              {{ _('Escoge qué tipos de galletas aceptas que Mosquito Alert pueda guardar en tu navegador.') }}
            </p>
            <p>{{ _('More info')}}
              <a href="#" @click.stop="openPolicy">Política de cookies</a>
            </p>
          </div>
        </div>
        <div class="col-2 col-sm-6 col-xs-12 q-mr-md">
          <button class="ma-btn" @click="openSettings">{{ _('Cookie preferences') }}</button>
        </div>
        <div class="col-2 col-sm-6 col-xs-12">
          <button class="ma-btn" @click="acceptAll">{{ _('Accept all') }}</button>
        </div>
      </div>
    </div>
  </transition>

  <modal-cookie-settings>
  </modal-cookie-settings>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'

export default {
  components: ['ModalCookieSettings'],
  setup (props, context) {
    const complyVisible = ref(null)
    const analyticsActivated = ref(false)
    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    onMounted(function () {
      complyVisible.value = true
      if (localStorage['cookie-comply']) {
        complyVisible.value = false
      }
    })

    const openSettings = function () {
      console.log('open')
      $store.commit('app/setModal', { id: 'cookieSettings', content: { visibility: true } })
    }

    const openPolicy = function () {
      console.log('open')
      $store.commit('app/setModal', { id: 'cookiePolicy', content: { visibility: true } })
    }

    const acceptAll = function () {
      localStorage['cookie-comply'] = 'all'
      complyVisible.value = false
    }

    return {
      _,
      acceptAll,
      openSettings,
      openPolicy,
      complyVisible,
      analyticsActivated,
      ModalCookieSettings
    }
  }
}
</script>

<style scoped lang="scss">
.cookie-comply-container{
  z-index: 1900;
  position: fixed;
  bottom: 60px;
  border-radius: 4px;
  width: auto;
  padding: 10px;
  margin: 0 10px;
  background: #ccc;
}

.cookie-comply-container .flex{
  align-items: flex-end
}

.cookie-comply-container h6{
  margin: 10px 0px;
}
.cookies-enter-from{
  opacity: 0;
  transform: translateY(260px);
}
.cookies-enter-to{
  opacity: 1;
  transform: translateY(0);
}
.cookies-enter-active{
  transition: all 1s ease;
}

// animation leave classes
.cookies-leave-from{
  opacity: 1;
  transform: translateY(0px);
}
.cookies-leave-to{
  opacity: 0;
  transform: translateY(260px);
}
.cookies-leave-active{
  transition: all 3s ease;
}
</style>
