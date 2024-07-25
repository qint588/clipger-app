<script setup lang="ts">
import { ref } from 'vue'
// @ts-ignore (define in dts)
import { IClipboardManager } from '../../../main/types/clipboard'

interface Props {
  index: number
  isActive: boolean
  clipboard: IClipboardManager
}

interface Emit {
  (e: 'handleChangeIndexActive', index: number): void,
  (e: 'handleSelected'): void
}

defineProps<Props>()
defineEmits<Emit>()
</script>

<template>
  <li
    :class="{ active: isActive }"
    @mouseover="$emit('handleChangeIndexActive', index)"
    @dblclick="$emit('handleSelected')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="icon-history"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
    <span class="text-content">{{ clipboard.type === 'text' ? clipboard.content : '[Image]' }}</span>
    <div class="shortcut">
      <template v-if="index <= 9">
        <img
          class="icon-command"
          width="11"
          height="11"
          src="https://static-00.iconduck.com/assets.00/mac-command-icon-2048x2048-8rpyvqiu.png"
          alt=""
        />
        <span>{{ index != 9 ? index + 1 : 0 }}</span>
      </template>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.text-content {
  font-size: 16px;
}
</style>