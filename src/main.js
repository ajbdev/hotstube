const electron = require('electron')
const {app, MenuItem, Menu, BrowserWindow, Tray} = require('electron')
const path = require('path')
const url = require('url')
const HighlightDir = require('./lib/HighlightDir')
const ELECTRON_ENV = require('./env').env
const glob = require('glob')
const fs = require('fs')
const Config = require('./lib/Config')
const os = require('os')
const _env = require('./env').env
const Rollbar = require('rollbar')

Config.load()

if (_env !== 'development') {
  let opts = Object.assign({}, Config.options)

  if (opts.streamablePassword && opts.streamablePassword.length > 0) {
    opts.streamablePassword = '******'
  }

  const rollbar = new Rollbar({
    accessToken: '5209cc3fb71f498190ecf601df11d98b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: _env,
    payload: {
      config: opts,
      version: app.version,
      context: 'main-threads'
    }
  })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    resizable: true,
    show: false,
    backgroundColor: '#2a2a2a',
    webPreferences: {
      webSecurity: false,
      nodeIntegrationInWorker: true
    },
    icon: path.join(__dirname, './assets/icons/64x64.png')
  })

  if (os.platform() == 'win32' && Config.options.minimizeToTray) {
    app.tray = new Tray(path.join(__dirname, './assets/icons/logo.ico'))

    let contextMenu = Menu.buildFromTemplate([
      {
          label: 'Open', 
          click: () => {
              mainWindow.show()
          }
      },
      // {
      //     label: 'Run on startup',
      //     type: 'checkbox',
      //     checked: Config.options.openOnLogin,
      //     click: (a,b,c) => {
      //       Config.options.openOnLogin = this.checked
      //       Config.save()
      //     }
      // },
      {
          label: 'Quit', 
          click: () =>  {
              app.isQuitting = true
              app.quit()
          }
      }
    ])

    mainWindow.setMinimizable(false)

    app.tray.setToolTip('HotSTube')
    app.tray.setContextMenu(contextMenu)
    app.tray.on('click', () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
    })

    mainWindow.on('close', function (event) {
      if (!app.isQuitting) {
        event.preventDefault()
        mainWindow.hide()
      }
    })
    mainWindow.on('minimize', function (event) {
        event.preventDefault()
        mainWindow.hide()
    })
    mainWindow.on('show', function () {
        app.tray.setHighlightMode('always')
    })

  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (Config.options.minimizeOnStartup) {
      mainWindow.minimize()
    }
  })


  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (ELECTRON_ENV === 'development') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

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

app.on('window-all-closed',  () => {
  deleteTmpData()
  app.isQuitting = true
  app.quit()
})

const deleteTmpData = () => {
  let dir = app.getPath('userData')
  
  glob(path.join(dir,"/*.webm"), (err, files) => {
    files.map((file) => {
      fs.unlink(file, (err) => {
        if (err) {
            console.log('Could not delete ' + file + ': ' + err)
        }
      })
    })
  })    
}


deleteTmpData()