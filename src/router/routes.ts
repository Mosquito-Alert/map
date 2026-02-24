import { ReportType } from 'src/types/reportType';
import type { RouteRecordRaw } from 'vue-router';

import { DEFAULT_LOCALE, i18n } from 'src/boot/i18n';

const reportTypeRegex = Object.values(ReportType).join('|');

const routes: RouteRecordRaw[] = [
  {
    path: '/:locale?',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/reports',
    beforeEnter: (to, from, next) => {
      const LOCALES = i18n.global.availableLocales;
      const pathParts = to.path.split('/').filter(Boolean); // split and remove empty parts

      // Check if first part is a locale
      let firstPart = pathParts[0];
      if (firstPart === 'en') {
        firstPart = 'en-US';
      }
      if (firstPart && LOCALES.includes(firstPart as (typeof LOCALES)[number])) {
        next(); // already has locale at start, continue
        return;
      }

      // Check if last part is a locale
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && LOCALES.includes(lastPart as (typeof LOCALES)[number])) {
        // Move locale from end to start
        pathParts.pop(); // remove from end
        pathParts.unshift(lastPart); // add at start
        next('/' + pathParts.join('/'));
        return;
      }

      // No locale found, prepend default
      next(`/${DEFAULT_LOCALE}${to.fullPath}`);
    },
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
