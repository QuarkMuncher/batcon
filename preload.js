const { ipcRenderer } = require('electron');

process.once('loaded', () => {
    window.addEventListener('message', e => {
        const type = e.data.type;
        if (type === 'select-dirs') {
            ipcRenderer.send('select-dirs');
        } else if (type === 'button-pressed') {
            for (let i = 0; i < e.data.content.length; i++) {
                ipcRenderer.send(type, e.data.content[i]);
            }
        } else if (type === 'options-expanded') {
            ipcRenderer.send('options-expanded', e.data.height);
        } else if (type === 'options-collapsed') {
            ipcRenderer.send('options-collapsed');
        } else if (type === 'select-dir') {
            ipcRenderer.send('select-dir');
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

    ipcRenderer.on('selected-dir', (event, arg) => {
        window.postMessage({
            type: 'selected-dir',
            path: arg
        });
    })
});