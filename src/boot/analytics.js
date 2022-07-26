// import { boot } from 'quasar/wrappers'
import VueGtag from 'vue-gtag'
import { useCookies } from 'vue3-cookies'
// import { useStore } from 'vuex'
// import { VueCookieNext } from 'vue-cookie-next'
// import { VueAnalytics } from 'vue3-analytics'
// import { provide } from 'vue'

export default ({ app, router, store }) => {
// export default boot(async ({ app }) => {
  // app.use(VueAnalytics, {
  //   id: 'G-ZLD12V4W3V',
  //   disabled: true
  // })
  // app.provide('ma-analytics', VueAnalytics)
  const { cookies } = useCookies()
  let enableCookies = false
  if (cookies.get('cookie-comply')) {
    const cookiesArray = cookies.get('cookie-comply').split(',')
    if (cookiesArray.indexOf('ga') > -1 || cookiesArray.indexOf('all') > -1) {
      enableCookies = true
    }
  }
  // window['ga-disable-G-ZLD12V4W3V'] = !enableCookies
  // window['ga-disable-G-RT6ZXWX8PS'] = !enableCookies
  // app.use(VueCookieNext)
  app.use(VueGtag, {
    // config: { id: 'G-ZLD12V4W3V' },
    config: { id: store.getters['app/getAnalyticsId'] },
    enabled: enableCookies
  })
  // Will be used later
  app.provide('gtag', app.config.globalProperties.$gtag)
  // window['ga-disable-G-ZLD12V4W3V'] = state
  // app.provide('gtag', window['ga-disable-G-ZLD12V4W3V'])
}
