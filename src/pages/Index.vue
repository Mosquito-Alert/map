<template>
  <q-page class="flex">
    <div id="mapa" class="bg-green">Mapa</div>
    <div class="bg-white text-black map-footer">Gràfica</div>
  </q-page>

</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex'
})
</script>

<style>
.q-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  height: calc(100vh - 50px);
}
#mapa {
  flex: 1;
}
.q-page-container {
  padding-top: 0px !important;
}
.map-footer {
  width: 100%;
  max-height: 200px;
  flex: 1;
}
</style>
