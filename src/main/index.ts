import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Tray,
  Menu,
  nativeImage
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow
let tray: Tray
let isQuitting = false

function createWindow(): void {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  mainWindow = new BrowserWindow({
    width: 940,
    height: 580,
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

  let trayIcon = nativeImage.createFromPath(icon)
  trayIcon = trayIcon.resize({ width: 16, height: 16 })

  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

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

  mainWindow.on('show', () => {
    mainWindow.webContents.send('focus-input', true)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.openDevTools()
  })

  mainWindow.on('blur', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  globalShortcut.register('Control+space', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    } else {
      mainWindow.hide()
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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
