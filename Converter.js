//const Jimp = require('jimp');
const sharp = require("sharp");

class Converter {
  /**
   * Async method for converting and compressing images to a specific standard.
   * @param file {Object}
   * @returns {Promise<boolean>}
   */ inherits;
  /*async imageScaler(file) {
        return await Jimp.read(file.src)
            .then(img => {
                img
                    .background(0xFFFFFFFF)
                    .contain(1000, 1000, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
                    .quality(80)
                    .writeAsync(`${file.savePath}/${file.src.split('/').pop()}`)
                    .catch(() => {
                        return false;
                    });
                //TODO: Implement functions for assuring jpg output.
                //TODO: Implement proper compression.
            })
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }*/

  imageScaler(file) {
    return sharp(file.src)
      .resize({
        width: file.size.width,
        height: file.size.height,
        fit: "contain",
        background: "#fff",
      })
      .toBuffer()
      .then((data) => this[file.type](file, data))
      .catch((err) => {
        console.log(`err: ${err}`);
      });
  }

  jpg(file, buffer) {
    sharp(buffer)
      .flatten({ background: "#fff" })
      .jpeg({
        quality: file.resolution,
      })
      .toFile(
        `${file.savePath}/${file.src
          .replace(/^.*[\\\/]/, "")
          .split(".")
          .shift()}.${file.type}`
      )
      .catch((err) => console.log(err));
  }

  png(file, buffer) {
    sharp(buffer)
      .png({
        quality: file.resolution,
      })
      .toFile(
        `${file.savePath}/${file.src.split("/").pop().split(".").shift()}.${
          file.type
        }`
      )
      .catch((err) => console.log(err));
  }
}

module.exports = Converter;
