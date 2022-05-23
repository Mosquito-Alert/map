<template>
    <div
      class="sampling-effort-box"
      :class="{active: (samplingIsActive || isActive)}"
      @click="toggleClass"
    >
      <i :class="icon_code"></i>
       <div class="colors">
          <ul class="sampling-effort-categories">
              <li v-for="value, key in samplingEffort.legend" :key="key">
                  <div class="category-label" >{{ value.from }}</div>
                  <div class="category-color" :style="{ backgroundColor: value.color }"></div>
              </li>
          </ul>
          <q-spinner v-if="loading"
            color="orange"
            size="2em"
          />
      </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, ref, onMounted } from 'vue'

export default {
  props: ['title', 'colors'],
  emits: ['samplingEffort'],
  computed: {
    icon_code (props) {
      return `fa-thin fa-${props.title}`
    }
  },
  setup (props, context) {
    const $store = useStore()
    const isActive = ref(false)

    const samplingEffort = computed(() => {
      return $store.getters['app/layers'].sampling_effort
    })

    onMounted(function () {
      console.log(isActive.value)
      console.log(samplingIsActive())
    })

    const samplingIsActive = function () {
      return $store.getters['map/getActiveLayers'].some(l => {
        return l.type === 'sampling_effort'
      })
    }

    const loading = computed(() => {
      return $store.getters['map/getSamplingEffortLoading']
    })

    const toggleClass = () => {
      if (samplingIsActive()) {
        isActive.value = false
      } else {
        isActive.value = true
      }
      console.log(samplingIsActive())
      console.log(isActive.value)
      const d = JSON.parse(JSON.stringify($store.getters['map/getMapDates']))

      context.emit('samplingEffort', {
        status: isActive.value,
        dates: [d]
      })

      if (isActive.value) {
        $store.commit('map/addActiveLayer', { type: 'sampling-effort' })
      } else {
        $store.commit('map/removeActiveLayer', { type: 'sampling-effort' })
      }
    }

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    return {
      loading,
      samplingIsActive,
      samplingEffort,
      toggleClass,
      isActive,
      _
    }
  }
}
</script>

<style scoped>
    .sampling-effort-box{
        margin: 0 20px 20px 10px;
        padding:10px 15px;
        border-radius:5px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(0,0,0,0.2);
        max-width: 250px;
        display: flex;
        flex-grow: 1;
        align-items: center;
        border: 1px solid #b4aeae;
    }

    .sampling-effort-box:hover i,
    .sampling-effort-box.active i{
      background-color: #e3d6a2;
      color: #6a6b59;
      opacity: 1;
    }

    .sampling-effort-box:hover div.colors,
    .sampling-effort-box.active div.colors{
      filter: none;
      opacity:1;
    }

    div.colors{
        display: flex;
        align-items: center;
        filter: grayscale(100%);
        opacity:0.4;
    }

    .sampling-effort-categories{
        list-style-type: none;
        display:flex;
        align-items:center;
        padding: 0 15px;
    }

    .sampling-effort-categories li{
        display:inline-block;
    }

    div.category-label,
    div.category-color{
        width:25px;
    }

    div.category-color{
      height:10px;
    }
    .sampling-effort-box:hover div.category-label,
    .sampling-effort-box.active div.category-label{
      color: rgb(58, 51, 51);
    }

    div.category-label{
        height:15px;
        font-size: 0.7em;
        position: relative;
        left: -1px;
        color: #646262;
    }

    .toc-category{
      padding: 10px 10px 0px 25px;
      margin-bottom: 10px;
      display: flex;
      flex-flow: row;
      align-items: center;
    }

  .sampling-effort-box i{
    background-color: #e6e6e6;
    opacity:0.75;
    color: #576c7e;
    padding: 8px;
    border-radius:50%;
    cursor: pointer;
    font-size:1.5em;
  }

  .toc-title{
    font-family: "Roboto";
    text-transform: uppercase;
    font-weight: 700;
    color: #666666;
  }

</style>
