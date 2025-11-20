import marker_bite from '../assets/img/marker_bite.svg'
import storm_drain_water from '../assets/img/storm_drain_water.svg'
import storm_drain_dry from '../assets/img/storm_drain_dry.svg'
import breeding_other from '../assets/img/breeding_other.svg'

export const bitesObservations = {
  // Bites
  bite: {
    categories: ['bite'],
    icon: marker_bite,
    faIcon: 'fa-solid fa-child-reaching bites',
    common_name: 'Bites',
    color: '#cc6677',
    active: false,
  },
}

export const breedingObservations = {
  // Breeding sites
  with_water: {
    categories: ['storm_drain_water'],
    icon: storm_drain_water,
    common_name: 'Stormdrain with water',
    color: '#1072ad',
    active: false,
  },
  without_water: {
    categories: ['storm_drain_dry'],
    icon: storm_drain_dry,
    common_name: 'Stormdrain without water',
    color: '#1072ad',
    active: false,
  },
  other_water: {
    categories: ['breeding_site_other'],
    icon: breeding_other,
    common_name: 'Breeding site other',
    color: '#1072ad',
    active: false,
  },
}
