<template>
<!-- G-ZLD12V4W3V -->
    <div class="cookie-comply-container" v-if="complyVisible">
      <vue-cookie-comply
        class="compliance-box"
        :headerTitle="_('Cookie settings')"
        :preferences="preferences"
        @on-accept-all-cookies="onAccept"
      >
        <template v-slot:header>
          <header v-html="_('Cookies comply title')"></header>
          <div>
            {{ _('We use cookies and similar technologies to help personalize content and offer a better experience. You can opt to customize them by clicking the preferences button') }}
          </div>
        </template>

        <template v-slot:modal-body="{ preference }">
          <div v-if="preference.items[0].isRequired">
            <div>
              <h2>{{ _('Tecnical cookies') }}</h2>
              <p> {{ _('Tecnical cookies description') }}</p>
              <div class="cookie-comply__modal-switches">
                <h3>Active</h3><label class="cookie-comply-switch" title="is required">
                  <input id="performance" type="checkbox" disabled="" value="performance">
                  <span class="cookie-comply-slider cookie-comply-round cookie-comply-required"></span>
                </label>
              </div>
            </div>
          </div>
          <div v-else>
            <div>
              <h2>{{ _('Analytics cookie title') }}</h2>
              <p>{{ _('Analytics cookie description') }}</p>
              <div class="cookie-comply__modal-switches">
                <h3>GoogleAnalytics</h3>
                <label class="cookie-comply-switch" title="ga">
                  <input id="ga" type="checkbox" value="ga" @click="analyticsActivated = !analyticsActivated">
                  <span class="cookie-comply-slider cookie-comply-round"></span>
                </label>
              </div>
            </div>
          </div>
        </template>

        <template v-slot:modal-footer>
          <footer class="cookie-comply__modal-footer text-center">
            <button class="cookie-comply__button" @click="savePreferences"> {{ _('Save cookie preferences') }} </button>
          </footer>
        </template>

    </vue-cookie-comply>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
// import VueAnalytics from 'vue3-analytics'

export default {
  setup () {
    const complyVisible = ref(true)
    const analyticsActivated = ref(false)
    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const preferences = [
      {
        title: 'Title',
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

    // Get all accepted cookies and save them in store
    const savePreferences = function (val) {
      // Prevent cookie message appearing next time
      const complied = (val === 'all') ? val : ((analyticsActivated.value) ? ['performance', 'ga'] : ['performance'])
      localStorage['cookie-comply'] = complied
      // ga.enable()
      // if (analyticsActivated.value) {
      //   Vue.$ga.enable()
      // } else {
      //   app.$ga.disable()
      // }
      complyVisible.value = false
    }

    const onAccept = function () {
      savePreferences('all')
    }

    return {
      _,
      complyVisible,
      analyticsActivated,
      preferences,
      savePreferences,
      onAccept
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
.cookie-comply-container header{
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
