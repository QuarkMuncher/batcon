"use strict"
const { BrowserWindow } = require('electron');
const path = require('path');

const defaultProps = {
    width: 500,
    height: 800,
    show: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: false,
        contextIsolation: true,
        sandbox: true
    }
};

class Window extends BrowserWindow {
    constructor({ file, ...windowSettings }) {
        super({ ...defaultProps, ...windowSettings});

        this.loadFile(file);
    // this.webContents.openDevTools();

        this.once('ready-to-show', () => {
            this.show();
        })
    }
}

module.exports = Window;