<template>
  <main>
    <header />

    <div />

      <vue-cookie-comply
        :preferences="preferences"
        @on-accept-all-cookies="onAccept"
        @on-save-cookie-preferences="onSavePreferences"
      />

    <footer />
  </main>
</template>

<script>

export default {
  setup () {
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
          { label: 'GoogleAnalytics', value: 'ga' },
          { label: 'Sentry', value: 'sentry', isEnable: true },
          { label: 'Mapbox', value: 'mapbox' },
          { label: 'New Relic', value: 'newRelic', isEnable: true },
          { label: 'Dog Food', value: 'dogfood' }
        ]
      }
    ]

    const onAccept = function () {
      console.log('accepted')
    }

    const onSavePreferences = function () {
      console.log('accepted')
    }

    return {
      preferences,
      onAccept,
      onSavePreferences
    }
  }
}
</script>

<style>
</style>
