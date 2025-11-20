<template>
  <aside
    class="fixed top-0 left-0 flex flex-col z-100 h-[calc(100vh-2rem)] sm:w-[30%] mx-auto px-4 my-4"
  >
    <Summary />
    <SelectButton
      v-model="activeTab"
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
              activeTab === slotProps.option.value ? activeTabClass : inactiveTabClass,
            ]"
          >
            {{ slotProps.option.icon }}
          </span>
          <span :class="[activeTab === slotProps.option.value ? activeTabClass : inactiveTabClass]">
            {{ slotProps.option.label }}
          </span>
        </div>
      </template>
    </SelectButton>
    <ScrollableDrawer />
  </aside>
</template>
<script lang="ts" setup>
import { SelectButton } from 'primevue'
import { ref } from 'vue'
import ScrollableDrawer from './ScrollableDrawer.vue'
import Summary from './SummaryLocation.vue'

const activeTabClass = 'text-gray-700 font-semibold'
const inactiveTabClass = 'text-gray-400'

const tabs = ref({
  explore: { label: 'Explora', icon: 'explore', value: 'explore' },
  analize: { label: 'Analiza', icon: 'query_stats', value: 'analize' },
})
const activeTab = ref(tabs.value.explore.value)
const options = Object.values(tabs.value)
</script>
