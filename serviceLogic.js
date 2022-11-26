"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
setInterval(function () {
    (0, child_process_1.exec)('taskkill /im notepad.exe /f', function (err) {
    });
}, 2000);
// fs.writeFile('D:\\REPOS\\Electron\\ResearchElectron\\asd', err.message, (err) =>{
// })
//# sourceMappingURL=serviceLogic.js.map