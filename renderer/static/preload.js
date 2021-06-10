const { ipcRenderer, remote } = require('electron');

window.$remote = remote;
window.$ipcRenderer = ipcRenderer;

ipcRenderer.invoke('get-main-web-content-id').then(id=>{
  window.$mainWebContentId = id;
})