<script setup lang="ts">
// @ts-ignore (define in dts)
import IconComponent from './Icon.vue'

interface Props {
  tabActive: 'list' | 'pinned'
}

defineProps<Props>()
</script>

<template>
  <div class="navbar">
    <ul>
      <li :class="{'active': tabActive === 'list'}">
        <IconComponent name="clipboard-document" />
      </li>
      <li :class="{'active': tabActive === 'pinned'}">
        <IconComponent name="bookmark" />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
ul {
  padding: unset;
  list-style: none;
  background-color: #1e1d0e;
  height: 100vh;
  li {
    opacity: 0.5;
    width: 55px;
    height: 55px;
    display: flex;
    justify-content: center;
    align-items: center;
    &.active {
      opacity: 1;
    }
  }
}
</style>