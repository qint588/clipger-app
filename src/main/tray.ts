import { BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import icon from '../../resources/icon.png?asset'

interface Props {
  app: Electron.App
  mainWindow: BrowserWindow
  onQuit: () => void
}

const initTray = ({ mainWindow, onQuit }: Props) => {
  let trayIcon = nativeImage.createFromPath(icon)
  trayIcon = trayIcon.resize({ width: 16, height: 16 })

  let tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: () => onQuit()
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  return tray
}

export default initTray
