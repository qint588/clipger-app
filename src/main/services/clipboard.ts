import electron, { app, BrowserWindow, ipcMain, nativeImage, NativeImage } from 'electron'
import ClipboardWatcher from 'electron-clipboard-watcher'
import DatabaseBuilder from './database'
import { v4 as uuidv4 } from 'uuid'
import { IClipboardManager } from '../types/clipboard'
import { execSync } from 'child_process'
import { formatBytes, getAppInformation, getPathImage, now, showNotification } from '../utils'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

interface DataSelectedEvent {
  index: number
  id: string | null
}

export default class ClipboardManager {
  protected mainWindow: BrowserWindow
  protected databaseBuilder!: DatabaseBuilder
  private isDisableListener: boolean = false

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
    if (this.isDisableListener) return
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
    item.attachment_path = path.join(folderImagePath, fileName)
    const buffer = nativeImage.toPNG()
    try {
      const { width, height } = nativeImage.getSize()
      let content = `Image ${width}x${height}px`
      await sharp(buffer).toFile(item.attachment_path)
      const stats: fs.Stats = await new Promise((resolve, reject) => {
        if (!item.attachment_path) {
          reject('Attachment path is null')
          return
        }
        fs.stat(item.attachment_path, (err, stats) => {
          if (err) {
            reject(err)
            return
          }
          resolve(stats)
        })
      })
      item.content = `${content} ${formatBytes(stats.size)}`
      this.processSaveClipboard(item)
    } catch (error: any) {
      showNotification('Error: ' + error.message)
    }
  }

  processSaveClipboardText(text: string) {
    if (this.isDisableListener) return
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

  async processSaveClipboard(item: IClipboardManager) {
    const appInformation = await getAppInformation()
    item = {
      ...item,
      created_at: now(),
      app_icon: appInformation.iconPath,
      app_name: appInformation.name
    }
    const result = this.databaseBuilder.createClipboard(item)
    if (result) {
      this.mainWindow.webContents.send('set:clipboard', result)
    }
  }

  init(): void {
    ipcMain.on('get:clipboards', (_, filters: { keyword?: string }) => {
      const clipboards = this.databaseBuilder.findClipboards(filters)
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
    this.isDisableListener = true
    const clipboard = this.databaseBuilder.findClipboard(data.id ?? '')
    if (clipboard) {
      this.copyToClipboard(clipboard)
      this.pasteToCurrentApp()
    }
    setTimeout(() => {
      this.isDisableListener = false
    }, 1000)
  }

  async processDelete(data: DataSelectedEvent) {
    if (!data.id) return

    const result = await this.databaseBuilder.deleteClipboard(data.id)
    if (result) {
      return this.mainWindow.webContents.send('set:clipboard-deleted', result)
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
    if (clipboard.type === 'image') {
      const image = nativeImage.createFromPath(clipboard.content)
      electron.clipboard.writeImage(image)
      this.databaseBuilder.transferClipboardToTop(clipboard.id)
    }
    this.mainWindow.webContents.send('set:clipboard-reload', true)
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

  setTab(tab: 'list' | 'pinned') {
    this.mainWindow.webContents.send('set:tab-active', tab)
  }
}
