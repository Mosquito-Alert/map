
const routes = [
  // DEFAULT PAGE
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    props: { initView: false }
  },
  // DEFAULT WITH LANG
  {
    path: '/:lang(ca|es|en)',
    component: () => import('layouts/MainLayout.vue'),
    props: { initView: false }
  },
  // MODELS MAP
  {
    path: '/models',
    component: () => import('layouts/ModelsLayout.vue')
  },
  // MODELS WITH LANG
  {
    path: '/models/:lang(ca|es|en)',
    component: () => import('layouts/ModelsLayout.vue')
  },
  // SHARE OBSERVATIONS VIEW
  {
    path: '/:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/MainLayout.vue')
  },
  // SHARE OBSERVATIONS VIEW WITH LANG
  {
    path: '/:code([a-zA-Z0-9]{4})/:lang(ca|es|en)',
    component: () => import('layouts/MainLayout.vue')
  },
  // SHARE MODELS VIEW
  {
    path: '/M-:code([a-zA-Z0-9]{4})',
    component: () => import('layouts/ModelsLayout.vue')
  },
  // SHARE MODELS VIEW WITH LANG
  {
    path: '/M-:code([a-zA-Z0-9]{4})/:lang(ca|es|en)',
    component: () => import('layouts/ModelsLayout.vue')
  },
  {
    // Set the accepted characters and length of reports view
    path: '/:report([a-zA-Z0-9]{6})',
    component: () => import('layouts/ReportsLayout.vue')
  },
  {
    // Set the accepted characters and length of reports view with lang
    path: '/:report([a-zA-Z0-9]{6})/:lang(ca|es|en)',
    component: () => import('layouts/ReportsLayout.vue')
  },
  {
    // Only one feature map (by observation long id)
    path: '/:code([-a-zA-Z0-9]{36})',
    component: () => import('src/layouts/OneFeatureLayout.vue')
  },
  {
    // Only one feature map (by observation long id) with lang
    path: '/:code([-a-zA-Z0-9]{36})/:lang(ca|es|en)',
    component: () => import('src/layouts/OneFeatureLayout.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
