import moment from 'moment'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

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
      const preDate = moment(date.from, 'YYYY-MM-DD').add(1, 'd')
      const postDate = moment(date.to, 'YYYY-MM-DD').subtract(1, 'd')
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
      extent: ol.getView().calculateExtent(ol.getSize()),
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

    axios(this.options.url, {
      withCredentials: true,
      method: 'POST', // or 'PUT'
      data: JSON.stringify(dataView),
      headers: {
        'X-CSRFToken': _this.options.csrfToken
      }
    })
      .then(function (resp) {
        _this.options.callback(resp.data)
      })
  }

  load (callback) {
    const _this = this
    axios(this.options.url, {
      withCredentials: true,
      method: 'GET', // or 'PUT'
      headers: {
        'X-CSRFToken': _this.options.csrfToken
      }
    })
      .then(function (resp) {
        if (resp.status === STATUS_CODES.OK) {
          callback(resp.data)
        } else {
          console.log(resp.status)
        }
      })
  }
}
