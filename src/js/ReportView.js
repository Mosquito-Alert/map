export default class ReportView {
  // constructor (map, filters, url, callback) {
  constructor (map, opt) {
    const options = opt || {}
    this.map = map
    this.options = options
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

    if (filters.dates.length) {
      dataView.filters.dates = filters.dates
    }

    if (filters.hashtags.length) {
      dataView.filters.hashtags = filters.hashtags
    }

    if (filters.locations.length) {
      dataView.filters.locations = filters.locations
    }

    // Filtering mode is always 'resetFilter'. So it applies at once when loading the view
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