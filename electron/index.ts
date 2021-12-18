import { app, BrowserWindow, Tray, protocol } from 'electron'
import path from 'path'

const toggleWindow = (window: BrowserWindow, tray: Tray) => {
  if (window.isVisible()) window.hide()
  else {
    const windowBounds = window.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    window.setPosition(x, y, false)
    window.show()
    window.focus()
  }
}

const adjustRenderer = async (directory: string) => {
  const paths = ['/_next', '/static']

  protocol.interceptFileProtocol('file', (request, callback) => {
    const filePath = request.url.substr(7)
    let newFilePath = filePath

    for (const prefix of paths) {
      if (!newFilePath.startsWith(prefix)) {
        continue
      }

      newFilePath = path.join(directory, 'out', newFilePath)
    }

    // Electron doesn't like anything in the path to be encoded,
    // so we need to undo that. This specifically allows for
    // Electron apps with spaces in their app names.
    newFilePath = decodeURIComponent(newFilePath)

    callback({ path: newFilePath })
  })
}

// // Don't show the app in the doc
app.dock.hide()

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  adjustRenderer(path.join(__dirname, '../renderer'))

  const mainWindow = new BrowserWindow({
    width: 370,
    height: 600,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: false,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
    },
  })

  const tray = new Tray(path.join(__dirname, 'assets/logo.png'))
  tray
    .on('right-click', () => toggleWindow(mainWindow, tray))
    .on('double-click', () => toggleWindow(mainWindow, tray))
    .on('click', () => toggleWindow(mainWindow, tray))

  mainWindow
    .on('blur', () => {
      if (!mainWindow.webContents.isDevToolsOpened()) mainWindow.hide()
    })
    .loadURL(!app.isPackaged ? 'http://localhost:3000' : `file://${path.join(__dirname, '../index.html')}`)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)
