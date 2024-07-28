<script setup lang="ts">
// @ts-ignore (define in dts)
import { IClipboardManager } from '../../../main/types/clipboard'
import moment from 'moment'

interface Props {
  clipboard: IClipboardManager
}

interface Emit {
  (e: 'handleSelected'): void
  (e: 'handleDelete'): void
}

defineProps<Props>()
defineEmits<Emit>()
</script>

<template>
  <div class="heading">
    <span>
      <small>First copied {{ moment(clipboard.created_at).fromNow() }} in {{ clipboard.app_name }}</small>
    </span>
  </div>
  <div class="showed">
    <div v-if="clipboard.type === 'text'" class="copied">
      <span>{{ clipboard.content }}</span>
    </div>
    <div v-if="clipboard.type === 'image'" class="copied">
      <img :src="`file://${clipboard.attachment_path}`" alt="" />
    </div>
  </div>
  <div class="footer-action">
    <button @click.prevent="$emit('handleSelected')">Press enter to copy</button>
    <button @click.prevent="$emit('handleDelete')">Delete from history</button>
  </div>
</template>