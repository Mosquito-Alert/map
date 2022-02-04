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
        <div class="item-container" v-for="layer, code in observations" :key="code">
          <div class="content">
            <div class="li-item" @click="filterData" data-type="observations" :data-code="code" :class="initialClass(layer, code)">
              <img v-if="initialClass(layer, code) == 'active'" :src="layer.icon"/>
              <img v-else :src="layer.icon_disabled"/>
            </div>
              <div v-text="_(layer.common_name)" class="toc-item-name"></div>
            </div>
        </div>
      </div>

      <!-- BITES AND BREEDING SITES-->
      <div class="breeding-sites-container">
        <div>
          <!-- BITES -->
          <div class="toc-category">
            <div class="toc-title" v-html="_('Bites')"></div>
          </div>
          <div class="category-boxes bites">
              <div class="item-container" v-for="layer, code in bites" :key="code">
                <div class="content">
                  <div class="li-item" @click="filterData" data-type="bites" :data-code="code">
                      <!-- <img :src="layer.icon"/> -->
                      <i class="fa-thin fa-child"></i>
                  </div>
                  <div v-text="_(layer.common_name)" class="toc-item-name"></div>
                </div>
              </div>
          </div>
        </div>
        <div>
          <!-- BREEDING SITES -->
          <div class="toc-category lf-mg">
            <div class="toc-title" v-html="_('Breeding')"></div>
          </div>
          <div class="category-boxes breeding n-lf-pad">
              <div class="item-container" v-for="layer, code in breeding" :key="code">
                  <div class="content">
                    <div class="li-item" @click="filterData" data-type="breeding" :data-code="code">
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
            <div class="li-item" @click="filterData" data-type="otherObservations" :data-code="code">
              <img v-if="initialClass(layer, code) == 'active'" :src="layer.icon"/>
              <img v-else :src="layer.icon_disabled"/>
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
    const filterData = function (event) {
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
      } else {
        classes.add('active')
      }
    }
    const initialClass = function (layer, code) {
      const initialLayers = JSON.parse(JSON.stringify($store.getters['app/initialLayers']))
      const isInitial = initialLayers.find(layer => {
        return layer.code === code
      })

      let cls = ''
      if (isInitial) cls += 'active'
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

.category-boxes div{
  width: 60px;
  margin: 0 10px;
}

.toc-layers ul li div{
  text-align:center;
}

.li-item img,
.li-item i{
  display: block;
  margin:auto;
  filter: grayscale(100%);
}

.bites .li-item:hover i,
.bites .li-item.active i{
  background-color:  #cc6677;
  color: #e2b3aa;
}

.bites .li-item i{
  background-color: #e6e6e6;
  color: #e2b3aa;
  padding:10px;
  border-radius:50%;
}

.breeding .li-item:hover i,
.breeding .li-item.active i{
  background-color:  #a8b9c1;
  color: #1072ad;
}

.breeding .li-item i{
  background-color: #e6e6e6;
  color: #e2b3aa;
  padding:10px;
}

.li-item:hover{
  background-color: #ccc;
}

.li-item:hover i,
.li-item:hover img{
  filter: grayscale(0);
}

.item-container{
  margin-right: 5px;
  display: flex;
}

.item-container.item-separator,
.item-container .content{
  display:inline;
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

.toc-item-name{
  // white-space: nowrap;
  font-size:0.6em;
  text-align: center;
  line-height: 1;
  padding: 10px 0 20px 0;
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
  right: -13px;
}

.vertical-separator{
  position: absolute;
  bottom: 20px;
}

.category-boxes.last{
  border-top: 1px solid #b0b0b0;
}
</style>
