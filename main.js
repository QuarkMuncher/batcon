"use strict";
const { app, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const Window = require('./Window');
const Converter = require('./Converter');

String.prototype.removeLastOf = value => {
    return this.slice(0, this.lastIndexOf(value));
};

function main() {
    let mainWindow = new Window({
        file: 'renderer/index.html'
    });

    let converter = new Converter();

    ipcMain.on('button-pressed', async (event, ...arg) => {
        const folder = arg[0].savePath;
        if (!fs.stat(arg[0].savePath, (err, stats) => { if (!err) return stats.isDirectory() })){
            fs.mkdir(folder, {recursive: true}, err => {
                if (err) {
                    console.error(err);
                }
            });
        }
        const result = await converter.imageScaler(arg[0]);
        if (result) {
            event.reply('button-pressed-reply', {
                file: arg[0],
                result: true
            });
        } else {
            event.reply('button-pressed-reply', {
                file: arg[0],
                result: false
            });
        }
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
        optionsHeight = arg + 6;
        const height = mainWindow.getSize()[1] + optionsHeight;
        mainWindow.setSize(600, height, true);
    });

    ipcMain.on('options-collapsed', () => {
        const height = mainWindow.getSize()[1] - optionsHeight;
        mainWindow.resizable = true;
        mainWindow.setSize(600, height, true);
        mainWindow.resizable = false;
    });

    ipcMain.on('select-dir', (event) => {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then( result => {
            event.reply('selected-dir', result.filePaths[0]);
        });
    });

    mainWindow.resizable = false;
    // Uncomment in production.
    //mainWindow.removeMenu();

}

app.on('ready', main);
app.on('window-all-closed', () => {
    app.quit();
});
