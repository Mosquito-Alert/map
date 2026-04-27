import { area } from '@turf/turf'

type regionDetails = {
  name: string
  subname: string
  country: string
}

const EMPTY_REGION_DETAILS: regionDetails = {
  name: '',
  subname: '',
  country: '',
}

const asCleanString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  if (!normalized || normalized.toUpperCase() === 'NA') {
    return undefined
  }

  return normalized
}

// Given different region formats, extract the details of the region
export const getRegionDetails = (feature: GeoJSON.Feature | undefined): regionDetails => {
  if (!feature) {
    return EMPTY_REGION_DETAILS
  }

  if (!feature.properties || typeof feature.properties !== 'object') {
    return EMPTY_REGION_DETAILS
  }

  const properties = feature.properties as Record<string, unknown>

  // Format 1: Nominatim-like payload with name/display_name/address.country. Example:
  // {"place_id":82934966,"osm_type":"relation","osm_id":348890,"place_rank":16,"category":"boundary","type":"administrative","importance":0.5353472076134255,"addresstype":"town","name":"Blanes","display_name":"Blanes, la Selva, Gerona, Cataluña, 17300, España","address":{"town":"Blanes","county":"la Selva","province":"Gerona","ISO3166-2-lvl6":"ES-GI","state":"Cataluña","ISO3166-2-lvl4":"ES-CT","postcode":"17300","country":"España","country_code":"es"},"extratags":{"ele":"14","capital":"8","ref:ine":"17023000000","wikidata":"Q12991","idee:name":"Blanes","wikipedia":"ca:Blanes","population":"41935","border_type":"municipi","ref:idescat":"170237","linked_place":"town","ine:municipio":"17023","population:date":"2024","admin_level":"8"}}
  const name = asCleanString(properties.name)
  const subname = asCleanString(properties.display_name)
  const address =
    properties.address && typeof properties.address === 'object'
      ? (properties.address as Record<string, unknown>)
      : undefined
  const countryFromAddress = asCleanString(address?.country)

  if (name || subname || countryFromAddress) {
    return {
      name: name ?? '',
      subname: subname ?? name ?? '',
      country: countryFromAddress ?? '',
    }
  }

  // Format 2: hierarchical NAME_0..NAME_N properties. Example:
  // { "fid": 14332, "GID_0": "ESP", "COUNTRY": "Spain", "GID_1": "ESP.6_1", "NAME_1": "Cataluña", "NL_NAME_1": "NA", "GID_2": "ESP.6.1_1", "NAME_2": "Barcelona", "VARNAME_2": "NA", "NL_NAME_2": "NA", "TYPE_2": "Provincia", "ENGTYPE_2": "Province", "CC_2": "08", "HASC_2": "ES.CT.BR" }
  const nameByLevel = Object.keys(properties)
    .map((key) => {
      const match = key.match(/^NAME_(\d+)$/)
      if (!match) {
        return undefined
      }

      return {
        level: Number(match[1]),
        value: asCleanString(properties[key]),
      }
    })
    .filter((item): item is { level: number; value: string | undefined } => !!item)
    .sort((a, b) => b.level - a.level)

  if (nameByLevel.length) {
    const highestLevelName = nameByLevel.find((item) => !!item.value)?.value
    const subnameFromLevels = nameByLevel
      .map((item) => item.value)
      .filter((value): value is string => !!value)
      .join(', ')

    const country =
      nameByLevel.find((item) => item.level === 0)?.value ?? asCleanString(properties.COUNTRY) ?? ''

    return {
      name: highestLevelName ?? '',
      subname: `${subnameFromLevels}, ${country}`,
      country,
    }
  }

  return EMPTY_REGION_DETAILS
}

// Calculates the area of a GeoJSON feature in km².
export const calculateArea = (feature: GeoJSON.Feature): number => {
  if (!feature.geometry) return 0

  const areaInSquareMeters = area(feature)
  return areaInSquareMeters / 1000000 // Convert to km²
}
