<template>
  <button class="fa-thin-button-menu">
    <div>
      <i :class="icon_code"></i>
      <span>{{ label }} <i class="fas fa-caret-right menu-arrow"></i></span>
    </div>
    <div class="menu">
      <slot></slot>
    </div>
  </button>
</template>

<script>
export default {
  props: ['name', 'label'],
  computed: {
    icon_code (props) {
      return `fa-thin ${props.name}`
    }
  }
}
</script>

<style scoped lang="scss">
button {
  width: 56px;
  height: 64px;
  background: white;
  border: none;
  border-top: 1px solid $grey-color;
  border-left: 6px solid white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  padding: 5px 6px 5px 0px;
  &>div:first-child {
    position: relative;
    z-index: 9;
    background: white;
    padding: 5px 0px;
  }
  :deep(i.fa-thin) {
    padding: 0 8px;
    font-size: 2em;
  }
  :deep(i.menu-arrow) {
    margin: 0;
    padding: 0;
    font-size: 1em;
    transition: all .3s ease-in;
  }
  :deep(span) {
    text-align: center;
    white-space: nowrap;
    font-size: 12px;
  }
  &:first-child {
    border: none;
  }
  .menu {
    display: flex;
    position: relative;
    left: -60px;
    height: 60px;
    width: 56px;
    top: -1px;
    visibility: hidden;
    opacity: 0;
    &>div {
      position: relative;
      z-index: 1;
      height: 30px;
      border: 12px solid $grey-color;
    }
  }
  &:hover {
    border-left: 6px solid #999;
    transition: all 0.3s ease-in;
    overflow: visible;
    padding: 5px 6px 5px 6px;
    .menu {
      width: auto;
      left: 0px;
      visibility: visible;
      opacity: 1;
      transition: all 0.3s ease-in;
      &>div {
        position: relative;
        z-index: 1;
        border: 12px solid $grey-color;
      }
    }
    :deep(i.menu-arrow) {
      transform: rotate(180deg);
      transition: all .3s ease-in;
    }
  }
  &.active {
    border-left: 6px solid $primary-button-background;
  }
  &>button:hover {
    border: none;
    background: blue;
  }
}
</style>
