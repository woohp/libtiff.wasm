#include "tiffio.h"

int get_width(TIFF* tiff)
{
    int value;
    TIFFGetField(tiff, TIFFTAG_IMAGEWIDTH, &value);
    return value;
}

int get_height(TIFF* tiff)
{
    int value;
    TIFFGetField(tiff, TIFFTAG_IMAGELENGTH, &value);
    return value;
}
