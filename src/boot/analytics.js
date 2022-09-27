// import { boot } from 'quasar/wrappers'
import VueGtag from 'vue-gtag'
import { useCookies } from 'vue3-cookies'

export default ({ app, router, store }) => {
  const { cookies } = useCookies()
  let enableCookies = false
  if (cookies.get('cookie-comply')) {
    const cookiesArray = cookies.get('cookie-comply').split(',')
    if (cookiesArray.indexOf('ga') > -1 || cookiesArray.indexOf('all') > -1) {
      enableCookies = true
    }
  }

  app.use(VueGtag, {
    config: { id: store.getters['app/getAnalyticsId'] },
    enabled: enableCookies
  })

  app.provide('gtag', app.config.globalProperties.$gtag)
}
