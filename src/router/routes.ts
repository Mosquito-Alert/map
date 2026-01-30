import { ReportType } from 'src/types/reportType';
import type { RouteRecordRaw } from 'vue-router';

const reportTypeRegex = Object.values(ReportType).join('|');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/reports',
    children: [
      {
        path: 'reports/:uuid([0-9a-fA-F-]{36})',
        name: 'reportsByUuid',
        redirect: (to) => {
          return {
            name: 'reports',
            params: {
              reportType: ReportType.Observation,
              uuid: to.params.uuid,
            },
          };
        },
      },
      {
        path: `reports/:reportType(${reportTypeRegex})?/:uuid([0-9a-fA-F-]{36})?`,
        name: 'reports',
        component: () => import('pages/ReportsPage.vue'),
      },
      {
        path: 'discoveries/:speciesCode?',
        name: 'discoveries',
        component: () => import('pages/DiscoveriesPage.vue'),
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
