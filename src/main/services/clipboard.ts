import electron, { app, BrowserWindow, ipcMain, NativeImage } from 'electron'
import ClipboardWatcher from 'electron-clipboard-watcher'
import DatabaseBuilder from './database'
import { v4 as uuidv4 } from 'uuid'
import { IClipboardManager } from '../types/clipboard'
import { execSync } from 'child_process'
import { getPathImage, showNotification } from '../utils'
import sharp from 'sharp'
import path from 'path'

interface DataSelectedEvent {
  index: number
  id: string | null
}

export default class ClipboardManager {
  protected mainWindow: BrowserWindow
  protected databaseBuilder!: DatabaseBuilder

  constructor() {
    this.mainWindow = app['mainWindow']
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
      onImageChange: (nativeImage: NativeImage) => this.processSaveClipboardImage(nativeImage),

      // handler for when text data is copied into the clipboard
      onTextChange: (text: string) => this.processSaveClipboardText(text)
    })
  }

  async processSaveClipboardImage(nativeImage: NativeImage) {
    const folderImagePath = getPathImage()
    const item: IClipboardManager = {
      id: uuidv4(),
      content: '',
      type: 'image',
      attachment_path: null,
      app_icon: null,
      app_name: null
    }
    const fileName = item.id + '.png'
    item.content = path.join(folderImagePath, fileName)
    const buffer = nativeImage.toPNG()
    try {
      await sharp(buffer).toFile(item.content)
      this.processSaveClipboard(item)
    } catch (error: any) {
      showNotification('Error saving TIFF file: ' + error.message)
    }
  }

  processSaveClipboardText(text: string) {
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
    this.processSaveClipboard(item)
  }

  processSaveClipboard(item: IClipboardManager) {
    const result = this.databaseBuilder.createClipboard(item)
    if (result) {
      this.mainWindow.webContents.send('set:clipboard', result)
    }
  }

  init(): void {
    ipcMain.on('get:clipboards', () => {
      const clipboards = this.databaseBuilder.findClipboards()
      this.mainWindow.webContents.send('push:clipboards', clipboards)
    })

    ipcMain.on('set:clipboard-selected', (_, data: DataSelectedEvent) => this.processSelected(data))

    ipcMain.on('set:clipboard-delete', (_, data: DataSelectedEvent) => this.processDelete(data))

    ipcMain.on('set:clipboard-clear', (_, result: boolean) => {
      if (!result) return
      this.processClear()
    })

    this.mainWindow.on('show', () => {
      this.mainWindow.webContents.send('set:focus-input', true)
    })
  }

  selected(): void {
    this.mainWindow.webContents.send('get:clipboard-selected', true)
  }

  delete(): void {
    this.mainWindow.webContents.send('get:clipboard-delete', true)
  }

  processSelected(data: DataSelectedEvent) {
    const clipboard = this.databaseBuilder.findClipboard(data.id ?? '')
    if (clipboard) {
      this.copyToClipboard(clipboard)
      this.pasteToCurrentApp()
    }
  }

  processDelete(data: DataSelectedEvent) {
    if (!data.id) return

    const result = this.databaseBuilder.deleteClipboard(data.id)
    if (result) {
      this.mainWindow.webContents.send('set:clipboard-deleted', result)
      return
    }
    showNotification('Error: fail on delete')
  }

  processClear() {
    const result = this.databaseBuilder.clearClipboards()
    if (result) {
      this.mainWindow.webContents.send('set:clipboard-cleared', result)
      return
    }
    showNotification('Error: fail on clear')
  }

  copyToClipboard(clipboard: IClipboardManager): void {
    if (clipboard.type === 'text' && clipboard.content.length) {
      electron.clipboard.writeText(clipboard.content, 'clipboard')
    }
  }

  async pasteToCurrentApp(): Promise<void> {
    if (process.platform === 'darwin') {
      await app.dock.show()
      execSync(
        `osascript -e 'tell application "System Events" to keystroke tab using command down'`
      )
      execSync(
        `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
      )
      await new Promise((resolve) => setTimeout(resolve, 750))
      app.dock.hide()
    }
  }
}
