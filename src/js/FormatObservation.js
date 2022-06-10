export default class FormatObservation {
  // constructor (map, filters, url, callback) {
  constructor (json, titles, latinNames) {
    this.o = json
    this.titles = titles
    this.latinNames = latinNames
  }

  format () {
    console.log(this.o)
    if (!('validation_type' in this.o)) {
      this.o.validation_type = 'human'
    }
    if (this.o.private_webmap_layer in this.latinNames) {
      this.o.latinName = this.latinNames[this.o.private_webmap_layer]
    }
    // format title based on observation type
    if (this.o.type.toLowerCase() === 'bite') {
      this.o.title = this.titles.bite
    } else if (this.o.type.toLowerCase() === 'site') {
      this.o.title = this.titles[this.o.private_webmap_layer]
    } else if (this.o.type.toLowerCase() === 'adult') {
      this.o.title = this.titles[this.o.private_webmap_layer]
      if (!['unidentified', 'other_species'].includes(this.o.private_webmap_layer)) {
        this.o.validation = (this.o.private_webmap_layer.toLowerCase().indexOf('confirmed') > -1) ? 'Confirmed' : 'Probable'
      } else {
        this.o.validation = ''
      }
    }

    // Format object based on private_webmap_layer
    if (this.o.private_webmap_layer.toLowerCase() === 'storm_drain_water' ||
        this.o.private_webmap_layer.toLowerCase() === 'storm_drain_dry'
    ) {
      this.o.withWater = ''
    }
    if (this.o.private_webmap_layer.toLowerCase() === 'storm_drain_water') {
      this.o.withLarva = this.o.formatedResponses.with_larva
    }
    if (this.o.private_webmap_layer.toLowerCase() === 'breeding_site_other') {
      this.o.withWater = this.o.formatedResponses.with_water
      this.o.withLarva = this.o.formatedResponses.with_larva
    }
    // if bite
    if (this.o.type.toLowerCase() === 'bite') {
      this.o.howMany = this.o.formatedResponses.howManyBites
      this.o.bodyPart = this.o.formatedResponses.bodyPart
      this.o.location = this.o.formatedResponses.location
      this.o.biteTime = this.o.formatedResponses.biteTime
    }

    const preUrl = '//webserver.mosquitoalert.com'
    if (this.o.photo_url !== '') {
      if (!this.o.photo_url.startsWith(preUrl)) {
        this.o.photo_url = preUrl + this.o.photo_url
      }
    }
    return this.o
  }
}
