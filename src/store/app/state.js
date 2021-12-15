export default function () {
  return {
    DEFAULTS: {
      LAYERS: [
        { type: 'observations', code: 'tiger' }
        // {type: 'observations', code: 'other'}
      ]
    },
    BACKEND: 'http://localhost:8000/',
    trans: {},
    layers: {
      observations: { // Mosquito observations
        tiger: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
        yellow: ['yellow_fever_probable', 'yellow_fever_confirmed'],
        culex: ['culex_probable', 'culex_confirmed'],
        japonicus: ['japonicus_probable', 'japonicus_confirmed'],
        koreicus: ['koreicus_probable', 'koreicus_confirmed'],
        other: ['other_species'],
        unidentified: ['unidentified'],
        pending: ['not_yet_validated'],
        trash: ['trash_layer']
      },
      breeding: { // Breeding sites
        pending: ['breeding_site_not_yet_filtered'],
        other: ['breeding_site_other']
      },
      storm_drain: { // Storm drain
        water: ['storm_drain_water'],
        dry: ['storm_drain_dry']
      },
      other: { // ??
        conflict: ['conflict']
      }
    }
  }
}
