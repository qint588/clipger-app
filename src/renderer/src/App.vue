
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import moment from 'moment'
// @ts-ignore (define in dts)
import { IClipboardManager, LIMIT_SIZE } from '../../main/types/clipboard'

const search = ref<string>('')
const inputSearch = ref<HTMLElement | null>(null)
const isSearch = computed(() => search.value.length)
const clipboards = ref<IClipboardManager[]>([])
const indexActive = ref<number>(0)

onMounted(() => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:focus-input', (_: never, value: boolean) => {
    if (!value) return
    indexActive.value = 0
    focusInputSearch()
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:clipboard', (_: never, value: IClipboardManager) => {
    if (!value) return
    handleFetchClipboard()
  })

  // @ts-ignore (define in dts)
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp'].indexOf(event.key) !== -1) {
      event.preventDefault()
      switch (event.key) {
        case 'ArrowDown':
          indexActive.value =
            indexActive.value + 1 < clipboards.value.length ? indexActive.value + 1 : 0
          break
        case 'ArrowUp':
          indexActive.value =
            indexActive.value == 0 ? clipboards.value.length - 1 : indexActive.value - 1
          break
      }
      handleScrollList()
    }
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('push:clipboards', (_: never, data: IClipboardManager[]) => {
    clipboards.value = data
  })

  handleFetchClipboard()

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('get:clipboard-selected', () => {
    handleSelected()
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:clipboard-reload', () => {
    handleFetchClipboard()
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('get:clipboard-delete', () => {
    handleDelete()
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:clipboard-deleted', (_: never, result: boolean) => {
    if (!result) return
    handleFetchClipboard()
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:clipboard-cleared', (_: never, result: boolean) => {
    if (!result) return
    indexActive.value = 0
    clipboards.value = []
  })
})

const clipboard = computed<IClipboardManager | null>(() => {
  return clipboards.value[indexActive.value] ?? null
})

const handleClearSearch = () => {
  search.value = ''
  focusInputSearch()
}

const focusInputSearch = () => {
  inputSearch.value?.focus()
}

const handleFetchClipboard = () => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.send('get:clipboards')
}

const handleChangeIndexActive = (index: number) => {
  indexActive.value = index
}

const handleScrollList = () => {
  const list = document.querySelector('.content > .left > ul')
  const activeItem = document.querySelector('.content > .left li.active')

  const activeItemHeight = list.scrollHeight / list.children.length
  const itemBottom = activeItem['offsetTop'] + activeItemHeight

  if (itemBottom > list.clientHeight || clipboards.value.length - 1 === indexActive.value) {
    list.scrollTop =
      activeItem['offsetHeight'] -
      (activeItemHeight * 13 - list.clientHeight) +
      (indexActive.value - 11) * activeItemHeight
  } else {
    list.scrollTop = 0
  }
}

const getDataSelected = () => {
  return {
    index: indexActive.value,
    id: clipboards.value[indexActive.value]?.id ?? null
  }
}

const handleSelected = () => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.send('set:clipboard-selected', getDataSelected())
}

const handleDelete = () => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.send('set:clipboard-delete', getDataSelected())
}

const handleClear = () => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.send('set:clipboard-clear', true)
}
</script>

<template>
  <div class="main">
    <div class="toolbar">
      <input
        ref="inputSearch"
        v-model="search"
        type="text"
        placeholder="Search the clipboard history"
      />
      <div class="action">
        <svg
          v-show="isSearch"
          class="close"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          @click.prevent="handleClearSearch"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <a
          href="javascript:"
          class="base-svg"
          title="Reload histories"
          @click.prevent="handleFetchClipboard"
        >
          <svg
            class="reload"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </a>
        <a
          href="javascript:"
          class="base-svg"
          title="Clear all histories"
          @click.prevent="handleClear"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="reload"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </a>
        <a href="javascript:" class="base-svg" title="Setting histories">
          <svg xmlns="http://www.w3.org/2000/svg" class="setting" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />
          </svg>
          <!-- <svg xmlns="http://www.w3.org/2000/svg" class="setting" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
          </svg> -->
        </a>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <ul>
          <li
            v-for="(item, index) in clipboards"
            :key="index"
            :class="{ active: index === indexActive }"
            @mouseover="handleChangeIndexActive(index)"
            @dblclick="handleSelected()"
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
            <span class="text-content">{{ item.type === 'text' ? item.content : '[Image]' }}</span>
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
        </ul>
      </div>
      <div class="right">
        <template v-if="clipboard">
          <div class="heading">
            <span>
              <small
                >First copied {{ moment(clipboard.created_at).fromNow() }} in Clipger</small
              >
            </span>
          </div>
          <div class="showed">
            <div v-if="clipboard.type === 'text'" class="copied">
              <span>{{ clipboard.content }}</span>
            </div>
            <div v-if="clipboard.type === 'image'" class="copied">
              <img :src="`file://${clipboard.content}`" alt="" />
            </div>
          </div>
          <div class="footer-action">
            <button @click.prevent="handleSelected">Press enter to copy</button>
            <button @click.prevent="handleDelete">Delete from history</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./assets/main.scss"></style>
