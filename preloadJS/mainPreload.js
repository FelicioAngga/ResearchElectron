const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld('api', {
  sendToMain: function(option){
    ipcRenderer.send('taskManager', option);
  },
  receiveFromMain: function(func){
      ipcRenderer.on('taskManager', (event, ...args) => func(event, ...args)) 
  },
  sendMessage: function(option){
    ipcRenderer.send('message', option);
  },
  receiveMessage: function(func){
    ipcRenderer.on('message', (event, ...args) => func(event, ...args));
  },
  
  openUser: function(){
    ipcRenderer.send('openUser');
  },
});