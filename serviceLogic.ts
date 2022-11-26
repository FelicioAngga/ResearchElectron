import { exec } from 'child_process';
import * as fs from 'fs';
setInterval(() => {
  exec('taskkill /im notepad.exe /f', (err) => {
  });
}, 2000)


// fs.writeFile('D:\\REPOS\\Electron\\ResearchElectron\\asd', err.message, (err) =>{
  
// })