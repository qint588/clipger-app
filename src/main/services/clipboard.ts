import { app, BrowserWindow, ipcMain } from 'electron'
import ClipboardWatcher from 'electron-clipboard-watcher'
import DatabaseBuilder from './database'
import { v4 as uuidv4 } from 'uuid'
import { IClipboardManager } from '../types/clipboard'

export default class ClipboardManager {
  protected mainWindow: BrowserWindow
  protected databaseBuilder!: DatabaseBuilder

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.createDatabase()
    this.init()
    this.watch()
  }

  createDatabase() {
    this.databaseBuilder = new DatabaseBuilder()
  }

  init() {
    app.whenReady().then(() => {
      ipcMain.on('get:clipboards', () => {
        const clipboards = this.databaseBuilder.findClipboards()
        this.mainWindow.webContents.send('push:clipboards', clipboards)
      })

      this.mainWindow.on('show', () => {
        this.mainWindow.webContents.send('set:focus-input', true)
      })
    })
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
        this.databaseBuilder.createClipboard(item)
      }
    })
  }
}
