import { getPathDatabase } from '../utils'
import Database from 'better-sqlite3'
import { IClipboardManager, LIMIT_SIZE } from '../types/clipboard'

export default class DatabaseBuilder {
  private db!: Database.Database

  constructor() {
    this.createDataBase().then()
  }

  async createDataBase(): Promise<boolean> {
    try {
      const path = getPathDatabase()
      this.db = new Database(path, { verbose: console.log, fileMustExist: true })
      this.initClipboardTable()
      return true
    } catch (error) {
      console.log(error)
      return false
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
    this.getInstant().exec(sql)
  }

  createClipboard(data: IClipboardManager): IClipboardManager | null {
    const sql = `INSERT INTO clipboard_histories (id, content, attachment_path, type, app_icon, app_name)
        VALUES (@id, @content, @attachment_path, @type, @app_icon, @app_name)`
    this.getInstant().prepare(sql).run(data)
    return this.findClipboard(data.id)
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
}
