<template>
  <button>
    <i :class="icon_code"></i>
    <span>{{ label }}</span>
  </button>
</template>

<script>
export default {
  props: ["name", "label"],
  computed: {
    icon_code(props) {
      return `fa-thin ${props.name}`;
    }
  }
}
</script>

<style scoped>

</style>
