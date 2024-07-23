import { app, Notification } from 'electron'
import fs from 'fs'
import moment from 'moment'
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

export const getPathImage = (): string => {
  const userDataPath = app.getPath('userData')

  const folderPath = path.join(userDataPath, 'Images')
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  return folderPath
}

export const showNotification = (message: string): void => {
  const title = 'Clipger App'
  const settings = {
    title: title,
    body: message
  }
  new Notification(settings).show()
}

export const now = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss')
}
