"use strict"

const { ipcRenderer } = require('electron');
const picsElement = document.querySelector('#pics');
const button = document.querySelector('#button');
const progressBar = document.querySelector('#progress > div');
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
        button.innerText = 'Convert';
        progressBar.style.width = '0';
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                const pic = {
                    id: (picsFileArray.length === 0)
                            ? '0'
                            : picsFileArray.length.toString(),
                    src: e.dataTransfer.items[i].getAsFile().path,
                    selected: false,
                }

                const picElement = document.createElement('img');
                picsFileArray.push(pic);
                picElement.src = pic.src;
                picElement.id = pic.id;
                picElement.setAttribute('data-selected', 'false');
                picElement.className = 'picture';
                picElement.addEventListener('click', e => {
                    e.target.dataset.selected = 'true';
                    pic.selected = true;
                });
                picsElement.appendChild(picElement);
                picsElementChildArray.push(picElement);
            }
        }
    }
});

button.addEventListener('click', () => {
    button.innerText = 'Converting: 0%';
    window.postMessage({
        type: 'button-pressed',
        content: picsFileArray
    });
});

function updateProgressBar(element, percent) {
    element.style.width = `${percent}%`;
}

window.addEventListener('message', e => {
    if (e.data.type === 'img') {
        if (e.data.result) {
            const percent = Math.round(( ( parseInt(e.data.file.id) + 1 ) / picsFileArray.length ) * 100);
            (percent === 100) ? button.innerText = 'Done' : button.innerText = `Converting: ${percent}%`;
            console.log(percent);
            updateProgressBar(progressBar, percent);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const notification = document.querySelector('#notification');
    const message = document.querySelector('#message');
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