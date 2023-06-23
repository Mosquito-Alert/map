<!--
  MODAL WINDOW TO SHOW FIRST COOKIES USE ADVICE
-->

<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-first" v-if="open">
    <!-- <div class="dialog" v-if="open" @click="close"> -->
      <dialog open class="modal-first q-pa-xl q-pb-sm" :class="mobile?'mobile':''">
        <slot></slot>
          <img src="~assets/img/mosquitoalert_logo.png" class="q-mb-lg">
          <p>{{ trans('Check the') }} <b>{{ trans('data on mosquitoes, breeding places and bites') }}</b> {{ trans('sent by citizens, through the Mosquito Alert app.') }} {{ trans('Part of this data has been validated by entomology professionals or by Artificial Intelligence (AI) algorithms. You will also find data modeled from the original data.') }}</p>

          <p> {{ trans('You can ') }} <b>{{ trans('view, filter and download data') }}</b>, {{ trans("among other functions") }}. {{ trans('Use the Help') }} <i class="fa-thin fa-square-question"></i> {{ trans('and Info') }} <i class="fa-thin fa-circle-info"></i> {{ trans('for more information.') }}</p>
          <p>
            {{ trans('If you want the complete Mosquito Alert data set, with advanced documentation and download options, go to the Mosquito Alert Data Portal:') }} <a href="http://www.mosquitoalert.com/en/access-to-mosquito-alert-data-portal" target="_blank">www.mosquitoalert.com/en/access-to-mosquito-alert-data-portal</a></p>
          <p> {{ trans('You can also consult the Mosquito Alert website: ') }} <a href="http://www.mosquitoalert.com" target="_blank">www.mosquitoalert.com</a></p>

          <div class="row text-center">
            <div class="col">
              <button @click="close" class="ma-close-btn">{{ trans('Close') }}</button>
            </div>
          </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { useCookies } from 'vue3-cookies'

export default {
  props: ['open', 'buttons'],
  emits: ['close'],
  setup (props) {
    const appStore = useAppStore()
    const { cookies } = useCookies()

    const close = function () {
      cookies.set('ma-visited', 'yes')
      appStore.setModal({ id: 'first', content: { visibility: false } })
    }
    const mobile = computed(() => {
      return appStore.getIsMobile
    })
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })
    const trans = function (text) {
      return appStore.getText(text)
    }
    const layers = appStore.getLayers
    return {
      layers,
      close,
      hasCloseButton,
      mobile,
      trans,
      slide: ref('pag_1')
    }
  }
}
</script>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.75);
}
* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.dialog div::-webkit-scrollbar {
    height: 12px;
    width: 4px;
    background: #ccc;
}

.dialog div::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}

.dialog.modal-first {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}

.dialog.modal-first i.fa-thin{
  color: $primary-color;
  font-size:1.2rem;
  font-weight: 300;
}

dialog {
  position:relative;
  max-width: 50vw;
  max-height: 50vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
  padding-bottom: 10px;
}

dialog.mobile {
  max-width: 80vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
.backdrop-enter-active,
.backdrop-leave-active {
  transition: all .25s ease-in;
}
.modal-enter-from {
  opacity: 0;
  top: -5vh;
}
.modal-enter-active,
.modal-leave-active {
  transition: all .25s ease-in;
}
.modal-leave-to {
  opacity: 0;
  top: 5vh;
}
button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background: $primary-button-background-hover;
  color: #644a0f;
}
button.close {
  float: right;
}

// MOBILE
dialog.mobile {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem 1rem 1rem 1rem;
}

dialog.mobile button{
  padding: 5px 10px;
}
.q-carousel__slide img{
  max-width: 70%;
  height: auto;
}
dialog.mobile .q-carousel__slide.column.no-wrap.flex-center{
  padding: 4px 4px 60px 4px;
}
hr{
  border: 1px solid #cccccc88;
}
.help-icon img{
  height: 30px;
  width: auto;
}
.sampling-effort i {
  background-color: #e3d6a2;
  color: #6a6b59;
  opacity: 1;
  font-size: 30px;
  border-radius: 50%;
}
.close-modal {
  position: absolute;
  bottom: 10px;
  right: 0;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}

.ma-close-btn::before{
  box-shadow: none;
}

button.ma-close-btn,
.ma-close-btn{
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
}
button.ma-close-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}

</style>
