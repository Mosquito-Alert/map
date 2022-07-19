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
                <div class="pr-30 q-mt-md q-pr-md text-justify scroll">
                  <h5>
                    <a href="#" @click.stop="showModalCookiePolicy">
                      {{ _('Cookies policy') }}
                    </a>
                    </h5>
                  <h5>Información de los datos</h5>
                  <p>{{_("El mapa contiene información de 5 especies de mosquitos vectores de enfermedades:")}} {{_("el mosquito tigre")}} (<i>{{_("Aedes albopictus")}}</i>), {{_("el mosquito de la fiebre amarilla")}} (<i>{{_("Aedes aegypti")}})</i>, {{_("el mosquito del Japón")}} (<i>{{_("Aedes japonicus")}}</i>), {{_("el mosquito de Corea")}} (<i>{{_("Aedes koreicus")}}</i>) {{_("y el mosquito común")}} (<i>{{_("Culex pipiens")}}</i>).</p>
                  <p>{{ _('Además, puedes visualizar posibles lugares de cría de estos insectos en la vía pública. Esta información se complementa con modelos de probabilidad, elaborados a partir de los datos ciudadanos y con el esfuerzo de muestreo o distribución de participantes.') }}</p>
                  <HR/>
                  <div class="text-subtitle1 q-my-md">
                    {{ _('DATOS NO MODELADOS') }}
                  </div>
                  <div class="text-subtitle2 text-left q-mb-md">
                    {{ _("Mosquitos") }}
                  </div>
                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.tiger.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Tiger mosquito') }}</b>: {{ _('según los expertos o los algoritmos de Inteligencia Artificial (IA), las fotos de esta observación podrían ser de mosquito tigre (Aedes albopictus). También incluye observaciones que podrían ser o de Aedes albopictus o de Aedes cretinus; en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.yellow.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Mosquito de la fiebre amarilla') }}</b>{{ _(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito de la fiebre amarilla') }} (<i>Aedes aegypti</i>)
                      </div>
                    </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.japonicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Mosquito del Japón') }}</b>{{ _(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito del Japón') }} (<i>Aedes japonicus</i>). {{ _('También incluye observaciones que podrían ser o de Aedes japonicus o de Aedes koreicus; en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.koreicus.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Mosquito del Corea') }}</b>: {{ _('según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito de Corea') }} (<i>Aedes koreicus</i>){{ _('. También incluye observaciones que podrían ser o de Aedes japonicus o de Aedes koreicus; en estos casos, no es posible determinar con seguridad de qué especie se trata.') }}
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.culex.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Mosquito Común') }}</b>{{ _(': según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser del mosquito común') }} (<i>Culex pipiens</i>).
                      </div>
                  </div>

                  <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.observations.unidentified.icon" />
                      </div>
                      <div class="q-pr-md"><b>{{ _('Otras categorías. Mosquito no identificable:') }}</b>: {{ _('según los expertos o los algoritmos de IA, estas observaciones y sus fotos no permiten determinar ninguna especie de mosquito en concreto. También incluye observaciones enviadas como “mosquito” que no han sido evaluadas al no contener imágenes asociadas.') }}
                      </div>
                  </div>
                  <HR/>
                  <div class="text-subtitle2 text-left q-mb-md">
                      {{ _('Bites') }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.bites.pending.icon" />
                      </div>
                        <div class="q-pr-md">
                         {{ _(' Observaciones ciudadanas de picaduras de mosquito, de cualquier especie y sin ningún tipo de validación por parte de expertos o de algoritmos de IA.') }}
                        </div>
                    </div>
                  <HR/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ _("Breeding sites") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.with_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ _('Storm_drain_water') }}</b>{{ (': observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como imbornales con agua) en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.') }}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.without_water.icon" />
                      </div>
                        <div class="q-pr-md"><b>{{ _("Storm_drain_dry") }}</b>: {{ _('observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como “imbornales sin agua”), en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.')}}
                        </div>
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.breeding.other_water.icon" />
                      </div>
                        <div class="q-pr-md">
                          <b> {{ _("Unidentified mosquito") }}</b>{{ _(': observaciones ciudadanas de posibles lugares de cría de mosquitos (identificadas por la ciudadanía como “otros tipos de lugares de cría”), en su mayoría, sin ningún tipo de validación por parte de expertos o de algoritmos de IA.') }}
                        </div>
                    </div>
                    <HR/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ _("Other species") }}
                    </div>
                    <div class="text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img :src="layers.other.conflict.icon" />
                      </div>
                        <div class="q-pr-md">
                          {{ _('Según los expertos o los algoritmos de IA, las fotos de esta observación podrían ser de otras especies de mosquito') }}
                        </div>
                    </div>
                    <HR/>
                    <div class="text-subtitle2 text-left q-mb-md">
                      {{ _("Sampling effort") }}

                    </div>
                    <div class="flex text-justify q-mb-md row no-wrap">
                      <div class="help-icon q-pr-md">
                        <img src="~/assets/img/sampling_effort.png" />
                      </div>
                        <div class="q-pr-md">
                          {{ _('La capa muestra la distribución de los participantes, donde las cuadrículas más oscuras indican un mayor número de dispositivos con la app instalada o que han estado mucho tiempo en la zona. Este dato es esencial para poder elaborar modelos: sin esta información no se podría saber si hay muchos mosquitos en un área o si lo que hay es mucha participación. En ecología esta información se conoce como esfuerzo de muestreo, permitiendo corregir las observaciones para hacerlas comparables entre áreas.') }}
                        </div>
                    </div>
                </div>
              </q-carousel-slide>
            </q-carousel>

        <div class="close-info">
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
      $store.commit('app/setModal', { id: 'info', content: { visibility: false } })
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
      _,
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
  border: 1px solid #cccccc88;
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

</style>
