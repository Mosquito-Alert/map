// stores/mapUi.ts
import { defineStore } from 'pinia';

export const useMapUiStore = defineStore('mapUi', {
  state: () => ({
    grayscaleBasemap: false,
  }),
  actions: {
    setGrayscale(value: boolean) {
      this.grayscaleBasemap = value;
    },
  },
});
