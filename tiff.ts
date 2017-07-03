import { FS, Module } from 'libtiff';


export class Tiff {
    private tiffPtr: number;
    private fakeFilename: string;

    constructor(file_result: any) {
        this.fakeFilename = Tiff.getUniqueFilename();
        FS.createDataFile('/', this.fakeFilename, new Uint8Array(file_result), true, false);
        this.tiffPtr = Module.ccall('TIFFOpen', 'number', ['string', 'string'], [this.fakeFilename, 'r']);
    }

    close() {
        Module.ccall('TIFFClose', 'number', ['number'], [this.tiffPtr]);
        FS.unlink(this.fakeFilename);
    }

    width(): number {
        return Module.ccall('get_width', 'number', ['number'], [this.tiffPtr]);
    }

    height(): number {
        return Module.ccall('get_height', 'number', ['number'], [this.tiffPtr]);
    }

    numPages(): number {
        let count = 0;
        let result: number;

        this.setDirectory(0);

        do {
            count++;
            result = Module.ccall('TIFFReadDirectory', 'number', ['number'], [this.tiffPtr]);
        } while (result !== 0); 

        return count;
    }

    renderPageAsCanvas(pageNumber: number, targetCanvas: HTMLCanvasElement): HTMLCanvasElement {
        this.setDirectory(pageNumber);

        const width = this.width();
        const height = this.height();
        const raster: number = Module.ccall('_TIFFmalloc', 'number', ['number'], [width * height * 4]);
        const result: number = Module.ccall(
            'TIFFReadRGBAImageOriented',
            'number',
            ['number', 'number', 'number', 'number', 'number', 'number'],
            [this.tiffPtr, width, height, raster, 1, 0]
        );

        const image = Module.HEAPU8.subarray(raster, raster + width * height * 4);
        targetCanvas = targetCanvas || document.createElement('canvas');
        targetCanvas.width = width;
        targetCanvas.height = height;

        const context = targetCanvas.getContext('2d');
        if (context) {
            const imageData = context.createImageData(width, height);
            imageData.data.set(image);
            context.putImageData(imageData, 0, 0);
        }

        Module.ccall('_TIFFfree', 'number', ['number'], [raster]);
        return targetCanvas;
    }

    private setDirectory(index: number) {
        Module.ccall('TIFFSetDirectory', 'number', ['number', 'number'], [this.tiffPtr, index]);
    }

    private static filenameCounter: number = 0;
    private static getUniqueFilename(): string {
        return `${Tiff.filenameCounter++}.tiff`;
    }
}
