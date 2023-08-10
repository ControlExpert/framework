using Signum.Entities.Files;
using System.IO;

namespace Signum.Engine.Files;

public class FileTypeAlgorithm : FileTypeAlgorithmBase, IFileTypeAlgorithm
{
    public Func<IFilePath, PrefixPair> GetPrefixPair { get; set; }
    public Func<IFilePath, string> CalculateSuffix { get; set; }

    public bool RenameOnCollision { get; set; }
    public bool WeakFileReference { get; set; }

    public Func<string, int, string> RenameAlgorithm { get; set; }

    public FileTypeAlgorithm(Func<IFilePath, PrefixPair> getPrefixPair)
    {
        this.GetPrefixPair = getPrefixPair;
        
        WeakFileReference = false;
        CalculateSuffix = SuffixGenerators.Safe.YearMonth_Guid_Filename;

        RenameOnCollision = true;
        RenameAlgorithm = DefaultRenameAlgorithm;
    }

    public static readonly Func<string, int, string> DefaultRenameAlgorithm = (sufix, num) =>
       Path.Combine(Path.GetDirectoryName(sufix)!,
          "{0}({1}){2}".FormatWith(Path.GetFileNameWithoutExtension(sufix), num, Path.GetExtension(sufix)));

    
    public virtual void SaveFile(IFilePath fp)
    {
        using (new EntityCache(EntityCacheType.ForceNew))
        {
            if (WeakFileReference)
                return;

            string suffix = CalculateSuffix(fp);
            if (!suffix.HasText())
                throw new InvalidOperationException("Suffix not set");

            fp.SetPrefixPair(GetPrefixPair(fp));

            int i = 2;
            fp.Suffix = suffix;
            while (RenameOnCollision && File.Exists(fp.FullPhysicalPath()))
            {
                fp.Suffix = RenameAlgorithm(suffix, i);
                i++;
            }

            SaveFileInDisk(fp);
        }
    }

    public virtual void SaveFileInDisk(IFilePath fp)
    {
        string fullPhysicalPath = fp.FullPhysicalPath();
        using (HeavyProfiler.Log("SaveFileInDisk", () => fullPhysicalPath))
            try
            {
                string directory = Path.GetDirectoryName(fullPhysicalPath)!;
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory);
                File.WriteAllBytes(fp.FullPhysicalPath(), fp.BinaryFile);
                fp.BinaryFile = null!;
            }
            catch (IOException ex)
            {
                ex.Data.Add("FullPhysicalPath", fullPhysicalPath);
                ex.Data.Add("CurrentPrincipal", System.Threading.Thread.CurrentPrincipal!.Identity!.Name);

                throw;
            }
    }

    public virtual Stream OpenRead(IFilePath path)
    {
        string fullPhysicalPath = path.FullPhysicalPath();
        using (HeavyProfiler.Log("OpenRead", () => fullPhysicalPath))
            return File.OpenRead(fullPhysicalPath);
    }

    public virtual byte[] ReadAllBytes(IFilePath path)
    {
        string fullPhysicalPath = path.FullPhysicalPath();
        using (HeavyProfiler.Log("ReadAllBytes", () => fullPhysicalPath))
            return File.ReadAllBytes(fullPhysicalPath);
    }

    public virtual void MoveFile(IFilePath ofp, IFilePath fp)
    {
        if (WeakFileReference)
            return;

        string source = ofp.FullPhysicalPath();
        string target = fp.FullPhysicalPath();
        using (HeavyProfiler.Log("ReadAllBytes", () =>
        "SOURCE: " + source + "\n" +
        "TARGET:" + target))
        {
            System.IO.File.Move(source, target);
        }
    }

    public virtual void DeleteFiles(IEnumerable<IFilePath> files)
    {
        if (WeakFileReference)
            return;

        foreach (var f in files)
        {
            string fullPhysicalPath = f.FullPhysicalPath();
            using (HeavyProfiler.Log("DeleteFile", () => fullPhysicalPath))
                File.Delete(fullPhysicalPath);
        }
    }

    public virtual void DeleteFilesIfExist(IEnumerable<IFilePath> files)
    {
        if (WeakFileReference)
            return;

        foreach (var f in files)
        {
            string fullPhysicalPath = f.FullPhysicalPath();

            using (HeavyProfiler.Log("DeleteFileIfExists", () => fullPhysicalPath))
                if (File.Exists(fullPhysicalPath))
                    File.Delete(fullPhysicalPath);
        }
    }

    PrefixPair IFileTypeAlgorithm.GetPrefixPair(IFilePath efp)
    {
        return this.GetPrefixPair(efp);
    }
}

