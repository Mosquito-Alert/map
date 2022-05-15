
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    props: { initView: false }
    // children: [
    //   { path: '', component: () => import('pages/DataView.vue') }
    // ]
  },
  {
    // Set the accepted characters and length of init view code
    path: '/:code([a-zA-Z0-9]{4})*',
    component: () => import('layouts/MainLayout.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
