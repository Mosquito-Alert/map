// id: 'G-ZLD12V4W3V',
import { boot } from 'quasar/wrappers'
import VueGtag from 'vue-gtag'
// import { VueCookieNext } from 'vue-cookie-next'
// import { VueAnalytics } from 'vue3-analytics'
// import { provide } from 'vue'

export default boot(async ({ app }) => {
  // app.use(VueAnalytics, {
  //   id: 'G-ZLD12V4W3V',
  //   disabled: true
  // })
  // app.provide('ma-analytics', VueAnalytics)
  let enableCookies = false
  if (localStorage['cookie-comply']) {
    const cookies = localStorage['cookie-comply'].split(',')
    if (cookies.indexOf('ga') > -1 || cookies.indexOf('all') > -1) {
      enableCookies = true
    }
  }
  window['ga-disable-G-ZLD12V4W3V'] = !enableCookies
  // window['ga-disable-G-RT6ZXWX8PS'] = !enableCookies
  // app.use(VueCookieNext)
  app.use(VueGtag, {
    config: { id: 'G-ZLD12V4W3V' },
    // config: { id: 'G-RT6ZXWX8PS' },
    enabled: enableCookies
  })
  // Will be used later
  app.provide('gtag', app.config.globalProperties.$gtag)
  console.log(enableCookies)
  // window['ga-disable-G-ZLD12V4W3V'] = state
  // app.provide('gtag', window['ga-disable-G-ZLD12V4W3V'])
})
