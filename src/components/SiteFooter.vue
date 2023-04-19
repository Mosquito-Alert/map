<!--
  SHOW FOOTER
-->

<template>
  <q-footer v-if="!mobile || (!popupContent || !Object.keys(popupContent).length)" class="text-white">
    <q-toolbar>
      <q-toolbar-title>
        <div class="flex" style="justify-content:space-between; width: 100%; align-items:center">
          <div v-if="!mobile" class="col q-my-xs">
            <div class="logo-title">
              {{ trans('This interactive map has been funded by') }}
            </div>
            <div class="main-logo">
              <a :href="linkLaCaixa" target="_blank">
                <img src="~assets/img/fundacio_la_caixa.jpg">
              </a>
            </div>
          </div>

          <div v-if="mobile" class="main-logo flex">
            <div class="mosquito-logo flex">
              <a href="https://www.ceab.csic.es/" target="_blank" class="flex">
                <img src="~assets/img/MA-mobile.png">
              </a>
            </div>
            <div class="about cursor-pointer" @click="showLogos">
              {{ trans('About us') }}
            </div>
          </div>

          <div v-if="!mobile">
            <ul class="logos" :class="mobile?'mobile':''">
              <li>
                <a href="https://www.ceab.csic.es/" target="_blank">
                  <img src="~assets/img/CSIC-CEAB.png">
                </a>
              </li>
              <li>
                <a href="https://www.upf.edu/" target="_blank">
                  <img src="~assets/img/UPF.png">
                </a>
              </li>
              <li>
                <a href="https://www.creaf.cat/" target="_blank">
                  <img src="~assets/img/CREAF-SO.png">
                </a>
              </li>
              <li>
                <a href="https://www.icrea.cat/" target="_blank">
                  <img src="~assets/img/ICREA.png">
                </a>
              </li>
            </ul>
          </div>
        </div>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<script>
import { useStore } from 'vuex'
import { defineComponent, computed } from 'vue'

export default defineComponent({
  setup (props, context) {
    const $store = useStore()

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const popupContent = computed(() => {
      return $store.getters['map/getSelectedFeature']
    })

    const showFooter = computed(() => {
      console.log(Object.keys(popupContent).length)
      return (!mobile.value || Object.keys(popupContent).length !== 0)
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const showLogos = function () {
      $store.commit('app/setModal', {
        id: 'logos',
        content: {
          visibility: true
        }
      })
    }

    const linkLaCaixa = computed(() => {
      const lang = $store.getters['app/getLang']
      return '//fundacionlacaixa.org/' + lang + '/convocatoria-caixaresearch-investigacion-salud-2019-proyecto-dengue-chikunguna-zika'
    })

    return {
      trans,
      linkLaCaixa,
      showLogos,
      mobile,
      popupContent,
      showFooter
    }
  }
})
</script>

<style lang="scss">
.q-footer {
  // height:50px;
  background-color: $footer-background;
  display: flex;
}
.q-toolbar{
  // height: 50px;
}
.q-footer .q-toolbar__title {
  display: flex;
  height:$footer-height;
  justify-content: space-between;
}
.logos.mobile {
  display:flex;
  // transform: scale(0.5);
  // transform-origin: 0 0;
}
.main-logo,
.logos {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}
.logos li a {
  display: flex;
  justify-content: center;
}
.logos.mobile li {
  width:20%;
  margin:0;
  padding:0;
}
.main-logo img,
.logos li img {
  max-height: 35px;
  margin-left: 30px;
}
.main-logo img{
  margin-left: 0px;
}
.logos.mobile li img {
  max-width: 95%;
  margin-left: 0px;
}

.logo-title{
  font-size: 11px;
}
.main-logo.flex{
  width: 100%;
  justify-content: space-between;
}
.about{
  font-size: 12px;
  text-decoration: underline;
}
</style>
