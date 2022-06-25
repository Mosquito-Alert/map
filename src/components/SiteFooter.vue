<template>

  <q-footer v-if="!mobile || (!popupContent || !Object.keys(popupContent).length)" class="text-white">
    <q-toolbar>
      <q-toolbar-title>
        <div v-if="!mobile" class="attribution"></div>
        <ul class="logos" :class="mobile?'mobile':''">
          <li v-if="mobile">
            <a href="https://www.ceab.csic.es/" target="_blank">
              <img src="~assets/img/mosquito_alert_mobile.png">
            </a>
          </li>
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

    return {
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
  height:50px;
  justify-content: space-between;
}
.logos.mobile {
  display:flex;
  // transform: scale(0.5);
  // transform-origin: 0 0;
}
.logos {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}
.logos li a {
  display: flex;
  align-items: center;
}
.logos.mobile li {
  width:20%;
  margin:0;
  padding:0;
}
.logos li img {
  max-height: 35px;
  margin-left: 30px;
}
.logos.mobile li img {
  max-width: 95%;
  margin-left: 0px;
}
</style>
