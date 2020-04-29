"use strict"
const { app, dialog, ipcMain } = require('electron');
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

    //Listen for click event at file dialog
    ipcMain.on('select-dirs', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        console.log('directories selected', result.filePaths);
    });

    ipcMain.on('button-pressed', async (event, ...arg) => {
        console.log(typeof arg[0]);
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

}

app.on('ready', main);
app.on('window-all-closed', () => {
    app.quit();
});