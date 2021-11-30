<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <!-- <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" /> -->

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Mosquito Alert
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" behavior="desktop" bordered class="bg-red" width="350">
      <q-toolbar class="text-primary">
        <q-btn flat round dense icon="layers" />
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat round dense icon="more_vert" />
      </q-toolbar>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
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

<style>
header {
  right: auto;
  width: 350px;
}
.q-drawer .q-toolbar {
  background: white;
  height: 100%;
  width: 56px;
  top: 0px;
  bottom: 0px;
  flex-direction: column;
}
.q-drawer {
  width: 350px;
}
.panel {
  background: red;
}
</style>
