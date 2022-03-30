<template>
  <div>
     <q-select
        ref="llista"
        bottom-slots
        :options="results"
        :label="_('Placeholder location')"
        use-input
        @keyup.enter="search"
        @input-value="setSearchWord"
        option-label="label"
        option-value="value"
        v-model="model"
        clearable
        @update:model-value="filterLocation"
      >
        <template v-slot:append>
          <q-icon name="search" @click.stop />
        </template>

        <template v-slot:hint>
          Field hint
        </template>
      </q-select>
    <!-- <q-input @keyup.enter="search" v-model="term" :label="_('Placeholder location')" />
    <div>
      <ul class="result" ref="llista">
          <li
            v-for="result, id in results" :key="id"
            @click="filterLocation(result)"
          >
            {{result.display_name}}
           </li>
      </ul>
    </div>
    <div v-if="noResults">
        Sorry, but no results were found. I blame Apple.
    </div>

    <div v-if="searching">
        <i>{{ _('Searching ...') }}</i>
    </div> -->
  </div>
</template>
<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  props: [],
  emits: ['locationSelected'],
  setup (props, context) {
    const llista = ref(null)
    const term = ref(null)
    const results = ref(null)
    const noResults = ref(null)
    const searching = ref(null)
    const model = ref(null)

    results.value = []
    noResults.value = false
    searching.value = false

    const $store = useStore()

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const setSearchWord = function (e) {
      term.value = e
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
          results.value = []
          polygons.forEach(function (feature) {
            results.value.push({
              label: feature.display_name,
              labelShort: feature.display_name.substring(0, 10) + '...',
              value: feature
            })
          })
          noResults.value = results.value.length === 0
        })
    }

    const filterLocation = function (res) {
      let locationValue = null
      if (res) {
        locationValue = res.value
      }
      context.emit('locationSelected', {
        location: locationValue
      })
    }

    return {
      _,
      llista,
      model,
      setSearchWord,
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
