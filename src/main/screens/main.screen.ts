import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import TrayBuilder from '../tray'
import { is } from '@electron-toolkit/utils'
import ClipboardManager from '../services/clipboard'
import ShortCutBuilder from '../shortcut'
import icon from '../../../resources/icon.png?asset'

export default function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
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
    onQuit: () => {}
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then(console.log)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then(console.log)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then(console.log)
  }

  mainWindow.on('close', () => {
    app.quit()
  })

  mainWindow.on('blur', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    }
  })
  mainWindow['clipboardManager'] = new ClipboardManager(mainWindow)
  new ShortCutBuilder(mainWindow).build()

  return mainWindow
}
