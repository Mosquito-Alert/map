export default class ShareMapView {
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

    if (filters.hashtags.length) {
      dataView.filters.hashtags = JSON.stringify(filters.hashtags)
    }

    if (filters.locations.length) {
      dataView.filters.locations = JSON.stringify(JSON.parse(filters.locations[0]).features[0].geometry)
    }

    fetch(this.options.url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(dataView),
      headers: {
        'Content-Type': 'application/force-download'
      }
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
