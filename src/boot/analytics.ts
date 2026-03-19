import { defineBoot } from '#q-app/wrappers';
import { createConsentPlugin } from '@structured-world/vue-privacy/vue';

export default defineBoot(({ app, router }) => {
  const gtag = createConsentPlugin({
    gaId: 'GTM-MQG3F3J',
    euDetection: 'auto',
    router: router,
    banner: {
      privacyLink: 'https://app.mosquitoalert.com/legal/privacy',
    },
  });

  const root = document.documentElement;

  const primaryColor = getComputedStyle(document.body).getPropertyValue('--q-primary').trim();
  const font = getComputedStyle(document.body).getPropertyValue('font-family').trim();

  root.style.setProperty('--consent-btn-accept-bg', primaryColor);
  root.style.setProperty('--consent-link', primaryColor);
  root.style.setProperty('--consent-font', font);

  app.use(gtag);
});
