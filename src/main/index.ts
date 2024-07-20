import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import TrayBuilder from './tray'
import ShortCutBuilder from './shortcut'
import ClipboardManager from './services/clipboard'

let mainWindow: BrowserWindow
let isQuitting = false

function createWindow(): void {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  mainWindow = new BrowserWindow({
    width: 940,
    height: 584,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    hasShadow: false,
    frame: false
  })

  mainWindow.setWindowButtonVisibility(false)
  mainWindow.setSkipTaskbar(true)

  new TrayBuilder(mainWindow).build({
    onQuit: () => {
      isQuitting = true
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.show()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting && !is.dev) {
      event.preventDefault()
      mainWindow.hide()
    } else {
      app.quit()
    }
  })

  mainWindow.on('blur', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    }
  })
  mainWindow.webContents.openDevTools()

  new ShortCutBuilder(mainWindow).build()
  new ClipboardManager(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (mainWindow === null) {
      createWindow()
    } else {
      mainWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
