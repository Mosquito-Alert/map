import { adjustSaturation } from './colorConversor'

type zoomConfig = { center: [number, number]; zoom: number }
export const zoomToEurope: zoomConfig = {
  center: [11.39831, 47.26244],
  zoom: 2.25,
}
export const zoomToSpain: zoomConfig = {
  center: [-4.0, 39.75],
  zoom: 5.75,
}

export const firstGbifDateAvailable = new Date(1900, 0, 1)
// TODO: API endpoint. get date limits
export const firstRM0DateAvailable = new Date(2025, 8, 3) // Note: Months are 0-indexed in JavaScript
// TODO: API endpoint. get date limits
export const lastRM0DateAvailable = new Date(2026, 4, 12)
// TODO: API endpoint. get date limits
export const firstBiteIndexDateAvailable = new Date(2020, 0, 1)

export enum MosquitoLayersEnum {
  MA_OBSERVATIONS = 'ma observations',
  EXTENDED_OBSERVATIONS = 'extended observations',
  DISCOVERIES = 'discoveries',
  RM0 = 'rm0',
  BITE_INDEX = 'bite_index',
}

export const mosquitoLayers = [
  {
    key: MosquitoLayersEnum.MA_OBSERVATIONS,
    label: 'Observaciones de nuestra comunidad',
    info: 'Muestra las observaciones de mosquitos reportadas por la comunidad en la aplicación Mosquito Alert.',
  },
  {
    key: MosquitoLayersEnum.EXTENDED_OBSERVATIONS,
    label: 'Observaciones de la comunidad',
    info: 'Muestra las observaciones de mosquitos de la especie seleccionada obtenidas de GBIF. GBIF usa datos de múltiples fuentes, incluyendo Mosquito Alert, lo que ayuda a entender su distribución global y local.',
  },
  {
    key: MosquitoLayersEnum.DISCOVERIES,
    label: 'Descubrimientos de nuestra comunidad',
    info: 'Muestra los descubrimientos de mosquitos reportados por la comunidad en la aplicación Mosquito Alert, que pueden incluir avistamientos de especies invasoras o nuevas áreas de presencia.',
  },
  {
    key: MosquitoLayersEnum.RM0,
    label: 'Ritmo reproductivo básico de la especie',
    info: 'Indica el potencial reproductivo de los mosquitos en diferentes áreas, lo que ayuda a entender dónde es más probable que se reproduzcan y propaguen.',
  },
  {
    key: MosquitoLayersEnum.BITE_INDEX,
    label: 'Índice de picadura de la especie',
    info: 'Muestra la probabilidad de picaduras de mosquitos en diferentes áreas, ayudando a los usuarios a identificar zonas con mayor riesgo de contacto con mosquitos.',
  },
]

export enum VariablesLayersEnum {
  TEMPERATURE = 'temperature',
  PRECIPITATION = 'precipitation',
  TRANSPORT = 'transport',
}

export const variablesLayers = [
  {
    key: VariablesLayersEnum.TEMPERATURE,
    label: 'Temperatura',
  },
  {
    key: VariablesLayersEnum.PRECIPITATION,
    label: 'Precipitación',
  },
  {
    key: VariablesLayersEnum.TRANSPORT,
    label: 'Transporte humano',
  },
]

// * BITE INDEX LAYER
// Values need to be the same as the names of the style in geoserver.
export enum BiteIndexStyleEnum {
  RISE = 'rise',
  BALANCE = 'balance',
  BINARY = 'binary',
  ANOMALY = 'anomaly',
}

export const biteIndexStyles = [
  {
    key: BiteIndexStyleEnum.RISE,
    label: 'Estilo RISE',
    info: 'Este estilo es más adecuado para ver puntos calientes o áreas con alto índice de picadura, ya que resalta claramente las zonas con mayor riesgo.',
  },
  {
    key: BiteIndexStyleEnum.BALANCE,
    label: 'Estilo BALANCE',
    info: 'Este estilo es útil para visualizar la distribución general del índice de picadura, mostrando tanto las áreas de bajo como de alto riesgo de manera equilibrada.',
  },
  {
    key: BiteIndexStyleEnum.BINARY,
    label: 'Estilo BINARY',
    info: 'Este estilo es adecuado para visualizar zonas de bajo y alto riesgo de picadura, pasando así desapercibidas las áreas con riesgo intermedio.',
  },
  {
    key: BiteIndexStyleEnum.ANOMALY,
    label: 'Anomalías en el índice de picadura',
    info: 'Este estilo resalta las anomalías en el índice de picadura, donde el azul representa valores por debajo del valor esperado y el rojo representa valores por encima del valor esperado.',
  },
]

export const ANOMALY_COLORS = {
  USUAL_LIGHT: '#EEF4EF',
  USUAL: '#5BBA6F',
  LOW: '#85b0d5BE',
  HIGH: '#ff795b',
}

// HIGHLIGHT ALL VALUES
export const VALUE_COLOR_BALANCE_STOPS = [
  { min: 0.0, max: 0.15, start: '#A9DFBF', end: '#7DCEA0' },
  { min: 0.15, max: 0.3, start: '#7DCEA0', end: '#D5E87A' },
  { min: 0.3, max: 0.45, start: '#D5E87A', end: '#E7D47A' },
  { min: 0.45, max: 0.6, start: '#E7D47A', end: '#E5B93F' },
  { min: 0.6, max: 0.75, start: '#E5B93F', end: '#E74C3C' },
  { min: 0.75, max: 0.9, start: '#E74C3C', end: '#8a2a0a' },
  { min: 0.9, max: 1.0, start: '#8a2a0a', end: '#6d250d' },
]

// HIGHLIGHT HIGH VALUES
export const VALUE_COLOR_RISE_STOPS = [
  { min: 0.0, max: 0.15, start: '#ffffff', end: '#fef0d9' },
  { min: 0.15, max: 0.3, start: '#fef0d9', end: '#fdd49e' },
  { min: 0.3, max: 0.45, start: '#fdd49e', end: '#fdbb84' },
  { min: 0.45, max: 0.6, start: '#fdbb84', end: '#fc8d59' },
  { min: 0.6, max: 0.75, start: '#fc8d59', end: '#e34a33' },
  { min: 0.75, max: 1.0, start: '#e34a33', end: '#b30000' },
]

// HIGHLIGHT CONTRAST VALUES
export const VALUE_COLOR_BINARY_STOPS = [
  { min: 0.0, max: 0.2, start: '#08306b', end: '#2171b5' },
  { min: 0.2, max: 0.4, start: '#2171b5', end: '#deebf7' },
  { min: 0.4, max: 0.5, start: '#deebf7', end: '#ffffff' },
  { min: 0.5, max: 0.6, start: '#ffffff', end: '#fee0d2' },
  { min: 0.6, max: 0.8, start: '#fee0d2', end: '#fb6a4a' },
  { min: 0.8, max: 1.0, start: '#fb6a4a', end: '#67000d' },
]

export const gradientStops = (layerStyle: BiteIndexStyleEnum = BiteIndexStyleEnum.RISE): string => {
  let stops
  switch (layerStyle) {
    case BiteIndexStyleEnum.BALANCE:
      stops = VALUE_COLOR_BALANCE_STOPS
      break
    case BiteIndexStyleEnum.ANOMALY:
    case BiteIndexStyleEnum.RISE:
      stops = VALUE_COLOR_RISE_STOPS
      break
    case BiteIndexStyleEnum.BINARY:
      stops = VALUE_COLOR_BINARY_STOPS
      break
    default:
      stops = VALUE_COLOR_BALANCE_STOPS // Fallback to ALL
  }

  return stops
    .map((range) => {
      const start =
        layerStyle === BiteIndexStyleEnum.ANOMALY ? adjustSaturation(range.start, 0.0) : range.start
      const end =
        layerStyle === BiteIndexStyleEnum.ANOMALY ? adjustSaturation(range.end, 0.0) : range.end
      return `${start} ${(range.min * 100).toFixed(0)}%, ${end} ${(range.max * 100).toFixed(0)}%`
    })
    .join(', ')
}

// * RM0 LAYER
// RM0 palette and settings
export const RM0_PALETTE = [
  '#fff7ec',
  '#fee8c8',
  '#fdd49e',
  '#fdbb84',
  '#fc8d59',
  '#ef6548',
  '#d7301f',
  '#b30000',
  '#7f0000',
]
// The maximum value in the dataset is dynamic, but we consider that a value
// of 7 or higher indicates a very high R0, so we set it as the upper bound for the color scale
export const RM0_MAX_VALUE = 7
