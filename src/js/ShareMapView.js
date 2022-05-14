export default class ShareMapView {
  constructor (map, filters, url, callback) {
    this.map = map
    this.filters = filters
    this.url = url
    this.callback = callback
  }

  save () {
    const _this = this
    const ol = this.map
    const dataView = {
      center: ol.getView().getCenter(),
      zoom: ol.getView().getZoom(),
      filters: _this.filters
    }

    if (this.filters.hashtags.length) {
      dataView.filters.hashtags = JSON.stringify(this.filters.hashtags)
    }

    if (this.filters.locations.length) {
      dataView.filters.locations = JSON.stringify(JSON.parse(this.filters.locations[0]).features[0].geometry)
    }

    fetch(this.url, {
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
        _this.callback(json)
      })
  }
}
