import { BrowserWindow, globalShortcut } from 'electron'

export default class ShortCutBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  build() {
    globalShortcut.register('Control+space', () => {
      !this.mainWindow.isVisible() ? this.mainWindow.show() : this.mainWindow.hide()
    })

    this.mainWindow.on('show', () => {
      // globalShortcut.register('Enter', () => {
      //   console.log('Enter key is pressed')
      // })
      globalShortcut.register('esc', () => {
        this.mainWindow.hide()
      })
    })

    this.mainWindow.on('hide', () => {
      globalShortcut.unregister('esc')
      globalShortcut.unregister('Enter')
    })
  }
}
