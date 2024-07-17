<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {ALL_CLIPBOARD, FETCH_ALL_CLIPBOARD, FOCUS_INPUT} from './constants'
import {IClipboardManager} from './types'

const search = ref<string>('')
const inputSearch = ref<HTMLElement|null>(null)
const isSearch = computed(() => search.value.length)
const clipboards = ref<IClipboardManager[]>([])
const indexActive = ref<number>(0)

onMounted(() => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on(FOCUS_INPUT, (_, value: boolean) => {
    if(!value) return
    indexActive.value = 0
    focusInputSearch()
  })

  handleFetchClipboard()
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
  window.electron.ipcRenderer.send(FETCH_ALL_CLIPBOARD)

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on(ALL_CLIPBOARD, (_, data: IClipboardManager[]) => {
    clipboards.value = data
  })
}
</script>

<template>
  <div class="main">
    <div class="toolbar">
      <input type="text" ref="inputSearch" v-model="search" placeholder="Search the clipboard history" />
      <div class="action">
        <svg v-show="isSearch" @click.prevent="handleClearSearch" class="close" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <svg class="reload" @click.prevent="handleFetchClipboard" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <svg class="setting" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <ul>
          <li :class="{'active': index === indexActive}" v-for="(item, index) in clipboards" :key="index">
            <img src="https://cdn.icon-icons.com/icons2/836/PNG/512/Google_Chrome_icon-icons.com_66794.png" width="20" height="20" />
            <span class="text-content">{{ item.data }}</span>
            <div class="shortcut">
              <template v-if="index <= 9">
                <img class="icon-command" width="11" height="11" src="https://static-00.iconduck.com/assets.00/mac-command-icon-2048x2048-8rpyvqiu.png" />
                <span>{{ index != 9 ? index + 1 : 0 }}</span>
              </template>
              </div>
          </li>
        </ul>
      </div>
      <div class="right">
        <!-- <div class="heading">
          <span>
            <small>First copied 48 seconds ago in Google Chrome</small>
          </span>
        </div>
        <div class="showed">
          <div class="copied">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjsJg0VZ_OohPt6dIBkUV2kloFjIo-7M0q2Q&s" />
          </div>
          <div class="copied">
            <span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident eum unde repellat ad doloremque, sapiente deserunt, nesciunt minima quae inventore eos tenetur. Asperiores nemo aspernatur, vitae placeat repudiandae dolorum maxime. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia tempora debitis cupiditate animi similique repellat. Fugit dolores rem quaerat, voluptatibus recusandae quidem molestias sint atque dicta illum rerum voluptates <autem class="lo"></autem></span>
          </div>
          <div class="copied">
            <a href="https://florian.github.io/clipgerapp/">https://florian.github.io/clipgerapp/</a>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./assets/main.scss"></style>
