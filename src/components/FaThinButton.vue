<!--
  COMPONENT TO ADD A BUTTON WITH FONT AWESOME ICON ON LEFT MENU
-->

<template>
  <a class="main-menu-item" :href="link_url">
    <button class="fa-thin-button" :class="class_prop">
      <i :class="icon_code"></i>
      <span>{{ label }}</span>
    </button>
  </a>
</template>

<script>
export default {
  props: ['name', 'label', 'link', 'class'],
  computed: {
    icon_code (props) {
      return `${props.name}`
    },
    link_url (props) {
      return props.link
    },
    class_prop (props) {
      return props.class
    }
  }
}
</script>

<style lang="scss">
button.fa-thin-button span{
  text-align: center;
  white-space: nowrap;
  font-size: 11px;
}

button.fa-thin-button i.fa-thin{
  padding: 0 8px;
  font-size: 2em;
}

a button.fa-thin-button {
  width: 60px;
  height: 64px;
  background: white;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:first-child {
    border: none;
  }
  &:not(.disabled):focus {
    border-left: 0;
    transition: all 0.1s ease-in;
  }
  &:not(.disabled):hover {
    border-left: 6px solid $primary-color;
    transition: all 0.1s ease-in;
  }
  &:not(.disabled):hover span,
  &:not(.disabled):hover i{
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
.main-menu-item{
  border-top: 1px solid $grey-color;
}
.q-toolbar a.main-menu-item:nth-child(2){
  border-bottom: 1px solid $grey-color;
}
</style>
