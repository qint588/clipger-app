import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import icon from '../../resources/icon.png?asset'

export default class TrayBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  build(props: { onQuit: () => void }) {
    let trayIcon = nativeImage.createFromPath(icon)
    trayIcon = trayIcon.resize({ width: 16, height: 16 })

    let tray = new Tray(trayIcon)
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
          props.onQuit()
          app.quit()
        }
      }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
  }
}
