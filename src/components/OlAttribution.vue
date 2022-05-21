<template>
  <div class="ol-attribution">
    © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
    | © <a href="https://mapbox.com" target="_blank">Mapbox</a>
    | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
  </div>
</template>

<script>
</script>

<style lang="scss">
  .ol-attribution:not(.ol-collapsed){
    background: #33333342;
  }

  .ol-attribution {
    position: absolute;
    top: auto;
    left: auto;
    bottom: 4px;
    right: 10px;
    z-index: 100;
    font-size: 10px;
    color: white;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }

  .ol-attribution a:hover {
    text-decoration:underline;
  }

  .ol-attribution a {
    color: #3498DB;
    text-decoration:none;
  }
</style>
