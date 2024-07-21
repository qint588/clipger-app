import electron, { app, BrowserWindow, ipcMain } from 'electron'
import ClipboardWatcher from 'electron-clipboard-watcher'
import DatabaseBuilder from './database'
import { v4 as uuidv4 } from 'uuid'
import { IClipboardManager } from '../types/clipboard'
import wxw from 'wxw'
import { execSync } from 'child_process'

interface DataSelectedEvent {
  index: number
  id: string | null
}

export default class ClipboardManager {
  protected mainWindow: BrowserWindow
  protected databaseBuilder!: DatabaseBuilder

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.createDatabase()
    this.watch()
    app.whenReady().then(() => {
      this.init()
    })
  }

  createDatabase() {
    this.databaseBuilder = new DatabaseBuilder()
  }

  watch() {
    ClipboardWatcher({
      // (optional) delay in ms between polls
      watchDelay: 500,

      // handler for when image data is copied into the clipboard
      onImageChange: (nativeImage: never) => {
        console.log(nativeImage)
      },

      // handler for when text data is copied into the clipboard
      onTextChange: (text: string) => {
        if (text.trim().length == 0 || this.mainWindow.isVisible()) {
          return
        }
        const item: IClipboardManager = {
          id: uuidv4(),
          content: text,
          type: 'text',
          attachment_path: null,
          app_icon: null,
          app_name: null
        }
        const result = this.databaseBuilder.createClipboard(item)
        if (result) {
          this.mainWindow.webContents.send('set:clipboard', result)
        }
      }
    })
  }

  init(): void {
    ipcMain.on('get:clipboards', () => {
      const clipboards = this.databaseBuilder.findClipboards()
      this.mainWindow.webContents.send('push:clipboards', clipboards)
    })

    ipcMain.on('set:clipboard-selected', (_, data: DataSelectedEvent) =>
      this.processSelected(data)
    )

    this.mainWindow.on('show', () => {
      this.mainWindow.webContents.send('set:focus-input', true)
    })
  }

  selected(): void {
    this.mainWindow.webContents.send('get:clipboard-selected', true)
    ipcMain.once('push:clipboard-selected', (_, data: DataSelectedEvent) =>
      this.processSelected(data)
    )
  }

  processSelected(data: DataSelectedEvent) {
    const clipboard = this.databaseBuilder.findClipboard(data.id ?? '')
    if (clipboard) {
      this.copyToClipboard(clipboard)
      this.pasteToCurrentApp()
    }
    this.mainWindow.hide()
  }

  copyToClipboard(clipboard: IClipboardManager): void {
    if (clipboard.type === 'text' && clipboard.content.length) {
      electron.clipboard.writeText(clipboard.content, 'clipboard')
    }
  }

  pasteToCurrentApp(): void {
    if (process.platform === 'win32') {
      setTimeout(() => wxw('key', 'ctrl+v'), 20)
    } else if (process.platform === 'darwin') {
      execSync(
        `osascript -e 'tell application "System Events" to keystroke tab using command down'`
      )
      execSync(
        `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
      )
    }
  }
}
