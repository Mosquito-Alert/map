export default function () {
  return {
    DEFAULTS: {
      ZOOM: 5,
      CENTER: [13.6889, 44.8409]
      // ZOOM: 17,
      // CENTER: [2.813930487775805, 41.97837835421166]
      // CENTER: [4.848618507385254, 52.380792836403685]
    },
    maxZoom: 19,
    features: [],
    selectedFeature: null,
    activeLayers: [],
    samplingEffortLoading: false,
    mapDates: { from: '', to: '' }
  }
}
