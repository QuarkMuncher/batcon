"use strict";
const { BrowserWindow } = require('electron');
const path = require('path');

const defaultProps = {
    width: 600,
    height: 666,
    useContentSize: true,
    show: false,
    maximizable: false,
    autoHideMenuBar: true,
    center: true,
    titleBarStyle: 'hidden',
    fullscreenable: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
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