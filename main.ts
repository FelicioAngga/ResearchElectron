import { app, BrowserWindow, ipcMain, globalShortcut, dialog, MessageBoxOptions } from 'electron';
import { exec } from 'child_process';
import * as wol from 'wake_on_lan';
import * as monitor  from 'node-active-window';
import * as path from 'path';
import * as net from 'net';
import * as Registry from 'winreg';
import * as sqlite3 from '@journeyapps/sqlcipher';
import * as ffi from 'ffi-napi';
import { autoUpdater } from 'electron-updater';
import * as electronLog from 'electron-log';
import * as dotenv from 'dotenv';
dotenv.config()

class AppUpdater {
  constructor() {
    
    electronLog.transports.file.level = 'info';
    autoUpdater.logger = electronLog;
    // autoUpdater.setFeedURL({
    //   provider: "github",
    //   repo: 'ResearchElectron',
    //   owner: 'FelicioAngga',
    //   private: true,
    //   token: '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'
    // })

    //https://sbs-testing.s3.ap-southeast-1.amazonaws.com
    //https://s3.console.aws.amazon.com/s3/buckets/sbs-testing
    autoUpdater.autoDownload = true;
    autoUpdater.setFeedURL('https://sbs-testing.s3.ap-southeast-1.amazonaws.com/sbsElectron');
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.log(err);
    });
  }
}

autoUpdater.on('update-available', (updateInfo) => {
  const dialogOptions: MessageBoxOptions = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application update',
    message: `${updateInfo.version} - ${updateInfo.files}`
  }
  dialog.showMessageBox(dialogOptions);
})

autoUpdater.on('update-downloaded', (updateInfo) => {
  const dialogOptions: MessageBoxOptions = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application update',
    message: updateInfo.version
  }
  dialog.showMessageBox(dialogOptions).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  })
});

process.env.NODE_ENV = 'production';
let mainWindow : BrowserWindow;
let userWindow : BrowserWindow;
let db: sqlite3.Database = new sqlite3.Database('test.db');

Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  }
});

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 650,
    height: 650,
    title: 'ResearchElectron',
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), './preloadJS/mainPreload.js')
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('./app/index.html');
  mainWindow.once("ready-to-show", () => {
    new AppUpdater();
  });
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
      preload: path.join(app.getAppPath(), './preloadJS/userPreload.js'),
    },
  });
  userWindow.webContents.openDevTools();
  userWindow.loadFile('./app/user.html');
  userWindow.once('ready-to-show', () => {

  })
}

const runAppLibrary = ffi.Library('./resources/MathLibrary', {
  "Random": [
    "int", ["int","int"]
  ],
  "ListProcesses": [
    'string', []
  ],
  "DisableHotKey": [
    'void', []
  ],
  "EnableHotKey": [
    'void', []
  ],
})

app.on('ready', () => {
  createMainWindow();
  encryptDb();
  runAppLibrary.DisableHotKey();
  

  // setInterval(() => {
  //   let listProcess = runAppLibrary.ListProcesses().split('|').filter(e => e !== '');
  //   mainWindow.webContents.send('message', listProcess)
  // }, 3000)
  
  // mainWindow.webContents.on('before-input-event', (e, input) => {
  //   if (input.alt && input.key === 'Tab') e.preventDefault();
  //   console.log(input.alt && input.key === 'Tab')
  // })
  
  // mainWindow.on('close', (e) => {
  //   e.preventDefault();
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
  runAppLibrary.EnableHotKey();
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
  wol.wake('18-C0-4D-7E-BE-4D', {address: '192.168.23.145'}, (err: any) => {
    console.log(err);
  })
}

async function getActiveWindow(){  
  
  try{
    monitor.getActiveWindow((err: any, res: { title: any; }) => {
      if (!err) console.log(res.title);
    })
  }catch (err){
    console.log(err)
  }
}