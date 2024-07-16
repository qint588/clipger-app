import Database from 'better-sqlite3'
import { getPathDatabase } from '../utils'

export default class DatabaseBuilder {
  db: Database.Database

  constructor() {
    this.db = new Database(getPathDatabase(), {
      verbose: console.log,
      fileMustExist: true
    })
    this.createTable()
  }

  createTable() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS clipboard_histories (
      id TEXT PRIMARY KEY,
      data TEXT ,
      type VARCHAR(50) NOT NULL,
      attachment_path TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`)
  }
}
