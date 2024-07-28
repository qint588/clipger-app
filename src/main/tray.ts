import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import icon from '../../resources/icon.png?asset'

export default class TrayBuilder {
  protected mainWindow: BrowserWindow

  constructor() {
    this.mainWindow = app['mainWindow']
  }

  build() {
    let trayIcon = nativeImage.createFromPath(icon)
    trayIcon = trayIcon.resize({ width: 16, height: 16 })

    const tray = new Tray(trayIcon)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          this.mainWindow.show()
        }
      },
      {
        label: 'Quit',
        click: () => {
          app['isQuit'] = true
          app.quit()
        }
      }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
  }
}
