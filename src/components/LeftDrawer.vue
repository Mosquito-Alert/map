<template>
  <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      bordered
      width="350"
      no-swipe-close>
    <!-- Main menu -->
    <q-toolbar class="text-primary">
      <fa-thin-button name="fa-layer-group" label="Capes"></fa-thin-button>
      <q-toolbar-title></q-toolbar-title>
      <fa-thin-button name="fa-user" label="Log in"></fa-thin-button>
    </q-toolbar>
    <!-- Drawer content -->
    <div>
      ToC
    </div>
  </q-drawer>
</template>

<script>
import FaThinButton from 'components/FaThinButton.vue';
export default {
  "components": { FaThinButton }
}
</script>

<style scoped lang="scss">
.q-drawer .q-toolbar {
  background: white;
  height: 100%;
  width: 56px;
  top: 0px;
  bottom: 0px;
  flex-direction: column;
  border-right: 1px solid $line-color;
}
.q-drawer {
  width: 350px;
}
:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
}
</style>
