const { ipcRenderer } = require('electron');

/**
 * @param type {String}
 * @param file {Object}
 */
function buttonPressedAction(type, file) {
    ipcRenderer.send(type, file);
}

process.once('loaded', () => {
    console.log('loaded');
    window.addEventListener('message', e => {
        if (e.data.type === 'select-dirs') {
            ipcRenderer.send('select-dirs');
            console.log('sent');
        } else if (e.data.type === 'button-pressed') {
            for (let i = 0; i < e.data.content.length; i++) {
                buttonPressedAction(e.data.type, e.data.content[i]);
            }
        }
    });

    ipcRenderer.on('button-pressed-reply', (event, arg) => {
        if (arg.result) {
            window.postMessage({
                type: 'img',
                file: arg.file,
                result: arg.result
            })
        }
    });
});