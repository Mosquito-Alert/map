<template>
  <div>
    <q-input @keyup.enter="search" v-model="term" :label="_('Placeholder location')" />
     <!-- <q-select
        outlined
        bottom-slots
        v-model="results"
        :options="options"
        :label="_('Placeholder location')"
        :dense="dense"
        :options-dense="denseOpts"
        use-input
        @keyup.enter="search"
      >
        <template v-slot:append>
          <q-icon name="search" @click.stop />
        </template>

        <template v-slot:hint>
          Field hint
        </template>
      </q-select> -->

    <div>
      <ul v-for="result, id in results" :key="id" class="result">
          <li @click="filterLocation(result)"> {{result.display_name}} </li>
      </ul>
    </div>
    <div v-if="noResults">
        Sorry, but no results were found. I blame Apple.
    </div>

    <div v-if="searching">
        <i>{{ _('Searching ...') }}</i>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  props: [],
  emits: ['locationSelected'],
  setup (props, context) {
    const term = ref(null)
    const results = ref(null)
    const noResults = ref(null)
    const searching = ref(null)

    results.value = []
    noResults.value = false
    searching.value = false

    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const search = function () {
      searching.value = true
      fetch(`https://nominatim.openstreetmap.org/search?q=${term.value}&format=json&polygon_geojson=1&addressdetails=1`)
        .then(res => res.json())
        .then(res => {
          searching.value = false
          // Get only polygon and multipolygons
          const polygons = res.filter(feature => {
            return feature.geojson.type.toLowerCase().indexOf('polygon') > -1
          })
          results.value = polygons
          noResults.value = results.value.length === 0
        })
    }

    const filterLocation = function (result) {
      context.emit('locationSelected', {
        location: result
      })
    }

    return {
      _,
      term,
      results,
      noResults,
      searching,
      search,
      filterLocation
    }
  }
}
</script>

<style lang="scss">
input{
  width:80%;
  border: 1px solid $grey-color;
  line-height: 1.5rem;
}

.toc-layers input::placeholder {
  color: #666666;
  font-size: 0.9em;
}

.toc-layers .filters input{
  padding: 3px 10px;
  border-radius:10px;
  margin-top:10px;
}

.toc-layers .filters button{
  padding: 3px 10px;
  background-color: $primary-button-background;
  color: white;
  border: 0px;
  border-radius:5px;
  margin-left: 3px;
}

</style>
