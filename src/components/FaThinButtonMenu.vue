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
  width: 60px;
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
  &:hover {
    border-left: 6px solid $primary-color;
    overflow: visible;
    padding: 5px 6px 5px 10px;
    :deep(i.menu-arrow) {
      transform: rotate(180deg);
      transition: all .3s ease-in;
    }
  }
  &:hover :deep(.lang-container){
    left: 44px;
    opacity: 1;
    transition: left 0.3s ease-in;
    transition: opacity 0.5s ease-in;
  }
  &:hover span,
  &:hover i{
    font-weight: bold;
    color: #efa501;
  }
  &.active {
    border-left: 6px solid $primary-button-background;
  }
  &>button:hover {
    border: none;
    background: blue;
  }
}

:deep(.lang-container){
  position: relative;
  display: flex;
  opacity: 0;
  left: -290px;
  transition: left ease 0.5s;
  height: 62px;
}

.fa-thin-button-menu{
  position:relative;
}
.fa-thin-button-menu:hover .menu{
  position:fixed;
  z-index: 100;
}
</style>
