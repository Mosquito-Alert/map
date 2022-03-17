<template>
  <q-drawer
      show-if-above
      side="left"
      behavior="desktop"
      no-swipe-close
      width="">
    <!-- Main menu -->
    <q-toolbar>
      <fa-thin-button name="fa-thin fa-layer-group" :label="_('Layers')" class="active"></fa-thin-button>
      <fa-thin-button name="fa-thin fa-chart-scatter" :label="_('Models')"></fa-thin-button>
      <q-toolbar-title></q-toolbar-title>

      <fa-thin-button name="fa-thin fa-share-nodes" :label="_('Share')"></fa-thin-button>
      <fa-thin-button name="fa-thin fa-circle-info" :label="_('Help')" @click="showInfo"></fa-thin-button>
      <fa-thin-button-menu name="fa-thin fa-globe" :label="_('Lang')">
        <div class="menuItem" @click="clickLanguageSelector('ca', $event)" ref="ca">
          <span>Català</span>
        </div>
        <div class="menuItem" @click="clickLanguageSelector('es', $event)" ref="es">
          <span>Castellano</span>
        </div>
        <div class="menuItem" @click="clickLanguageSelector('en', $event)" ref="en">
          <span>English</span>
        </div>
      </fa-thin-button-menu>
      <fa-thin-button name="fa-thin fa-user" :label="_('Log in')"></fa-thin-button>
    </q-toolbar>

    <!-- Drawer content -->
    <div class="toc-layers">
      <div class="toc-card filters">
        <div class="toc-title" v-html="_('Select')"></div>
          <search-location @locationSelected="locationSelected"/>
          <input type="text" name="hastag" :placeholder="_('Placeholder hashtag')"/> <button>></button>
      </div>

      <div class="toc-category">
        <div class="toc-title" v-html="_('Mosquitos')"></div>
      </div>

      <div class="category-box">
        <div class="item-container" v-for="layer, code in observations" :key="code" >
          <div class="content">
            <div class="li-item"
                  @click="filterData(layer, $event)"
                  data-type="observations"
                  :data-code="code"
                  :class="initialClass(code, 'observations')">
            </div>
            <div v-text="_(layer.common_name)" class="toc-item-name"></div>
            <!-- <div v-text="_(layer.scientific_name)" class="toc-item-latin-name"></div> -->
          </div>
          <div class="separator" :class="{ 'active': layer.separator }"></div>
        </div>
      </div>

      <!-- BITES AND BREEDING SITES-->
      <div class="toc-category">
          <div class="bites-title" v-html="_('Bites')"></div>
          <div class="breeding-title" v-html="_('Breeding sites')"></div>
      </div>

      <div class="category-box bites-and-breeding">
          <!-- BITES -->
          <div class="item-container" v-for="layer, code in bites" :key="code">
            <div class="content bites">
              <div
                class="li-item"
                @click="filterData(layer, $event)"
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

          <!-- BREEDING SITES -->
          <div class="item-container" v-for="layer, code in breeding" :key="code">
              <div class="content breeding">
                <div
                  class="li-item"
                  @click="filterData(layer, $event)"
                  data-type="breeding"
                  :data-code="code"
                  :class="initialClass(code, 'breeding')"
                  >
                    <i class="fa-solid" :class="layer.faIcon"></i>
                </div>
                <div v-text="_(layer.common_name)" class="toc-item-name"></div>
              </div>
              <div class="separator" :class="{ 'active': layer.separator }"></div>
          </div>
      </DIV>

      <!-- OTHER OBSERVATIONS -->
      <div class="toc-category">
        <div class="toc-title" v-html="_('Other species')"></div>
      </div>

      <div class="category-box other-species">
        <div class="item-container" v-for="layer, code in otherObservations" :key="code">
          <div class="content">
            <div class="li-item"
              @click="filterData(layer, $event)"
              data-type="other_observations"
              :data-code="code"
              :class="initialClass(code, 'other')">
            </div>
              <div v-text="_(layer.common_name)" class="toc-item-name"></div>
            </div>
        </div>
        <div class="separator"></div>
      </div>

      <div class="fill-space"></div>
      <!-- SAMPLIING EFFORT -->
        <div class="toc-category last">
          <div class="toc-title" v-html="_('Sampling effort')"></div>
          <i class="fa-thin fa-circle-info"></i>
        </div>
        <div class="category-box">
          <sampling-effort title="fa-light fa-gauge-max"></sampling-effort>
        </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import FaThinButton from 'components/FaThinButton.vue'
import SamplingEffort from 'components/SamplingEffort.vue'
import FaThinButtonMenu from 'components/FaThinButtonMenu.vue'
import SearchLocation from 'components/SearchLocation.vue'

export default {
  components: { FaThinButton, FaThinButtonMenu, SamplingEffort, SearchLocation },
  emits: ['filter', 'locationSelected'],
  setup (props, context) {
    const ca = ref(null)
    const es = ref(null)
    const en = ref(null)
    const $store = useStore()

    const filterData = function (layer, event) {
      let obj = event.target
      if (!event.target.dataset.type) {
        obj = obj.closest('.li-item')
      }
      context.emit('filter', {
        type: obj.dataset.type,
        code: obj.dataset.code
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

    const clickLanguageSelector = (lang, event) => {
      let object = event.target
      if (!object.classList.contains('menuItem')) object = object.parentNode
      setLanguage(lang, object)
    }

    const setLanguage = (lang, object) => {
      $store.dispatch('app/setLanguage', lang)
      object.parentNode.querySelectorAll('.menuItem').forEach(item => {
        item.classList.remove('active')
      })
      object.classList.add('active')
    }
    onMounted(function () {
      initLanguage()
    })
    function initLanguage () {
      const lang = $store.getters['app/getLang']
      let object = ca.value
      if (lang === 'es') object = es.value
      else if (lang === 'en') object = en.value
      setLanguage(lang, object)
    }
    const showInfo = function () {
      $store.commit('app/setModal', { id: 'info', visible: true })
    }

    const locationSelected = function (location) {
      const bb = location.boundingbox
      const bounding = [bb[2], bb[0], bb[3], bb[1]]
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              boundingBox: bounding
            },
            geometry: location.geojson
          }
        ]
      }

      context.emit('locationSelected', geojson)
    }

    return {
      ca,
      es,
      en,
      clickLanguageSelector,
      initialClass,
      filterData,
      observations,
      showInfo,
      breeding,
      bites,
      otherObservations,
      mouseEnter,
      mouseOut,
      locationSelected,
      _
    }
  }
}
</script>

<style scoped lang="scss">
button.fa-thin-button, button.fa-thin-button-menu {
  color: $toolbar-icons-color;
}
button.fa-thin-button.active, button.fa-thin-button-menu.active {
  color: $primary-color;
}
.q-header,
.q-drawer{
  width: $left-drawer-width;
}
.menuItem {
  z-index: 100;
  border: 1px solid $grey-color;
  border-left: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 84px;
  background: #efefef;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
}
.menuItem.active {
  background: white;
  transition: all 0.3s ease-in;
  font-weight: bold;
  color: $primary-color;
}
.menuItem:not(.active):hover {
  background: $grey-color;
  transition: all 0.3s ease-in;
  box-shadow: 6px 0 12px rgba(0,0,0,0.25), 4px 0 4px rgba(0,0,0,0.22);
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
}

.toc-layers{
  overflow-y:auto;
  display:flex;
  flex-direction: column;
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
  padding: 20px 10px 0px 25px;
  margin-bottom: 10px;
}

.breeding-column .toc-category{
  padding-left: 18px;
}

.toc-title{
  font-family: 'Roboto';
  text-transform: uppercase;
  font-weight: 700;
  color: #666666;
}

.toc-title .input
.bites-title{
  width:25%;
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

.li-item.tiger,
.li-item.yellow,
.li-item.koreicus,
.li-item.japonicus,
.li-item.culex{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-mosquito-disabled);
}

.li-item.other{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-other-disabled);
}

.li-item.unidentified{
  background-repeat: no-repeat;
  background-position: center;
  background-image: url($icon-unidentified-disabled);
}

.li-item.tiger.active{
  background-image: url($icon-tiger);
}
.li-item.yellow.active{
  background-image: url($icon-yellow);
}
.li-item.koreicus.active{
  background-image: url($icon-koreicus);
}
.li-item.japonicus.active{
  background-image: url($icon-japonicus);
}
.li-item.culex.active{
  background-image: url($icon-culex);
}
.li-item.unidentified.active{
  background-image: url($icon-unidentified);
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
  margin:5px 0 50px 0;
  position: relative;
  left:0px;
  border-right: 2px solid transparent;
}
.separator.active{
  border-right: 2px solid #c0c0c0;
}

</style>
