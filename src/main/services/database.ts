import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'

export default class DatabaseBuilder {
  db: Database.Database

  constructor() {
    this.db = new Database(this.getPath(), {
      verbose: console.log
    })
  }

  getPath() {
    const userDataPath = app.getPath('userData')

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    return path.join(userDataPath, 'database-clipger-app.db')
  }

  findAllCat() {
    return this.db.prepare('SELECT * from cats').all()
  }
}
