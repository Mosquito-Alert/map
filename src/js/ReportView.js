import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

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
      extent: ol.getView().calculateExtent(ol.getSize()),
      filters: filters,
      lang: this.options.lang
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
    axios(this.options.url, {
      withCredentials: true,
      method: 'POST', // or 'PUT'
      data: JSON.stringify(dataView),
      headers: {
        'X-CSRFToken': _this.options.csrfToken
      }
    })
      .then(function (resp) {
        if (resp.status === STATUS_CODES.OK) {
          _this.options.callback(resp.data)
        } else {
          console.log(resp.status)
        }
      })
  }

  load (callback) {
    axios(this.options.url, {
      withCredentials: true,
      method: 'GET' // or 'PUT'
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
