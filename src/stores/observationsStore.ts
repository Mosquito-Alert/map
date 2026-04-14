import { BitesListOrderByParameter, type Observation } from 'mosquito-alert'
import { defineStore } from 'pinia'
import { boundariesApi, observationsApi } from '../services/apiService'
import { useTaxaStore } from './taxaStore'

export const useObservationsStore = defineStore('observations', {
  state: () => ({
    // observations: {} as any,
    dataProcessed: false,
    recent_observations: [] as Observation[],
    are_observations_near: false, // This flag tells if recent_observations are near the user or not.
    user_location: null as { latitude: number; longitude: number } | null,
    radius_for_nearby_observations: 100, // in km
    dateFilter: {
      start: null as string | null,
      end: null as string | null,
    } as { start: string | null; end: string | null },
    dateLimits: {
      first: null as string | null,
      last: null as string | null,
    } as { first: string | null; last: string | null },
    // This state tells the observation that is currently shown in the drawer to see its details
    observationInDrawer: null as Observation | null,
    selectedObservationId: null as string | null, // This controls the observation point in the map
  }),
  actions: {
    async fetchObservationsNearMe(
      numberOfObservations: number,
      latitude?: number,
      longitude?: number,
    ) {
      try {
        const taxaStore = useTaxaStore()
        const threeMonthsAgo = new Date(this.dateFilter.end ? this.dateFilter.end : new Date())
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 12) // TODO: Change to 3 months ago

        const response = await observationsApi.list({
          pageSize: numberOfObservations,
          hasPhotos: true,
          identificationTaxonIds: [taxaStore.taxonSelected.id.toString()],
          ...(latitude && longitude
            ? {
                point: [longitude, latitude],
                dist: this.radius_for_nearby_observations * 1000, // 100 km radius
                orderBy: [BitesListOrderByParameter.Distance, BitesListOrderByParameter.ReceivedAt],
              }
            : { orderBy: [BitesListOrderByParameter.ReceivedAt] }),
          receivedAtAfter: threeMonthsAgo.toISOString(),
        })
        if (response.data.results) {
          this.recent_observations = response.data.results
        }
      } catch (error) {
        console.error('Failed to fetch observations near me:', error)
        throw error
      }
    },
    async fetchObservations(geojsonFormat = false, boundary?: any) {
      const taxaStore = useTaxaStore()
      try {
        let boundaryUuid = null
        if (boundary) {
          const response = await boundariesApi.createTemporary({
            temporaryBoundaryRequest: {
              geojson: boundary.features[0].geometry,
            },
          })
          boundaryUuid = response.data.uuid
        }
        const requestParams = {
          identificationTaxonIds: [taxaStore.taxonSelected.id.toString()],
          identificationTaxonIdsLookup: 'is_tree_of',
          ...(boundaryUuid ? { boundaryUuid: boundaryUuid } : {}),
        }
        const response = await observationsApi.geoList(requestParams as any, {
          headers: { Accept: geojsonFormat ? 'application/geo+json' : 'application/json' },
        })
        if (response.data) {
          return response.data as any
        }
      } catch (error) {
        console.error('Failed to fetch observations:', error)
        throw error
      }
    },
    async fetchObservationById(uuid: string) {
      try {
        // TODO: Accept-language header
        const response = await observationsApi.retrieve({ uuid })
        if (response.data) {
          this.observationInDrawer = response.data as Observation
          return response.data as any
        }
      } catch (error) {
        console.error('Failed to fetch observation by ID:', error)
        throw error
      }
    },
    resetDateFilter() {
      this.dateFilter = { start: this.dateLimits.first, end: this.dateLimits.last }
    },
  },
})
