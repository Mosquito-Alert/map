<!--
  COMPONENT TO SHOP OBSERVATION POPUP
  GET FEATURE INFO FROM PROP
  IF OBSERVATIONS INCLUDES IMAGE, THE RATIO OF THE IMAGE DETERMINES DE POPUP STRUCTURE (LANDSCAPE, PORTRAIT, SQUARE)
-->

<template>
  <ol-overlay
      :title="selectedFeature?.title ? $t(selectedFeature.title) : ''"
      :position="selectedFeature.coordinates"
      positioning="bottom-center"
      :offset="[0, -35]"
      v-if="selectedFeature"
    >
    <template v-slot="slotProps">
      <div class="parentContainer" :class="imageRatio">
        <div :class="getPopupClass(selectedFeature)">
          {{ slotProps.empty }}
          <div class="image" :class="imageRatio" v-if="selectedFeature.photo_url">
            <div class="progress-bar-container q-px-lg" v-if="progress>0 && progress<100">
              <q-linear-progress :value="progress" color="orange" class="progress-bar-relative"/>
            </div>
            <a target="_blank" :href="selectedFeature.photo_url">
              <div class="img-container">
                <img v-if="!mosquitoImageLoaded" src="~/assets/img/notavailable.png">
                <img
                  v-else
                  :height="loading"
                  :src="imgData"
                  @error="errorLoading"
                >
                <div
                  v-if="!errorLoadingImage"
                  class="credits"
                >{{ $t('anonymous')}},
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC BY-SA 4.0</a> Mosquito Alert
                </div>
              </div>
            </a>
          </div>
          <!-- end picture -->

          <div class="info" :class="selectedFeature.type==='adult'?'info-validation':'info-no-validation'">
            <div class="scroll" :class="mobile?'q-px-md':''">
              <label class="popup-title">
                {{ selectedFeature?.title ? $t(selectedFeature.title) : '' }}
              </label>
              <p class="latin-name">{{ selectedFeature.latinName }}</p>
              <div>
                <div class="report-id-wrapper" v-if="selectedFeature.report_id">
                    <div><i class="fa-solid fa-hashtag"></i></div>
                    <div><span class="report_id">Id</span>:
                      {{ selectedFeature.report_id }}
                    </div>
                </div>
                <!-- THIS ATTRIBUTE IS JUST FOR BITES -->
                <div class="description-wrapper" v-if="selectedFeature.howMany">
                    <div><i class="fa-solid fa-child-reaching"></i></div>
                    <div><span class="how-many-bites">{{ $t('how_many_bites') }}</span>:
                      {{ $t(selectedFeature.howMany) }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="selectedFeature.location">
                    <div><i class="fa-solid fa-location-dot"></i></div>
                    <div><span class="bite-location">{{ $t('bite_location') }}</span>:
                      {{ $t(selectedFeature.location) }}
                    </div>
                </div>

                <div class="date-wrapper">
                    <div><i class="fa-solid fa-calendar-days"></i></div>
                    <div>
                      <span class="date">{{ $t('date') }}</span>:
                      {{ formatData(selectedFeature) }}
                      <span class="bite-time" v-if="selectedFeature.biteTime">
                        | {{ $t(selectedFeature.biteTime) }}
                      </span>
                    </div>
                </div>

                <div class="date-wrapper" v-if="selectedFeature.note">
                    <div><i class="fa-regular fa-message"></i></div>
                    <div>
                      <span class="date">{{ $t('citizen_note') }}</span>:
                      {{ selectedFeature.note }}
                    </div>
                </div>

                <!--IF SITES, THEN SHOW OTHER ATTRIBUTES -->
                <div class="description-wrapper" v-if="selectedFeature.withWater">
                    <div><i class="fa-solid fa-droplet"></i></div>
                    <div><span class="water-status">{{ $t('breeding_site_with_water') }}</span>
                      {{ $t(selectedFeature.withWater) }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="selectedFeature.withLarva">
                    <div><i class="fa-solid fa-worm"></i></div>
                    <div><span class="with-larva">{{ $t('breeding_site_with_larva') }}</span>
                      {{ $t(selectedFeature.withLarva) }}
                    </div>
                </div>

                <!-- THIS ATTRIBUTE ONLY FOR ADULTS -->
                <div class="description-wrapper" v-if="selectedFeature.edited_user_notes && selectedFeature.type=='adult'">
                    <div><i class="fa-solid fa-message-check"></i></div>
                    <div><span class="description">{{ $t('expert_note') }}</span>:
                      {{ selectedFeature.edited_user_notes }}
                    </div>
                </div>
              </div>
            </div>
            <!-- only adults have validation  -->
            <div v-if="selectedFeature.type === 'adult'" :class="mobile?'q-px-md':''">
              <div :class="getValidationClass(selectedFeature)">
                <i :class="getValidationIcon(selectedFeature)"></i>
              </div>
              <div class="validation-string">
                <div>{{ getValidationTypeTitle(selectedFeature) }}</div>
                <span
                  v-if="selectedFeature.validation_type==='human' &&
                        selectedFeature.validation"
                >
                  {{ $t(selectedFeature.validation) }}
                </span>
              </div>
            </div>
          </div>
          <div class="btn-close text-center" v-if="mobile">
            <button class="q-btn ma-btn" @click.stop="closePopup">
              {{ $t('close') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </ol-overlay>
</template>

<script>
import { onUpdated, defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: ['selectedFeature'],
  emits: ['popupimageloaded', 'closePopupButton'],
  setup (props, context) {
    const $store = useStore()
    const { t } = useI18n()

    const mosquitoImageLoaded = ref(false)
    const imageRatio = ref('null')
    const errorLoadingImage = ref()
    const loading = ref(true)
    const ratio = ref('null')
    const progress = ref(0)
    const imgData = ref()

    ratio.value = 0

    function blobToData (blob) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    }

    onUpdated(async function () {
      mosquitoImageLoaded.value = false
      if (Object.keys(props.selectedFeature).length === 0) {
        mosquitoImageLoaded.value = false
      } else {
        if (props.selectedFeature.photo_url) {
          const url = props.selectedFeature.photo_url
          axios(url, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
              progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
          }).then(async function (resp) {
            if (resp.status === 200) {
              const base64data = await blobToData(resp.data)
              imgData.value = base64data
              imageLoaded(base64data)
            }
          }).catch(function () {
            console.log('Error loading image')
          })
        }
      }
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const closePopup = function () {
      context.emit('closePopupButton')
    }

    if (mobile.value) {
      imageRatio.value = mobile.value ? 'mobile landscape' : ''
    } else {
      imageRatio.value = mobile.value ? 'landscape' : ''
    }

    const imageLoaded = function (base64data) {
      const image = new Image()
      image.src = base64data
      image.onload = function () {
        mosquitoImageLoaded.value = true
        ratio.value = (image.width / image.height)
        // Set poup class based on mobile device and image ratio
        if (mobile.value) {
          imageRatio.value = mobile.value ? 'mobile ' : ''
        } else {
          imageRatio.value = ''
        }
        imageRatio.value += (ratio.value > 1.35) ? 'landscape' : ((ratio.value < 1.05) ? 'portrait' : 'square')

        loading.value = false
        progress.value = 0
        errorLoadingImage.value = false
        context.emit('popupimageloaded')
      }
    }

    const getPopupClass = function (feature) {
      let css
      if (ratio.value === 0) {
        css = 'overlay-content landscape'
      } else if (feature.photo_url) {
        css = 'overlay-content ' + imageRatio.value
      } else {
        ratio.value = 0
        css = 'overlay-content small'
      }
      return mobile.value ? css + ' mobile ' : css
    }

    const getValidationIcon = function (feature) {
      if (feature.validation_type === 'human') return 'fa-light fa-users'
      if (feature.validation_type === 'ai') return 'fa-light fa-robot'
      return ''
    }
    const getValidationClass = feature => {
      if (feature.validation_type === 'ai') return 'validation ai'
      if (feature.validation === 'Confirmed') return 'validation confirmed'
      else return 'validation probable'
    }
    const getValidationTypeTitle = function (feature) {
      if (feature.validation_type === 'human') return t('expert_validation')
      if (feature.validation_type === 'ai') return t('ai_validation')
      return ''
    }

    const formatData = function (feature) {
      // Some locales add '.' after month, so we remove it
      if (feature.biteTime) {
        return moment(feature.observation_date).format('lll')
      } else {
        return moment(feature.observation_date, 'YYYY-MM-DD').format('DD/MM/YYYY').replace('.', '')
      }
    }

    const errorLoading = function () {
      console.log('error...loading image')
      errorLoadingImage.value = true
    }

    return {
      mosquitoImageLoaded,
      ratio,
      mobile,
      closePopup,
      loading,
      errorLoadingImage,
      errorLoading,
      imageRatio,
      imageLoaded,
      formatData,
      getPopupClass,
      getValidationClass,
      getValidationIcon,
      getValidationTypeTitle,
      progress,
      imgData
    }
  }
})
</script>

<style lang='scss'>
* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.info div::-webkit-scrollbar {
    height: 4px;
    width: 4px;
    background: #ccc;
}

.info div::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}

.ol-overlaycontainer{
  padding-top:20px;
  max-height: 80vh;
}
.popup-title{
  font-size: 1.2em;
  text-transform: uppercase;
}
.overlay-content.landscape .image{
  // toni testing
  max-height: $popup-height-with-image-landscape;
  width: 100%;
  overflow: hidden;
  position:relative;
  border-top-left-radius: $popup-border-radius;
  border-top-right-radius: $popup-border-radius;
}
.overlay-content.landscape .image .img-container{
  width: 100%;
  display: flex;
  justify-content: center;
}

.overlay-content.mobile.landscape .image .img-container{
  height: 100%;
}

.overlay-content.landscape .image img{
  max-width: 100%;
  height: auto;
  object-fit: fill;
  border-top-left-radius: $popup-border-radius;
  border-top-right-radius: $popup-border-radius;
}

.overlay-content.portrait .image{
  height: $popup-height-with-image-portrait;
  position: relative;
  text-align: center;
}

.overlay-content.square .image{
  height: $popup-height-with-image-square;
  position: relative;
  text-align: center;
}

// .overlay-content.mobile.landscape .image .img-container{
//   width: 100%;
//   display: flex;
//   justify-content: center;
// }
.overlay-content.square .image .img-container,
.overlay-content.portrait .image .img-container{
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.overlay-content.square .image img,
.overlay-content.portrait .image img{
  height: 100%;
  border-top-left-radius: $popup-border-radius;
  border-bottom-left-radius: $popup-border-radius;
}

.overlay-content.landscape {
    max-width: $popup-width-landscape;
    // max-height: $popup-height-landscape;
    border:0px;
}
.parentContainer{
  max-width: $popup-width-small;
}
.parentContainer.portrait{
  max-width: $popup-width-portrait;
}
.overlay-content.portrait {
  max-width: $popup-width-portrait;
  display:flex;
  flex-direction: row;
}
.parentContainer.square{
  max-width: $popup-width-square;
}
.overlay-content.square {
  max-height: $popup-height-with-image-square;
  display:flex;
  flex-direction: row;
}

.q-page.expended .overlay-content.portrait {
  max-width: calc(#{$popup-width-portrait} - #{$left-drawer-width});
  display:flex;
  flex-direction: row;
}

.q-page.expended .overlay-content.square {
  max-width: calc(#{$popup-width-square} - #{$left-drawer-width});
  display:flex;
  flex-direction: row;
}

.parentContainer.landscape::after {
  content: " ";
  border: $popup-vertical-offset solid transparent;
  border-top-color: white;
  width: $popup-vertical-offset * 2;
  position: relative;
  top: $popup-padding-info - 2px;
  left: 0;
  margin:auto;
  align-items: center;
  }

.parentContainer {
  // display:flex;
  // flex-direction: column;
  text-align: center;
}

.parentContainer::after,
.parentContainer.square::after,
.parentContainer.portrait::after{
  content: ' ';
  border: $popup-vertical-offset solid transparent;
  border-top-color: white;
  width: $popup-vertical-offset * 2;
  position: relative;
  top: 23px;
  left: 0;
  margin:auto;
  align-items: center;
}

.overlay-content {
  background: white;
  position:relative;
  display: flex;
  flex-direction: column;
  border-radius: $popup-border-radius;
  cursor: default;
  font-size: 1em;
  &.small {
    &:after {
      content: ' ';
      // border: $popup-vertical-offset solid transparent;
      border-top-color: white;
      width: $popup-vertical-offset * 2;
      position: relative;
      top: #{2*$popup-padding-info};
      left: 0;
      margin:auto;
    }
    // max-height: calc(#{$popup-height} - #{50px});
    .info-validation {
      &>div:first-child {
        max-height: calc(#{$popup-height} - #{50px});
        overflow: auto;
        padding-right: 20px;
        text-align:left;
      }
    }
  }
}
.info-no-validation{
  max-width: $popup-width-portrait-info;
  max-height: $popup-height-with-image-portrait;
  overflow:auto;
  background: white;
  position:relative;
  display: flex;
  flex-direction: column;
  border-radius: $popup-border-radius;
  cursor: default;
  font-size: 1em;
}

.info {
  label {
    font-weight: bold;
  }
  padding: $popup-padding-info;
  display: flex;
  flex-direction: row;
  text-align:left;
  width: 100%;
  .title {
    text-transform: uppercase;
    font-size: 1.2em;
  }
  .validation {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    color: white;
    &.confirmed {
      background: #22a973;
    }
    &.probable {
      background: #8fd3b8;
    }
    &.ai {
      background: #9d6466;
    }
    i {
      height: 50px;
      width: 50px;
      font-size: 1.5em;
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
}
.landscape .info-validation{
}
.landscape .info-validation,
.small .info-validation {
  width: 100%;
  &>div:first-child {
    text-align:left;
    width: 60%;
    max-height: calc(#{$popup-height-with-image-landscape / 2} - #{$popup-padding-info});
    overflow: auto;
    padding-right:20px;
  }
  &>div:last-child {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width:40%;
    .validation-string {
      padding-top: 10px;
      text-transform: uppercase;
      text-align: center;
      &>div {
        font-weight: bold;
      }
    }
  }
}

.portrait .info-validation {
  max-width: $popup-width-portrait-info;
  max-height: $popup-height-with-image-portrait;
  flex-direction:column;
  padding-bottom:5px;
  &>div:first-child {
    max-height: calc(#{$popup-height-with-image-portrait} - 100px);
  }
}

.square .info-validation {
  max-width: $popup-width-square-info;
  max-height: $popup-height-with-image-square;
  padding-bottom: 5px;
  flex-direction:column;
  &>div:first-child {
    max-height: calc(#{$popup-height-with-image-square} - #{$popup-padding-info});
  }
}

.square .info-validation,
.portrait .info-validation {
  display:flex;
  flex-grow: 1;
  &>div {
    // padding-right:20px;
  }
  &>div:first-child {
    overflow: auto;
    text-align:left;
    padding-right:10px;
  }
  &>div:last-child {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    flex-grow:1;
    align-items: center;
    justify-content: top;
    .validation-string {
      padding-top: 10px;
      text-transform: uppercase;
      text-align: center;
      &>div {
        font-weight: bold;
      }
    }
  }
}

.latin-name{
  font-style: italic;
}
.credits{
  position: absolute;
  bottom: 5px;
  margin:auto;
  padding:5px;
  background: #33333342;
  border-radius: 10px;
  text-align: right;
  font-size:0.8em;
  color: white;
  &>a {
    color: #3498DB;
    text-decoration: none;
    &:hover{
      text-decoration: underline;
    }
  }
}
.ol-overlay-container{
  padding:25px;
  padding-bottom: 5px;
}
.report-id-wrapper,
.date-wrapper,
.description-wrapper{
  display:flex;
  flex-direction:row;
  margin-top:10px;
}
.report-id-wrapper div:first-child,
.date-wrapper div:first-child,
.description-wrapper div:first-child{
  margin-right:10px;
  font-weight: bold;
}

.report-id-wrapper span,
.date-wrapper span,
.description-wrapper span{
  font-weight: bold;
}
.date-wrapper span.bite-time{
  font-weight:normal;
}
.m-circular-progress{
  position: absolute;
  height: 100%;
  margin: auto;
}

// MOBILE
.parentContainer.mobile::after{
  content: none;
}

.parentContainer.mobile{
  max-width:100vw;
}

.parentContainer.mobile .overlay-content.small,
.overlay-content.mobile.landscape,
.overlay-content.mobile.portrait,
.overlay-content.mobile.square{
  width: 100vw;
  height: 100%;
  max-width: 100vw;
  max-height: unset;
  border-radius:none;
  flex-direction: column;
  // justify-content: center;
}

.overlay-content.small{
  padding-bottom: 10px;
}

.parentContainer.mobile,
.overlay-content.mobile{
  border-radius: 0px;
  width: 100vw;
  height: 100vh;
}

.parentContainer.mobile .overlay-content.small{
  width: 100vw;
}

.image.mobile.portrait,
.image.mobile.square{
  padding-top:20px;
}
.image.mobile .img-container{
  display: flex;
  justify-content: center;
  margin:auto;
  position: absolute;
  left: 0;
}

.image.mobile .img-container img {
  margin: auto;
  max-width: 100%;
  max-height: 100%;
}

.parentContainer.mobile .info{
  flex-direction: row;
}

.parentContainer.mobile .info:nth-child(2){

}

.mobile.portrait .info-validation{
  max-height: 40%;
}

.parentContainer.mobile .info-validation,
.parentContainer.mobile .info-no-validation{
  max-width: 100vw;
  max-height: 40%;
  border-radius: 0px;
}

.overlay-content.mobile .image,
.overlay-content.mobile.landscape .image,
.overlay-content.mobile.portrait .image{
  height: 40%;
  margin: 0px auto;
  border-radius: 0px;
}

.parentContainer.mobile .overlay-content .image img{
  border-radius: 0px;
}

.parentContainer.mobile .info-validation > div:first-child{
  max-height: 100%;
}

.ma-btn{
  background: $primary-color;
  color: white;
  border: none;
  margin:auto;
}
.mobile.portrait .info-validation{
  padding: 20px;
}
.btn-close{
  display:flex;
  align-self: center;
}
.parentContainer.mobile .btn-close{
  // display:flex;
  // position: absolute;
  // bottom: 60px
}

.ul-filters li, .filters .report-tag span{
  background-color: #ccc;
}

.like-link:hover{
  color: $primary-color;
}
.progress-bar-container{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
}
.progress-bar-relative {
  position:relative;
  z-index: 10;
}
@media (max-width: 640px) {
  .ol-viewport .ol-overlaycontainer-stopevent,
  .ol-viewport .ol-overlay-container{
    z-index:900 !important;
    padding: 0px;
    width: 100%;
    height: 100%;
    transform: none !important;
  }
}
</style>
