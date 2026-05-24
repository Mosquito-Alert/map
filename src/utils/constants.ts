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

// Values need to be the same as the names of the style in geoserver.
export enum BiteIndexStyleEnum {
  RISE = 'rise',
  BALANCE = 'balance',
  BINARY = 'binary',
  ANOMALY = 'anomaly',
}

export const firstGbifDateAvailable = new Date(1900, 0, 1)
export const firstRM0DateAvailable = new Date(2025, 8, 3) // Note: Months are 0-indexed in JavaScript
// TODO: API endpoint
export const lastRM0DateAvailable = new Date(2026, 4, 12)
