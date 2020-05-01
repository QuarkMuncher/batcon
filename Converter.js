const Jimp = require('jimp');

class Converter {

    /**
     * Async method for converting and compressing images to a specific standard.
     * @param file {Object}
     * @returns {Promise<boolean>}
     */
    async imageScaler(file) {
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
    }



}

module.exports = Converter;