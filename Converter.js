//const Jimp = require('jimp');
const sharp = require("sharp");

// TODO: Turn into a module
class Converter {

  imageScaler(file) {
    const image = sharp(file.src);
    return image
      .flatten({background: "#fff"})
      .resize({
        width: file.size.width,
        height: file.size.height,
        fit: "contain",
        background: "#fff",
      })
      .toBuffer()
      .then((data) => {
        this[file.type](file, data);
      })
      .catch((err) => {
        console.log(`err: ${err}`);
      });
  }

  jpg(file, buffer) {
    sharp(buffer)
      .flatten({background: "#fff"})
      .jpeg({
        quality: file.resolution,
      })
      .toFile(
        `${file.savePath}/${file.src
          .replace(/^.*[\\\/]/, "")
          .split(".")
          .shift()
          .replace(/[\s]/g, "_")}.${file.type}`
      )
      .catch((err) => console.log(err));
  }

  png(file, buffer) {
    sharp(buffer)
      .png({
        quality: file.resolution,
      })
      .toFile(
        `${file.savePath}/${file.src
          .replace(/^.*[\\\/]/, "")
          .split(".")
          .shift()
          .replace(/[\s]/g, "_")}.${file.type}`
      )
      .catch((err) => console.log(err));
  }
}

module.exports = Converter;
