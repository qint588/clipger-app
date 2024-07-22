import { app, Notification } from 'electron'
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

export const showNotification = (message: string): void => {
  const title = 'Clipger App'
  const settings = {
    title: title,
    body: message
  }
  new Notification(settings).show()
}
