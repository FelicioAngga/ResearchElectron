"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_windows_1 = require("node-windows");
var svc = new node_windows_1.Service({
    name: 'ResearchElectronService',
    script: "".concat(__dirname, "\\serviceLogic.js")
    // script: `${__dirname}\\serviceLogic.js`,
});
svc.on('install', function () {
    svc.start();
});
console.log("".concat(__dirname, "\\serviceLogic.js"));
svc.install();
// svc.uninstall();
exports.default = svc;
//# sourceMappingURL=service.js.map