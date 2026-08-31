import type { Feature } from 'ol'
import type { breedingSiteTypes, mosquitoTaxonIds } from '../../../utils/constants'

export interface ReportAnalyticsStats {
  total: number
  colorCounts: Record<string, number>
  histogramCounts: Record<string, number>
  recentFeatures: Feature[]
}

export type LayerVisibilityKey =
  // Mosquito species
  | 'albopictus'
  | 'aegypti'
  | 'japonicus'
  | 'koreicus'
  | 'culex'
  | 'unidentifiedMosquito'
  | 'otherSpecies'
  // Breeding sites
  | 'stormDrainWater'
  | 'stormDrainDry'
  | 'otherSite'

export interface ObservationLayerConfig {
  key: LayerVisibilityKey
  taxonKey: keyof typeof mosquitoTaxonIds
  colorKey: string
  negate?: boolean
}

export interface BreedingSiteLayerConfig {
  key: LayerVisibilityKey
  siteTypeKey: keyof typeof breedingSiteTypes
  hasWater?: boolean
}
