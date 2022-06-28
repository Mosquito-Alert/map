<template>
  <transition name="backdrop">
    <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-help" v-if="open">
    <!-- <div class="dialog" v-if="open" @click="close"> -->
      <dialog open class="modal-help q-pa-xl" :class="mobile?'mobile':''">
        <slot></slot>
          <q-carousel
           v-model="slide"
            transition-prev="slide-right"
            transition-next="slide-left"
            navigation-position="bottom"
            height="95%"
            swipeable
            animated
            prev-icon="arrow_left"
            next-icon="arrow_right"
            navigation
            control-color="orange"
            padding
            :arrows="!mobile"
            class="rounded-borders">
              <q-carousel-slide name="pag_1" class="column no-wrap flex-center">
                <img src="~/assets/img/help/help1.gif" />
                <div class="q-mb-0 q-mt-md q-px-xl text-center scroll">
                  <p>Selecciona las capas de información que te interese visualizar: observaciones de mosquito, picaduras, lugares de cría, otras especies y esfuerzo de muestreo.</p>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="pag_2" class="column no-wrap flex-center">
                <div class="scroll q-pr-md">
                  <div class="row q-mt-md q-pr-md text-left scroll">
                    <div>
                    <!-- <div class="column-img col-xl-7 col-lg-7 col-md-7 q-px-md self-center"> -->
                      <img src="~/assets/img/help/help2.gif">
                    <!-- </div> -->
                    <!-- <div class="col-xl-5 col-lg-5 col-md-5 text-justify scroll"> -->
                      <p>Filtra tu selección de distintas maneras:</p>
                      <p><b>POR LOCALIZACIÓN</b>: Escribe y selecciona del desplegable tu lugar de interés</p>
                      <p><b>POR HASHTAG</b>: puedes usar más de una etiqueta. Se mostrarán las observaciones que contengan como mínimo una de las etiquetas utilizadas.</p>
                      <p><b>POR IDENTIFICADOR</b>: escribe el identificador corto de un informe en el buscador de hashtag precedido
                      por el símbolo “:”</p>
                      <p>Ejemplo > :6RUID. Puedes usar más de un identificador. Se mostrarán las observaciones que contengan como mínimo
                      uno de los identificadores utilizados.</p>
                      <p><b>POR FECHA O RANGO DE FECHAS</b>. Los filtros aplican a todas las capas de información de las obser-
                      vaciones (mosquitos, lugares de cría, picaduras, otras especies). La capa “esfuerzo de muestreo” sólo puede filtrarse por fecha o rango de fecha.</p>
                    </div>
                  </div>
                  <div class="row q-px-lg text-center">
                      <p>Los filtros son acumulativos, es decir, que actúan sobre el rango de datos previamente seleccionados. Por ejemplo, si filtramos mosquitos de la ciudad de Barcelona, y posteriormente buscamos un hashtag, el mapa nos devolverá solamente aquellas observaciones de la ciudad de Barcelona que tengan dicho hashtag.</p>
                  </div>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="pag_3" class="column no-wrap flex-center">
                <img src="~/assets/img/help/help3.gif">
                <div class="q-mt-md q-px-xl text-center scroll">
                  <p>Descarga los datos seleccionados en la vista de tu mapa y genera informes html con los datos seleccionados en la vista de tu mapa.</p>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="pag_4" class="column no-wrap flex-center">
                <img src="~/assets/img/help/help4.gif">
                <div class="q-mt-md q-px-xl  text-center scroll">
                  <p>Consulta la información de la vista del mapa en formato de gráfico temporal</p>
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="pag_5" class="column no-wrap flex-center">
                <img src="~/assets/img/help/help5.gif">
                <div class="q-mt-md q-px-xl text-center scroll">
                  <p>Comparte la vista del mapa, consulta la ayuda y la información del mapa y cambia el idioma del mapa</p>
                </div>
              </q-carousel-slide>
            </q-carousel>
        <div class="close-modal text-center">
          <slot name="buttons"></slot>
          <button @click="close" v-if="hasCloseButton" class="ma-close-btn">{{ _('Close') }}</button>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['open', 'buttons'],
  emits: ['close'],
  setup (props) {
    const $store = useStore()
    const close = function () {
      $store.commit('app/setModal', { id: 'help', content: { visibility: false } })
    }
    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const layers = $store.getters['app/getLayers']
    return {
      layers,
      close,
      hasCloseButton,
      mobile,
      _,
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

.dialog.modal-help {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}

dialog {
  position:relative;
  max-width: 60vw;
  height: 70vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
}

dialog.mobile {
  max-width: 80vw;
  height: 90vh;
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
.mobile .q-carousel__slide img{
  max-width: 100%;
  margin-bottom: 10px;
}

.q-carousel__slide img{
  max-width: 50%;
  height: auto;
  float:left;
  margin-right: 20px;
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
.column-img{
  align-self:auto;
}
.q-mb-0{
  margin-bottom: 0px;
}
</style>
