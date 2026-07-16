const electronInstaller = require('electron-winstaller');
const path = require('path');

const rootPath = path.join('./');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/MetroPOS-win32-x64',
    outputDirectory: './release',
    authors: 'MetroPOS',
    noMsi: true,
    exe: 'MetroPOS.exe',
    setupExe: 'MetroPOS Setup 0.3.0.exe',
    setupIcon: path.join(rootPath, 'assets', 'images', 'icon.ico')
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));