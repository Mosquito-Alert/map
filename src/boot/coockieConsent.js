import { boot } from 'quasar/wrappers'
import VueCookieComply from 'vue-cookie-comply'
import 'vue-cookie-comply/dist/style.css'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(VueCookieComply)
})
