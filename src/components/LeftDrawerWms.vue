<!--
  THIS COMPONENT CONTAINS
  - MAIN MENU TOOLS
  - TABLE OF CONTENTS FOR MODELS
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
    <left-menu item="ew"
      @leftMenuMounted="callFirstMapCall"
      @startShareView="startShareView"
    />

    <!-- Drawer content -->
    <div class="toc-models"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile" class="text-right q-ma-md">
        <q-btn :label="trans('Close')" class="ma-close-btn" @click="toggleLeftDrawer"/>
      </div>
      <div class="text-h5 toc-title-estimates">
        {{ trans('Early warning') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            :label="trans('Select species')"
            :label-color="localSpeciesCode?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="vectorOptions"
            option-value="code"
            option-label="label"
            color="orange"
            emit-value
            map-options
            v-model="localSpeciesCode"
          />
          </div>
          <!-- INFO LINK -->
            <div class="q-mt-xl flex-center model-buttons">
              <div>
                <div @click="goInfoModal">
                  <div class="div-link flex-center q-ml-xs">
                    <div>
                      <i class="fa-thin fa-circle-info"></i>
                    </div>
                    <div class="q-ml-xs">
                      {{ trans('Early warning data') }}
                    </div>
                  </div>
                </div>
              </div>
            <div>
            <!-- END INFO LINK -->
          </div>
        </div>

        <!-- LAYER CONTROLS -->
        <div v-show="localSpeciesCode">
          <hr class="q-my-lg"/>
          <div class="title-shaded-box">{{ trans('Layer controls') }}</div>
          <div class="row shaded-box q-pa-sm">
            <div class="col-9 q-pr-md">
              <div class="row">
                <q-badge :outline="!localVisible" color="orange">
                  {{ trans('Opacity') }}
                </q-badge>
              </div>
              <q-slider
                v-model="localOpacity"
                :min="0"
                :max="1"
                :step="0.05"
                color="orange"
                label
                />
            </div>
            <q-toggle class="col" checked-icon="check" v-model="localVisible" color="orange" size="lg"/>
          </div>
          <!-- LEGEND -->
          <div id="legend" class="q-pt-md" style="position: relative;" :hidden="!localVisible"></div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'

export default {
  components: { LeftMenu },
  props: {
    expanded: {
      type: Boolean,
      default: true
    },
    speciesCode: {
      type: String
    },
    opacity: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'firstMapCall',
    'toggleLeftDrawer',
    'speciesCodeChange',
    'opacityChange',
    'visibilityChange'
  ],
  setup (props, context) {
    const $store = useStore()

    const localSpeciesCode = ref(props.speciesCode)
    watch(localSpeciesCode, (newValue) => {
      context.emit('speciesCodeChange', newValue)
    })

    const localVisible = ref(props.visible)
    watch(localVisible, (newValue) => {
      context.emit('visibilityChange', newValue)
    })

    const localOpacity = ref(props.opacity)
    watch(localOpacity, (newValue) => {
      context.emit('opacityChange', newValue)
    })

    const vectorOptions = computed(() => {
      return [
        // Code is the MVT property
        { code: 'albopictus', label: trans('Tiger mosquito') },
        { code: 'aegypti', label: trans('Yellow fever mosquito') },
        { code: 'japonicus', label: trans('Japonicus mosquito') },
        { code: 'koreicus', label: trans('Koreicus mosquito') }
      ]
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    // Get rid off reactiveness
    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    // Called when TOC is toggled
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const goInfoModal = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true, anchor: 'earlyWarning_info' } })
    }

    const startShareView = function () {
      if (!localSpeciesCode.value) {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: 'Must select a species first'
          }
        })
      } else {
        const payload = {
          speciesCode: localSpeciesCode.value
        }
        context.emit('startShareView', payload)
      }
    }

    return {
      localSpeciesCode,
      localVisible,
      localOpacity,
      vectorOptions,
      mobile,
      trans,
      goInfoModal,
      toggleLeftDrawer,
      callFirstMapCall,
      startShareView
    }
  }
}
</script>

<style scoped lang="scss">
.toc-models{
  padding: 0px;
  width: 100%;
  overflow: auto;
  &.expanded{
    z-index:10;
  }
  &.expanded > div:not(.text-right){
    padding: 18px;
  }
}

.toc-models::-webkit-scrollbar {
    height: 12px;
    width: 4px;
    background: #ccc;
}

.toc-models::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}
.toc-models .q-field--filled {
  background: $primary-color;
  border-radius: 4px;
}

:deep(.toc-models .q-field--filled .q-field__inner .q-field__control){
  background: $primary-color;
}
:deep(.q-field--filled.calendar-input i),
:deep(.q-field--filled.calendar-input input){
  color: white !important;
}

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
  }
}

:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  width: $left-drawer-width;
  overflow:hidden;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.li-item.active{
  background: $primary-color;
  color: white;
}

:deep(button.q-btn.disabled) {
  opacity: 0.3 !important;
}
div.flex-right{
  display:flex;
  justify-content: right;
}
.flex{
  display:flex;
}
.spaceBetween{
  justify-content: space-between;
  align-items: center;
}

.alignt-items-centered{
  align-items: center;
}
.legend-row{
  height: 25px;
}

.model-buttons{
  justify-content: space-between;
}
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}

.div-link{
  cursor: pointer;
  color: rgb(0,0,0,0.6);
}
.div-link:hover{
  color: $primary-color;
}
.div-link div i {
  font-size: 22px;
}
.div-link
.lower-case{
      text-transform: lowercase;
}
.capitalFirstLetter:first-letter {
    text-transform: uppercase;
}
.flex-center{
  display: flex;
  align-items: center;
}
.text-h4-normal{
  font-size: 2.125rem;
  font-weight: 100;
}
.toc-title-estimates{
  font-family: 'Roboto';
  font-weight: 700;
  color: #666666;
}
.toc-title-estimates::first-letter{
  text-transform: uppercase;
}
.flex-expand{
  flex-grow: 1;
}
.flex.row{
  align-items:center;
}
.handle{
  opacity:0;
  cursor: move;
}
.layer-controller{
  padding: 0px 0px;
  border-radius: 5px;
  background-color: $grey-color;
  margin: 3px 0px;
}
.layer-controller:hover .handle{
  opacity:1
}

.transparency-title{
  color: black;
}
.no-pad-right{
  padding-right: 0px;
}
.fa-download{
  cursor: pointer;
  color: #ff9800 ;
}
.title-shaded-box{
  font-family: 'Roboto';
  font-weight: 700;
  color: #666666;
  text-transform: uppercase;
}
.shaded-box{
  border-radius: 5px;
  background-color: $grey-color;
  margin: 3px 0px;
}
</style>
