using DocumentFormat.OpenXml.Packaging;
using ImageMagick;
using System.IO;

namespace Signum.Word;

// COM-9140: Company-approved image library (Magick.NET-Q8-AnyCPU) replaces upstream's SkiaSharpConverter, since SkiaSharp is not approved.
public class MagickConverter : IImageConverter<MagickImage>
{
    public static readonly MagickConverter Instance = new MagickConverter();

    public MagickImage FromStream(Stream stream)
    {
        return new MagickImage(stream);
    }

    public (int width, int height) GetSize(MagickImage image)
    {
        return ((int)image.Width, (int)image.Height);
    }

    public MagickImage Resize(MagickImage image, int maxWidth, int maxHeight, ImageVerticalPosition verticalPosition = ImageVerticalPosition.Center, ImageHorizontalPosition horizontalPosition = ImageHorizontalPosition.Center)
    {
        var gravity = (verticalPosition, horizontalPosition) switch
        {
            (ImageVerticalPosition.Top, ImageHorizontalPosition.Left) => Gravity.Northwest,
            (ImageVerticalPosition.Top, ImageHorizontalPosition.Right) => Gravity.Northeast,
            (ImageVerticalPosition.Top, ImageHorizontalPosition.Center) => Gravity.North,

            (ImageVerticalPosition.Center, ImageHorizontalPosition.Left) => Gravity.West,
            (ImageVerticalPosition.Center, ImageHorizontalPosition.Right) => Gravity.East,
            (ImageVerticalPosition.Center, ImageHorizontalPosition.Center) => Gravity.Center,

            (ImageVerticalPosition.Bottom, ImageHorizontalPosition.Left) => Gravity.Southwest,
            (ImageVerticalPosition.Bottom, ImageHorizontalPosition.Right) => Gravity.Southeast,
            (ImageVerticalPosition.Bottom, ImageHorizontalPosition.Center) => Gravity.South,

            _ => throw new UnexpectedValueException((verticalPosition, horizontalPosition))
        };

        // Fit inside maxWidth x maxHeight keeping the aspect ratio (scales up too), then pad with white to the exact size.
        var result = new MagickImage(image);
        result.Resize(new MagickGeometry((uint)maxWidth, (uint)maxHeight));
        result.Extent((uint)maxWidth, (uint)maxHeight, gravity, MagickColors.White);
        return result;
    }

    public void Save(MagickImage image, Stream str, PartTypeInfo imagePartType)
    {
        image.Write(str, ToImageFormat(imagePartType));
    }

    public static Dictionary<PartTypeInfo, MagickFormat> FormatsDictionary = new Dictionary<PartTypeInfo, MagickFormat>
    {
        { ImagePartType.Bmp, MagickFormat.Bmp },
        { ImagePartType.Gif, MagickFormat.Gif },
        { ImagePartType.Jpeg, MagickFormat.Jpeg },
        { ImagePartType.Png, MagickFormat.Png },
        { ImagePartType.Tiff, MagickFormat.Tiff },
    };

    private static MagickFormat ToImageFormat(PartTypeInfo imagePartType)
    {
        if (!FormatsDictionary.TryGetValue(imagePartType, out var format))
        {
            throw new InvalidOperationException("Unexpected {0}".FormatWith(imagePartType));
        }

        return format;
    }
}
