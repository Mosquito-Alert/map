/// <reference lib="webworker" />

import { latLngToCell, cellToBoundary } from 'h3-js'
import { markRaw } from 'vue'

const DAY_MS = 86_400_000

export enum MessageType {
  BUILD_ORIGINAL = 'BUILD_ORIGINAL',
  BUILT = 'BUILT',
  FILTER = 'FILTER',
  FILTERED = 'FILTERED',
}

type WorkerMessage =
  | {
      type: MessageType.BUILD_ORIGINAL
      features: GeoJSON.Feature<GeoJSON.Point>[]
      resolution: number
      selectedTaxonId: number
    }
  | {
      type: MessageType.FILTER
      resolution: number
      selectedTaxonId: number
      start: number
      end: number
    }

type HexStore = Record<
  number, // taxonomic id
  Record<
    number, // resolution
    Record<
      string, // hex
      {
        type: string
        geometry: GeoJSON.Polygon
        properties: {
          hex: string
          countsByDay: Map<number, number>
          count: number
        }
      }
    >
  >
>

const originalHexData: HexStore = {}
let dateAggregation: Record<number, Record<number, number>> = {}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === MessageType.BUILD_ORIGINAL) {
    const { features, resolution, selectedTaxonId } = msg

    console.log(
      'Building original data for resolution:',
      resolution,
      ' and taxon id:',
      selectedTaxonId,
    )

    if (originalHexData[selectedTaxonId]?.[resolution]) return

    originalHexData[selectedTaxonId] = originalHexData[selectedTaxonId] || {}

    const aggregateByDate = Object.keys(dateAggregation?.[selectedTaxonId] ?? {}).length === 0
    if (aggregateByDate) {
      dateAggregation[selectedTaxonId] = {}
    }

    for (const feature of features) {
      // ------------------------------------------------
      // Timestamp + day precomputation (ONCE)
      // ------------------------------------------------
      const ts = feature.properties?.ts || Date.parse(feature.properties?.received_at)
      const day = feature.properties?.day || ts - (ts % DAY_MS)
      feature.properties!.ts = ts
      feature.properties!.day = day

      // ------------------------------------------------
      // H3 aggregation
      // ------------------------------------------------
      const [lng, lat] = feature.geometry.coordinates as [number, number]
      const hex = latLngToCell(lat, lng, resolution)

      let hexFeature = originalHexData[selectedTaxonId][resolution]?.[hex] as
        | HexStore[number][number][string]
        | undefined
      if (!hexFeature) {
        hexFeature = {
          type: 'Feature',
          geometry: markRaw({
            type: 'Polygon',
            coordinates: [cellToBoundary(hex, true)],
          }),
          properties: {
            hex,
            countsByDay: new Map(),
            count: 0,
          },
        }
      }

      if (!originalHexData[selectedTaxonId][resolution]) {
        originalHexData[selectedTaxonId][resolution] = {}
      }

      // ------------------------------------------------
      // Per-hex histogram update
      // ------------------------------------------------
      const countsByDay = hexFeature.properties.countsByDay
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1)
      hexFeature.properties.count++

      //  ------------------------------------------------
      // Global date aggregation (once)
      // ------------------------------------------------
      if (aggregateByDate) {
        dateAggregation[selectedTaxonId]![day] = (dateAggregation[selectedTaxonId]![day] ?? 0) + 1
      }
      originalHexData[selectedTaxonId][resolution]![hex] = hexFeature
    }

    postMessage({
      type: MessageType.BUILT,
      resolution,
      originalHexData: originalHexData[selectedTaxonId][resolution]!,
      dateAggregation: dateAggregation[selectedTaxonId]!,
    })
  }

  if (msg.type === MessageType.FILTER) {
    const { resolution, start, end, selectedTaxonId } = msg

    console.log('Filtering data for resolution:', resolution)

    const source = originalHexData[selectedTaxonId]?.[resolution]
    if (!source) return

    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = []
    const counts: number[] = []

    for (const [hex, feature] of Object.entries(source)) {
      let count = 0
      for (const [day, c] of feature.properties.countsByDay) {
        if (day >= start && day <= end) count += c
      }

      if (count > 0) {
        counts.push(count)
        features.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: { hex, count },
        })
      }
    }

    counts.sort((a, b) => a - b)

    postMessage({
      type: MessageType.FILTERED,
      resolution,
      featureCollection: {
        type: 'FeatureCollection',
        features,
      },
      counts,
    })
  }
}
