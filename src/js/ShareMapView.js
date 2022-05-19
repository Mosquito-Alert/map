export default class ShareMapView {
  // constructor (map, filters, url, callback) {
  constructor (map, opt) {
    const options = opt || {}
    this.map = map
    this.options = options
    console.log(this.options)
  }

  save () {
    const _this = this
    const filters = _this.options.filters
    const ol = this.map
    const dataView = {
      center: ol.getView().getCenter(),
      zoom: ol.getView().getZoom(),
      filters: filters
    }

    if (this.options.locationName.length) {
      dataView.locationName = this.options.locationName
    }

    if (this.options.popup.toString().length) {
      dataView.popup = this.options.popup
    }

    if (filters.dates.length) {
      dataView.filters.dates = filters.dates
    }

    if (filters.hashtags.length) {
      dataView.filters.hashtags = filters.hashtags
    }

    if (filters.locations.length) {
      dataView.filters.locations = filters.locations
    }

    dataView.samplingEffort = this.options.samplingEffort
    dataView.feature = this.options.feature

    // When sharing a view, filtering mode is always 'resetFilter'. So it applies at once when loading the view
    dataView.filters.mode = 'resetFilter'

    fetch(this.options.url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(dataView)
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        _this.options.callback(json)
      })
  }

  load (callback) {
    fetch(this.options.url, {
      method: 'GET' // or 'PUT'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        callback(json)
      })
  }
}
