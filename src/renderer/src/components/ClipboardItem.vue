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
    @click="$emit('handleSelected')"
  >
    <span class="text-content">{{ clipboard.content }}</span>
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