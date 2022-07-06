// id: 'G-ZLD12V4W3V',
import { boot } from 'quasar/wrappers'
import { VueAnalytics } from 'vue3-analytics'

export default boot(async ({ app }) => {
  app.use(VueAnalytics, {
    id: 'G-ZLD12V4W3V',
    disabled: true
  })

  // const ga = VueAnalytics({
  //   id: 'G-ZLD12V4W3V',
  //   disabled: true
  // })

  // app.use(ga)
})
