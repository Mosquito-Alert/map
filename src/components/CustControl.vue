<!--
  COMPONENT TO ADD BUTTON ON MAP, IF BUTTON IS CLICKED EVENT IS FIRED
-->

<template>
  <div :class="className">
    <button
      :title="trans(titleText)"
      :disabled="isDisabled"
      @click.stop="buttonClicked"
    >
      <i :class="faIcon"></i>
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  props: ['class', 'icon', 'title', 'disabled'],
  emits: ['clicked'],
  setup (props, context) {
    const $store = useStore()
    const isDisabled = computed(() => {
      return props.disabled
    })

    const className = computed(() => {
      return props.class
    })

    const faIcon = computed(() => {
      return props.icon
    })

    const titleText = computed(() => {
      return props.title
    })

    const buttonClicked = function () {
      context.emit('clicked')
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    return {
      trans,
      className,
      isDisabled,
      faIcon,
      titleText,
      buttonClicked
    }
  }
}
</script>

<style lang="scss">
  .ol-reports.ol-control.ol-disabled,
  .ol-download.ol-control.ol-disabled {
    opacity: 1;
    cursor: not-allowed;
  }

  .ol-reports.ol-control.ol-disabled button,
  .ol-download.ol-control.ol-disabled button {
    color: #7b7272;
    background: white;
    cursor:inherit;
  }

  .ol-reports button i,
  .ol-download button i {
    cursor:pointer;
  }

  .ol-reports{
    bottom: 120px;
  }
  .ol-download{
    bottom: 170px;
  }

  .ol-reports,
  .ol-download{
    position: absolute;
    top: auto;
    right: 0.5em;
    left: auto;
    display: flex;
    flex-direction: column;
    background: none;
  }

  .ol-reports.ol-control button,
  .ol-download.ol-control button {
    background: $primary-button-background;
    color: $primary-button-text;
    border: none;
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-bottom: 6px;
    border-radius: 10px;
    font-size: 2em;
    font-weight: normal;
    cursor: pointer;
    padding: 0 0 20px 0;
    box-shadow: $box-shadow;
  }
  .ol-reports button:hover,
  .ol-download button:hover{
    background: $primary-button-background-hover;
    color: $primary-button-text-hover;
    box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
    transition: all .6s cubic-bezier(.25,.8,.25,1);
  }
  </style>
