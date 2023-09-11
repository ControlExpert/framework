using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Drawing.Wordprocessing;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.IO;
#pragma warning disable CA1416 // Validate platform compatibility

namespace Signum.Engine.Word;

public static class WordImageReplacer
{
    public static bool AvoidAdaptSize = false; //Jpeg compression creates different images in TeamCity

    /// <param name="titleOrDescription">
    /// Replaces a placeholder-image with the provided image by comparing title/description
    /// 
    /// Word Image -> Right Click -> Format Picture -> Alt Text -> Title 
    /// </param>
    public static void ReplaceImage<TImage>(this WordprocessingDocument doc, string titleOrDescription, TImage image, IImageConverter<TImage> converter, string newImagePartId, bool adaptSize = false, ImagePartType imagePartType = ImagePartType.Png)
    {
        var blip = doc.FindBlip(titleOrDescription);

        if (adaptSize && AvoidAdaptSize == false)
        {
            var size = doc.GetBlipBitmapSize(blip, converter);
            image = converter.Resize(image, size.width, size.height);
        }

        doc.ReplaceBlipContent(blip, image, converter, newImagePartId, imagePartType);
    }

    /// <param name="titleOrDescription">
    /// Replaces a placeholder-image with multiple images by comparing title/description
    /// 
    /// Word Image -> Right Click -> Format Picture -> Alt Text -> Title 
    /// </param>
    public static void ReplaceMultipleImages<TImage>(WordprocessingDocument doc, string titleOrDescription, TImage[] images, IImageConverter<TImage> converter, string newImagePartId, bool adaptSize = false, ImagePartType imagePartType = ImagePartType.Png)
    {
        Blip[] blips = FindAllBlips(doc, d => d.Title == titleOrDescription || d.Description == titleOrDescription);

        if (blips.Count() != images.Length)
            throw new ApplicationException("Images count does not match the images count in word");

        if (adaptSize && !AvoidAdaptSize)
        {
            images = images.Select(bitmap =>
            {
                var part = doc.MainDocumentPart!.GetPartById(blips.First().Embed!);

                using (var stream = part.GetStream())
                {
                    TImage oldImage = converter.FromStream(stream);
                    var size = converter.GetSize(oldImage);
                    return converter.Resize(bitmap, size.width, size.height);
                }
            }).ToArray();
        }

        doc.MainDocumentPart!.DeletePart(blips.First().Embed!);

        var i = 0;
        var bitmapStack = new Stack<TImage>(images.Reverse());
        foreach (var blip in blips)
        {
            ImagePart img = CreateImagePart(doc, bitmapStack.Pop(), converter, newImagePartId + i, imagePartType);
            blip.Embed = doc.MainDocumentPart.GetIdOfPart(img);
            i++;
        }
    }

    public static (int width, int height) GetBlipBitmapSize<TImage>(this WordprocessingDocument doc, Blip blip, IImageConverter<TImage> converter)
    {
        var part = doc.MainDocumentPart!.GetPartById(blip.Embed!);

        using (var str = part.GetStream())
        {
            var image = converter.FromStream(str);
            return converter.GetSize(image);
        }
    }

    public static void ReplaceBlipContent<TImage>(this WordprocessingDocument doc, Blip blip, TImage image, IImageConverter<TImage> converter, string newImagePartId, ImagePartType imagePartType = ImagePartType.Png)
    {
        if (doc.MainDocumentPart!.Parts.Any(p => p.RelationshipId == blip.Embed))
            doc.MainDocumentPart.DeletePart(blip.Embed!);
        ImagePart img = CreateImagePart(doc, image, converter, newImagePartId, imagePartType);
        blip.Embed = doc.MainDocumentPart.GetIdOfPart(img);
    }

    public static void RemoveImage(this WordprocessingDocument doc, string title, bool removeFullDrawing)
    {
        Blip blip = FindBlip(doc, title);
        doc.MainDocumentPart!.DeletePart(blip.Embed!);

        if (removeFullDrawing)
            ((OpenXmlElement)blip).Follow(a => a.Parent).OfType<Drawing>().FirstEx().Remove();
        else
            blip.Remove();
    }

    static ImagePart CreateImagePart<TImage>(this WordprocessingDocument doc, TImage image, IImageConverter<TImage> converter, string id, ImagePartType imagePartType = ImagePartType.Png)
    {
        ImagePart img = doc.MainDocumentPart!.AddImagePart(imagePartType, id);

        using (var ms = new MemoryStream())
        {
            converter.Save(image, ms, imagePartType);
            ms.Seek(0, SeekOrigin.Begin);
            img.FeedData(ms);
        }
        return img;
    }


    public static Blip FindBlip(this WordprocessingDocument doc, string titleOrDescription)
    {
        var drawing = doc.MainDocumentPart!.Document.Descendants().OfType<Drawing>().Single(r =>
        {
            var prop = r.Descendants<DocProperties>().SingleOrDefault();
            var match = prop != null && (prop.Title == titleOrDescription || prop.Description == titleOrDescription);

            return match;
        });

        return drawing.Descendants<Blip>().SingleEx();
    }

    public static Blip[] FindAllBlips(this WordprocessingDocument doc, Func<DocProperties, bool> predicate)
    {
        var drawing = doc.MainDocumentPart!.Document.Descendants().OfType<Drawing>().Where(r =>
        {
            var prop = r.Descendants<DocProperties>().SingleOrDefault();
            var match = prop != null && predicate(prop);

            return match;
        });

        return drawing.Select(d => d.Descendants<Blip>().SingleEx()).ToArray();
    }
}

//https://docs.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/6.0/system-drawing-common-windows-only
/// <summary>
/// System.Drawing is being deprecated outside windows
/// </summary>
/// <typeparam name="TImage"></typeparam>
public interface IImageConverter<TImage>
{
    (int width, int height) GetSize(TImage image);
    TImage FromStream(Stream str);
    void Save(TImage image, Stream str, ImagePartType imagePartType);
    TImage Resize(TImage image, int maxWidth, int maxHeight);
}
