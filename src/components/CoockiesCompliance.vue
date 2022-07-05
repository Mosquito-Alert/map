<template>
    <div class="coockie-comply-container">
      <vue-cookie-comply
        class="compliance-box"
        :headerTitle="_('Coockie settings')"
        :headerDescription="_('We use cookies and similar technologies to help personalize content and offer a better experience. You can opt to customize them by clicking the preferences button.')"
        :preferences="preferences"
        @on-accept-all-cookies="onAccept"
        @on-save-cookie-preferences="onSavePreferences"
      />
    </div>
</template>

<script>
import { useStore } from 'vuex'

export default {
  setup () {
    const $store = useStore()
    const preferences = [
      {
        title: 'Performance',
        description:
          'Bla bla serviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer serviços que podemos oferecer.',
        items: [{ label: 'Active', value: 'performance', isRequired: true }]
      },
      {
        title: 'Analytics',
        description:
          'Bla bla serviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer serviços que podemos oferecer.',
        items: [
          { label: 'GoogleAnalytics', value: 'ga' }
          // { label: 'Sentry', value: 'sentry', isEnable: true },
          // { label: 'Mapbox', value: 'mapbox' },
          // { label: 'New Relic', value: 'newRelic', isEnable: true },
          // { label: 'Dog Food', value: 'dogfood' }
        ]
      }
    ]

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const onAccept = function () {
      console.log('accepted')
    }

    const onSavePreferences = function () {
      console.log('accepted')
    }

    return {
      _,
      preferences,
      onAccept,
      onSavePreferences
    }
  }
}
</script>

<style>
.q-layout aside.compliance-box{
  position: absolute;
  bottom: 60px;
  z-index: 1010;
  background-color: #ccc;
}
.compliance-box h3{
  font-size: 2em;
}

.cookie-comply__modal-middle h2,
.cookie-comply__modal-middle h3{
  font-size: 2em;
}
.cookie-comply__modal-content{
  padding: 20px;
}
.cookie-comply__modal-middle .cookie-comply__modal-inner{
  z-index:1020;
}
</style>
