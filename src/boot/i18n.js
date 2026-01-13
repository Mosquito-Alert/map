import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export const DEFAULT_LOCALE = 'en'

export const i18n = createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  legacy: false,
  globalInjection: true,
  missing: (locale, key, vm) => {
  // Return key itself to avoid errors
    return key
  },
  messages
})

export default boot(({ app }) => {
  app.use(i18n)
})
