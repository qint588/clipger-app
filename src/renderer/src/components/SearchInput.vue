<script lang="ts" setup>
// @ts-ignore (define in dts)
import IconComponent from './Icon.vue'

interface Props {
  modelValue: string
}

interface Emit {
  (e: 'update:modelValue', value: string): void,
  (e: 'handleClearSearch'): void,
  (e: 'handleFetchClipboard'): void,
  (e: 'handleClear'): void
}

defineProps<Props>()
defineEmits<Emit>()

</script>

<template>
  <div class="toolbar">
    <input
      ref="inputSearch"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      placeholder="Search the clipboard history"
    />
    <div class="action">
      <template v-if="modelValue">
        <IconComponent name="search" @click="$emit('handleClearSearch')" />
      </template>
      <a
        href="javascript:"
        class="base-svg mr-3"
        title="Reload histories"
        @click.prevent="$emit('handleFetchClipboard')"
      >
        <IconComponent name="reload" />
      </a>
      <a
        href="javascript:"
        class="base-svg"
        title="Clear all histories"
        @click.prevent="$emit('handleClear')"
      >
        <IconComponent name="trash" />
      </a>
    </div>
  </div>
</template>