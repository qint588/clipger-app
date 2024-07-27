import { app, BrowserWindow, globalShortcut } from 'electron'
import ClipboardManager from './services/clipboard'
import localShortcut from 'electron-localshortcut'

export default class ShortCutBuilder {
  mainWindow: BrowserWindow
  clipboardManager: ClipboardManager

  constructor() {
    this.mainWindow = app['mainWindow']
    this.clipboardManager = app['clipboardManager']
  }

  build() {
    globalShortcut.register('Control+space', () => {
      !this.mainWindow.isVisible() ? this.mainWindow.show() : this.mainWindow.hide()
    })

    localShortcut.register(this.mainWindow, 'Esc', () => this.mainWindow.hide())
    localShortcut.register('Enter', () => {
      this.clipboardManager.selected()
    })
    localShortcut.register('Command+X', () => this.clipboardManager.delete())
  }
}
