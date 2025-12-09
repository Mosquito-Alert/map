import { defineStore } from 'pinia'
import { MosquitoLayersEnum, VariablesLayersEnum } from '../utils/constants'
import { cellToBoundary, latLngToCell } from 'h3-js'

export const useMapStore = defineStore('map', {
  state: () => ({
    showDiscoveries: false,
    layerSelected: MosquitoLayersEnum.observations as MosquitoLayersEnum,
    variablesSelected: [] as VariablesLayersEnum[],
    hex_data: {} as Record<string, any>,
    dataDateCount: {} as Record<string, number>,
  }),
  actions: {
    processPoints(data_objects: any[], resolutions: number[]) {
      for (const resolution of resolutions) {
        this.hex_data[resolution] = {}
      }

      for (const { point, received_at } of data_objects) {
        for (const resolution of resolutions) {
          const hex = latLngToCell(point.latitude, point.longitude, resolution)
          if (!this.hex_data[resolution][hex]) {
            this.hex_data[resolution][hex] = {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [cellToBoundary(hex, true)],
              },
              properties: {
                count: 1,
              },
            }
          } else {
            this.hex_data[resolution][hex].properties.count += 1
          }
        }
        if (this.dataDateCount[received_at]) {
          this.dataDateCount[received_at] += 1
        } else {
          this.dataDateCount[received_at] = 1
        }
      }
    },
  },
})
