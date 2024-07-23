import { app, protocol } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import createMainWindow from './screens/main.screen'
import ClipboardManager from './services/clipboard'
import ShortCutBuilder from './shortcut'
import TrayBuilder from './tray'

function init() {
  app['mainWindow'] = createMainWindow()

  new TrayBuilder().build()

  app['clipboardManager'] = new ClipboardManager()

  app['shortCutBuilder'] = new ShortCutBuilder()
  app['shortCutBuilder'].build()
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true
    }
  }
])

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  init()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
