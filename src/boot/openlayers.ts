// import { boot } from 'quasar/wrappers';
import { defineBoot } from '#q-app/wrappers';
import OpenLayersMap from 'vue3-openlayers';

import 'ol/ol.css';
import 'vue3-openlayers/vue3-openlayers.css';
// export default boot(({ app }) => {
export default defineBoot(({ app }) => {
  app.use(OpenLayersMap);
});
