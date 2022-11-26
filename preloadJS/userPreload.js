const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld('api', {
  addUserBridge: function(option) {
    ipcRenderer.send('add-user', option);
  }
})