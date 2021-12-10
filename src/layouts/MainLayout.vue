<template>
  <q-layout view="hHh lpR fFf">
    <site-header/>
    <left-drawer/>
    <q-page-container>
      <router-view />
    </q-page-container>
    <site-footer/>
  </q-layout>
</template>

<script>
import SiteHeader from "components/SiteHeader.vue"
import SiteFooter from "components/SiteFooter.vue"
import LeftDrawer from "components/LeftDrawer.vue"
import { ref } from 'vue'

export default {
  components: { SiteHeader, LeftDrawer, SiteFooter },
  setup () {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style scoped>
.q-page-container {
  padding-top: 0px !important;
}

</style>
