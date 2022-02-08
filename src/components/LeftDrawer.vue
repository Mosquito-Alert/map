<template>
  <q-drawer
      show-if-above
      side="left"
      behavior="desktop"
      no-swipe-close
      width="">
    <!-- Main menu -->
    <q-toolbar>
      <fa-thin-button name="fa-layer-group" :label="_('Layers')" class="active"></fa-thin-button>
      <fa-thin-button name="fa-chart-scatter" :label="_('Models')"></fa-thin-button>
      <q-toolbar-title></q-toolbar-title>
      <fa-thin-button-menu name="fa-globe" :label="_('Lang')">
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
      <fa-thin-button name="fa-share-nodes" :label="_('Share')"></fa-thin-button>
      <fa-thin-button name="fa-circle-info" :label="_('Help')"></fa-thin-button>
      <fa-thin-button name="fa-user" :label="_('Log in')"></fa-thin-button>
    </q-toolbar>

    <!-- Drawer content -->
    <div class="toc-layers">
      <div class="toc-card filters">
        <div class="toc-title" v-html="_('Selecciona')"></div>
          <input type="text" name="localitat"/> <button>></button>
          <input type="text" name="hastag"/> <button>></button>
      </div>

      <div class="toc-category">
        <div class="toc-title" v-html="_('Mosquits')"></div>
      </div>

      <div class="category-boxes">
        <div class="item-container" v-for="layer, code in observations" :key="code" >
          <div class="content">
            <div class="li-item"
                  @click="filterData(layer, $event)"
                  data-type="observations"
                  :data-code="code"
                  :class="initialClass(layer, code)">

              <!-- <img v-if="initialClass(layer, code).includes('active')" :src="layer.icon" />
              <img v-else :src="layer.icon_disabled"/> -->
            </div>
              <div v-text="_(layer.common_name)" class="toc-item-name"></div>
              <div v-text="_(layer.scientific_name)" class="toc-item-latin-name"></div>
            </div>
        </div>
      </div>

      <!-- BITES AND BREEDING SITES-->
      <div class="breeding-sites-container">
        <div class="bites-column">
          <!-- BITES -->
          <div class="toc-category">
            <div class="toc-title" v-html="_('Bites')"></div>
          </div>
          <div class="category-boxes bites">
              <div class="item-container" v-for="layer, code in bites" :key="code">
                <div class="content">
                  <div class="li-item" @click="filterData(layer, $event)" data-type="bites" :data-code="code">
                      <i class="fa-thin fa-child"></i>
                  </div>
                  <div v-text="_(layer.common_name)" class="toc-item-name"></div>
                </div>
              </div>
          </div>
        </div>
        <div class="breeding-column">
          <!-- BREEDING SITES -->
          <div class="toc-category lf-mg">
            <div class="toc-title" v-html="_('Breeding')"></div>
          </div>
          <div class="category-boxes breeding n-lf-pad">
              <div class="item-container" v-for="layer, code in breeding" :key="code">
                  <div class="content">
                    <div class="li-item" @click="filterData(layer, $event)" data-type="breeding" :data-code="code">
                        <i class="fa-solid" :class="layer.icon"></i>
                    </div>
                    <div v-text="_(layer.common_name)" class="toc-item-name"></div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      <!-- OTHER OBSERVATIONS -->
      <div class="toc-category">
        <div class="toc-title" v-html="_('Other_species')"></div>
      </div>

      <div class="category-boxes">
        <div class="item-container" v-for="layer, code in otherObservations" :key="code">
          <div class="content">
            <div class="li-item"
              @click="filterData(layer, $event)"
              data-type="otherObservations"
              :data-code="code"
              :class="initialClass(layer, code)">
            </div>
              <div v-text="_(layer.common_name)" class="toc-item-name"></div>
            </div>
        </div>
      </div>

      <!-- SAMPLIING EFFORT -->
      <div class="category-boxes last">
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

export default {
  components: { FaThinButton, FaThinButtonMenu, SamplingEffort },
  emits: ['filter'],
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
        obj.querySelector('img').src = layer.icon_disabled
      } else {
        classes.add('active')
        obj.querySelector('img').src = layer.icon
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

    const initialClass = function (layer, code) {
      const initialLayers = JSON.parse(JSON.stringify($store.getters['app/initialLayers']))
      const isInitial = initialLayers.find(layer => {
        return layer.code === code
      })

      let cls = code
      if (isInitial) cls += ' active'
      cls += (('separator' in layer) ? ' separator' : '')
      return cls
    }

    const observations = computed(() => {
      return $store.getters['app/layers'].observations
    })

    const breeding = computed(() => {
      return $store.getters['app/layers'].breeding
    })

    const otherObservations = computed(() => {
      return $store.getters['app/layers'].other_observations
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
    return {
      ca,
      es,
      en,
      clickLanguageSelector,
      initialClass,
      filterData,
      observations,
      breeding,
      bites,
      otherObservations,
      mouseEnter,
      mouseOut,
      _
    }
  }
}
</script>

<style scoped lang="scss">
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
    width: 56px;
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
}

.toc-card{
  padding: 10px 10px 0px 20px;
}

.toc-category,
.toc-card.filters{
  padding: 10px 10px 0px 25px;
  margin-bottom: 10px;
}

.toc-title{
  text-transform: uppercase;
  font-weight: 500;
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

.category-boxes{
  display: flex;
  flex-wrap: wrap;
}

.bites-column{
  width: 26%
}

.breeding-column{
  width: 75%
}

.toc-layers ul li div{
  text-align:center;
}

.li-item{
  width:60px;
}

.li-item i{
  display: block;
  margin:auto;
}

.bites .li-item:hover i,
.bites .li-item.active i{
  background-color:  #cc6677;
  color: #e2b3aa;
}

.bites .li-item i{
  background-color: #e6e6e6;
  color: white;
  padding:10px;
  border-radius:50%;
}

.bites .item-container{
  width:100%;
}

.breeding .item-container{
  width:33%;
}

.breeding .li-item:hover i,
.breeding .li-item.active i{
  background-color:  #a8b9c1;
  color: #1072ad;
}

.breeding .li-item i{
  background-color: #e6e6e6;
  color: white;
  padding:10px;
}

.item-container{
  // margin-right: 5px;
  display: flex;
  width:25%;
}

.item-container.item-separator{
  display:inline;
}

.item-container .content{
  display:flex;
  flex-direction:column;
  align-items: center;
  width:100%;
}

.li-item{
  text-align: center;
  text-transform: capitalize;
  height: 60px;
  border-radius:10px;
  border:1px solid rgb(180, 174, 174);
  padding:5px;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(0,0,0,0.2);
  display:flex;
  align-items: center;
  text-align: center;
  position: relative;
}

.li-item.active img{
  filter: grayscale(0);
}

.toc-item-name,
.toc-item-latin-name{
  font-size:0.6em;
  text-align: center;
  line-height: 1;
}

.toc-item-name{
  margin-top:5px;
  padding: 2px;
}

.toc-item-latin-name{
  margin-bottom:20px;
  font-style: italic;
}

.toc-card-title{
  margin-bottom: 10px;
}

.breeding-sites-container{
  display:flex;
  flex-direction:row;
}

.n-lf-pad,
.category-boxes.n-lf-pad{
  padding-left:0px;
}

.li-item.separator::after{
  border-right:3px solid #c0c0c0;
  position:absolute;
  content:'';
  height: 45px;
  left: 75px;
}

.vertical-separator{
  position: absolute;
  bottom: 20px;
}

.category-boxes.last{
  border-top: 1px solid #b0b0b0;
}

// LAYER ICONS
.li-item.tiger,
.li-item.yellow,
.li-item.koreicus,
.li-item.japonicus,
.li-item.culex{
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-image: url($icon-mosquito-disabled);
}

.li-item.other{
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-image: url($icon-other-disabled);
}

.li-item.unidentified{
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-image: url($icon-unidentified-disabled);
}

.li-item.tiger.active,
.li-item.tiger:hover{
  background-image: url($icon-tiger);
}
.li-item.yellow.active,
.li-item.yellow:hover{
  background-image: url($icon-yellow);
}
.li-item.koreicus.active,
.li-item.koreicus:hover{
  background-image: url($icon-koreicus);
}
.li-item.japonicus.active,
.li-item.japonicus:hover{
  background-image: url($icon-japonicus);
}
.li-item.culex.active,
.li-item.culex:hover{
  background-image: url($icon-culex);
}
.li-item.unidentified.active,
.li-item.unidentified:hover{
  background-image: url($icon-unidentified);
}
.li-item.other.active,
.li-item.other:hover{
  background-image: url($icon-other);
}
</style>
