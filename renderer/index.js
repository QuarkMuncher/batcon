const picsElement = document.querySelector("#pics");
let picsFileArray = [];
let picSavePath;
const picsElementChildArray = [];

const deleteButton = document.querySelector("#deleteButtonContainer > div");
const restartButton = document.querySelector("#restart-button");
const optionsButton = document.querySelector("#optionsButton");
const options = document.querySelector("#options");
const sizeOpts = document.querySelectorAll("#options .size");
const selectFolderButton = document.querySelector(
  "#selectFolderContainer > button"
);
const pictureFormatSelect = document.querySelector("#pictureFormat");
const resolutionDisplay = document.querySelector("#resolutionContainer > span");
const resolutionSlider = document.querySelector("#resolutionContainer > input");
const progressBar = document.querySelector("#progress > div");
const convertButton = document.querySelector("#convertButton");
const notification = document.querySelector("#notification");
const message = document.querySelector("#message");
const folderButton = document.querySelector("#folderButton");

// Preventing event that block functionality
picsElement.addEventListener("dragenter", (e) => {
  e.preventDefault();
});
picsElement.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// Receiving the dropped files.
picsElement.addEventListener("drop", (e) => {
  e.preventDefault();

  if (e.dataTransfer.items) {
    convertButton.innerText = "Convert";
    progressBar.style.width = "0";
    for (let i = 0; i < e.dataTransfer.items.length; i += 1) {
      if (e.dataTransfer.items[i].kind === "file") {
        const file = e.dataTransfer.items[i].getAsFile().path;
        const pic = {
          id:
            picsFileArray.length === 0 ? "0" : picsFileArray.length.toString(),
          src: file,
          savePath:
            picSavePath ||
            ((string, value) => {
              const result = `${string.slice(
                0,
                string.lastIndexOf(value)
              )}/resultat`;
              picSavePath = result;
              document
                .querySelector('#selectFolderContainer > input[type="text"]')
                .setAttribute("value", result);
              return result;
            })(file, "/"),
        };

        const picElement = document.createElement("img");
        picsFileArray.push(pic);
        picElement.src = pic.src;
        picElement.id = `id${pic.id}`;
        picElement.setAttribute("data-selected", "false");
        picElement.className = "picture";
        picElement.addEventListener("click", () => {
          if (pic.selected) {
            picElement.dataset.selected = "false";
            pic.selected = false;
          } else {
            picElement.dataset.selected = "true";
            pic.selected = true;
          }
        });
        picsElement.appendChild(picElement);
        picsElementChildArray.push(picElement);
      }
    }
  }
});

window.addEventListener("message", (e) => {
  const { type } = e.data;
  if (type === "img") {
    if (e.data.result) {
      const percent = Math.round(
        ((picsFileArray.findIndex((ev) => ev.id === e.data.file.id) + 1) /
          picsFileArray.length) *
          100
      );
      if (percent === 100) {
        convertButton.innerText = "Done";
        folderButton.classList.toggle("hidden");
      } else {
        convertButton.innerText = `Converting: ${percent}%`;
      }
      progressBar.style.width = `${percent}%`;
    }
  } else if (type === "selected-dir") {
    if (e.data.path) {
      for (let i = 0; i <= picsFileArray.length - 1; i += 1) {
        picsFileArray[i].savePath = e.data.path;
      }
      picSavePath = e.data.path;
      document
        .querySelector('#selectFolderContainer > input[type="text"]')
        .setAttribute("value", e.data.path);
    }
  } else if (type === "update-available") {
    message.innerText = "Der er en ny opdatering. den bliver downloaded nu.";
    notification.classList.remove("hidden");
  } else if (type === "update-downloaded") {
    message.innerText =
      "Opdateringen er nu klar til at blive installeret, tryk på genstart for at installere den.";
    restartButton.classList.remove("disabled");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  deleteButton.addEventListener("click", () => {
    if (picsFileArray.some((pic) => pic.selected === true)) {
      picsFileArray = picsFileArray.filter((pic) => {
        if (pic.selected === true) {
          const element = document.querySelector(`#id${pic.id}`);
          element.remove();
          return false;
        }
        return true;
      });
    } else {
      picsElement.innerHTML = "";
      picsFileArray = [];
    }
    progressBar.style.width = "0%";
    convertButton.innerText = "Convert";
    if (!folderButton.classList.contains("hidden"))
      folderButton.classList.toggle("hidden");
  });

  optionsButton.addEventListener("click", () => {
    optionsButton.classList.toggle("active");
    if (options.style.maxHeight) {
      window.postMessage({
        type: "options-collapsed",
      });
      options.style.maxHeight = null;
      optionsButton.innerHTML = "Options &#8623";
    } else {
      window.postMessage({
        type: "options-expanded",
        height: options.scrollHeight,
      });
      options.style.maxHeight = `${options.scrollHeight}px`;
      optionsButton.innerHTML = "Options &#8618";
    }
  });

  restartButton.addEventListener("click", () => {
    window.postMessage({
      type: "restart-app",
    });
  });

  sizeOpts[0].addEventListener("input", () => {
    picDefaultOptions.size.width = parseInt(sizeOpts[0].value);
  });

  sizeOpts[1].addEventListener("input", () => {
    picDefaultOptions.size.height = parseInt(sizeOpts[1].value);
  });

  convertButton.addEventListener("click", () => {
    if (picsFileArray.length > 0) {
      convertButton.innerText = "Converting: 0%";
      for (let i = 0; i < picsFileArray.length; i++) {
        picsFileArray[i].size = {
          width: picDefaultOptions.size.width,
          height: picDefaultOptions.size.height,
        };
        picsFileArray[i].resolution = picDefaultOptions.resolution;
        picsFileArray[i].type = picDefaultOptions.type;
      }
      window.postMessage({
        type: "button-pressed",
        content: picsFileArray,
      });
    }
  });

  selectFolderButton.addEventListener("click", () => {
    window.postMessage({
      type: "select-dir",
    });
  });

  pictureFormatSelect.addEventListener("change", () => {
    picDefaultOptions.type = pictureFormatSelect.value;
  });

  folderButton.addEventListener("click", () => {
    window.postMessage({
      type: "open-folder",
      folder: picSavePath,
    });
  });

  resolutionSlider.addEventListener("input", () => {
    resolutionDisplay.innerHTML = `${resolutionSlider.value}%`;
    picDefaultOptions.resolution = `${resolutionSlider.value}`;
  });
});
