
const routes = [
  // REPORT PAGE
  {
    path: '/:lang(\\w{2})?/reports',
    alias: '/:lang(\\w{2})?',
    name: 'reports',
    component: () => import('layouts/MainLayout.vue')
  },
  // DISTRIBUTION WITH LANG
  {
    path: '/:lang(\\w{2})?/distribution',
    redirect: { path: '/early_warning/', permanent: true }
  },
  // Old WMS share permalink
  {
    path: '/:lang(\\w{2})?/W-:code([a-zA-Z0-9]{4})',
    redirect: { path: '/early_warning/', permanent: true }
  },
  // EARLY WARNING LANG
  {
    path: '/:lang(\\w{2})?/early_warning/:speciesCode?',
    component: () => import('layouts/WMSLayout.vue'),
    name: 'early_warning',
    props: true
  },
  // MODELS TAB
  {
    path: '/:lang(\\w{2})?/models/:speciesCode?/:year(\\d{4})?/:month(\\d{2})?',
    component: () => import('layouts/ModelsLayout.vue'),
    name: 'models',
    props: (route) => ({
      ...route.params,
      year: route.params.year ? parseInt(route.params.year) : undefined,
      month: route.params.month ? parseInt(route.params.month) : undefined
    })
  },
  // Old shared model permalink
  {
    path: '/:lang(\\w{2})?/M-:code([a-zA-Z0-9]{4})',
    redirect: { path: '/models/', permanent: true }
  },
  // SHARE OBSERVATIONS VIEW
  {
    path: '/:lang(\\w{2})?/:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/MainLayout.vue')
  },
  {
    // Set the accepted characters and length of reports view
    path: '/:lang(\\w{2})?/report(s)?/:report([a-zA-Z0-9]{6})',
    component: () => import('layouts/ReportsLayout.vue')
  },
  {
    // Only one feature map (by observation long id)
    path: '/:lang(\\w{2})?/report(s)?/:code([-a-zA-Z0-9]{36})',
    component: () => import('src/layouts/OneFeatureLayout.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:pathMatch(.*)',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
