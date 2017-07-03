export DIR=`pwd`

# download zlib
curl https://zlib.net/zlib-1.2.11.tar.gz | tar -xz
cd zlib-1.2.11
emconfigure ./configure
emmake make -j8
cd ..

# download libjpeg
curl http://ijg.org/files/jpegsrc.v9b.tar.gz | tar -xz
cd jpeg-9b
emconfigure ./configure
emmake make clean
emmake make -j8
cd ..

# download libtiff
curl ftp://download.osgeo.org/libtiff/tiff-4.0.8.tar.gz | tar -xz
cd tiff-4.0.8
patch configure ../configure.patch
emconfigure ./configure \
    --with-zlib-include-dir=$DIR/zlib-1.2.11/ \
    --with-zlib-lib-dir=$DIR/zlib-1.2.11/ \
    --with-jpeg-include-dir=$DIR/jpeg-9b/ \
    --with-jpeg-lib-dir=$DIR/jpeg-9b/.libs/ \
    --enable-shared
emmake make -j8
cd ..

# compile everything together
emcc -o dist/libtiff.js \
    -I tiff-4.0.8/libtiff \
    -O3 \
    -s WASM=1 \
    -s TOTAL_MEMORY=268435456 \
    -s ASSERTIONS=1\
    -s EXPORTED_FUNCTIONS="['_TIFFOpen', '_TIFFClose', '_TIFFGetField', '_TIFFReadRGBAImageOriented', '_TIFFSetDirectory', '_TIFFCurrentDirectory', '_TIFFReadDirectory', '__TIFFmalloc', '__TIFFfree', '_get_width', '_get_height']"\
    --memory-init-file 0 \
    helper.c \
    tiff-4.0.8/libtiff/.libs/libtiff.a \
    zlib-1.2.11/libz.a \
    jpeg-9b/.libs/libjpeg.a
