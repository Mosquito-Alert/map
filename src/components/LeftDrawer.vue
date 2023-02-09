<!--
  THIS COMPONENT CONTAINS
  - MAIN MENU TOOLS
  - TABLE OF CONTENTS FOR MAP OBSERVATIONS WITH FILTERS FOR ADMINISTRATIVE LOCATIONS, HASHTAGS AND CITIZEN OBSERVATIONS
  - SAMPLING EFFORT SWITCHER
-->

<template>
  <q-drawer
    show-if-above
    side="left"
    behavior="desktop"
    width=""
    v-touch-swipe.mouse.left="toggleLeftDrawer"
  >
    <!-- Main menu -->
    <left-menu item="layers" @leftMenuMounted="callFirstMapCall"/>

    <!-- Drawer content -->
    <div class="toc-layers"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile" class="text-right">
        <q-btn :label="_('Close')" class="ma-close-btn q-ma-md" @click="toggleLeftDrawer"/>
      </div>
      <div class="toc-card filters">
        <div class="text-h5 toc-title-reports" v-html="_('Reports')"></div>
          <search-location
            ref="searchLocation"
            @locationSelected="locationSelected"
            @locationCleared="locationCleared"
          />
          <filter-hastags
            ref="hashtags"
            @tagsModified="tagsModified"
          />
      </div>

      <div class="toc-category">
        <div class="toc-title" v-html="_('Mosquitos')"></div>
      </div>

      <div class="category-box">
        <div class="item-container" v-for="layer, code in observations" :key="code" >
          <div class="content">
            <div class="li-item"
              @click="filterObservations(layer, $event)"
              data-type="observations"
              :data-code="code"
              :class="initialClass(code, 'observations')"
            ></div>
            <div v-text="_(layer.common_name)" class="toc-item-name">
            </div>
          </div>
          <div class="separator" :class="{ 'active': layer.separator }"></div>
        </div>
      </div>

      <!-- BITES AND BREEDING SITES-->
      <div class="toc-category">
          <div class="bites-title" v-html="_('Breeding sites')"></div>
      </div>

      <div class="category-box bites-and-breeding">
          <!-- BREEDING SITES -->
          <div class="item-container" v-for="layer, code in breeding" :key="code">
              <div class="content breeding">
                <div
                  class="li-item"
                  @click="filterObservations(layer, $event)"
                  data-type="breeding"
                  :data-code="code"
                  :class="initialClass(code, 'breeding')"
                >
                    <i :class="layer.faIcon"></i>
                </div>
                <div v-text="_(layer.common_name)" class="toc-item-name"></div>
              </div>
              <div class="separator" :class="{ 'active': layer.separator }"></div>
          </div>
      </DIV>

      <div class="toc-category">
          <div class="bites-title" v-html="_('Bites')"></div>
      </div>
      <div class="category-box bites-and-breeding">
          <!-- BITES -->
          <div class="item-container" v-for="layer, code in bites" :key="code">
            <div class="content bites">
              <div class="li-item"
                @click="filterObservations(layer, $event)"
                data-type="bites"
                :data-code="code"
                :class="initialClass(code, 'bites')"
              >
                  <i class="fa-solid" :class="layer.faIcon"></i>
              </div>
              <div v-text="_(layer.common_name)" class="toc-item-name"></div>
            </div>
            <div class="separator" :class="{ 'active': layer.separator }"></div>
          </div>
        </div>

      <!-- OTHER OBSERVATIONS -->
      <div class="toc-category">
        <div class="toc-title" v-html="_('Other species')"></div>
      </div>

      <div class="category-box other-species">
        <div class="item-container" v-for="layer, code in otherObservations" :key="code">
          <div class="content">
            <div class="li-item"
              @click="filterObservations(layer, $event)"
              data-type="otherObservations"
              :data-code="code"
              :class="initialClass(code, 'otherObservations')">
            </div>
            <div v-text="_(layer.common_name)" class="toc-item-name"></div>
          </div>
          <div class="separator" :class="{ 'active': layer.separator }"></div>
        </div>
      </div>

      <div class="fill-space"></div>
      <!-- SAMPLIING EFFORT -->
        <div class="toc-category last">
          <div class="toc-title" v-html="_('Sampling effort')"></div>
        </div>
        <div class="category-box">
          <sampling-effort ref="samplingEffort"
            title="fa-light fa-gauge-max"
            @samplingEffort="toggleSamplingEffort"
          ></sampling-effort>
        </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'
import SamplingEffort from 'components/SamplingEffort.vue'
import SearchLocation from 'components/SearchLocation.vue'
import FilterHastags from './FilterHastags.vue'

export default {
  components: { LeftMenu, SamplingEffort, SearchLocation, FilterHastags },
  emits: ['filterObservations', 'filterLocations', 'clearLocations', 'toggleSamplingEffort', 'firstMapCall'],
  props: ['expanded'],
  setup (props, context) {
    const searchLocation = ref()
    const hashtags = ref()
    const samplingEffort = ref(null)
    const $store = useStore()

    // Get a copy of layers from store to get categories
    const layers = computed(() => {
      return JSON.parse(JSON.stringify($store.getters['app/getLayers']))
    })

    // Set active and inactive layers
    const filterObservations = function (layer, event) {
      let obj = event.target
      if (!event.target.dataset.type) {
        obj = obj.closest('.li-item')
      }

      context.emit('filterObservations', {
        type: obj.dataset.type,
        code: obj.dataset.code,
        categories: layers.value[obj.dataset.type][obj.dataset.code].categories
      })

      const classes = obj.classList
      if (classes.contains('active')) {
        classes.remove('active')
        if (obj.querySelector('img')) {
          obj.querySelector('img').src = layer.icon_disabled
        }
      } else {
        classes.add('active')
        if (obj.querySelector('img')) {
          obj.querySelector('img').src = layer.icon
        }
      }
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const mouseEnter = function (layer, event) {
      const obj = event.target
      obj.querySelector('img').src = layer.icon
    }

    const mouseOut = function (layer, event) {
      const obj = event.target
      obj.querySelector('img').src = layer.icon_disabled
    }

    const initialClass = function (code, type) {
      const initialLayers = JSON.parse(JSON.stringify($store.getters['app/initialLayers']))
      const isInitial = initialLayers.find(initialLayer => {
        return initialLayer.code === code && initialLayer.type === type
      })

      let cls = code
      if (isInitial) cls += ' active'
      return cls
    }

    const observations = computed(() => {
      return $store.getters['app/layers'].observations
    })

    const breeding = computed(() => {
      return $store.getters['app/layers'].breeding
    })

    const otherObservations = computed(() => {
      return $store.getters['app/layers'].otherObservations
    })

    const bites = computed(() => {
      return $store.getters['app/layers'].bites
    })

    // Language functions
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const setTags = function (tags) {
      hashtags.value.setTags(tags)
    }

    // Fired when user selects an administrative filter
    const locationSelected = function (location) {
      let geojson = null
      if (location.location !== null) {
        const loc = location.location
        const displayName = loc.display_name
        const bb = loc.boundingbox
        const bounding = [bb[2], bb[0], bb[3], bb[1]]
        geojson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                boundingBox: bounding,
                displayName: displayName
              },
              geometry: loc.geojson
            }
          ]
        }
      }
      // Trigger event to show the selected geometry on map
      context.emit('filterLocations', geojson)
    }

    const toggleSamplingEffort = function (payload) {
      context.emit('toggleSamplingEffort', payload)
      samplingEffort.value.isActive = payload.status
    }

    const locationCleared = function () {
      context.emit('clearLocations')
    }

    const tagsModified = function (tags) {
      context.emit('filterTags', tags)
    }

    // Show selection on form
    const setLocationName = function (name) {
      searchLocation.value.searchString = name
      searchLocation.value.filterIsActive = true
    }

    // Called when user folds/unfolds the component
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    return {
      callFirstMapCall,
      mobile,
      toggleLeftDrawer,
      hashtags,
      setTags,
      samplingEffort,
      searchLocation,
      setLocationName,
      initialClass,
      filterObservations,
      tagsModified,
      observations,
      breeding,
      bites,
      otherObservations,
      mouseEnter,
      mouseOut,
      locationSelected,
      locationCleared,
      toggleSamplingEffort,
      _
    }
  }
}
</script>

<style scoped lang="scss">
.q-header,
.q-drawer{
  width: $left-drawer-width;
  z-index:1200;
}
.q-drawer {
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  .q-toolbar {
    box-shadow: 2px 0 4px rgba(0,0,0,0.25), 1px 0 1px rgba(0,0,0,0.22);
    background: white;
    height: 100%;
    width: 60px;
    top: 0px;
    bottom: 0px;
    flex-direction: column;
    .q-toolbar__title {
      padding: 28px;
      border-top: 1px solid $grey-color;
    }
  }
}
:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  width: $left-drawer-width;
}

.collapsed :deep(.q-drawer__content.fit){
  width: 60px !important;
}

.toc-layers{
  overflow-y:auto;
  display:flex;
  flex-direction: column;
  z-index: 1200;
}

.toc-layers::-webkit-scrollbar {
    height: 12px;
    width: 4px;
    background: #ccc;
}

.toc-layers::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}

* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.fill-space{
  flex-grow:1;
}

.toc-card{
  padding: 10px 10px 0px 20px;
}

.toc-category{
  display:flex;
  align-items:center;
}
.toc-category,
.toc-card.filters{
  padding: 20px 10px 0px 18px;
  margin-bottom: 10px;
}

.breeding-column .toc-category{
  padding-left: 18px;
}

.toc-title-reports{
  font-family: 'Roboto';
  text-transform: Capitalize;
  font-weight: 700;
  color: #666666;
}
.toc-title{
  font-family: 'Roboto';
  text-transform: uppercase;
  font-weight: 700;
  color: #666666;
}

.toc-title .input,
.bites-title{
  min-width:55px;
}

.breeding-title{
  margin-left: 10px;
}
.bites-title,
.breeding-title{
  display:inline;
  font-family: "Roboto";
  text-transform: uppercase;
  font-weight: 700;
  color: #666666;
}
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

.category-box{
  display: flex;
  flex-wrap: wrap;
  padding-left:10px;
}

.category-box.other-species{
  margin-bottom:20px;
}

.toc-layers ul li div{
  text-align:center;
}

.li-item i{
  display: block;
  margin:auto;
  padding: 6px;
  width:35px;
}

.content.bites .li-item.active i{
  padding:8px 6px;
  border-radius:50%;
  font-size:1.2rem;
}

.content.bites .li-item.active i{
  background-color:  $color-bites;
  color: $text-color-bites;
}

.content.bites .li-item i{
  background-color:  #e6e6e6;
  color: white;
  padding:8px 6px;
  border-radius:50%;
  font-size:1.2rem;
}

.content.breeding .li-item i{
  background-color: #e6e6e6;
  color: white;
  border-radius:50%;
  font-size:1.5em;
  padding: 8px 6px;
}

.content.breeding .li-item.active i {
  background-color:  $color-breeding;
  color: $text-color-breeding;
}

.content.breeding .li-item i{
  background-color: #e6e6e6;
  color: white;
  border-radius: 4px;
  font-size:1.5em;
}

.content.breeding .li-item .fa-droplet-slash{
  padding-left: 4px;
}

.item-container{
  // margin-right: 5px;
  display: flex;
  width:24%;
  position:relative;
}

.item-container.item-separator{
  display:inline;
}

.item-container .content{
  display:flex;
  flex-direction:column;
  // align-items: center;
  width:100%;
}

.li-item{
  // text-align: center;
  text-transform: capitalize;
  width:50px;
  height: 50px;
  border-radius:10px;
  border:1px solid rgb(180, 174, 174);
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(0,0,0,0.2);
  display:flex;
  align-items: center;
  text-align: center;
  position: relative;
  margin: 0 auto;
}

.li-item.active img{
  filter: grayscale(0);
}

.toc-item-name,
.toc-item-latin-name{
  font-size:0.8em;
  text-align: center;
  line-height: 1.3em;
  font-family: 'Roboto';
  color: #000;
  margin: auto;
}

.toc-item-name{
  margin-top:5px;
  padding: 2px;
}

.toc-item-latin-name{
  margin-bottom:10px;
  font-style: italic;
  font-family: 'Roboto';
}

.toc-card-title{
  margin-bottom: 10px;
}

.breeding-sites-container{
  display:flex;
  flex-direction:row;
}

.toc-category.last{
  border-top: 1px solid #b0b0b0;
  margin-bottom:20px;
}

.toc-category.last i{
  margin-left:10px;
  background-color: #e6e6e6;
  color: #576c7e;
  border-radius:50%;
  cursor: pointer;
  font-size: 1.1rem;
}

// LAYER ICONS
.li-item{
  // background-size:30px;
}
.li-item.other,
.li-item.tiger,
.li-item.yellow,
.li-item.koreicus,
.li-item.japonicus,
.li-item.culex{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-mosquito-disabled);
}

.li-item.tiger_probable,
.li-item.yellow_probable,
.li-item.koreicus_probable,
.li-item.japonicus_probable,
.li-item.culex_probable{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-mosquito-possible-disabled);
}
.li-item.other{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-other-disabled);
}

.li-item.not_yet_validated{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-not-yet-validated-disabled);
}

.li-item.unidentified{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-unidentified-disabled);
}

.li-item.tiger.active{
  background-image: url($icon-tiger);
}
.li-item.tiger_probable.active{
  background-image: url($icon-tiger-possible);
}
.li-item.yellow.active{
  background-image: url($icon-yellow);
}
.li-item.yellow_probable.active{
  background-image: url($icon-yellow-possible);
}
.li-item.koreicus.active{
  background-image: url($icon-koreicus);
}
.li-item.koreicus_probable.active{
  background-image: url($icon-koreicus-possible);
}
.li-item.japonicus.active{
  background-image: url($icon-japonicus);
}
.li-item.japonicus_probable.active{
  background-image: url($icon-japonicus-possible);
}
.li-item.culex.active{
  background-image: url($icon-culex);
}
.li-item.culex_probable.active{
  background-image: url($icon-culex-possible);
}
.li-item.unidentified.active{
  background-image: url($icon-unidentified);
}
.li-item.not_yet_validated.active{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-not-yet-validated);
}

.li-item.other.active{
  background-image: url($icon-other);
}

.li-item.tiger:hover,
.li-item.yellow:hover,
.li-item.koreicus:hover,
.li-item.japonicus:hover,
.li-item.culex:hover,
.li-item.unidentified:hover,
.li-item.other:hover{
  opacity:0.7;
}

.content.bites .li-item:hover i,
.content.breeding .li-item:hover i{
  opacity:0.7;
}

.separator{
  margin:6px 0 45px 0;
  position: relative;
  left:0px;
  border-right: 2px solid transparent;
}
.separator.active{
  border-right: 2px solid #c0c0c0;
}
.toc-layers{
  position:relative;
}
.toc-layers.expanded{
  left: 0px;
}
.q-drawer__content.fit.scroll.expanded{
  width: 250px !important;
}
.lang-wrapper{
  position: relative;
}

.ma-close-btn::before{
  box-shadow: none;
}
button.ma-close-btn,
.ma-close-btn{
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
}
button.ma-close-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
}
  .toc-card{
    font-size: 12px;
  }
}

</style>
