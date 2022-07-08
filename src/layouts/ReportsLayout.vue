<template>
  <q-layout
    :class="expanded"
    view='hHh lpR fFf'
  >
      <the-map-report
        ref='map'
        :report="reportId"
        :reportLang="lang"
      />

  <modal-cookie-settings>
  </modal-cookie-settings>

  <modal-cookie-policy>
  </modal-cookie-policy>
  <cookies-compliance/>
  </q-layout>
</template>

<script>

import { useRoute } from 'vue-router'
import TheMapReport from 'components/TheMapReport.vue'
import ModalCookieSettings from 'src/components/ModalCookieSettings.vue'
import ModalCookiePolicy from 'src/components/ModalCookiePolicy.vue'
import CookiesCompliance from 'src/components/CookiesCompliance.vue'

export default {
  components: {
    TheMapReport,
    ModalCookieSettings,
    ModalCookiePolicy,
    CookiesCompliance
  },
  setup () {
    const route = useRoute()
    const reportId = (route.params) ? ((route.params.report) ? route.params.report : '') : ''
    const lang = (route.params) ? ((route.params.lang) ? route.params.lang : '') : ''
    return {
      reportId,
      lang
    }
  }
}
</script>

<style lang="scss">
  .q-page.collapsed{
    margin-left:$left-toolbar-width;
    transition: margin-left ease 1s;
  }
  .q-page.expanded{
    margin-left:$left-drawer-width;
    transition: margin-left ease 1s;
  }
  .q-page {
    flex-direction: column;
    height: 100%;
    height: calc(100vh - 50px);
    margin-left: $left-drawer-width;
    overflow: hidden;
  }
  .q-header.collapsed {
    width: $left-toolbar-width;
    transition: width ease 1s;
  }
  .q-header.expanded {
    width: $left-drawer-width;
    transition: width ease 1s;
  }
  .toc-layers.collapsed{
    opacity:0;
    overflow:hidden;
    z-index: -10;
    transition: opacity ease 1s;
  }

  .toc-layers.expanded{
    opacity: 1;
    z-index: 10;
    overflow:auto;
    transition: opacity ease 0.6s;
  }
 .q-drawer-left{
    width: $left-drawer-width;
  }
  aside {
    width: 350px;
  }
  .q-layout.collapsed aside{
    width: $left-toolbar-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout.expanded aside{
    width: $left-drawer-width;
    box-shadow: none;
    transition:width ease 1s;
  }
  .q-layout .q-drawer-left{
    width: $left-drawer-width !important;
  }
  .q-layout.collapsed .q-drawer__content{
    overflow-x:hidden;
  }
</style>
