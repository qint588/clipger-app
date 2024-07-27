import { app, BrowserWindow, protocol, shell } from 'electron'
import path, { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

export default function createMainWindow(): BrowserWindow {
  protocol.registerFileProtocol('local-icon', (request, callback) => {
    const url = request.url.substr(12)
    const filePath = path.normalize(`${__dirname}/${url}`)
    callback({ path: filePath })
  })
  const mainWindow = new BrowserWindow({
    width: 940,
    height: 584,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    hasShadow: false,
    frame: false
  })

  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  mainWindow.setWindowButtonVisibility(false)
  mainWindow.setSkipTaskbar(true)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then()
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then()
  }

  mainWindow.on('close', (event) => {
    if (is.dev) {
      app.quit()
    } else {
      event.preventDefault() // Prevent the default close behavior
      if (!app['isQuit']) {
        mainWindow.hide()
      } else {
        app.quit()
      }
    }
  })

  mainWindow.on('blur', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    }
  })

  return mainWindow
}
