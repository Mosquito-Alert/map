<!--
  SHOW HEADER. MOSQUITO LOGO
-->

<template>
  <q-header
    class="bg-white text-black"
    :class="expanded?'expanded':'collapsed'"
    height-hint="98"
  >
    <q-toolbar>
      <q-toolbar-title>
        <a href="http://www.mosquitoalert.com/ca/" target="_blank">
        <img v-if="expanded" src="~assets/img/mosquitoalert_logo.png">
        <img v-else src="~assets/img/logo-collapsed.png">
        </a>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['expanded'],
  setup () {
    return {}
  }
})
</script>

<style scoped lang="scss">
header {
  right: auto;
  width: $left-drawer-width;
  height: $header-height;
}
.q-toolbar {
  padding: 0;
}
.q-toolbar__title {
  display: flex;
  justify-content: center;
  padding: 10px;
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.25), 2px 0 2px rgba(0, 0, 0, 0.22);
}
</style>
