
import { DEFAULT_LOCALE, i18n } from 'src/boot/i18n'

const routes = [
  // Redirect any path missing locale to /en/{path}
  {
    path: '/:pathMatch(.*)*',
    beforeEnter: (to, from, next) => {
      const LOCALES = i18n.global.availableLocales
      const pathParts = to.path.split('/').filter(Boolean) // split and remove empty parts

      // Check if first part is a locale
      if (LOCALES.includes(pathParts[0])) {
        next() // already has locale at start, continue
        return
      }

      // Check if last part is a locale
      const lastPart = pathParts[pathParts.length - 1]
      if (LOCALES.includes(lastPart)) {
        // Move locale from end to start
        pathParts.pop() // remove from end
        pathParts.unshift(lastPart) // add at start
        next('/' + pathParts.join('/'))
        return
      }

      // No locale found, prepend default
      next(`/${DEFAULT_LOCALE}${to.fullPath}`)
    }
  },
  // Root locale routes
  {
    path: '/:locale(ca|es|en)',
    component: () => import('layouts/MainLayout.vue')
  },
  {
    path: '/:locale(ca|es|en)/models',
    component: () => import('layouts/ModelsLayout.vue')
  },
  {
    path: '/:locale(ca|es|en)/discoveries',
    component: () => import('layouts/WMSLayout.vue')
  },

  // SHARE OBSERVATIONS VIEW
  {
    path: '/:locale(ca|es|en)/:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/MainLayout.vue')
  },

  // SHARE MODELS VIEW
  {
    path: '/:locale(ca|es|en)/M-:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/ModelsLayout.vue')
  },

  // SHARE distribution VIEW
  {
    path: '/:locale(ca|es|en)/W-:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/WMSLayout.vue')
  },

  // Reports view
  {
    path: '/:locale(ca|es|en)/:report([a-zA-Z0-9]{6})',
    component: () => import('layouts/ReportsLayout.vue')
  },

  // Only one feature map (by observation long id)
  {
    path: '/:locale(ca|es|en)/:code([-a-zA-Z0-9]{36})',
    component: () => import('src/layouts/OneFeatureLayout.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:pathMatch(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
