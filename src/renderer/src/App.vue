
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
// @ts-ignore (define in dts)
import PreviewComponent from './components/Preview.vue'
// @ts-ignore (define in dts)
import ClipboardItemComponent from './components/ClipboardItem.vue'
// @ts-ignore (define in dts)
import NavbarComponent from './components/Navbar.vue'
// @ts-ignore (define in dts)
import SearchInputComponent from './components/SearchInput.vue'
// @ts-ignore (define in dts)
import { IClipboardManager } from '../../main/types/clipboard'
import lodash from 'lodash'

const search = ref<string>('')
const inputSearch = ref<HTMLElement | null>(null)
const clipboards = ref<IClipboardManager[]>([])
const indexActive = ref<number>(0)
const tabActive = ref<string>('list')

onMounted(() => {
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:focus-input', (_: never, value: boolean) => {
    if (!value) return
    handleResetData()
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
    indexActive.value = 0
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

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:tab-active', (_: never, tab: string) => {
    tabActive.value = tab
  })

  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.on('set:index-clipboard-selected', (_: never, index: number) => {
    indexActive.value = index
    handleSelected()
  })
})

watch(
  search,
  lodash.debounce((newValue) => {
    handleFetchClipboard()
  }, 500)
)

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

const handleFetchClipboard = (isConfirm: boolean = false) => {
  const params = {
    keyword: search.value
  }
  if (isConfirm) {
    if (confirm('Are you sure you want to reload?') === true) {
      // @ts-ignore (define in dts)
      window.electron.ipcRenderer.send('get:clipboards', params)
    }
    return
  }
  // @ts-ignore (define in dts)
  window.electron.ipcRenderer.send('get:clipboards', params)
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
  if (confirm('Are you sure you want to delete?') === true) {
    // @ts-ignore (define in dts)
    window.electron.ipcRenderer.send('set:clipboard-clear', true)
  }
}

const handleResetData = () => {
  indexActive.value = 0
  search.value = ''
}
</script>

<template>
  <div class="card">
    <!-- <NavbarComponent :tab-active="tabActive" /> -->
    <div class="main">
      <SearchInputComponent
        v-model="search"
        @handleClearSearch="handleClearSearch"
        @handleFetchClipboard="() => handleFetchClipboard(true)"
        @handleClear="handleClear"
      />
      <div class="content">
        <div class="left">
          <ul>
            <ClipboardItemComponent
              v-for="(item, index) in clipboards"
              :key="index"
              :isActive="index === indexActive"
              :index="index"
              :clipboard="item"
              @handleChangeIndexActive="handleChangeIndexActive(index)"
              @handleSelected="handleSelected()"
            />
          </ul>
        </div>
        <div class="right" v-if="clipboard">
          <PreviewComponent
            v-if="clipboard"
            :clipboard="clipboard"
            @handleSelected="handleSelected"
            @handleDelete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./assets/main.scss"></style>