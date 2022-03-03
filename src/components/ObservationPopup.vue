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
        <div class="image" v-if="selectedFeature.photo_url">
          <img :src="'//webserver.mosquitoalert.com' + selectedFeature.photo_url">
        </div>
        <div class="info">
          <div>
            <label>{{ _(selectedFeature.title) }}</label>:
            <p class="title"></p>
            <label>{{ _('Date') }}</label>:
            <p class="date" v-html="formatData(selectedFeature)"></p>
            <p
              v-if="selectedFeature.edited_user_notes"
              class="description"><label>{{ _('Expert note') }}</label>: {{ selectedFeature.edited_user_notes }}</p>
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
import moment from 'moment'

export default defineComponent({
  props: ['selectedFeature'],
  setup (props, context) {
    const $store = useStore()
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }
    const getPopupClass = function (feature) {
      if (feature.photo_url) return 'overlay-content'
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

    const formatData = function (feature) {
      return moment.unix(feature.observation_date).format('MM/DD/YYYY')
    }

    return {
      _,
      formatData,
      getPopupClass,
      getValidationClass,
      getValidationIcon,
      getValidationTypeTitle
    }
  }
})
</script>

<style scoped lang='scss'>
* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.ol-overlaycontainer{
  padding-top:20px;
  max-height: 80vh;
}

.overlay-content {
  max-width: $popup-width;
  background: white;
  position:relative;
  display: flex;
  flex-direction: column;
  border-radius: $popup-border-radius;
  cursor: default;
  font-size: 1em;
  &:after {
    content: " ";
    border: $popup-vertical-offset solid transparent;
    border-top-color: white;
    width: $popup-vertical-offset * 2;
    position: relative;
    top: #{2*$popup-padding-info};
    left: 0;
    margin:auto;
  }
  &.small {
    &:after {
      border: $popup-vertical-offset solid transparent;
      border-top-color: white;
      width: $popup-vertical-offset * 2;
      position: relative;
      top: #{2*$popup-padding-info};
      left: 0;
      margin:auto;
    }
    // max-height: calc(#{$popup-height} - #{50px});
    .info {
      &>div:first-child {
        max-height: calc(#{$popup-height} - #{50px});
        overflow: auto;
      }
    }
  }
  .image {
    // max-height: $popup-height-with-image / 2;
    max-height: $popup-height-with-image / 2;
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
    padding: $popup-padding-info;
    padding-bottom: 0px;
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
      max-height: calc(#{$popup-height-with-image / 2} - #{$popup-padding-info});
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

.info div{
  // padding-right:15px;
}
</style>
