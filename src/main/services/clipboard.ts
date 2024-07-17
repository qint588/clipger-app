import { BrowserWindow } from 'electron'
import DatabaseBuilder from './database'
import clipboardWatcher from 'electron-clipboard-watcher'
import { v4 as uuidv4 } from 'uuid'

export enum TypeClipboardHistory {
  Text = 'text',
  Image = 'image'
}

export interface IClipboardManager {
  id?: number
  data: string | null
  type: TypeClipboardHistory
  attachment_path?: string | null
  created_at?: string
  updated_at?: string
}

export default class ClipboardManager {
  mainWindow: BrowserWindow
  builder: DatabaseBuilder

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.builder = new DatabaseBuilder()

    this.watch()
  }

  watch() {
    clipboardWatcher({
      // (optional) delay in ms between polls
      watchDelay: 500,

      // handler for when image data is copied into the clipboard
      onImageChange: (nativeImage) => {
        console.log(nativeImage)
      },

      // handler for when text data is copied into the clipboard
      onTextChange: (text: string) => {
        if (text.trim().length == 0) {
          return
        }
        this.store({
          data: text,
          type: TypeClipboardHistory.Text
        })
      }
    })
  }

  store(data: IClipboardManager) {
    const queryBuilder = this.builder.db.prepare(
      'INSERT INTO clipboard_histories (id, data, type, attachment_path) VALUES (?, ?, ?, ?)'
    )
    const result = queryBuilder.run(uuidv4(), data.data, data.type, data.attachment_path)
    console.log('STORE_CLIPBOARD_HISTORY', result)
  }

  findAll(limit: number = 1000): Array<IClipboardManager> {
    const queryBuilder = this.builder.db.prepare(
      'SELECT * FROM clipboard_histories ORDER BY created_at DESC LIMIT ?'
    )
    return queryBuilder.all(limit) as Array<IClipboardManager>
  }
}
