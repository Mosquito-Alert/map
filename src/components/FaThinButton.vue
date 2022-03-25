<template>
  <button class="fa-thin-button">
    <i :class="icon_code"></i>
    <span>{{ label }}</span>
  </button>
</template>

<script>
export default {
  props: ['name', 'label'],
  computed: {
    icon_code (props) {
      return `${props.name}`
    }
  }
}
</script>

<style scoped lang="scss">
button.fa-thin-button {
  width: 60px;
  height: 64px;
  background: white;
  border: none;
  border-top: 1px solid $grey-color;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  :deep(i.fa-thin) {
    padding: 0 8px;
    font-size: 2em;
  }
  :deep(span) {
    text-align: center;
    white-space: nowrap;
    font-size: 12px;
  }
  &:first-child {
    border: none;
  }
  &:hover {
    border-left: 6px solid $primary-color;
    transition: all 0.1s ease-in;
  }
  &:hover span,
  &:hover i{
    font-weight: bold;
    color: #efa501;
  }
  &.active {
    border-left: 6px solid $primary-button-background;
  }
  &.active i,
  &.active span{
    color: #efa501;
    font-weight: bold;
  }
}
</style>
