<template>
  <inner-drawer :title="$t('discoveries')">
    <q-select :label="$t('select_species')" :label-color="selectedSpeciesCode ? 'primary' : 'rgba(0, 0, 0, 0.6)'"
      :options="vectorOptions" option-value="code" option-label="label" color="primary" emit-value map-options
      v-model="selectedSpeciesCode" />
    <!-- LAYER CONTROLS -->
    <div v-show="selectedSpeciesCode" class="q-mt-xl">
      <div class="row">
        <span class="text-weight-light text-uppercase text-grey-7">{{ $t('layer_controls') }}</span>
        <q-space />
        <q-btn-group flat stretch class="bg-grey-1">
          <q-btn icon="fa fat fa-info" size="xs" @click="showInfoDialog()" />
          <q-btn :loading="downloadProgress.loading" :percentage="downloadProgress.percentage" icon="fa fat fa-download"
            size="xs" @click="downloadFile()" />
        </q-btn-group>
      </div>
      <div class="row bg-grey-3 rounded-borders q-pa-sm">
        <div class="col-9">
          <q-badge :outline="!visibleLayer" color="primary" :label="$t('opacity')" />
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

<script setup lang="ts">
import { useQuasar, exportFile } from 'quasar'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouteParams } from '@vueuse/router';
import { useI18n } from 'vue-i18n'

import { useMapUiStore } from 'src/stores/mapUI';
import { mapserver } from 'boot/axios'

import InnerDrawer from 'src/components/InnerDrawer.vue'
import DiscoveriesMapLayer from 'src/components/DiscoveriesMapLayer.vue'

const selectedSpeciesCode = useRouteParams('speciesCode', '', { transform: String })

const $q = useQuasar()
const { t } = useI18n()

const mapUi = useMapUiStore();

const downloadProgress = ref({
  loading: false,
  percentage: 0
})

const vectorOptions = computed(() => {
  return [
    // Code is the MVT property
    { code: 'albopictus', label: t('tiger_mosquito') },
    { code: 'aegypti', label: t('yellow_fever_mosquito') },
    { code: 'japonicus', label: t('asian_bush_mosquito') },
    { code: 'koreicus', label: t('korean_mosquito') }
  ]
})

const visibleLayer = ref(true)
const opacityLayer = ref(1)

onMounted(() => {
  mapUi.setGrayscale(true);
})

onUnmounted(() => {
  mapUi.setGrayscale(false);
})

function showInfoDialog() {
  $q.dialog({
    title: t('information'),
    message: t('discoveries_layer_info').replace(/\\n/g, '<br>'),
    html: true,
    style: 'width: min(100%, 800px);',
  })
}

async function downloadFile() {
  downloadProgress.value.loading = true;
  downloadProgress.value.percentage = 0;

  const params = {
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: 'mosquitoalert:discoveries',
    outputFormat: 'SHAPE-ZIP',
    cql_filter: `${selectedSpeciesCode.value} IS NOT NULL`,
    propertyName: `fid,geom,cntryCode,cntryName,codeLevel,locCode,locName,${selectedSpeciesCode.value}`
  };

  try {
    const response = await mapserver.get('ows', {
      params,
      responseType: 'blob',
      onDownloadProgress: (event) => {
        if (event.total) {
          downloadProgress.value.percentage = Math.round((event.loaded * 100) / event.total);
        }
      }
    });
    exportFile(`discoveries_${selectedSpeciesCode.value}.zip`, response.data, { mimeType: 'application/zip' });
    downloadProgress.value.percentage = 100
  } finally {
    downloadProgress.value.loading = false;
    downloadProgress.value.percentage = 0;
  }
}
</script>
