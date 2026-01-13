<!--
  MODAL WINDOW TO SHOW APP INFO
-->

<template>
  <transition name="backdrop">
    <div class="backdrop-modal-info" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog help" v-if="open">
    <!-- <div class="dialog" v-if="open" @click="close"> -->
      <dialog open class="modal-info q-pa-xl" :class="mobile?'mobile q-pa-xs':''">
        <slot></slot>
          <q-carousel
           v-model="slide"
            height="100%"
            padding
            class="scroll rounded-borders">
              <q-carousel-slide
                name="pag_1"
                class="column no-wrap flex-center"
              >
                <div class="q-mt-md q-pr-md text-justify scroll">
                  <h5 class="q-my-lg">
                    <a href="#" @click.prevent="showModalCookiePolicy">
                      {{ $t('cookies_policy') }}
                    </a>
                  </h5>
                  <h5 class="q-my-lg">
                     {{ $t('informacion_de_los_datos') }}
                  </h5>
                  <p>{{$t("el_mapa_contiene_informacion_de_5_especies_de_mosquitos_vectores_de_enfermedades")}} {{$t("el_mosquito_tigre")}} (<i>Aedes albopictus</i>), {{$t("el_mosquito_de_la_fiebre_amarilla")}} (<i>Aedes aegypti</i>, {{$t("el_mosquito_del_japon")}} (<i>Aedes japonicus</i>), {{$t("el_mosquito_de_corea")}} (<i>Aedes koreicus</i>) {{$t("y_el_mosquito_comun")}} (<i>Culex pipiens</i>).</p>
                  <p>{{ $t('ademas_puedes_visualizar_posibles_lugares_de_cria_de_estos_insectos_en_la_via_publica_esta_informacion_se_complementa_con_modelos_de_probabilidad_elaborados_a_partir_de_los_datos_ciudadanos_y_con_el_esfuerzo_de_muestreo_o_distribucion_de_participantes') }}</p>
                  <q-separator size="1"/>
                  <div class="text-subtitle1 q-my-md">
                    {{ $t('datos_no_modelados') }}
                  </div>
                  <div class="text-subtitle2 text-left q-mb-md">
                    {{ $t("mosquitos") }}
                  </div>
                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.tiger.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('tiger_mosquito') }}</b>: {{ $t('segun_los_expertos_o_los_algoritmos_de_inteligencia_artificial_ia_las_fotos_de_esta_observacion_podrian_ser_de_mosquito_tigre')  }}(<i>Aedes albopictus</i>). {{ $t('tambien_incluye_observaciones_que_podrian_ser_o_de') }} <i>Aedes albopictus</i> {{ $t('o_de') }} <i>Aedes cretinus</i>; {{ $t('en_estos_casos_no_es_posible_determinar_con_seguridad_de_que_especie_se_trata') }}
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.yellow.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('yellow_fever_mosquito') }}</b>{{ $t('segun_los_expertos_o_los_algoritmos_de_ia_las_fotos_de_esta_observacion_podrian_ser_del_mosquito_de_la_fiebre_amarilla') }} (<i>Aedes aegypti</i>)
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.japonicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('mosquito_del_japon') }}</b>{{ $t('segun_los_expertos_o_los_algoritmos_de_ia_las_fotos_de_esta_observacion_podrian_ser_del_mosquito_del_japon') }} (<i>Aedes japonicus</i>). {{ $t('tambien_incluye_observaciones_que_podrian_ser_o_de') }} <i>Aedes japonicus</i> {{ $t('o_de') }} <i>Aedes koreicus</i>; {{ $t('en_estos_casos_no_es_posible_determinar_con_seguridad_de_que_especie_se_trata') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.koreicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('mosquito_del_corea') }}</b>: {{ $t('segun_los_expertos_o_los_algoritmos_de_ia_las_fotos_de_esta_observacion_podrian_ser_del_mosquito_de_corea') }} (<i>Aedes koreicus</i>){{ $t('tambien_incluye_observaciones_que_podrian_ser_o_de') }} <i>Aedes japonicus</i> {{ $t('o_de') }} <i>Aedes koreicus</i>; {{ $t('en_estos_casos_no_es_posible_determinar_con_seguridad_de_que_especie_se_trata') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.culex.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('mosquito_comun') }}</b>{{ $t('segun_los_expertos_o_los_algoritmos_de_ia_las_fotos_de_esta_observacion_podrian_ser_del_mosquito_comun') }} (<i>Culex pipiens</i>).
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.unidentified.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ $t('otras_categorias_mosquito_no_identificable') }}</b> {{ $t('segun_los_expertos_o_los_algoritmos_de_ia_estas_observaciones_y_sus_fotos_no_permiten_determinar_ninguna_especie_de_mosquito_en_concreto_tambien_incluye_observaciones_enviadas_como_mosquito_que_no_han_sido_evaluadas_al_no_contener_imagenes_asociadas') }}
                      </div>
                  </div>
                  <q-separator size="1"/>
                  <div class="text-subtitle2 text-left q-mb-md">
                      {{ $t('bites') }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.bites.bite.icon" />
                      </div>
                        <div class="q-pr-md">
                         {{ $t('observaciones_ciudadanas_de_picaduras_de_mosquito_de_cualquier_especie_y_sin_ningun_tipo_de_validacion_por_parte_de_expertos_o_de_algoritmos_de_ia') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ $t("breeding_sites") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.with_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ $t('storm_drain_water') }}</b>{{ $t('observaciones_ciudadanas_de_posibles_lugares_de_cria_de_mosquitos_identificadas_por_la_ciudadania_como_imbornales_con_agua_en_su_mayoria_sin_ningun_tipo_de_validacion_por_parte_de_expertos_o_de_algoritmos_de_ia')}}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.without_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ $t("storm_drain_dry") }}</b>: {{ $t('observaciones_ciudadanas_de_posibles_lugares_de_cria_de_mosquitos_identificadas_por_la_ciudadania_como_imbornales_con_agua_en_su_mayoria_sin_ningun_tipo_de_validacion_por_parte_de_expertos_o_de_algoritmos_de_ia')}}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.other_water.icon" />
                      </div>
                        <div class="q-pr-md">
                          <b> {{ $t("unidentified_mosquito") }}</b>{{ $t('observaciones_ciudadanas_de_posibles_lugares_de_cria_de_mosquitos_identificadas_por_la_ciudadania_como_otros_tipos_de_lugares_de_cria_en_su_mayoria_sin_ningun_tipo_de_validacion_por_parte_de_expertos_o_de_algoritmos_de_ia') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ $t("other_species") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.other.conflict.icon" />
                      </div>
                        <div class="q-pr-md">
                          {{ $t('segun_los_expertos_o_los_algoritmos_de_ia_las_fotos_de_esta_observacion_podrian_ser_de_otras_especies_de_mosquito') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ $t("sampling_effort") }}

                    </div>
                    <div class="flex text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img src="~/assets/img/sampling_effort.png" />
                      </div>
                        <div class="q-pr-md">
                          {{ $t('la_capa_muestra_la_distribucion_de_los_participantes_donde_las_cuadriculas_mas_oscuras_indican_un_mayor_numero_de_dispositivos_con_la_app_instalada_o_que_han_estado_mucho_tiempo_en_la_zona_este_dato_es_esencial_para_poder_elaborar_modelos_sin_esta_informacion_no_se_podria_saber_si_hay_muchos_mosquitos_en_un_area_o_si_lo_que_hay_es_mucha_participacion_en_ecologia_esta_informacion_se_conoce_como_esfuerzo_de_muestreo_permitiendo_corregir_las_observaciones_para_hacerlas_comparables_entre_areas') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <!-- MODELS INFO -->
                    <a id="modeled_info" class="q-py-md"></a>
                    <p></p>
                    <div class="text-subtitle1 q-my-md">
                      {{ $t('modeled_data') }}
                    </div>
                    <p>{{ $t('model_maps_provide_information_to_help_better_unde') }}</p>
                    <p>{{ $t('these_estimates_are_generated_monthly_for_each_of') }}</p>
                    <p>{{ $t('the_map_currently_shows_estimates_for_all_countrie') }}</p>
                    <p><a href="https://mosquito-alert.github.io/global_model_estimates/">https://mosquito-alert.github.io/global_model_estimates/</a></p>
                    <!--<p>{{ $t('model_maps_show_the_probability_of_encountering_a_specific_mosquito_species_or_of_receiving_a_mosquito_bite_probabilities_are_based_on_data_submitted_by_citizens_to_mosquito_alert_the_first_estimates_for_a_month_are_based_on_observations_received_for_that_month_in_previous_years_estimates_that_are_updated_weekly_with_data_for_the_current_year_to_readjust_the_values_in_real_time') }}</p>
                    <p>{{ $t('models_show_the_probability_of_encountering_each_of_the_target_species_the_tiger_mosquito_the_yellow_fever_mosquito_the_asian_bush_mosquito_the_korean_mosquito_and_the_common_house_mosquito_another_model_shows_the_probability_of_receiving_a_mosquito_bite_which_does_not_correspond_to_any_specific_mosquito_species_but_to_all_the_reports_of_bites_received_reflecting_the_human_mosquito_interaction_in_the_area') }}</p>
                    <p>{{ $t('estimates_are_displayed_at_different_world_s_administrative_areas_or_boundaries_depending_on_the_zoom_and_the_map_view_administrative_areas_in_the_database_are_countries_and_lower_lever_subdivisions_such_as_provinces_at_high_resolution_estimates_are_displayed_in_grids_of_approximately_2x2_kilometers_grid_of_0_05_degrees_latitude_by_0_05_degrees_longitude_in_addition_to_the_probability_of_encountering_a_mosquito_or_receiving_a_bite_each_administrative_area_also_shows_its_uncertainty_value') }}</p>
                    <p>{{ $t('This calculation considers the sampling_effort, considering the number of participants with the active app in each grid or area in the defined time. The probability of mosquitoes or of receiving a mosquito bite is higher in a grid in which 10 observations have been received and there are 5 participants, than in another with 10 observations and 10 participants. Modeling observations and active participants determines the value of the probability shown on the map.') }}</p>
                    <p>{{ $t('this_probability_has_been_observed_to_correspond_to_the_observations_of_the_tiger_mosquito_obtained_by_traditional_surveillance_methods_ovitraps_thus_demonstrating_that_it_is_a_good_way_of_estimating_the_presence_and_abundance_of_a_species') }}</p>
                    <p class="capitalFirstLetter">{{ $t('for_more_information')}}</p>
                    <a target="blank" href="https://www.nature.com/articles/s41467-017-00914-9">https://www.nature.com/articles/s41467-017-00914-9</a>-->
                    <q-separator size="1"/>
                    <!-- WMS INFO -->
                    <a id="wms_info" class="q-py-md"></a>
                    <p></p>
                    <div class="text-subtitle1 q-my-md">
                      {{ $t('discoveries_data') }}
                    </div>
                    <p v-html="$t('discoveries_description').replace(/\\n/g, '<br>')"></p>
                </div>
              </q-carousel-slide>
            </q-carousel>

        <div class="close-info">
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
import { scroll } from 'quasar'

export default {
  props: ['open', 'buttons'],
  emits: ['close'],
  setup (props) {
    const $store = useStore()
    onUpdated(() => {
      const modal = $store.getters['app/getModals'].info
      const { getScrollTarget, setVerticalScrollPosition } = scroll
      const el = document.getElementById(modal.anchor)
      if (el) {
        const target = getScrollTarget(el)
        const offset = el.offsetTop
        const duration = 1000
        setVerticalScrollPosition(target, offset, duration)
      }
    })
    const close = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: false } })
    }
    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })
    const hasCloseButton = computed(() => {
      return props.buttons.split(',').includes('close')
    })

    const showModalCookiePolicy = function () {
      close()
      $store.commit('app/setModal', { id: 'cookiePolicy', content: { visibility: true } })
    }
    const layers = $store.getters['app/getLayers']
    return {
      layers,
      showModalCookiePolicy,
      close,
      hasCloseButton,
      mobile,
      slide: ref('pag_1')
    }
  }
}
</script>

<style scoped lang="scss">
.backdrop-modal-info {
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

.dialog {
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
  max-width: 60vw;
  height: 70vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
  position:relative;
}

dialog.mobile {
  max-width: 90vw;
  height: 90%;
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

// MOBILE
dialog.mobile {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem 1rem 1rem 1rem;
}

dialog.mobile .q-carousel__slide.column.no-wrap.flex-center{
  padding: 4px 4px 60px 4px;
}
dialog.mobile button{
  padding: 5px 10px;
}
.q-carousel__slide img{
  width: 100%;
  height: auto;
}
hr{
  margin-bottom: 10px;
}
.help-icon img{
  // height: 30px;
  width: 30px;
}
.sampling-effort i {
  background-color: #e3d6a2;
  color: #6a6b59;
  opacity: 1;
  font-size: 30px;
  border-radius: 50%;
}
.modal-info{
  padding-bottom: 80px;
}
.modal-info .text-subtitle1{
  font-weight: 600;
}
.modal-info .pr-30{
  padding-right: 30px;
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
  margin-bottom: 10px;
}
button.ma-close-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}

.close-info{
  position: absolute;
  bottom: 10px;
  right: 0;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
}

.capitalFirstLetter:first-letter {
    text-transform: uppercase;
}
.info-logos{
  background: #333;
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

</style>
