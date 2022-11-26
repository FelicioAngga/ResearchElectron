import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Service } from "node-windows";
import { exec } from 'child_process';


let svc = new Service({
  name: 'ResearchElectronService',
  script: `${__dirname}\\serviceLogic.js`
  // script: `${__dirname}\\serviceLogic.js`,
});

svc.on('install', () => {
  svc.start();
});
console.log(`${__dirname}\\serviceLogic.js`)
svc.install();
// svc.uninstall();

export default svc;
