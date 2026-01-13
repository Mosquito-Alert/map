<!--
  MODAL WINDOW TO SHOW LOGOS (coordinators and sponsors)
-->

<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-first" v-if="open">
      <dialog open class="modal-first q-pa-xl q-pb-sm" :class="mobile?'mobile':''">
        <div v-if="mobile">
          <div v-if="mobile" class="coordinators col-12">
            <h5 class="q-my-lg">
                {{ $t('mosquito_alert_esta_coordinado_por') }}:
            </h5>
          </div>

          <div v-if="mobile" class="info-logos row">
            <div class="col-7">
                <a href="https://www.ceab.csic.es/" target="_blank">
                <img src="~assets/img/csic_ceab_logo.png" class="csic-ceab">
                </a>
            </div>
            <div class="col-5">
                <a href="https://www.upf.edu/" target="_blank">
                <img src="~assets/img/UPFt_rgb.png" class="upf">
                </a>
            </div>
            <div class="col-7">
                <a href="https://www.creaf.cat/" target="_blank">
                <img src="~assets/img/CREAF-SO-logo.jpg" class="creaf">
                </a>
            </div>
            <div class="col-5">
                <a href="https://www.icrea.cat/" target="_blank">
                <img src="~assets/img/icrea.jpeg" class="icrea">
                </a>
            </div>
          </div>
          <h5 class="q-my-lg text-left">
            {{ $t('con_el_apoyo_de') }}:
          </h5>
          <div v-if="mobile" class="col-12 text-left funded-logos">
            <a :href="linkLaCaixa" target="_blank">
                <img src="~assets/img/la_caixa.jpeg" class="lacaixa">
            </a>
          </div>

        </div>
        <div class="download-buttons q-mt-lg">
          <button class="q-btn ma-share-btn" @click="close">{{ $t('close') }}</button>
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

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const open = computed(() => {
      return $store.getters['app/getModals'].logos.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'logos', content: { visibility: false } })
    }

    const linkLaCaixa = computed(() => {
      const lang = $store.getters['app/getLang']
      return '//fundacionlacaixa.org/' + lang + '/convocatoria-caixaresearch-investigacion-salud-2019-proyecto-dengue-chikunguna-zika'
    })
    const layers = $store.getters['app/getLayers']

    return {
      open,
      close,
      linkLaCaixa,
      layers,
      hasCloseButton,
      mobile,
      trans,
      slide: ref('pag_1')
    }
  }
}
</script>

<style scoped lang="scss">
.info-logos,
.funded-logos{
  padding: 10px;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}
.info-logos img.csic-ceab,
.info-logos img.creaf{
  max-width: 150px;
}

.info-logos div {
  text-align: left;
}
.logos img.upf,
.logos img.icrea{
  max-width: 100px;
}
.info-logos img{
  max-width: 100px;
}

.funded-logos img{
  max-width: 230px;
}

.row .col-8,
.row .col-4{
  text-align: left;
}
</style>
