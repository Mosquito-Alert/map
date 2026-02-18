<template>
  <q-btn-dropdown icon="fa fat fa-language" dropdown-icon="fa fat fa-angle-right" menu-self="bottom left">
    <q-list class="text-center">
      <q-item v-for="(item, index) in localeOptions" :key="index" clickable v-ripple v-close-popup
        active-class="bg-primary text-white" :active="locale === item.value" @click="locale = item.value">
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">

import { useQuasar } from 'quasar'
import languages from 'quasar/lang/index.json'
import { useRouteParams } from '@vueuse/router';

import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import enabledLanguages from 'src/i18n'

const modules = import.meta.glob(`../../node_modules/quasar/lang/*.js`)

export default {
  setup() {
    const $q = useQuasar()
    const { locale } = useI18n({ useScope: 'global' })

    const localeQuery = useRouteParams<string>('locale')
    watch(localeQuery, (newValue) => {
      if (!newValue) {
        newValue = 'en-US'
      }
      if (newValue && newValue in enabledLanguages && locale.value !== newValue) {
        locale.value = newValue as keyof typeof enabledLanguages
      }
    }, { immediate: true })

    watch(locale, (newValue,) => {
      // Both vue-i18n and quasar app must be set.
      $q.cookies.set('language', newValue, { path: '/', secure: false })
      localeQuery.value = newValue
      modules[`../../node_modules/quasar/lang/${newValue}.js`]?.().then(langModule => {
        const lang = langModule as { default: typeof $q.lang }
        $q.lang.set(lang.default)
      }).catch(() => {
        console.warn(`Language ${newValue} is not supported by Quasar.`)
      })
    })

    return {
      locale,
      localeOptions: Object.keys(enabledLanguages).map(isoName => ({
        value: isoName, label: languages.filter(lang => lang.isoName === isoName)[0]?.nativeName
      }))
    }
  }
}
</script>
