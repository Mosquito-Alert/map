<template>

  <q-footer class="text-white">
    <q-toolbar>
      <q-toolbar-title>
        <div class="attribution"></div>
        <ul class="logos">
          <li><img src="~assets/img/logo-creaf-white.png"></li>
          <li><img src="~assets/img/ceab-csic-fusionat.png"></li>
          <li><img src="~assets/img/logo-icrea-white.png"></li>
        </ul>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<style scoped lang="scss">
.q-footer {
  background-color: $footer-background;
  display: flex;
}
.q-footer .q-toolbar__title {
  display: flex;
  justify-content: space-between;
}
.logos {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}
.logos li img {
  max-height: 41px;
}
</style>
