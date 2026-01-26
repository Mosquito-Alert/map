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
      // features: GeoJSON.Feature<GeoJSON.Point>[]
      observations: any[]
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
let features = [] as GeoJSON.Feature<GeoJSON.Point>[]

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === MessageType.BUILD_ORIGINAL) {
    const { observations, resolution } = msg

    console.log('Building original data for resolution:', resolution)

    if (originalHexData[resolution]) return

    const aggregateByDate = Object.keys(dateAggregation).length === 0
    const buildOriginalFeatures: boolean = Object.keys(features).length === 0

    for (const observation of observations) {
      const lng = observation.point.longitude as number
      const lat = observation.point.latitude as number
      // ------------------------------------------------
      // Timestamp + day precomputation (ONCE)
      // ------------------------------------------------
      const ts = observation.ts || Date.parse(observation.received_at)
      const day = observation.day || ts - (ts % DAY_MS)
      observation.ts = ts
      observation.day = day

      // ------------------------------------------------
      // Build original features list (ONCE)
      // ------------------------------------------------
      if (buildOriginalFeatures) {
        const feature: GeoJSON.Feature<GeoJSON.Point> = {
          // id: observation.uuid,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          properties: {
            ts: observation.ts,
            day: observation.day,
            received_at: observation.received_at,
          },
        }
        features.push(feature)
      }

      // ------------------------------------------------
      // H3 aggregation
      // ------------------------------------------------
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
      features,
    })
  }

  if (msg.type === MessageType.FILTER) {
    const { resolution, start, end } = msg

    console.log('worker ← receive', performance.now()) // DELETE:

    // console.log('Filtering data for resolution:', resolution)

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

    // console.log('Filtered features count:', features.length)
    console.log('worker → send', performance.now()) // DELETE:

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
