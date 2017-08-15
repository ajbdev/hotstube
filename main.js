const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 640, 
    height: 480,
    resizable: false,
    show: false,
    backgroundColor: '#2a2a2a',
    icon: path.join(__dirname, './assets/icons/64x64.png')
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })


  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'detach' })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.setName('HotSTube')

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  app.quit()
})