<template>
    <div class="toc-category">
      <div class="toc-title" v-html="_('Sampling Effort')"></div>
    </div>
    <div class="sampling-effort-box" @click="toggleClass" :class="{active: isActive}">
      <i :class="icon_code"></i>
      <div class="colors">
          <ul class="sampling-effort-categories">
              <li v-for="value, key in samplingEffort.legend" :key="key">
                  <div class="category-label" >{{ key }}</div>
                  <div class="category-color" :style="{ backgroundColor: value }"></div>
              </li>
          </ul>
      </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, ref } from 'vue'

export default {
  props: ['title', 'colors'],
  computed: {
    icon_code (props) {
      return `fa-thin fa-${props.title}`
    }
  },
  setup () {
    const $store = useStore()
    const isActive = ref(false)
    const samplingEffort = computed(() => {
      return $store.getters['app/layers'].sampling_effort
    })

    const toggleClass = () => {
      isActive.value = !isActive.value
    }

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    return {
      samplingEffort,
      toggleClass,
      isActive,
      _
    }
  }
}
</script>

<style>
    .sampling-effort-box{
        margin: 0 20px 0 20px;
        padding:10px 15px;
        border-radius:5px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(0,0,0,0.2);
        max-width: 250px;
        display: flex;
        flex-grow: 1;
        align-items: center;
    }

    .sampling-effort-box.active i{
      background-color: #e3d6a2;
      color: #6a6b59;
    }

    .sampling-effort-box i{
        float:inline;
        padding: 10px;
        border-radius:50%;
        font-size:1.5em;
        background-color: #e6e6e6;
    }

    .sampling-effort-box.active div.colors{
      filter: none;
    }

    div.colors{
        display: flex;
        align-items: center;
        filter: grayscale(100%)
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
        height:10px;
    }

    .sampling-effort-box.active div.category-label{
      color: rgb(58, 51, 51);
    }

    div.category-label{
        font-size: 0.55em;
        position: relative;
        left: -1px;
        color: #646262;
    }

    .toc-category{
      padding: 10px 10px 0px 25px;
      margin-bottom: 10px;
    }

    .toc-title{
      text-transform: uppercase;
      font-weight: 500;
    }

</style>
