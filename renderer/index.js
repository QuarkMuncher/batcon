"use strict"

const picsElement = document.querySelector('#pics');
let picDefaultOptions = {

}
let picsFileArray = [];
let picSavePath;
let pictureFormat = 'jpg';
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
                const file = e.dataTransfer.items[i].getAsFile().path;
                const pic = {
                    id: (picsFileArray.length === 0)
                            ? '0'
                            : picsFileArray.length.toString(),
                    type: pictureFormat,
                    size: {
                        width: 1000,
                        height: 1000,
                    },
                    src: file,
                    savePath: (picSavePath) ? picSavePath :((string, value) => {
                        const result = `${string.slice(0, string.lastIndexOf(value))}/resultat`;
                        picSavePath = result;
                        document.querySelector('#selectFolderContainer > input[type="text"]').setAttribute('value', result);
                        return result;
                    })(file, '/'),
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

const progressBar = document.querySelector('#progress > div');
const button = document.querySelector('#button');
const notification = document.querySelector('#notification');
const message = document.querySelector('#message');
const folderButton = document.querySelector('#folderButton');

window.addEventListener('message', e => {
    const type = e.data.type;
    if (type === 'img') {
        if (e.data.result) {
            const percent = Math.round(( ( parseInt(e.data.file.id) + 1 ) / picsFileArray.length ) * 100);
            if (percent === 100) {
                button.innerText = 'Done';
                folderButton.classList.toggle('hidden');
            } else {
                button.innerText = `Converting: ${percent}%`
            }
            progressBar.style.width = `${percent}%`;
        }
    } else if (type === 'selected-dir') {
        if (e.data.path){
            for (let i = 0; i <= picsFileArray.length - 1; i++) {
                picsFileArray[i].savePath = e.data.path;
            }
            picSavePath = e.data.path;
            document.querySelector('#selectFolderContainer > input[type="text"]').setAttribute('value', e.data.path);
        }
    } else if (type === 'update-available') {
        message.innerText = 'Der er en ny opdatering. den bliver downloaded nu.';
        notification.classList.remove('hidden');
    } else if (type === 'update-downloaded') {
        message.innerText = 'Opdateringen er nu klar til at blive installeret, tryk på genstart for at installere den.';
        restartButton.classList.remove('disabled');
    }
});


window.addEventListener('DOMContentLoaded', () => {
    const deleteButton = document.querySelector('#deleteButtonContainer > div');

    const restartButton = document.querySelector('#restart-button');
    const optionsButton = document.querySelector('#optionsButton');
    const options = document.querySelector('#options');
    const sizeOpts = document.querySelectorAll('#options .size');
    const selectFolderButton = document.querySelector('#selectFolderContainer > button');
    const pictureFormatSelect = document.querySelector('#pictureFormat');

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
        progressBar.style.width = '0%';
        button.innerText = 'Convert';
        folderButton.classList.toggle('hidden');
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
        window.postMessage({
            type: 'restart-app'
        });
    });


    button.addEventListener('click', () => {
        console.log(sizeOpts);
        if (picsFileArray.length > 0) {
            button.innerText = 'Converting: 0%';
            for (let i = 0; i < picsFileArray.length; i++) {
                picsFileArray[i].size.width = parseInt(sizeOpts[0].value);
                picsFileArray[i].height = parseInt(sizeOpts[1].value);
            }
            window.postMessage({
                type: 'button-pressed',
                content: picsFileArray
            });
        }
    });

    selectFolderButton.addEventListener('click', () => {
        window.postMessage({
            type: 'select-dir'
        });
    });

    pictureFormatSelect.addEventListener('change', () => {
        pictureFormat = pictureFormatSelect.value;
    })

    folderButton.addEventListener('click', () => {
        window.postMessage({
            type: 'open-folder',
            folder: picSavePath
        })
    })
});