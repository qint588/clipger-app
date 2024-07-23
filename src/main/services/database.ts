import { getPathDatabase, getPathImage, now } from '../utils'
import Database from 'better-sqlite3'
import { IClipboardManager, LIMIT_SIZE } from '../types/clipboard'
import fs from 'fs'
import path from 'path'

export default class DatabaseBuilder {
  private db!: Database.Database

  constructor() {
    this.createDataBase().then()
  }

  async createDataBase(): Promise<boolean> {
    try {
      const path = getPathDatabase()
      this.db = new Database(path, { fileMustExist: true })
      this.initClipboardTable()
    } catch (error) {
      console.log('Error', error)
    } finally {
      return true
    }
  }

  getInstant(): Database.Database {
    return this.db
  }

  initClipboardTable(): void {
    const sql = `CREATE TABLE IF NOT EXISTS clipboard_histories (
      id TEXT PRIMARY KEY,
      content TEXT,
      attachment_path TEXT,
      type TEXT,
      app_icon TEXT,
      app_name TEXT,
      created_at DATETIME
    )`
    this.getInstant().exec(sql)
  }

  createClipboard(data: IClipboardManager): IClipboardManager | null {
    const clipboardExist = this.findClipboardByContent(data.content)
    if (clipboardExist) {
      this.deleteClipboard(clipboardExist.id)
    }
    const sql = `INSERT INTO clipboard_histories (id, content, attachment_path, type, app_icon, app_name, created_at)
        VALUES (@id, @content, @attachment_path, @type, @app_icon, @app_name, @created_at)`
    this.getInstant().prepare(sql).run(data)
    return this.findClipboard(data.id)
  }

  transferClipboardToTop(id: string): boolean {
    const queryBuilder = this.getInstant().prepare(
      'UPDATE clipboard_histories SET created_at = ? WHERE id = ?'
    )
    return !!queryBuilder.run(now(), id)
  }

  findClipboardByContent(content: string): IClipboardManager | null {
    const queryBuilder = this.getInstant().prepare(
      'SELECT * FROM clipboard_histories WHERE content = ?'
    )
    return queryBuilder.get(content) as IClipboardManager | null
  }

  findClipboard(id: string): IClipboardManager | null {
    const queryBuilder = this.getInstant().prepare('SELECT * FROM clipboard_histories WHERE id = ?')
    return queryBuilder.get(id) as IClipboardManager | null
  }

  findClipboards(limit: number = LIMIT_SIZE): Array<IClipboardManager> {
    const queryBuilder = this.getInstant().prepare(
      'SELECT * FROM clipboard_histories ORDER BY created_at DESC LIMIT ?'
    )
    return queryBuilder.all(limit) as Array<IClipboardManager>
  }

  async deleteClipboard(id: string): Promise<boolean> {
    const clipboard = this.findClipboard(id)
    if (!clipboard) {
      return false
    }

    const sql = 'DELETE FROM clipboard_histories WHERE id = ?'
    const result = !!this.getInstant().prepare(sql).run(id)

    if (result && clipboard.type === 'image') {
      await fs.unlinkSync(clipboard.content)
    }
    return true
  }

  clearClipboards(): boolean {
    const sql = 'DELETE FROM clipboard_histories'
    const result = !!this.getInstant().prepare(sql).run()
    if (result) {
      const directory = getPathImage()
      const files = fs.readdirSync(directory)
      for (const file of files) {
        const filePath = path.join(directory, file)
        fs.unlinkSync(filePath)
      }
    }
    return true
  }
}
