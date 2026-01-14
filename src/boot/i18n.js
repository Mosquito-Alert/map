import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { useCookies } from 'vue3-cookies'

const { cookies } = useCookies()

export const DEFAULT_LOCALE = cookies.get('lang') || 'en'

export const i18n = createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: 'en',
  legacy: false,
  globalInjection: true,
  messages
})

export default boot(({ app }) => {
  app.use(i18n)
})
