// import { boot } from 'quasar/wrappers';
import { defineBoot } from '#q-app/wrappers';
import OpenLayersMap from 'vue3-openlayers';

import 'vue3-openlayers/styles.css';

// export default boot(({ app }) => {
export default defineBoot(({ app }) => {
  app.use(OpenLayersMap);
});
