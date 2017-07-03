declare module "libtiff" {
    // This is more like a type definition file for a small subset of emscripten

    namespace Module {
        var HEAPU8: Uint8Array;

        function ccall(ident: string,
                       returnType: string,
                       argTypes: string[],
                       args: any[]): any;
    }

    namespace FS {
        function createDataFile(parent: string, name: string, data: any,
                                 canRead: boolean, canWrite: boolean): Object;
        function unlink(filename: string): void;
    }    
}
