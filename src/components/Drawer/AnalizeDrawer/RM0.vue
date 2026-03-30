<template>
  <p>aaa</p>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRM0Store } from '../../../stores/rm0Store'

const rm0Store = useRM0Store()

onMounted(async () => {
  console.log('RM0 component mounted')
  // Initialize RM0 data

  await rm0Store.fetchRM0Data()
})
</script>
