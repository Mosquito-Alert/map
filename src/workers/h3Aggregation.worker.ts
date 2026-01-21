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
    }
  | {
      type: MessageType.FILTER
      resolution: number
      start: number
      end: number
    }

type HexStore = Record<
  number,
  Record<
    string,
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

const originalHexData: HexStore = {}
let dateAggregation: Record<number, number> = {}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === MessageType.BUILD_ORIGINAL) {
    const { features, resolution } = msg

    console.log('Building original data for resolution:', resolution)

    if (originalHexData[resolution]) return

    const aggregateByDate = Object.keys(dateAggregation).length === 0

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

      let hexFeature = originalHexData[resolution]?.[hex] as HexStore[number][string] | undefined
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

      if (!originalHexData[resolution]) {
        originalHexData[resolution] = {}
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
        dateAggregation[day] = (dateAggregation[day] ?? 0) + 1
      }
      originalHexData[resolution][hex] = hexFeature
    }

    postMessage({
      type: MessageType.BUILT,
      resolution,
      originalHexData: originalHexData[resolution],
      dateAggregation,
    })
  }

  if (msg.type === MessageType.FILTER) {
    const { resolution, start, end } = msg

    console.log('Filtering data for resolution:', resolution)

    const source = originalHexData[resolution]
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
