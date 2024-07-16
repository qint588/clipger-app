import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export const getPathDatabase = () => {
  const userDataPath = app.getPath('userData')

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  return path.join(userDataPath, 'database-clipger-app.db')
}
