<template>

  <q-drawer show-if-above v-model='drawerVisible' :width="78">
    <q-toolbar class="column fit q-pa-none bg-grey-3 text-black">

      <q-img img-class='q-pa-sm' fit="contain" :ratio="1" src="/img/mosquito_alert_squared_logo.png">
        <a class='absolute-full all-pointer-events' href="/" />
      </q-img>

      <q-tabs vertical switch-indicator shrink stretch outside-arrows active-color="primary">
        <q-route-tab icon="fa fa-thin fa-map-location-dot" active-class="bg-white" :to="{ 'name': 'reports' }">
          <q-tooltip anchor="center right" self="center left" class="text-capitalize">
            {{ $t('reports') }}
          </q-tooltip>
        </q-route-tab>
        <q-route-tab icon="fa fat fa-radar" active-class="bg-white" :to="{ 'name': 'discoveries' }">
          <q-tooltip anchor="center right" self="center left" class="text-capitalize">
            {{ $t('discoveries') }}
          </q-tooltip>
        </q-route-tab>
        <q-route-tab icon="fa fat fa-chart-mixed" active-class="bg-white" :to="{ 'name': 'models' }">
          <q-tooltip anchor="center right" self="center left" class="text-capitalize">
            {{ $t('exposure_risk') }}
          </q-tooltip>
        </q-route-tab>
      </q-tabs>

      <q-space />

      <q-btn-group stretch flat square class='column q-gutter-y-xs'>
        <q-separator color="grey-4" />
        <ShareButton />
        <q-separator inset color="grey-4" />
        <LanguageSwitcher />

      </q-btn-group>
    </q-toolbar>
  </q-drawer>

  <q-btn v-if="!drawerVisible" round color="primary" class="absolute-top-left q-ma-sm" icon="fa fal fa-bars" size="md"
    style="z-index: 1" @click="drawerVisible = true" />

</template>

<script lang="ts">

import { ref } from 'vue'
import { useQuasar } from 'quasar'

import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'
import ShareButton from 'src/components/ShareButton.vue'

export default {
  components: {
    LanguageSwitcher,
    ShareButton
  },
  setup() {

    const $q = useQuasar()

    const drawerVisible = ref(!$q.platform.is.mobile)

    return {
      drawerVisible,
    }
  }
}

</script>

<style lang="scss">
.q-tab {
  border-bottom: 0.5px solid $grey-4;
}

.q-tab:first-child {
  border-top: 0.5px solid $grey-4;
}
</style>
