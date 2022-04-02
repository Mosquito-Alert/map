<template>
  <div>
      <q-input
        ref="inputLocation"
        v-model="searchString"
        :label="_('Placeholder location')"
        color="orange"
        class="search-location"
        clearable
        :loading="loading"
        :filled="filterIsActive"
        @focus="checkResults"
        @keyup.enter="search"
        @keyup.down.exact.prevent="selectItem(0)"
        @update:model-value="resetResults"
        @clear="resetFilter"
      />
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
  emits: ['locationSelected'],
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

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const clickAway = function (event) {
      if (!inputLocation.value.$el.contains(event.target)) {
        hideResults()
      }
    }

    const search = function () {
      loading.value = true
      fetch(`https://nominatim.openstreetmap.org/search?q=${searchString.value}&format=json&polygon_geojson=1&addressdetails=1`)
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
          loading.value = false
          isVisible.value = true
          itemRefs = []
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
    }

    const resetFilter = function () {
      resetResults()
      filterLocation(null)
      filterIsActive.value = false
    }

    return {
      _,
      searchString,
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
.search-location .btn {
  background:none;
  color: #efa501;
}
.locations-list{
  position: absolute;
  background: white;
  z-index:2000;
}
.q-item:focus{
  color: $primary-color;
}
</style>
