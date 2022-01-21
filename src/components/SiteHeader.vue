<template>
  <q-header class="bg-white text-black" height-hint="98">
    <q-toolbar>
      <q-toolbar-title>
        <img src="~assets/img/mosquitoalert_logo.png">
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<style scoped lang="scss">
header {
  right: auto;
  width: 350px;
  border-bottom: 1px solid $line-color;
  border-right: 1px solid $line-color;
}
.q-toolbar {
  padding: 0;
}
.q-toolbar__title {
  display: flex;
  justify-content: center;
  padding: 20px;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
}
.q-toolbar__title img {
  max-height: 40px;
}
</style>
