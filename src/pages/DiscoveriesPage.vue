<template>
  <inner-drawer :title="$t('discoveries')">
    <q-select label="Select species" :label-color="selectedSpeciesCode ? 'primary' : 'rgba(0, 0, 0, 0.6)'"
      :options="vectorOptions" option-value="code" option-label="label" color="primary" emit-value map-options
      v-model="selectedSpeciesCode" />
    <!-- LAYER CONTROLS -->
    <div v-show="selectedSpeciesCode" class="q-mt-xl">
      <div class="row">
        <span class="text-weight-light text-uppercase text-grey-7">Layer Controls</span>
        <q-space />
        <q-btn-group flat stretch class="bg-grey-1">
          <q-btn icon="fa fat fa-info" size="xs" />
          <q-btn icon="fa fat fa-download" size="xs" />
        </q-btn-group>
      </div>
      <div class="row bg-grey-3 rounded-borders q-pa-sm">
        <div class="col-9">
          <q-badge :outline="!visibleLayer" color="primary" label="Opacity" />
          <q-slider v-model="opacityLayer" :min="0" :max="1" :step="0.05" color="primaray" label />
        </div>
        <q-toggle v-model="visibleLayer" class="col" checked-icon="check" color="primaray" size="lg" />
      </div>
    </div>
  </inner-drawer>
  <!-- MAP LAYER -->
  <DiscoveriesMapLayer v-if="selectedSpeciesCode" :species-code="selectedSpeciesCode" :visible="visibleLayer"
    :opacity="opacityLayer" />
</template>

<script lang="ts">

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import InnerDrawer from 'src/components/InnerDrawer.vue'
import DiscoveriesMapLayer from 'src/components/DiscoveriesMapLayer.vue'

export default {
  name: 'DiscoveriesPage',
  components: {
    InnerDrawer,
    DiscoveriesMapLayer
  },
  props: {
    speciesCode: {
      type: String
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()

    const selectedSpeciesCode = ref(props.speciesCode)
    const vectorOptions = computed(() => {
      return [
        // Code is the MVT property
        { code: 'albopictus', label: 'Tiger mosquito' },
        { code: 'aegypti', label: 'Yellow fever mosquito' },
        { code: 'japonicus', label: 'Japonicus mosquito' },
        { code: 'koreicus', label: 'Koreicus mosquito' }
      ]
    })

    const visibleLayer = ref(true)
    const opacityLayer = ref(1)

    watch(selectedSpeciesCode, async (newValue,) => {
      await router.push({
        name: route.name!,
        params: {
          ...route.params,
          speciesCode: newValue
        }
      })
    })

    return {
      selectedSpeciesCode,
      vectorOptions,
      visibleLayer,
      opacityLayer
    }
  }
}
</script>
