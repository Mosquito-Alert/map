<template>
  <q-footer v-if="$q.platform.is.desktop" class="bg-grey-8 text-grey-3" height-hint="45px" style="height: 45px;">
    <div class="row q-px-xs q-pb-xs">
      <!-- Funders -->
      <div class="col-4">
        <div class="column">
          <p class="col q-my-none text-weight-light" style="font-size: 0.6rem;">
            {{ $t('footer_collaborators_note') }}
          </p>
          <div class="row">
            <q-img v-for="(x, index) in funders" :key="index" class="col" height="30px" fit="scale-down"
              position="left center" :src="x.imgSrc">
              <a class='absolute-full all-pointer-events' :href="x.url" target="_blank" />
            </q-img>
          </div>
        </div>
      </div>
      <q-space />
      <!-- Collaborators -->
      <div class="col-3 row q-gutter-x-xs no-wrap">
        <div v-for="(x, index) in collaborators" :key="index" class="col">
          <div class="row no-wrap">
            <q-img height="45px" fit="scale-down" position="center center" :src="x.imgSrc">
              <a class='absolute-full all-pointer-events' :href="x.url" target="_blank" />
            </q-img>
            <q-separator v-if="index < collaborators.length - 1" vertical inset />
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<script lang="ts">

export default {

  setup() {
    const funders = [
      {
        url: "https://caixaresearch.org/es/convocatoria-caixaresearch-investigacion-salud-2019-proyecto-dengue-chikunguna-zika",
        imgSrc: '/img/fundacion_la_caixa.png' // From public folder
      }
    ]

    const collaborators = [
      {
        url: 'https://www.ceab.csic.es/',
        imgSrc: '/img/CSIC-CEAB.png'    // From public folder
      },
      {
        url: 'https://www.upf.edu/',
        imgSrc: '/img/UPF.png'    // From public folder
      },
      {
        url: 'https://www.creaf.cat/',
        imgSrc: '/img/CREAF.png'    // From public folder
      },
      {
        url: 'https://www.icrea.cat/',
        imgSrc: '/img/ICREA.png'    // From public folder
      },
    ]

    return {
      funders,
      collaborators
    }
  }
}
</script>
