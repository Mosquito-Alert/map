import { defineBoot } from '#q-app/wrappers';
import * as Sentry from '@sentry/vue';
import { apiUrl } from './api';

export default defineBoot(({ app, router }) => {
  Sentry.init({
    app,
    dsn: process.env.SENTRY_DSN,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration({ router })],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: ['localhost', apiUrl],
  });
});
