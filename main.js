const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const os = require('os');
var log = require('electron-log')
log.transports.console.level = 'silly'
// 注意这个autoUpdater不是electron中的autoUpdater
const { autoUpdater } = require("electron-updater")
log.transports.file.level = 'info'
// var autoUpdater = require('electron').autoUpdater;

var platform = os.platform() + '_' + os.arch();  // usually returns darwin_64
var version = app.getVersion();

// autoUpdater.setFeedURL('http://download.myapp.com/update/'+platform+'/'+version);

let myWin = null;


function handleUpdate () {
  console.log(process.env.NODE_ENV, 1234)
  //= =================================================================================================================
  const message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  }
  // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
  autoUpdater.autoDownload = true
  // https://github.com/electron-userland/electron-builder/issues/1254
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  }
  // if (process.env.NODE_ENV === 'development') {
  //   autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  // } else {
  //   autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  // }
  const updateURL = `http://electron-update.plusdoit.com/update/${platform}/stable`;
  autoUpdater.setFeedURL(updateURL)
  autoUpdater.on('error', function () {
    sendUpdateMessage(message.error)
    // myWin.webContents.send(message.error)
  })
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
    // myWin.webContents.send(message.checking)
  })
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(info)
    // myWin.webContents.send(message.updateAva)
  })
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva)
    // myWin.webContents.send(message.updateNotAva)
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    // log.warn('触发下载。。。')
    // console.log(progressObj)
    // log.warn(progressObj)
    sendUpdateMessage(progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    ipcMain.on('isUpdateNow', (e, arg) => {
      log.warn('开始更新')
      autoUpdater.quitAndInstall()
      myWin.destroy()
      // callback()
    })
    sendUpdateMessage('isUpdateNow')
  })

  ipcMain.on('checkForUpdate', () => {
    // 执行自动更新检查
    log.warn('执行自动更新检查')
    log.warn(__dirname)
    autoUpdater.checkForUpdates()
  })

  ipcMain.on('downloadUpdate', () => {
    // 下载
    log.warn('执行下载')
    autoUpdater.downloadUpdate()
  })
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage (text) {
  myWin.webContents.send('message', text)
}

function createWindow () {
  myWin = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })
  myWin.loadFile('index.html')
  myWin.webContents.openDevTools()
  handleUpdate();
  myWin.webContents.on('did-finish-load', () => {
    // win.webContents.send('message', 'whoooooooh!')
  })


}

// 192.168.3.137
// CSC_IDENTITY_AUTO_DISCOVERY=false 

app.whenReady().then(() => {
  createWindow()
})