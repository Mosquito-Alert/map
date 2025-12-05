<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    header="Coordinado por:"
    class="text-white bg-gray-600 w-70 lg:w-96"
  >
    <div class="flex flex-row justify-center mb-4 px-3 gap-6">
      <div class="mb-3 w-[50%]">
        <a href="https://www.csic.es/" target="_blank">
          <img src="@/assets/img/logos/logo_csic.png" alt="CSIC Logo" />
        </a>
      </div>
      <div class="mb-3 w-[50%]">
        <a href="https://www.ceab.csic.es/" target="_blank">
          <img src="@/assets/img/logos/logo_ceab.svg" alt="CEAB Logo" />
        </a>
      </div>
    </div>
    <div class="flex flex-row justify-center mb-4 px-3 gap-6">
      <div class="mb-3 w-[50%]">
        <a href="https://www.upf.edu/" target="_blank">
          <img src="@/assets/img/logos/logo_upf.png" alt="UPF Logo" />
        </a>
      </div>
      <div class="mb-3 w-[50%]">
        <a href="https://www.creaf.cat/" target="_blank">
          <img src="@/assets/img/logos/logo_creaf-so.jpg" alt="CREAF Logo" />
        </a>
      </div>
    </div>
    <div class="mb-4 w-[50%]">
      <a href="https://www.icrea.cat/" target="_blank">
        <img src="@/assets/img/logos/logo_icrea.jpeg" alt="ICREA Logo" />
      </a>
    </div>
    <p class="text-white">Con el apoyo de:</p>
    <div class="mb-4 w-[80%]">
      <a
        href="https://fundacionlacaixa.org/es/convocatoria-caixaresearch-investigacion-salud-2019-proyecto-dengue-chikunguna-zika"
        target="_blank"
      >
        <img src="@/assets/img/logos/logo_caixa.jpeg" alt="la Caixa Logo"
      /></a>
    </div>
  </Dialog>
</template>
<script setup>
import { ref, defineExpose } from 'vue'
import Dialog from 'primevue/dialog'

const visible = ref(false)
defineExpose({
  open: () => (visible.value = true),
  close: () => (visible.value = false),
})
</script>
