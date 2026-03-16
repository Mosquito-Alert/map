export enum MosquitoLayersEnum {
  OBSERVATIONS = 'observations',
  DISTRIBUTION = 'distribution',
  DISCOVERIES = 'discoveries',
  RM0 = 'rm0',
  BITE_INDEX = 'bite_index',
}

export const mosquitoLayers = [
  {
    key: MosquitoLayersEnum.OBSERVATIONS,
    label: 'Observaciones de la comunidad',
    info: 'Muestra las observaciones de mosquitos reportadas por la comunidad en la aplicación Mosquito Alert.',
  },
  {
    key: MosquitoLayersEnum.DISTRIBUTION,
    label: 'Distribución de la especie',
    info: 'Muestra la distribución geográfica de diferentes especies de mosquitos basada en datos científicos y observaciones. Datos obtenidos de la fuente GBIF.',
  },
  {
    key: MosquitoLayersEnum.DISCOVERIES,
    label: 'Descubrimientos de la comunidad',
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
