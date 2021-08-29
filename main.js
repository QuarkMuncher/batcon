const {app, ipcMain, dialog, shell} = require('electron');
const {autoUpdater} = require('electron-updater');
const fs = require('fs');
const Window = require('./Window');
const Converter = require('./Converter');

function main() {
  let mainWindow = new Window({
    //This file is the entry point for the frontend
    file: 'renderer/index.html'
  });

  let converter = new Converter();

  ipcMain.on('button-pressed', (event, ...arg) => {
    const folder = arg[0].savePath;

    fs.mkdirSync(folder, {recursive: true});

    const result = converter.imageScaler(arg[0]);
    if (result) {
      event.reply('button-pressed-reply', {
        file: arg[0]
        , result: true
      });
    } else {
      event.reply('button-pressed-reply', {
        file: arg[0]
        , result: false
      });
    }

    /*fs.stat(folder, (error, stats) => {
      if (error) console.error(`stat error: ${error}`);

    });*/
  });

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.log(err);
    });
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  let optionsHeight = 0;
  ipcMain.on('options-expanded', (event, arg) => {
    optionsHeight = arg;
    const height = mainWindow.getSize()[1] + optionsHeight;
    //console.log(mainWindow.getSize()[1]);
    //console.log(arg);
    //console.log(optionsHeight);
    //console.log(height);
    mainWindow.setSize(600, height - 10, true);
    //console.log(height);
    //console.log(mainWindow.getSize()[1]);
  });

  ipcMain.on('options-collapsed', () => {
    const height = mainWindow.getSize()[1] - optionsHeight;
    mainWindow.resizable = true;
    //console.log(mainWindow.getSize()[1]);
    //console.log(optionsHeight);
    //console.log(height);
    mainWindow.setSize(600, height, true);
    mainWindow.resizable = false;
  });

  ipcMain.on('select-dir', (event) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      console.log(result);
      event.reply('selected-dir', result.filePaths[0]);
    });
  });

  ipcMain.on('open-folder', (event, arg) => {
    shell.showItemInFolder(`${arg}/f`);
  });

  mainWindow.resizable = false;
  // Uncomment in production.
  //mainWindow.removeMenu();

}

app.on('ready', main);
app.on('window-all-closed', () => {
  app.quit();
});
