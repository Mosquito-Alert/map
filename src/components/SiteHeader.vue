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
.q-toolbar__title {
  display: flex;
  justify-content: center;
  padding: 20px;
}
.q-toolbar__title img {
  max-height: 40px;
}
</style>
