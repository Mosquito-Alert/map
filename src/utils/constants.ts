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
    label: 'Observaciones de la comunidad Mosquito Alert',
    info: 'Muestra las observaciones de mosquitos reportadas por la comunidad en la aplicación Mosquito Alert.',
  },
  {
    key: MosquitoLayersEnum.EXTENDED_OBSERVATIONS,
    label: 'Observaciones de fuentes externas (GBIF)',
    info: 'Muestra las observaciones de mosquitos de la especie seleccionada obtenidas de fuentes externas como GBIF, lo que ayuda a entender su distribución global y local. GBIF usa datos de múltiples fuentes, incluyendo Mosquito Alert.',
  },
  {
    key: MosquitoLayersEnum.DISCOVERIES,
    label: 'Descubrimientos de la comunidad Mosquito Alert',
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
