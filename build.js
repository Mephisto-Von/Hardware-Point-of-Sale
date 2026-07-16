const electronInstaller = require('electron-winstaller');
const path = require('path');

const rootPath = path.join('./');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/HardwarePOS-win32-x64',
    outputDirectory: './release',
    authors: 'Hosting Domain',
    noMsi: true,
    exe: 'HardwarePOS.exe',
    setupExe: 'HardwarePOS Setup 0.2.0.exe',
    setupIcon: path.join(rootPath, 'assets', 'images', 'icon.ico')
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));