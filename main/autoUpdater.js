
const { ipcMain, BrowserWindow, app } = require('electron')
const path = require('path');
const dialog = require('electron').dialog;
const { autoUpdater } = require("electron-updater")
const os = require('os')
var log = require('electron-log')
log.transports.console.level = 'silly'
log.transports.file.level = 'info'

var platform = os.platform() + '_' + os.arch();  // usually returns darwin_64
let updateWin = null;
// var version = app.getVersion();
const isMac = process.platform === 'darwin';

function handleUpdate (winInstance) {
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
  // if (process.env.NODE_ENV === 'development') {
  //   if (!isMac) {
  //     autoUpdater.updateConfigPath = path.join(__dirname, 'latest.yml')
  //     // mac的地址是'Contents/Resources/app-update.yml'
  //   } else {
  //     autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  //   }
  // }

  const updateURL = `http://electron-update.plusdoit.com/update/${platform}/stable`;
  autoUpdater.setFeedURL(updateURL)
  autoUpdater.on('error', function () {
    sendUpdateMessage(winInstance, message.error)
    updateWin.destroy();
  })
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(winInstance, message.checking)
  })
  autoUpdater.on('update-available', async function (info) {
    await dialog.showMessageBox({
      type: "info",
      title: "检查到新版本!",
      buttons: ["立即更新"],
      detail: "更新后重启可用!",
      message: `发现新版本${info.version}`
    })
    sendUpdateMessage(winInstance, info)

    updateWin = new BrowserWindow({
      parent: winInstance,
      modal: true,
      width: 240,
      frame: false,
      height: 160,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

    updateWin.loadFile(
      path.join(__dirname, "../appUpdate/index.html")
    );
  })
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(winInstance, message.updateNotAva)
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    updateWin.webContents.send('download-progress', progressObj.percent)
  })
  autoUpdater.on('update-downloaded', async function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    log.warn('开始更新')
    updateWin.destroy();
    await dialog.showMessageBox({
      type: "info",
      title: "立即重启!",
      buttons: ["确定"],
      message: `重启更新`
    })
    autoUpdater.quitAndInstall()


    // ipcMain.on('isUpdateNow', (e, arg) => {
    //   log.warn('开始更新')
    //   autoUpdater.quitAndInstall()
    //   winInstance.destroy()
    //   app.relaunch()
    //   app.exit()
    // })
    // sendUpdateMessage(winInstance, 'isUpdateNow')
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
function sendUpdateMessage (win, text) {
  win.webContents.send('message', text)
}


module.exports = { handleUpdate, sendUpdateMessage }