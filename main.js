"use strict"
const { app, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const Window = require('./Window');
const Converter = require('./Converter');

String.prototype.removeLastOf = function (value) {
    return this.slice(0, this.lastIndexOf(value));
}

function main() {
    let mainWindow = new Window({
        file: 'renderer/index.html'
    });

    let converter = new Converter();

    ipcMain.on('button-pressed', async (event, ...arg) => {
        const folder = `${arg[0].src.removeLastOf('/')}/resultat/`;
        if (!fs.stat(folder, (err, stats) => { if (!err) return stats.isDirectory() })){
            fs.mkdir(folder, {recursive: true}, err => {
                if (err) {
                    console.error(err);
                }
            });
        }
        const result = await converter.imageScaler(arg[0].src, folder);
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
        autoUpdater.checkForUpdatesAndNotify();
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
}

app.on('ready', main);
app.on('window-all-closed', () => {
    app.quit();
});
