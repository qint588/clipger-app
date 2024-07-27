import { app, nativeImage, Notification } from 'electron'
import fs from 'fs'
import moment from 'moment'
import path, { resolve } from 'path'
import appleScript from 'applescript'
import sharp from 'sharp'

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

export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const getAppInformation = (): Promise<{ name: string; iconPath: string | null }> => {
  return new Promise((resolve, reject) => {
    const getFrontmostAppScript = `
      tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
        return frontApp
      end tell
    `
    appleScript.execString(getFrontmostAppScript, async (err, frontAppName) => {
      if (err) {
        reject('Error getting frontmost application name: ' + err)
        console.error('Error getting frontmost application name:', err)
        return
      }
      console.log('Frontmost application:', frontAppName)
      // const iconPath = await getIconsFromAppName(frontAppName)
      resolve({
        name: frontAppName,
        iconPath: null
      })
    })
  })
}

export const getIconsFromAppName = (frontAppName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const getAppPathScript = `
      tell application "System Events"
        set appPath to (path to application "${frontAppName}") as text
        return appPath
      end tell
    `
    appleScript.execString(getAppPathScript, (iconErr, appPath) => {
      if (iconErr) {
        reject('Error getting application path: ' + iconErr)
      } else {
        console.log('Application path:', appPath)
        // Convert Mac path to POSIX path in JavaScript
        const posixAppPath = appPath.replace(/:/g, '/').replace('Macintosh HD', '')
        const resourcesPath = path.join(posixAppPath, 'Contents', 'Resources')

        // List all .icns files in the Resources directory
        fs.readdir(resourcesPath, async (readErr, files) => {
          if (readErr) {
            reject('Error reading Resources directory: ' + readErr)
            return
          }

          const icnsFiles = files.filter((file) => file.endsWith('.icns'))
          if (icnsFiles.length > 0) {
            const iconPath = path.join(resourcesPath, icnsFiles[0])
            console.log(iconPath)
            const iconNativeImage = nativeImage.createFromDataURL(iconPath)
            const iconLocalPath = path.join(getPathImage(), 'icons', `${frontAppName}.png`)
            console.log({ iconLocalPath, iconNativeImage })
            await sharp(iconNativeImage.toPNG()).toFile(iconLocalPath)
            resolve(iconLocalPath)
          } else {
            reject('No .icns files found in Resources directory')
          }
        })
      }
    })
  })
}
