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
                      {{ trans('Cookies policy') }}
                    </a>
                  </h5>
                  <h5 class="q-my-lg">
                     {{ trans('Información de los datos') }}
                  </h5>
                  <p>{{trans("El mapa contiene información de 5 especies de mosquitos vectores de enfermedades:")}} {{trans("el mosquito tigre")}} (<i>{{trans("Aedes albopictus")}}</i>), {{trans("el mosquito de la fiebre amarilla")}} (<i>{{trans("Aedes aegypti")}})</i>, {{trans("el mosquito del Japón")}} (<i>{{trans("Aedes japonicus")}}</i>), {{trans("el mosquito de Corea")}} (<i>{{trans("Aedes koreicus")}}</i>) {{trans("y el mosquito común")}} (<i>{{trans("Culex pipiens")}}</i>).</p>
                  <p>{{ trans('Además, puedes visualizar posibles lugares de cría de estos insectos en la vía pública. Esta información se complementa con modelos de probabilidad, elaborados a partir de los datos ciudadanos y con el esfuerzo de muestreo o distribución de participantes.') }}</p>
                  <q-separator size="1"/>
                  <div class="text-subtitle1 q-my-md">
                    {{ trans('DATOS NO MODELADOS') }}
                  </div>
                  <div class="text-subtitle2 text-left q-mb-md">
                    {{ trans("Mosquitos") }}
                  </div>
                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.tiger.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Tiger mosquito') }}</b>: {{ trans('según los expertos o los algoritmos de  Inteligencia Artificial (IA), las fotos de esta observación podrían ser de mosquito tigre')  }}(<i>Aedes albopictus</i>). {{ trans('También incluye observaciones que podrían ser o de') }} <i>Aedes albopictus</i> {{ trans('o de') }} <i>Aedes cretinus</i>; {{ trans('en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.yellow.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Yellow fever mosquito') }}</b>{{ trans(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito de la fiebre amarilla') }} (<i>Aedes aegypti</i>)
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.japonicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Mosquito del Japón') }}</b>{{ trans(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito del Japón') }} (<i>Aedes japonicus</i>). {{ trans('También incluye observaciones que podrían ser o de') }} <i>Aedes japonicus</i> {{ trans('o de') }} <i>Aedes koreicus</i>; {{ trans('en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.koreicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Mosquito del Corea') }}</b>: {{ trans('según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito de Corea') }} (<i>Aedes koreicus</i>){{ trans('También incluye observaciones que podrían ser o de') }} <i>Aedes japonicus</i> {{ trans('o de') }} <i>Aedes koreicus</i>; {{ trans('en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.culex.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Mosquito Común') }}</b>{{ trans(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito común') }} (<i>Culex pipiens</i>).
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.unidentified.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ trans('Otras categorías. Mosquito no identificable:') }}</b> {{ trans('según los expertos o los algoritmos de IA, estas observaciones y sus fotos no permiten determinar ninguna especie de mosquito en concreto. También incluye observaciones enviadas como “mosquito” que no han sido evaluadas al no contener imágenes asociadas.') }}
                      </div>
                  </div>
                  <q-separator size="1"/>
                  <div class="text-subtitle2 text-left q-mb-md">
                      {{ trans('Bites') }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.bites.bite.icon" />
                      </div>
                        <div class="q-pr-md">
                         {{ trans(' Observaciones ciudadanas de picaduras de mosquito, de cualquier especie y sin ningún tipo de validación por parte de expertos o de algoritmos de IA.') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ trans("Breeding sites") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.with_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ trans('Storm_drain_water') }}</b>{{ trans(': observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como “imbornales con agua”) en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.')}}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.without_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ trans("Storm_drain_dry") }}</b>: {{ trans('observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como “imbornales sin agua”), en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.')}}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.other_water.icon" />
                      </div>
                        <div class="q-pr-md">
                          <b> {{ trans("Unidentified mosquito") }}</b>{{ trans(': observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como “otros tipos de lugares de cría”), en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ trans("Other species") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.other.conflict.icon" />
                      </div>
                        <div class="q-pr-md">
                          {{ trans('Según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser de otras especies de mosquito') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ trans("Sampling effort") }}

                    </div>
                    <div class="flex text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img src="~/assets/img/sampling_effort.png" />
                      </div>
                        <div class="q-pr-md">
                          {{ trans('La capa muestra la distribución de los participantes, donde las cuadrículas más oscuras indican un mayor número de dispositivos con la app instalada o que han estado mucho tiempo en la zona. Este dato es esencial para poder elaborar modelos: sin esta información no se podría saber si hay muchos mosquitos en un área o si lo que hay es mucha participación. En ecología esta información se conoce como esfuerzo de muestreo, permitiendo corregir las observaciones para hacerlas comparables entre áreas.') }}
                        </div>
                    </div>
                    <q-separator size="1"/>
                    <!-- MODELS INFO -->
                    <a id="modeled_info" class="q-py-md"></a>
                    <p></p>
                    <div class="text-subtitle1 q-my-md">
                      {{ trans('MODELED DATA') }}
                    </div>
                    <p>{{ trans('Model-maps-provide-information-to-help-better-unde') }}</p>
                    <p>{{ trans('These-estimates-are-generated-monthly-for-each-of') }}</p>
                    <p>{{ trans('The-map-currently-shows-estimates-for-all-countrie') }}</p>
                    <p><a href="https://mosquito-alert.github.io/global_model_estimates/">https://mosquito-alert.github.io/global_model_estimates/</a></p>
                    <!--<p>{{ trans('Model maps show the probability of encountering a specific mosquito species or of receiving a mosquito bite. Probabilities are based on data submitted by citizens to Mosquito Alert. The first estimates for a month are based on observations received for that month in previous years, estimates that are updated weekly with data for the current year to readjust the values in real time.') }}</p>
                    <p>{{ trans('Models show the probability of encountering each of the target species: the tiger mosquito, the yellow fever mosquito, the Asian bush mosquito, the Korean mosquito, and the common house mosquito. Another model shows the probability of receiving a mosquito bite, which does not correspond to any specific mosquito species, but to all the reports of bites received, reflecting the human-mosquito interaction in the area.') }}</p>
                    <p>{{ trans('Estimates are displayed at different world’s administrative areas or boundaries depending on the zoom and the map view. Administrative areas in the database are countries and lower lever subdivisions such as provinces. At high resolution, estimates are displayed in grids of approximately 2x2 kilometers (grid of 0.05 degrees latitude by 0.05 degrees longitude). In addition to the probability of encountering a mosquito or receiving a bite, each administrative area also shows its uncertainty value.') }}</p>
                    <p>{{ trans('This calculation considers the sampling effort, considering the number of participants with the active app in each grid or area in the defined time. The probability of mosquitoes or of receiving a mosquito bite is higher in a grid in which 10 observations have been received and there are 5 participants, than in another with 10 observations and 10 participants. Modeling observations and active participants determines the value of the probability shown on the map.') }}</p>
                    <p>{{ trans('This probability has been observed to correspond to the observations of the tiger mosquito obtained by traditional surveillance methods (ovitraps), thus demonstrating that it is a good way of estimating the presence and abundance of a species.') }}</p>
                    <p class="capitalFirstLetter">{{ trans('for more information.')}}</p>
                    <a target="blank" href="https://www.nature.com/articles/s41467-017-00914-9">https://www.nature.com/articles/s41467-017-00914-9</a>-->
                    <q-separator size="1"/>
                    <!-- WMS INFO -->
                    <a id="wms_info" class="q-py-md"></a>
                    <p></p>
                    <div class="text-subtitle1 q-my-md">
                      {{ trans('Early Warning data') }}
                    </div>
                    <p v-html="trans('early_warning_description').replace(/\n/g, '<br>')"></p>
                </div>
              </q-carousel-slide>
            </q-carousel>

        <div class="close-info">
          <slot name="buttons"></slot>
          <button @click="close" v-if="hasCloseButton" class="ma-close-btn">{{ trans('Close') }}</button>
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
    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }
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
      trans,
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
