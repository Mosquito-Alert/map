import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'reports/:uuid?',
        name: 'reports',
        component: () => import('pages/ReportsPage.vue'),
        props: true,
      },
      {
        path: 'discoveries/:speciesCode?',
        name: 'discoveries',
        component: () => import('pages/DiscoveriesPage.vue'),
        props: true,
      },
      {
        path: 'models/:speciesCode?/:date?',
        name: 'models',
        component: () => import('pages/ExposureRiskPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
