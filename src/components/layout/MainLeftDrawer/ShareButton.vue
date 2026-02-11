<template>
  <q-btn stack icon="fa fat fa-share-nodes" @click="handleClick" />
</template>

<script lang="ts">

import { copyToClipboard, useQuasar } from 'quasar'
import { useI18n } from "vue-i18n"

export default {
  setup() {
    const $q = useQuasar()
    const { t } = useI18n()

    return {
      handleClick() {
        copyToClipboard(window.location.href)
          .then(() => {
            $q.notify({
              type: 'positive',
              message: t('url_copied'),
              icon: 'fa fat fa-clipboard',
              actions: [
                { icon: 'close', color: 'white', round: true }
              ]
            })
          })
          .catch(() => {
            console.log('Failed coping URL to clipboard')
          })
      }
    }
  }

}
</script>
