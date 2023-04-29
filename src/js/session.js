import axios from 'axios'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'

export default class MSession {
  constructor (backend, csrftoken) {
    this.backend = backend
    this.csrfToken = csrftoken
  }

  getCSRF (callback) {
    const _this = this
    axios(_this.backend + 'api/csrf/', {
      withCredentials: true
    })
      .then((resp) => {
        if (resp.status === STATUS_CODES.OK) {
          const csrfToken = resp.headers.get('X-CSRFToken')
          _this.csrfToken = csrfToken
          callback()
        } else {
          console.log(resp.status)
        }
      })
  }

  getSession (callback) {
    const _this = this
    axios(_this.backend + 'api/session/', {
      withCredentials: true
    })
      .then((resp) => {
        if (resp.status === STATUS_CODES.OK) {
          if (resp.data.isAuthenticated && _this.csrfToken !== null) {
            callback()
          } else {
            _this.getCSRF(callback)
          }
        } else {
          console.log(resp.status)
        }
      })
  }
}
