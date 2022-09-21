<template>
  <transition name="backdrop">
    <div class="backdrop-modal-help" v-if="open"></div>
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
              <q-carousel-slide name="pag_1" class="column no-wrap">
                <div class="pag_1">
                  <div class="img">
                    <img class="gif" src="~/assets/img/help/help1.gif" />
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5 class="q-my-md">{{ _('Layers selector help') }}</h5>
                      <p>{{ _('Selecciona las capas de información que te interese visualizar: observaciones de mosquito, picaduras, lugares de cría, otras especies y esfuerzo de muestreo.') }} Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur velit alias quo laborum dignissimos aperiam provident qui, soluta culpa harum voluptas nulla quas blanditiis accusantium sunt aliquam iure itaque quasi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum similique, excepturi, modi inventore autem quasi quisquam veritatis, libero quaerat magnam ipsam explicabo incidunt dolor. Laborum earum adipisci beatae labore voluptatem. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur sint nam consequatur, voluptatibus veritatis quaerat facilis odit vero, unde laudantium cum molestias cumque aliquid suscipit odio, repellendus ipsa quibusdam pariatur eos animi. Doloribus numquam sint aut. Illo quis rem tempore, excepturi maiores, consequuntur inventore atque itaque beatae reprehenderit blanditiis quibusdam quisquam quod sint dolorum adipisci! A itaque ullam dolorem vero veniam consequuntur placeat nihil minima distinctio obcaecati iure, et voluptates doloribus eius sit nemo maxime modi? Debitis ut sapiente autem magnam? Molestias explicabo ad rerum maiores nobis deserunt numquam quae quidem consequatur, doloremque ducimus? Corrupti eligendi ipsam impedit eius amet.</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <q-carousel-slide name="pag_2" class="column no-wrap flex-center">
                <div class="pag_2 scroll q-pr-md">
                  <h5>{{ _('Filters help') }}</h5>
                  <div class="row q-mt-md q-pr-md text-left">
                    <div>
                    <!-- <div class="column-img col-xl-7 col-lg-7 col-md-7 q-px-md self-center"> -->
                      <img src="~/assets/img/help/help2.gif">
                    <!-- </div> -->
                    <!-- <div class="col-xl-5 col-lg-5 col-md-5 text-justify scroll"> -->
                      <p>{{ _('Filtra tu selección de distintas maneras:') }}</p>
                      <p><b>{{ _('POR LOCALIZACIÓN') }}</b>: {{ _('Escribe y selecciona del desplegable tu lugar de interés') }}</p>
                      <p><b>{{ _('POR HASHTAG') }}</b>: {{ _('puedes usar más de una etiqueta. Se mostrarán las observaciones que contengan como mínimo una de las etiquetas utilizadas.') }}</p>
                      <p><b>{{ _('POR IDENTIFICADOR') }}</b>{{ _(': escribe el identificador corto de un informe en el buscador de hashtag precedido por el símbolo :') }}</p>
                      <p>{{ _('Ejemplo > :6RUID. Puedes usar más de un identificador. Se mostrarán las observaciones que contengan como mínimo uno de los identificadores utilizados.') }}</p>
                      <p><b>{{ _('POR FECHA O RANGO DE FECHAS') }}</b>{{ _('Los filtros aplican a todas las capas de información de las observaciones (mosquitos, lugares de cría, picaduras, otras especies). La capa “esfuerzo de muestreo” sólo puede filtrarse por fecha o rango de fecha.') }}</p>
                      <hr/>
                      <p>{{ _('Los filtros son acumulativos, es decir, que actúan sobre el rango de datos previamente seleccionados. Por ejemplo, si filtramos mosquitos de la ciudad de Barcelona, y posteriormente buscamos un hashtag, el mapa nos devolverá solamente aquellas observaciones de la ciudad de Barcelona que tengan dicho hashtag.') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <q-carousel-slide name="pag_3" class="column no-wrap flex-center">
                <div class="pag_3 scroll q-pr-md">
                  <h5>{{ _('Download and reports help') }}</h5>
                  <div class="row q-mt-md q-pr-md text-left">
                    <div>
                      <img src="~/assets/img/help/help3.gif">
                      <p>{{ _('Descarga los datos seleccionados en la vista de tu mapa y genera informes html con los datos seleccionados en la vista de tu mapa.') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <q-carousel-slide name="pag_4" class="column no-wrap flex-center">
                <div class="pag_4 scroll q-pr-md">
                  <h5>{{ _('Graph help') }}</h5>
                  <div class="row q-mt-md q-pr-md text-left">
                    <div>
                      <img src="~/assets/img/help/help4.gif">
                      <p>{{ _('Consulta la información de la vista del mapa en formato de gráfico temporal') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <q-carousel-slide name="pag_5" class="column no-wrap flex-center">
                <div class="pag_5 scroll q-pr-md">
                  <h5>{{ _('Shareview help') }}</h5>
                  <div class="row q-mt-md q-pr-md text-left">
                    <div>
                      <img src="~/assets/img/help/help5.gif">
                      <p>{{ _('Comparte la vista del mapa, consulta la ayuda y la información del mapa y cambia el idioma del mapa') }}</p>
                    </div>
                  </div>
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
import { computed, ref, onUpdated } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['open', 'buttons'],
  emits: ['close'],
  setup (props) {
    const slide = ref('pag_1')
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

    onUpdated(() => {
      slide.value = 'pag_1'
    })

    return {
      layers,
      close,
      hasCloseButton,
      mobile,
      _,
      slide
    }
  }
}
</script>

<style scoped lang="scss">
.backdrop-modal-help {
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
  // max-width: 600px;
  // width: 80vw;
  height: 85vw;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
  padding: 0;
}
dialog.modal-help.mobile {
  margin:0;
}
:deep(.q-carousel__slide.column){
  padding: 0;
}
// dialog.mobile {
//   max-width: 80vw;
//   height: 90vh;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
//   background-color: white;
//   z-index: 2001;
//   border: none;
//   overflow:auto;
// }

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
  width: 100vw;
  height: 100vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 0px;
}

dialog.mobile button{
  padding: 5px 10px;
}
.mobile .q-carousel__slide img{
  // max-width: 100%;
  margin-bottom: 10px;
}

.q-carousel__slide img{
  // max-width: 50%;
  height: auto;
  float:left;
  // margin-right: 20px;
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
.q-carousel__slide div.scroll{
  height: 100%;
}
.modal-help :deep(.q-panel.scroll){
  overflow: hidden;
}
.pag_1{
  height: 100%;
  max-width: 450px;
  // max-height: 70vw;
  display:flex;
  flex-direction: column;
  align-items: stretch;
  position:relative;
}
.pag_1 div.img{
  // height: 100%;
  height: 450px;
  // max-height: 65%;
}
.pag_1 div.text{
  margin-top: 20px;
  height: calc(100% - 530px);
  padding-right: 20px;
  overflow: auto;
  position: relative;
}
.gif{
  // max-width: 100%;
  width: 450px;
}

.pag_1 h5{
  margin-top: 0px;
}
.mobile .pag_1{
  width: 100%;
}
dialog.mobile .pag_1 div.img{
  height: 50%;
  width: auto;
  object-fit:contain;
  margin: 0;
  margin-left:auto;
  margin-right:auto;
}
dialog.mobile .pag_1 div.img img{
  height: 100%;
  width: auto;
}
dialog.mobile .pag_1 div.text{
  margin-top: 20px;
  height: calc(50% - 70px);
  overflow: auto;
  position: relative;
}
</style>
