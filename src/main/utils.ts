import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export const getPathDatabase = (): string => {
  const userDataPath = app.getPath('userData')

  const folderDatabasePath = path.join(userDataPath, 'Databases')
  if (!fs.existsSync(folderDatabasePath)) {
    fs.mkdirSync(folderDatabasePath, { recursive: true })
  }

  const fileDatabasePath = path.join(folderDatabasePath, 'clipger_app.db')
  if (!fs.existsSync(fileDatabasePath)) {
    fs.writeFileSync(fileDatabasePath, '')
  }

  return fileDatabasePath
}
