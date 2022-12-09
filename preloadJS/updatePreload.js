const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld('api', {
  sendMessage: function(option){
    ipcRenderer.send('message', option);
  },
  receiveProgress: function(func){
    ipcRenderer.on('update-progress', (event, ...args) => func(event, ...args));
  },
});