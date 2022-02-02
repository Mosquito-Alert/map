<template>
  <div class="sampling-effort-box">
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
import { computed } from 'vue'

export default {
  props: ['title', 'colors'],
  computed: {
    icon_code (props) {
      return `fa-thin fa-${props.title}`
    }
  },
  setup () {
    const $store = useStore()
    const samplingEffort = computed(() => {
      console.log($store.getters['app/layers'].sampling_effort)
      return $store.getters['app/layers'].sampling_effort
    })

    return {
      samplingEffort
    }
  }
}
</script>

<style>
    .sampling-effort-box{
        margin-top: 10px;
        padding:20px 15px;
        border-radius:5px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(0,0,0,0.2);
        /* display:block; */
        display: flex;
        align-items: center;
    }
    .sampling-effort-box i{
        float:inline;
        padding:15px 16px;
        background-color: #e3d9a4;
        border-radius:50%;
    }

    div.colors{
        display: flex;
        align-items: center;
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
        height:15px;
    }

    div.category-label{
        font-size: 0.55em;
        position: relative;
        top: 3px;
        left: -1px;
        color: rgb(58, 51, 51);
    }
</style>
