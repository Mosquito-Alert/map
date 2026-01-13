<!--
  MODAL WINDOW TO SHOW APP HELP AS A QUASAR CAROUSEL
-->

<template>
  <transition name="backdrop">
    <div class="backdrop-modal-help" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog modal-help" v-if="open">
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
            prev-icon="navigate_before"
            next-icon="navigate_next"
            navigation
            control-type="flat"
            control-color="grey"
            padding
            :arrows="!mobile"
            class="rounded-borders">
              <!-- TAB 1 -->
              <q-carousel-slide name="pag_1" class="column no-wrap">
                <div class="page pag_1">
                  <div class="img">
                    <img class="gif" :src="videos[0]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5 class="q-my-md">{{ $t('layers_selector_help') }}</h5>
                      <p>{{ $t('selecciona_las_capas_de_informacion_que_te_interese_visualizar_observaciones_de_mosquito_picaduras_lugares_de_cria_otras_especies_y_esfuerzo_de_muestreo') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <!-- TAB 2 -->
              <q-carousel-slide name="pag_2" class="column no-wrap">
                <div class="page pag_2">
                  <div class="img">
                    <img class="gif" :src="videos[1]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5 class="q-my-md">{{ $t('filters_help') }}</h5>
                      <p>{{ $t('filtra_tu_seleccion_de_distintas_maneras') }}</p>
                      <p><b>{{ $t('por_localizacion') }}</b>: {{ $t('escribe_y_selecciona_del_desplegable_tu_lugar_de_interes') }}</p>
                      <p><b>{{ $t('por_hashtag') }}</b>: {{ $t('puedes_usar_mas_de_una_etiqueta_se_mostraran_las_observaciones_que_contengan_como_minimo_una_de_las_etiquetas_utilizadas') }}</p>
                      <p><b>{{ $t('por_identificador') }}</b>{{ $t('escribe_el_identificador_corto_de_un_informe_en_el_buscador_de_hashtag_precedido_por_el_simbolo') }}</p>
                      <p>{{ $t('ejemplo_6ruid_puedes_usar_mas_de_un_identificador_se_mostraran_las_observaciones_que_contengan_como_minimo_uno_de_los_identificadores_utilizados') }}</p>
                      <p><b>{{ $t('por_fecha_o_rango_de_fechas') }}</b>{{ $t('los_filtros_aplican_a_todas_las_capas_de_informacion_de_las_observaciones_mosquitos_lugares_de_cria_picaduras_otras_especies_la_capa_esfuerzo_de_muestreo_solo_puede_filtrarse_por_fecha_o_rango_de_fecha') }}</p>
                      <q-separator size="1"/>
                      <p>{{ $t('los_filtros_son_acumulativos_es_decir_que_actuan_sobre_el_rango_de_datos_previamente_seleccionados_por_ejemplo_si_filtramos_mosquitos_de_la_ciudad_de_barcelona_y_posteriormente_buscamos_un_hashtag_el_mapa_nos_devolvera_solamente_aquellas_observaciones_de_la_ciudad_de_barcelona_que_tengan_dicho_hashtag') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <!-- TAB 3 -->
              <q-carousel-slide name="pag_3" class="column no-wrap">
                <div class="page pag_3">
                  <div class="img">
                    <img class="gif" :src="videos[2]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5>{{ $t('download_and_reports_help') }}</h5>
                      <p>{{ $t('descarga_los_datos_seleccionados_en_la_vista_de_tu_mapa_y_genera_informes_html_con_los_datos_seleccionados_en_la_vista_de_tu_mapa') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <!-- TAB 4 -->
              <q-carousel-slide name="pag_4" class="column no-wrap">
                <div class="page pag_4">
                  <div class="img">
                    <img class="gif" :src="videos[3]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5>{{ $t('graph_help') }}</h5>
                      <p>{{ $t('consulta_la_informacion_de_la_vista_del_mapa_en_formato_de_grafico_temporal') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <!-- TAB 5 -->
              <q-carousel-slide name="pag_5" class="column no-wrap">
                <div class="page pag_5">
                  <div class="img">
                    <img class="gif" :src="videos[4]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5>{{ $t('shareview_help') }}</h5>
                      <p>{{ $t('comparte_la_vista_del_mapa_consulta_la_ayuda_y_la_informacion_del_mapa_y_cambia_el_idioma_del_mapa') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>

              <!-- TAB 6 -->
              <q-carousel-slide name="pag_6" class="column no-wrap">
                <div class="page pag_6">
                  <div class="img">
                    <img class="gif" :src="videos[5]" draggable="false"/>
                  </div>
                  <div class="q-ml-lg text">
                    <div>
                      <h5>{{ $t('estimates_help') }}</h5>
                      <p>{{ $t('consulta_el_grado_de_probabilidad_e_incertidumbre_de_encontrar_una_especie_de_mosquito_concreta_selecciona_la_especie_que_quieras_consultar_y_el_rango_temporal') }}</p>
                    </div>
                  </div>
                </div>
              </q-carousel-slide>
            </q-carousel>
        <div class="close-modal text-center">
          <slot name="buttons"></slot>
          <button @click="close" v-if="hasCloseButton" class="ma-close-btn">{{ $t('close') }}</button>
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
    // Define video location files for each lang
    const videosHelp = {
      ca: [
        require('../assets/img/help/help1_ca.gif'),
        require('../assets/img/help/help2_ca.gif'),
        require('../assets/img/help/help3_ca.gif'),
        require('../assets/img/help/help4_ca.gif'),
        require('../assets/img/help/help5_ca.gif'),
        require('../assets/img/help/help6_ca.gif')
      ],
      es: [
        require('../assets/img/help/help1_es.gif'),
        require('../assets/img/help/help2_es.gif'),
        require('../assets/img/help/help3_es.gif'),
        require('../assets/img/help/help4_es.gif'),
        require('../assets/img/help/help5_es.gif'),
        require('../assets/img/help/help6_es.gif')
      ],
      en: [
        require('../assets/img/help/help1_en.gif'),
        require('../assets/img/help/help2_en.gif'),
        require('../assets/img/help/help3_en.gif'),
        require('../assets/img/help/help4_en.gif'),
        require('../assets/img/help/help5_en.gif'),
        require('../assets/img/help/help6_en.gif')
      ]
    }

    const $store = useStore()
    const videos = computed(() => {
      const lang = $store.getters['app/getLang']
      if (lang === 'ca') {
        return videosHelp.ca
      } else if (lang === 'es') {
        return videosHelp.es
      } else {
        return videosHelp.en
      }
    })

    const slide = ref('pag_2')
    const close = function () {
      $store.commit('app/setModal', { id: 'help', content: { visibility: false } })
    }
    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })
    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }
    const layers = $store.getters['app/getLayers']

    onUpdated(() => {
      slide.value = 'pag_1'
    })

    return {
      videos,
      layers,
      close,
      hasCloseButton,
      mobile,
      trans,
      slide
    }
  }
}
</script>

<style scoped lang="scss">
hr{
  margin-bottom: 10px;
}
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
:deep(.q-btn){
  background-color: white;
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
.page{
  height: 100%;
  max-width: 450px;
  // max-height: 70vw;
  display:flex;
  flex-direction: column;
  align-items: stretch;
  position:relative;
}
.page div.img{
  // height: 100%;
  height: 450px;
  // max-height: 65%;
}
.page div.text{
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

.page h5{
  margin-top: 0px;
}
.mobile .page{
  width: 100%;
}
dialog.mobile .page div.img{
  height: 50%;
  width: auto;
  object-fit:contain;
  margin: 0;
  margin-left:auto;
  margin-right:auto;
}
dialog.mobile .page div.img img{
  height: 100%;
  width: auto;
}
dialog.mobile .page div.text{
  margin-top: 20px;
  height: calc(50% - 70px);
  overflow: auto;
  position: relative;
}
dialog.modal-help :deep(.q-carousel__arrow button span i) {
  font-size: 38px;
}
dialog.modal-help :deep(button.q-carousel__navigation-icon--active span i) {
  color: $primary-color;
  font-size: 1.5em;
}
dialog.modal-help :deep(.q-carousel__control) {
  align-items:end;
}
</style>
