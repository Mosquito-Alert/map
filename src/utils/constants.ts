export enum MosquitoLayersEnum {
  observations = 'observations',
  distribution = 'distribution',
  rm0 = 'rm0',
  bite_index = 'bite_index',
}

export const mosquitoLayers = [
  {
    key: MosquitoLayersEnum.observations,
    label: 'Observaciones de la comunidad',
    info: 'Muestra las observaciones de mosquitos reportadas por la comunidad en la aplicación Mosquito Alert.',
  },
  {
    key: MosquitoLayersEnum.distribution,
    label: 'Distribución de la especie',
    info: 'Muestra la distribución geográfica de diferentes especies de mosquitos basada en datos científicos y observaciones. Datos obtenidos de la fuente GBIF.',
  },
  {
    key: MosquitoLayersEnum.rm0,
    label: 'Ritmo reproductivo básico de la especie',
    info: 'Indica el potencial reproductivo de los mosquitos en diferentes áreas, lo que ayuda a entender dónde es más probable que se reproduzcan y propaguen.',
  },
  {
    key: MosquitoLayersEnum.bite_index,
    label: 'Índice de picadura de la especie',
    info: 'Muestra la probabilidad de picaduras de mosquitos en diferentes áreas, ayudando a los usuarios a identificar zonas con mayor riesgo de contacto con mosquitos.',
  },
]

export enum VariablesLayersEnum {
  temperature = 'temperature',
  precipitation = 'precipitation',
  transport = 'transport',
}

export const variablesLayers = [
  {
    key: VariablesLayersEnum.temperature,
    label: 'Temperatura',
  },
  {
    key: VariablesLayersEnum.precipitation,
    label: 'Precipitación',
  },
  {
    key: VariablesLayersEnum.transport,
    label: 'Transporte humano',
  },
]
