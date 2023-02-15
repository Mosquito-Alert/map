import moment from 'moment'

export default class ShareMapView {
  // constructor (map, filters, url, callback) {
  constructor (map, opt) {
    const options = opt || {}
    this.map = map
    this.options = options
  }

  constrictDate (date, f = 'YYYY/MM/DD') {
    let expandedDate = null
    if (!date) return
    if (typeof date === 'string') {
      expandedDate = { from: date.format(f), to: date.format(f) }
    } else {
      const preDate = moment(date.from).add(1, 'd')
      const postDate = moment(date.to).subtract(1, 'd')
      expandedDate = { from: preDate.format(f), to: postDate.format(f) }
    }
    return expandedDate
  }

  save () {
    const _this = this
    const filters = _this.options.filters
    const ol = this.map
    const dataView = {
      center: ol.getView().getCenter(),
      zoom: ol.getView().getZoom(),
      filters: filters,
      viewType: _this.options.viewType
    }

    if (this.options.viewType === 'layers') {
      // If share is not type models then  check for other filters
      if (this.options.locationName.length) {
        dataView.locationName = this.options.locationName
      }

      if (this.options.popup.toString().length) {
        dataView.popup = this.options.popup
      }

      if (filters.dates.length) {
        // dataView.filters.dates = [this.constrictDate(filters.dates[0])]
        dataView.filters.dates = [filters.dates[0]]
      } else {
        dataView.filters.dates = [this.options.dates]
      }

      if (filters.hashtags.length) {
        dataView.filters.hashtags = filters.hashtags
      }

      if (filters.locations.length) {
        dataView.filters.locations = filters.locations
      }

      dataView.samplingEffort = this.options.samplingEffort
      dataView.feature = this.options.feature
      dataView.spiderfyId = this.options.spiderfyId
      dataView.privateView = this.options.privateView

      // When sharing a view, filtering mode is always 'resetFilter'. So it applies at once when loading the view
      dataView.filters.mode = 'resetFilter'
    } else if (this.options.viewType === 'models') {
      dataView.vector = this.options.vector
      dataView.year = this.options.year
      dataView.month = this.options.month
      dataView.estimation = this.options.estimation
      dataView.uncertainty = this.options.uncertainty
      dataView.estimationTransparency = this.options.estimationTransparency
      dataView.uncertaintyTransparency = this.options.uncertaintyTransparency
      dataView.uncertaintyColor = this.options.uncertaintyColor
      dataView.estimationColors = this.options.estimationColors
    }

    fetch(this.options.url, {
      credentials: 'include',
      method: 'POST', // or 'PUT'
      body: JSON.stringify(dataView),
      headers: {
        'X-CSRFToken': _this.options.csrfToken
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
    const _this = this
    fetch(this.options.url, {
      credentials: 'include',
      method: 'GET', // or 'PUT'
      headers: {
        'X-CSRFToken': _this.options.csrfToken
      }
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        callback(json)
      })
      .catch(function (err) {
        console.log(err)
      })
  }
}
