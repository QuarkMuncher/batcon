"use strict"

const { ipcRenderer } = require('electron');
const picsElement = document.querySelector('#pics');
const button = document.querySelector('#button');
const picsFileArray = [];
const picsElementChildArray = [];

// Preventing event that block functionality
picsElement.addEventListener('dragenter', e => {
    e.preventDefault();
});
picsElement.addEventListener('dragover', e => {
    e.preventDefault();
});

// Receiving the dropped files.
picsElement.addEventListener('drop', e => {
    e.preventDefault();

    if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            console.log('did it!');
            if (e.dataTransfer.items[i].kind === 'file') {
                console.log(i);
                const pic = {
                    id: (picsFileArray.length === 0)
                            ? '0'
                            : picsFileArray.length.toString(),
                    src: e.dataTransfer.items[i].getAsFile().path,
                }

                const picElement = document.createElement('img');
                picsFileArray.push(pic);
                picElement.src = pic.src;
                picElement.id = pic.id;
                picElement.className = 'picture';
                picsElement.appendChild(picElement);
                picsElementChildArray.push(picElement);
            }
        }
    }
});

button.addEventListener('click', () => {
    window.postMessage({
        type: 'button-pressed',
        content: picsFileArray
    });
});

window.addEventListener('message', e => {
    if (e.data.type === 'img') {
        console.log(typeof e.data.file.id);
        if (e.data.result) {
            picsElementChildArray.find(el => el.id === e.data.file.id).classList.add('tint-done');
        } else {
            picsElementChildArray.find(el => el.id === e.data.file.id).classList.add('tint-failed');
        }
    } else {
        console.log(e.data.type);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const notification = document.querySelector('#notification');
    const message = document.querySelector('#message');
    //const closeButton = document.querySelector('#close-button');
    const restartButton = document.querySelector('#restart-button');

    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'Der er en ny opdatering. den bliver downloaded nu.';
        notification.classList.remove('hidden');
    });

    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        message.innerText = 'Opdateringen er nu klar til at blive installeret, tryk på genstart for at installere den.';
        restartButton.classList.remove('disabled');
    });

    restartButton.addEventListener('click', () => {
        ipcRenderer.send('restart_app');
    });
});