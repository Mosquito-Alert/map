<template>

  <q-footer class="text-white">
    <q-toolbar>
      <q-toolbar-title>
        <div class="attribution"></div>
        <ul class="logos">
          <li>
            <a href="https://www.ceab.csic.es/" target="_blank">
              <img src="~assets/img/CSIC-CEAB.png">
            </a>
          </li>
          <li>
            <a href="https://www.upf.edu/" target="_blank">
              <img src="~assets/img/UPF.png">
            </a>
          </li>
          <li>
            <a href="https://www.creaf.cat/" target="_blank">
              <img src="~assets/img/CREAF-SO.png">
            </a>
          </li>
          <li>
            <a href="https://www.icrea.cat/" target="_blank">
              <img src="~assets/img/ICREA.png">
            </a>
          </li>
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
  align-items: center;
  margin: 0;
  padding: 0;
}
.logos li a {
  display: flex;
  align-items: center;
}
.logos li img {
  max-height: 35px;
  margin-left: 30px;
}
</style>
