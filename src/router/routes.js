
import { DEFAULT_LOCALE } from 'src/boot/i18n'

const routes = [
  // Redirect any path missing locale to /en/{path}
  {
    path: '/:pathMatch(.*)*',
    beforeEnter: (to, from, next) => {
      // Check if the path already starts with a valid locale
      if (/^\/(ca|es|en)(\/|$)/.test(to.path)) {
        next() // already has a locale, continue normally
      } else {
        next(`/${DEFAULT_LOCALE}${to.fullPath}`) // prepend /en
      }
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
