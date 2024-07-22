<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import moment from 'moment'
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
    clipboards.value = [value, ...clipboards.value].slice(0, LIMIT_SIZE)
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

  window.electron.ipcRenderer.on('get:clipboard-selected', () => {
    console.log('hello')
    handleSelected()
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

const handleSelected = () => {
  window.electron.ipcRenderer.send('set:clipboard-selected', {
    index: indexActive.value,
    id: clipboards.value[indexActive.value]?.id ?? null
  })
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
        <svg
          class="reload"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          @click.prevent="handleFetchClipboard"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        <svg
          class="setting"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
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
            <span class="text-content">{{ item.content }}</span>
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
                >First copied {{ moment(clipboard.created_at).fromNow() }} in Google Chrome</small
              >
            </span>
          </div>
          <div class="showed">
            <div v-if="clipboard.type === 'text'" class="copied">
              <span>{{ clipboard.content }}</span>
            </div>
          </div>
          <div class="footer-action">
            <button @click.prevent="handleSelected">Press enter to copy</button>
            <button>Delete from history</button>
            <button>Pin to history</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./assets/main.scss"></style>
