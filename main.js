"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var wol = require("wake_on_lan");
var monitor = require("node-active-window");
var path = require("path");
var net = require("net");
var Registry = require("winreg");
var sqlite3 = require("@journeyapps/sqlcipher");
var ffi = require("ffi-napi");
var electron_updater_1 = require("electron-updater");
var electronLog = require("electron-log");
var dotenv = require("dotenv");
dotenv.config();
var AppUpdater = /** @class */ (function () {
    function AppUpdater() {
        electronLog.transports.file.level = 'info';
        electron_updater_1.autoUpdater.logger = electronLog;
        // autoUpdater.setFeedURL({
        //   provider: "github",
        //   repo: 'ResearchElectron',
        //   owner: 'FelicioAngga',
        //   private: true,
        //   token: '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'
        // })
        //https://sbs-testing.s3.ap-southeast-1.amazonaws.com
        //https://s3.console.aws.amazon.com/s3/buckets/sbs-testing
        electron_updater_1.autoUpdater.autoDownload = true;
        electron_updater_1.autoUpdater.setFeedURL('https://sbs-testing.s3.ap-southeast-1.amazonaws.com/sbsElectron');
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify().catch(function (err) {
            console.log(err);
        });
    }
    return AppUpdater;
}());
electron_updater_1.autoUpdater.on('update-available', function (updateInfo) {
    var dialogOptions = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Application update',
        message: "".concat(updateInfo.version, " - ").concat(updateInfo.files)
    };
    electron_1.dialog.showMessageBox(dialogOptions);
});
electron_updater_1.autoUpdater.on('update-downloaded', function (updateInfo) {
    var dialogOptions = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application update',
        message: updateInfo.version
    };
    electron_1.dialog.showMessageBox(dialogOptions).then(function (returnValue) {
        if (returnValue.response === 0)
            electron_updater_1.autoUpdater.quitAndInstall();
    });
});
process.env.NODE_ENV = 'production';
var mainWindow;
var userWindow;
var db = new sqlite3.Database('test.db');
Object.defineProperty(electron_1.app, 'isPackaged', {
    get: function () {
        return true;
    }
});
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 650,
        height: 650,
        title: 'ResearchElectron',
        autoHideMenuBar: true,
        webPreferences: {
            sandbox: false,
            contextIsolation: true,
            preload: path.join(electron_1.app.getAppPath(), './preloadJS/mainPreload.js')
        },
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile('./app/index.html');
    mainWindow.once("ready-to-show", function () {
        new AppUpdater();
    });
}
function createUserWindow() {
    userWindow = new electron_1.BrowserWindow({
        width: 650,
        height: 650,
        autoHideMenuBar: true,
        modal: true,
        // parent: mainWindow,
        // skipTaskbar: true,
        focusable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(electron_1.app.getAppPath(), './preloadJS/userPreload.js'),
        },
    });
    userWindow.webContents.openDevTools();
    userWindow.loadFile('./app/user.html');
    userWindow.once('ready-to-show', function () {
    });
}
var runAppLibrary = ffi.Library('./resources/MathLibrary', {
    "Random": [
        "int", ["int", "int"]
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
});
electron_1.app.on('ready', function () {
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
function encryptDb() {
    db.serialize(function () {
        db.run("PRAGMA cipher_compatibility = 4");
        db.run('PRAGMA key = `stream`');
    });
}
electron_1.ipcMain.on('taskManager', function (e, option) {
    var regKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System'
    });
    if (option === 'disable') {
        regKey.set('DisableTaskMgr', 'REG_SZ', '1', function (err) { if (err)
            console.log(err); });
    }
    else {
        regKey.get('DisableTaskMgr', function (err, res) {
            if (res)
                regKey.remove('DisableTaskMgr', function (err) { if (err)
                    console.log(err); });
        });
    }
    mainWindow.webContents.send('taskManager', option);
});
electron_1.ipcMain.on('openUser', function (e, option) {
    mainWindow.close();
    createUserWindow();
    // wakeOnLan();
});
electron_1.ipcMain.on('message', function (e, args) {
    // clients[0].client.write(args + " ")
    runAppLibrary.EnableHotKey();
});
electron_1.ipcMain.on('add-user', function () {
    db.run("INSERT INTO user (username, password) VALUES ('muahaha', 'asdasd')", function (err) {
        console.log(err);
    });
    // db.each('SELECT * FROM user WHERE username = `muahaha`', (err, row) => {
    // });
});
var clients = [];
var server = net.createServer(function (socket) {
    var ip = socket.remoteAddress;
    clients.push({ ip: ip, client: socket });
    socket.on('data', function (message) {
        mainWindow.webContents.send('message', message.toString());
    });
    electron_1.ipcMain.on('message', function (e, args) {
        // clients[0].client.write(args + " ")
        socket.write(args);
    });
    socket.on('error', function (err) {
        console.log(err);
    });
    // socket.write('Echo server\r\n');
});
// server.listen(23000);
function wakeOnLan() {
    wol.wake('18-C0-4D-7E-BE-4D', { address: '192.168.23.145' }, function (err) {
        console.log(err);
    });
}
function getActiveWindow() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                monitor.getActiveWindow(function (err, res) {
                    if (!err)
                        console.log(res.title);
                });
            }
            catch (err) {
                console.log(err);
            }
            return [2 /*return*/];
        });
    });
}
//# sourceMappingURL=main.js.map