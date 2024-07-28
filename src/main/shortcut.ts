import { app, BrowserWindow, globalShortcut } from 'electron'
import ClipboardManager from './services/clipboard'
import localShortcut from 'electron-localshortcut'
import { showNotification } from './utils'

export default class ShortCutBuilder {
  mainWindow: BrowserWindow
  clipboardManager: ClipboardManager

  constructor() {
    this.mainWindow = app['mainWindow']
    this.clipboardManager = app['clipboardManager']
  }

  build() {
    globalShortcut.register('Command+shift+space', () => {
      !this.mainWindow.isVisible() ? this.mainWindow.show() : this.mainWindow.hide()
    })

    localShortcut.register(this.mainWindow, 'Esc', () => this.mainWindow.hide())
    localShortcut.register('Enter', () => {
      this.clipboardManager.selected()
    })
    localShortcut.register('Command+X', () => this.clipboardManager.delete())
    localShortcut.register('Command+L', () => {
      this.clipboardManager.setTab('list')
    })
    localShortcut.register('Command+P', () => {
      this.clipboardManager.setTab('pinned')
    })
    for (let i = 0; i <= 9; i++) {
      localShortcut.register(`Command+${i}`, () => {
        console.log({ i })
        this.clipboardManager.setSelected(i === 0 ? 9 : i - 1)
      })
    }
  }
}
