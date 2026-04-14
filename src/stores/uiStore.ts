import { defineStore } from 'pinia'

export const drawerTabs = {
  explore: { label: 'Explora', icon: 'explore', value: 'explore' },
  analize: { label: 'Analiza', icon: 'query_stats', value: 'analize' },
}

export const useUIStore = defineStore('ui', {
  state: () => ({
    drawerWidth: 0,
    activeTab: drawerTabs.explore.value,
  }),
  actions: {},
})
