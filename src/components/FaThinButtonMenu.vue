<template>
  <button>
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
  width: 55px;
  height: 64px;
  background: white;
  border: none;
  border-top: 1px solid $grey-color;
  border-left: 1px solid white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  &>div:first-child {
    position: relative;
    z-index: 9;
    background: white;
  }
  :deep(i.fa-thin) {
    padding: 0 8px;
    font-size: 2em;
    color: $dark-grey;
  }
  :deep(i.menu-arrow) {
    margin: 0;
    padding: 0;
    font-size: 1em;
    transition: all .3s ease-in;
  }
  :deep(span) {
    color: $dark-grey;
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
    left: -300px;
    height: 63px;
    visibility: hidden;
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
    padding: 5px;
    .menu {
      left: 0px;
      visibility: visible;
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
