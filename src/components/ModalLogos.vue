<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-first" v-if="open">
    <!-- <div class="dialog" v-if="open" @click="close"> -->
      <dialog open class="modal-first q-pa-xl q-pb-sm" :class="mobile?'mobile':''">
        <div v-if="mobile">
          <div v-if="mobile" class="coordinators col-12">
            <h5 class="q-my-lg">
                {{ _('Este mapa interactivo ha sido coordinado por') }}:
            </h5>
          </div>

          <div v-if="mobile" class="info-logos row">
            <div class="col-6">
                <a href="https://www.ceab.csic.es/" target="_blank">
                <img src="~assets/img/csic_ceab_logo.png">
                </a>
            </div>
            <div class="col-6">
                <a href="https://www.upf.edu/" target="_blank">
                <img src="~assets/img/UPFt_rgb.png">
                </a>
            </div>
            <div class="col-6">
                <a href="https://www.creaf.cat/" target="_blank">
                <img src="~assets/img/CREAF-SO-logo.jpg">
                </a>
            </div>
            <div class="col-6">
                <a href="https://www.icrea.cat/" target="_blank">
                <img src="~assets/img/icrea.jpeg">
                </a>
            </div>
          </div>
          <h5 class="q-my-lg text-left">
            {{ _('Con el apoyo de') }}:
          </h5>
          <div v-if="mobile" class="col-12 text-center funded-logos">
            <a href="https://fundacionlacaixa.org/es/convocatoria-caixaresearch-investigacion-salud-2019-proyecto-dengue-chikunguna-zika" target="_blank">
                <img src="~assets/img/la_caixa.jpeg">
            </a>
          </div>

        </div>
        <div class="download-buttons q-mt-lg">
          <button class="q-btn ma-share-btn" @click="close">{{ _('Close') }}</button>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  emits: ['close'],
  setup (props) {
    const $store = useStore()

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const open = computed(() => {
      return $store.getters['app/getModals'].logos.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'logos', content: { visibility: false } })
    }

    const layers = $store.getters['app/getLayers']

    return {
      open,
      close,
      layers,
      hasCloseButton,
      mobile,
      _,
      slide: ref('pag_1')
    }
  }
}
</script>

<style scoped lang="scss">
.info-logos,
.funded-logos{
  // background: #333;
  padding: 10px;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}
.info-logos img{
  max-width: 100px;
}

.info-logos div {
  text-align: center;
}
.logos img{
  max-width: 150px;
}

.info-logos img{
  max-width: 100px;
}

.funded-logos img{
  max-width: 250px;
}

.info-logos div {
  text-align: center;
}

</style>
