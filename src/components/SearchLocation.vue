<template>
  <div>
      <q-input
        ref="inputLocation"
        v-model="searchString"
        :label="error?_('No results found'):_('Placeholder location')"
        :color="(filterIsActive && loading)?'white':'orange'"
        class="search-location"
        :loading="loading"
        :filled="filterIsActive"
        @focus="checkResults"
        @keyup="throttle"
        @keyup.down.exact.prevent="selectItem(0)"
        @update:model-value="resetResults"
        @clear="resetFilter"
      >
        <template v-if="filterIsActive && !loading" v-slot:append>
          <q-icon name="cancel" @click="resetFilter" class="cancel-pointer" />
        </template>
      </q-input>
      <q-list
        tabindex="0"
        ref="locationsList"
        v-if="isVisible"
        bordered separator class="locations-list"
        @keydown.esc.exact="hideResults"
        v-click-away="clickAway"
      >
        <q-item
          clickable
          v-ripple
          :ref="setItemRef"
          v-for="result, index in results" :key="index"
          @click="filterLocation(result)"
          @keyup.enter="filterLocation(result)"
          @keydown.up.exact.prevent="selectItem(index-1)"
          @keydown.down.exact.prevent="selectItem(index+1)"
        >
          {{ result.display_name}}
        </q-item>
      </q-list>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { mixin as VueClickAway } from 'vue3-click-away'

export default {
  props: [],
  emits: ['locationSelected', 'locationCleared'],
  mixins: [VueClickAway],
  setup (props, context) {
    let itemRefs = []
    const inputLocation = ref()
    const searchOptions = ref()
    const filterIsActive = ref(false)
    const searchString = ref()
    const isVisible = ref(false)
    const loading = ref(false)
    const model = ref()
    const $store = useStore()
    const results = ref([])
    const error = ref(false)
    let keyUpTimer = null
    const keyUpDelay = 500

    const setSearchString = function (v) {
      searchString.value = v
    }

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const clickAway = function (event) {
      if (!inputLocation.value.$el.contains(event.target)) {
        hideResults()
      }
    }

    function throttle (f, delay) {
      if (keyUpTimer) {
        clearTimeout(keyUpTimer)
        keyUpTimer = null
      }
      keyUpTimer = setTimeout(search, keyUpDelay)
    }

    const search = function () {
      loading.value = true
      const controller = new AbortController()
      const { signal } = controller
      const lang = $store.getters['app/getLang']

      // viewbox=<x1>,<y1>,<x2>,<y2>
      // bounded=[0|1]

      let url = `https://nominatim.openstreetmap.org/search?q=${searchString.value}`
      url += `&polygon_threshold=0.001&format=json&polygon_geojson=1&addressdetails=1&accept-language=${lang}`
      // Check for viewBox parameter in store
      const viewBox = $store.getters['map/getViewbox']
      if (viewBox.length) {
        url += '&viewbox=' + viewBox.join(',')
      }
      fetch(url,
        { signal })
        .then(res => res.json())
        .then(res => {
          // Get only polygon and multipolygons
          const polygons = res.filter(feature => {
            return feature.geojson.type.toLowerCase().indexOf('polygon') > -1
          })
          results.value = []
          polygons.forEach(function (feature) {
            results.value.push(feature)
          })
          if (!results.value.length) {
            error.value = true
          }
          loading.value = false
          isVisible.value = true
          itemRefs = []
          clearTimeout(keyUpTimer)
        })
        .catch(e => {
          loading.value = false
          error.value = true
        })
    }

    const filterLocation = function (location) {
      searchString.value = location.display_name
      isVisible.value = false
      filterIsActive.value = true
      context.emit('locationSelected', {
        location: location
      })
    }

    const setItemRef = function (el) {
      if (el) {
        itemRefs.push(el)
      }
    }
    const hideResults = function () {
      isVisible.value = false
    }

    const selectItem = function (index) {
      if (itemRefs[index]) {
        itemRefs[index].$el.focus()
      }
    }

    const checkResults = function () {
      if (results.value.length) {
        isVisible.value = true
      }
    }

    const resetResults = function () {
      hideResults()
      results.value = []
      error.value = false
      if (searchString.value === '') {
        inputLocation.value.$el.focus()
        filterIsActive.value = false
        context.emit('locationCleared')
      }
    }

    const resetFilter = function () {
      inputLocation.value.$el.focus()
      filterIsActive.value = false
      searchString.value = ''
      resetResults()
      context.emit('locationCleared')
    }

    return {
      _,
      throttle,
      error,
      searchString,
      setSearchString,
      searchOptions,
      model,
      loading,
      search,
      filterLocation,
      results,
      setItemRef,
      hideResults,
      selectItem,
      isVisible,
      checkResults,
      resetResults,
      resetFilter,
      filterIsActive,
      clickAway,
      inputLocation
    }
  }
}
</script>

<style scoped lang="scss">
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
.search-location button{
  background: $primary-color;
  color: white;
}
.locations-list{
  position: absolute;
  background: white;
  z-index:2000;
}
.q-item:focus{
  color: $primary-color;
}
:deep(.q-field--filled.search-location input){
  color: white !important;
}
.q-field--filled.search-location{
  background: $primary-color;
  color: white;
  border-radius: 4px;
}
.q-field--highlighted,
.q-field--highlighted .q-field__label {
  color: unset;
}

.cancel-pointer{
  opacity: 1;
  color: white;
}
</style>
