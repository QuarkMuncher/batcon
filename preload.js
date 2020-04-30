const { ipcRenderer } = require('electron');

/**
 * @param type {String}
 * @param file {Object}
 */
function buttonPressedAction(type, file) {
    ipcRenderer.send(type, file);
}

process.once('loaded', () => {
    window.addEventListener('message', e => {
        const type = e.data.type;
        if (type === 'select-dirs') {
            ipcRenderer.send('select-dirs');
        } else if (type === 'button-pressed') {
            for (let i = 0; i < e.data.content.length; i++) {
                buttonPressedAction(e.data.type, e.data.content[i]);
            }
        } else if (type === 'options-expanded') {
            ipcRenderer.send('options-expanded', e.data.height);
        } else if (type === 'options-collapsed') {
            ipcRenderer.send('options-collapsed');
        }
    });

    ipcRenderer.on('button-pressed-reply', (event, arg) => {
        if (arg.result) {
            window.postMessage({
                type: 'img',
                file: arg.file,
                result: arg.result
            });
        }
    });
});