<template>
  <div>
      <q-select
        hint="Hint available"
        v-model="searchString"
        use-input
        input-debounce="0"
        :label="_('Placeholder location')"
        :options="searchOptions"
        style="width: 250px"
        color="orange"
        clearable
        @filter="search"
        @keyup.enter="enterPressed"
        @update:model-value="filterLocation"
        :loading="loading"
        ref="mySelect"
      >
      </q-select>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  props: [],
  emits: ['locationSelected'],
  setup (props, context) {
    const searchOptions = ref(null)
    const searchString = ref()
    const loading = ref(null)
    const model = ref(null)
    const $store = useStore()
    const mySelect = ref()
    const enterPressed = function (e) {
      console.log(e)
    }
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const search = function (val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }
      update(() => {
        loading.value = true
        fetch(`https://nominatim.openstreetmap.org/search?q=${val}&format=json&polygon_geojson=1&addressdetails=1`)
          .then(res => res.json())
          .then(res => {
            // Get only polygon and multipolygons
            const polygons = res.filter(feature => {
              return feature.geojson.type.toLowerCase().indexOf('polygon') > -1
            })
            const results = []
            polygons.forEach(function (feature) {
              results.push({
                label: feature.display_name,
                labelShort: feature.display_name.substring(0, 10) + '...',
                value: feature
              })
            })
            loading.value = false
            searchOptions.value = results
          })
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
      mySelect,
      enterPressed,
      searchString,
      searchOptions,
      model,
      loading,
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
