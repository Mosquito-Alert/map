// id: 'G-ZLD12V4W3V',
import { boot } from 'quasar/wrappers'
import VueGtag from 'vue-gtag'
import { VueCookieNext } from 'vue-cookie-next'
// import { VueAnalytics } from 'vue3-analytics'
// import { provide } from 'vue'

export default boot(async ({ app }) => {
  // app.use(VueAnalytics, {
  //   id: 'G-ZLD12V4W3V',
  //   disabled: true
  // })
  // app.provide('ma-analytics', VueAnalytics)
  let state = true
  if (localStorage['cookie-comply']) {
    const cookies = localStorage['cookie-comply'].split(',')
    if (cookies.indexOf('ga') > -1) {
      state = false
    }
  }
  app.use(VueCookieNext)
  app.use(VueGtag, {
    config: { id: 'G-ZLD12V4W3V' },
    enabled: state
  })
  // Will be used later
  app.provide('gtag', app.config.globalProperties.$gtag)
  console.log(state)
  // window['ga-disable-G-ZLD12V4W3V'] = state
  // app.provide('gtag', window['ga-disable-G-ZLD12V4W3V'])
})
