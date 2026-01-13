import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { DEFAULT_LOCALE, i18n } from 'src/boot/i18n'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  // Locale guard + default locale redirect
  Router.beforeEach((to, from, next) => {
    let locale = to.params.locale

    // fallback to default locale if missing or invalid
    if (!['en', 'es', 'ca'].includes(locale)) {
      locale = DEFAULT_LOCALE
    }

    // Set i18n locale if different
    if (i18n.global.locale.value !== locale) {
      i18n.global.locale.value = locale
    }

    next()
  })

  return Router
})
