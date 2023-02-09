export default class MSession {
  constructor (backend, csrftoken) {
    this.backend = backend
    this.csrfToken = csrftoken
  }

  getCSRF (callback) {
    const _this = this
    fetch(_this.backend + 'api/csrf/', {
      credentials: 'include'
    })
      .then((res) => {
        const csrfToken = res.headers.get('X-CSRFToken')
        _this.csrfToken = csrfToken
        callback()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  getSession (callback) {
    const _this = this
    fetch(_this.backend + 'api/session/', {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated && _this.csrfToken !== null) {
          callback()
          console.log(true)
        } else {
          _this.getCSRF(callback)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
