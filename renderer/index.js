"use strict"

const { ipcRenderer } = require('electron');
const picsElement = document.querySelector('#pics');
let picsFileArray = [];
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

function updateProgressBar(element, percent) {
    element.style.width = `${percent}%`;
}

const progressBar = document.querySelector('#progress > div');
const button = document.querySelector('#button');
window.addEventListener('message', e => {
    if (e.data.type === 'img') {
        if (e.data.result) {
            const percent = Math.round(( ( parseInt(e.data.file.id) + 1 ) / picsFileArray.length ) * 100);
            (percent === 100) ? button.innerText = 'Done' : button.innerText = `Converting: ${percent}%`;
            updateProgressBar(progressBar, percent);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const deleteButton = document.querySelector('#deleteButtonContainer > div');
    const notification = document.querySelector('#notification');
    const message = document.querySelector('#message');
    const restartButton = document.querySelector('#restart-button');
    const optionsButton = document.querySelector('#optionsButton');
    const options = document.querySelector('#options');
    const selectFolderButton = document.querySelector('#selectFolderButton');

    //TODO: Move ipcRenderer processes to preload.
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

    deleteButton.addEventListener('click', () => {
        if (picsFileArray.some(pic => pic.selected === true)) {
            picsFileArray = picsFileArray.filter(pic => {
                if (pic.selected === true) {
                    document.querySelector(`#\\3${pic.id}`).remove();
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            picsElement.innerHTML = '';
            picsFileArray = [];
        }

    });

    optionsButton.addEventListener('click', () => {
        optionsButton.classList.toggle('active');
        if (options.style.maxHeight) {
            window.postMessage({
                type: 'options-collapsed',
            });
            options.style.maxHeight = null;
            optionsButton.innerHTML = 'Options &#8623';
        } else {
            window.postMessage({
                type: 'options-expanded',
                height: options.scrollHeight,
            });
            options.style.maxHeight = `${options.scrollHeight}px`;
            optionsButton.innerHTML = 'Options &#8618';
        }
    });

    restartButton.addEventListener('click', () => {
        ipcRenderer.send('restart_app');
    });


    button.addEventListener('click', () => {
        button.innerText = 'Converting: 0%';
        window.postMessage({
            type: 'button-pressed',
            content: picsFileArray
        });
    });

    selectFolderButton.addEventListener('click', () => {
        window.postMessage({
            type: 'select-dir'
        });
    });

});