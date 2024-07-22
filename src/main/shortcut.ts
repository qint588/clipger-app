import { app, BrowserWindow, globalShortcut } from 'electron'
import ClipboardManager from './services/clipboard'

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

    this.mainWindow.on('show', () => {
      globalShortcut.register('Enter', () => {
        this.clipboardManager.selected()
      })
      globalShortcut.register('command+x', () => {
        console.log('Command+delete key is pressed')
      })
      globalShortcut.register('command+p', () => {
        console.log('Command+p key is pressed')
      })
      globalShortcut.register('esc', () => {
        this.mainWindow.hide()
      })
    })

    this.mainWindow.on('hide', () => {
      globalShortcut.unregister('esc')
      globalShortcut.unregister('Enter')
      globalShortcut.unregister('command+p')
      globalShortcut.unregister('command+x')
    })
  }
}
