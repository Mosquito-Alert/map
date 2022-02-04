<template>
  <ol-overlay
      :title="_(selectedFeature.title)"
      :position="selectedFeature.coordinates"
      positioning="bottom-center"
      :offset="[0, -35]"
      v-if="selectedFeature">
    <template v-slot="slotProps">
      <div :class="getPopupClass(selectedFeature)">
        {{ slotProps.empty }}
        <div class="image" v-if="selectedFeature.img">
          <img :src="selectedFeature.img">
        </div>
        <div class="info">
          <div>
            <p class="title"><label>{{ _(selectedFeature.title) }}</label></p>
            <p class="date"><label>{{ _('Date') }}</label>: {{ selectedFeature.date }}</p>
            <p class="description"><label>{{ _('Expert note') }}</label>: {{ selectedFeature.description }}</p>
          </div>
          <div>
            <div :class="getValidationClass(selectedFeature)">
              <i :class="getValidationIcon(selectedFeature)"></i>
            </div>
            <div class="validation-string">
              <div>{{ getValidationTypeTitle(selectedFeature) }}</div>
              {{ _(selectedFeature.validation) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </ol-overlay>
</template>

<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  props: ['selectedFeature'],
  setup (props, context) {
    const $store = useStore()
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const getPopupClass = function (feature) {
      if (feature.img) return 'overlay-content'
      else return 'overlay-content small'
    }
    const getValidationIcon = function (feature) {
      if (feature.validation_type === 'human') return 'fa-light fa-users'
      else return 'fa-light fa-robot'
    }
    const getValidationClass = feature => {
      if (feature.validation === 'Confirmed') return 'validation confirmed'
      else return 'validation probable'
    }
    const getValidationTypeTitle = function (feature) {
      if (feature.validation_type === 'human') return _('Expert validation')
      else return _('AI validation')
    }
    return {
      _,
      getPopupClass,
      getValidationClass,
      getValidationIcon,
      getValidationTypeTitle
    }
  }
})
</script>

<style scoped lang='scss'>
.overlay-content {
  width: $popup-width;
  max-height: $popup-height-with-image;
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: $popup-border-radius;
  cursor: default;
  font-size: .8em;
  &:after {
    content: " ";
    border: $popup-vertical-offset solid transparent;
    border-top-color: white;
    width: $popup-vertical-offset * 2;
    top: $popup-height-with-image;
    left: $popup-width / 2 - $popup-vertical-offset;
    position: absolute;
  }
  &.small {
    height: $popup-height;
    &:after {
      top: $popup-height;
    }
    .info {
      &>div:first-child {
        max-height: calc(#{$popup-height} - #{50px});
        overflow: auto;
      }
    }
  }
  .image {
    height: $popup-height-with-image / 2;
    overflow: hidden;
    flex: 50%;
    display: flex;
    align-items: center;
    border-top-left-radius: $popup-border-radius;
    border-top-right-radius: $popup-border-radius;
    img {
      width: 100%;
    }
  }
  .info {
    padding: 25px;
    display: flex;
    flex: 50%;
    .title {
      text-transform: uppercase;
      font-size: 1.2em;
    }
    label {
      font-weight: bold;
    }
    &>div:first-child {
      width: 60%;
      max-height: calc(#{$popup-height-with-image / 2} - #{50px});
      overflow: auto;
    }
    &>div:last-child {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .validation-string {
        padding-top: 10px;
        text-transform: uppercase;
        text-align: center;
        &>div {
          font-weight: bold;
        }
      }
      .validation {
        height: 80px;
        width: 80px;
        border-radius: 50%;
        color: white;
        &.confirmed {
          background: #22a973;
        }
        &.probable {
          background: #8fd3b8;
        }
        i {
          height: 80px;
          width: 80px;
          font-size: 3em;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          .fa-check {
            background: #f6db63;
            color: white;
            border-radius: 50%;
            height: 25px;
            width: 25px;
            font-size: 0.3em;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            bottom: 0;
            right: 0;
            &::before {
              position: relative;
              top: 1px;
            }
          }
        }
      }
      width: 40%;
    }
  }
}
</style>
