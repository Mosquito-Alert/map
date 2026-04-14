<template>
  <aside
    class="fixed top-0 left-0 flex flex-col z-100 md:max-h-[calc(100vh-2rem)] md:w-[30%] md:pl-4 md:mt-4 mx-auto"
  >
    <!-- <Summary /> -->
    <HeaderDrawer />
    <SelectButton
      v-model="uiStore.activeTab"
      :options="options"
      optionLabel="label"
      optionValue="value"
      fluid
      class="mb-1"
    >
      <template #option="slotProps">
        <div class="flex items-center justify-center">
          <span
            class="mr-2"
            :class="[
              'material-icons-outlined text-xl!',
              uiStore.activeTab === slotProps.option.value ? activeTabClass : inactiveTabClass,
            ]"
          >
            {{ slotProps.option.icon }}
          </span>
          <span
            :class="[
              uiStore.activeTab === slotProps.option.value ? activeTabClass : inactiveTabClass,
            ]"
          >
            {{ slotProps.option.label }}
          </span>
        </div>
      </template>
    </SelectButton>
    <ExploreDrawer class="overflow-y-auto flex-1 mb-0 p-0" v-if="uiStore.activeTab === 'explore'" />
    <AnalizeDrawer class="overflow-y-auto flex-1 mb-0 p-0" v-if="uiStore.activeTab === 'analize'" />
  </aside>
</template>
<script lang="ts" setup>
import { SelectButton } from 'primevue'
import { onMounted, ref, watch } from 'vue'
import ExploreDrawer from './ExploreDrawer/ExploreDrawer.vue'
import AnalizeDrawer from './AnalizeDrawer/AnalizeDrawer.vue'
import { drawerTabs, useUIStore } from '../../stores/uiStore'
import HeaderDrawer from './HeaderDrawer.vue'
import { useTaxaStore } from '../../stores/taxaStore'
import { useObservationsStore } from '../../stores/observationsStore'

const taxaStore = useTaxaStore()
const observationsStore = useObservationsStore()
const uiStore = useUIStore()

const activeTabClass = 'text-gray-700 font-semibold'
const inactiveTabClass = 'text-gray-400'

const options = Object.values(drawerTabs)

// Record drawer width in the store to adjust map padding
onMounted(() => {
  uiStore.drawerWidth = document.querySelector('aside')?.clientWidth || 0
})
window.addEventListener('resize', () => {
  uiStore.drawerWidth = document.querySelector('aside')?.clientWidth || 0
})

watch(
  () => uiStore.activeTab,
  () => {
    taxaStore.resetSelectedTaxon()
    observationsStore.resetDateFilter()
  },
)
</script>
