import { app, BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import * as wol from 'wake_on_lan';
import * as monitor  from 'node-active-window';
import * as path from 'path';
import * as net from 'net';
import * as Registry from 'winreg';
import * as sqlite3 from '@journeyapps/sqlcipher';
import * as ffi from 'ffi-napi';
import * as svc from './service';

let mainWindow : BrowserWindow;
let userWindow : BrowserWindow;
let db: sqlite3.Database = new sqlite3.Database('test.db');

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 650,
    height: 650,
    title: 'ResearchElectron',
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), '/preloadJS/mainPreload.js')
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('./app/index.html');
}

function createUserWindow(){
  userWindow = new BrowserWindow({
    width: 650,
    height: 650,
    autoHideMenuBar: true,
    modal: true,
    // parent: mainWindow,
    // skipTaskbar: true,
    focusable: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(app.getAppPath(), '/preloadJS/userPreload.js')
    },
  });
  userWindow.webContents.openDevTools();
  userWindow.loadFile('./app/user.html');
  userWindow.once('ready-to-show', () => {

  })
}

app.on('ready', () => {
  createMainWindow();
  encryptDb();
  const runAppLibrary = ffi.Library('./MathLibrary', {
    "Random": [
      "int", ["int","int"]
    ],
    "ListProcesses": [
      'string', []
    ]
  })

  setInterval(() => {
    let listProcess = runAppLibrary.ListProcesses().split('|').filter(e => e !== '');
    mainWindow.webContents.send('message', listProcess)
  }, 3000)
  
  // mainWindow.webContents.on('before-input-event', (e, input) => {
  //   if (input.alt && input.key === 'Tab') e.preventDefault();
  //   console.log(input.alt && input.key === 'Tab')
  // })
});

function encryptDb(){
  db.serialize(() => {
    db.run("PRAGMA cipher_compatibility = 4");
    db.run('PRAGMA key = `stream`');
  })
}

ipcMain.on('taskManager', (e, option) => {
  const regKey = new Registry({
    hive: Registry.HKCU,
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System'
  });
  if (option === 'disable'){
    regKey.set('DisableTaskMgr', 'REG_SZ', '1', err => {if(err) console.log(err)});
  }else{
    regKey.get('DisableTaskMgr', (err, res) => {
      if(res) regKey.remove('DisableTaskMgr', err => {if(err) console.log(err)})
    })
  }
  mainWindow.webContents.send('taskManager', option);
});

ipcMain.on('openUser', (e, option) => {
  mainWindow.close();
  createUserWindow();
  // wakeOnLan();
  
});

ipcMain.on('message', (e, args) => {
  // clients[0].client.write(args + " ")
})

ipcMain.on('add-user', () => {
  db.run(`INSERT INTO user (username, password) VALUES ('muahaha', 'asdasd')`, (err) => {
    console.log(err)
  });

  // db.each('SELECT * FROM user WHERE username = `muahaha`', (err, row) => {
    
  // });
})

let clients = [];

let server = net.createServer(socket => {
  let ip = socket.remoteAddress
  clients.push({ip:ip, client: socket})

  socket.on('data', (message) => {
    mainWindow.webContents.send('message', message.toString())
  });
  
  ipcMain.on('message', (e, args) => {
    // clients[0].client.write(args + " ")
    socket.write(args)
  })

  socket.on('error', (err) => {
    console.log(err)
  });
  // socket.write('Echo server\r\n');
});

// server.listen(23000);

function wakeOnLan(){
  wol.wake('18-C0-4D-7E-BE-4D', {address: '192.168.23.145'}, (err) => {
    console.log(err);
  })
}

async function getActiveWindow(){  
  
  try{
    monitor.getActiveWindow((err, res) => {
      if (!err) console.log(res.title);
    })
  }catch (err){
    console.log(err)
  }
}