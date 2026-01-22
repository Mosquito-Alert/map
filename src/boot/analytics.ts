import { defineBoot } from '#q-app/wrappers';
import { createGtag } from "vue-gtag";

export default defineBoot(({ app, router }) => {
  const gtag = createGtag({
    tagId: "GTM-MQG3F3J",
    pageTracker: {
      router,
    }
  })

  app.use(gtag);
});
