const { app, BrowserWindow } = require('electron');
const { handleUpdate } = require('./autoUpdater')

function createWindow () {
  const myWin = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })


  myWin.loadFile('main/index.html')
  myWin.webContents.openDevTools()
  handleUpdate(myWin);


}

app.whenReady().then(() => {
  createWindow()
})