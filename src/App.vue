<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from 'src/stores/authStore';

const authStore = useAuthStore();

// Initialize auth state on app start
onMounted(async () => {
  await authStore.initialize();
});
</script>
