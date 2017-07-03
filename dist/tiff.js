(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "libtiff"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var libtiff_1 = require("libtiff");
    var Tiff = (function () {
        function Tiff(file_result) {
            this.fakeFilename = Tiff.getUniqueFilename();
            libtiff_1.FS.createDataFile('/', this.fakeFilename, new Uint8Array(file_result), true, false);
            this.tiffPtr = libtiff_1.Module.ccall('TIFFOpen', 'number', ['string', 'string'], [this.fakeFilename, 'r']);
        }
        Tiff.prototype.close = function () {
            libtiff_1.Module.ccall('TIFFClose', 'number', ['number'], [this.tiffPtr]);
            libtiff_1.FS.unlink(this.fakeFilename);
        };
        Tiff.prototype.width = function () {
            return libtiff_1.Module.ccall('get_width', 'number', ['number'], [this.tiffPtr]);
        };
        Tiff.prototype.height = function () {
            return libtiff_1.Module.ccall('get_height', 'number', ['number'], [this.tiffPtr]);
        };
        Tiff.prototype.numPages = function () {
            var count = 0;
            var result;
            this.setDirectory(0);
            do {
                count++;
                result = libtiff_1.Module.ccall('TIFFReadDirectory', 'number', ['number'], [this.tiffPtr]);
            } while (result !== 0);
            return count;
        };
        Tiff.prototype.renderPageAsCanvas = function (pageNumber, targetCanvas) {
            this.setDirectory(pageNumber);
            var width = this.width();
            var height = this.height();
            var raster = libtiff_1.Module.ccall('_TIFFmalloc', 'number', ['number'], [width * height * 4]);
            var result = libtiff_1.Module.ccall('TIFFReadRGBAImageOriented', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [this.tiffPtr, width, height, raster, 1, 0]);
            var image = libtiff_1.Module.HEAPU8.subarray(raster, raster + width * height * 4);
            targetCanvas = targetCanvas || document.createElement('canvas');
            targetCanvas.width = width;
            targetCanvas.height = height;
            var context = targetCanvas.getContext('2d');
            if (context) {
                var imageData = context.createImageData(width, height);
                imageData.data.set(image);
                context.putImageData(imageData, 0, 0);
            }
            libtiff_1.Module.ccall('_TIFFfree', 'number', ['number'], [raster]);
            return targetCanvas;
        };
        Tiff.prototype.setDirectory = function (index) {
            libtiff_1.Module.ccall('TIFFSetDirectory', 'number', ['number', 'number'], [this.tiffPtr, index]);
        };
        Tiff.getUniqueFilename = function () {
            return Tiff.filenameCounter++ + ".tiff";
        };
        Tiff.filenameCounter = 0;
        return Tiff;
    }());
    exports.Tiff = Tiff;
});
