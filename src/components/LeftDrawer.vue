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
      <q-btn dense icon="layers" />
      <q-toolbar-title></q-toolbar-title>
      <q-btn flat round dense icon="more_vert" />
    </q-toolbar>
    <!-- Drawer content -->
    <div>
      ToC
    </div>
  </q-drawer>
</template>

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
::v-deep .q-drawer__content {
  display: flex;
  flex-direction: row;
}
</style>
