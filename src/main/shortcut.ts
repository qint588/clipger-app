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
  }
}
