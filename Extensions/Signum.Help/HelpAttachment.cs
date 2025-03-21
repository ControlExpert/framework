using Signum.Files;

namespace Signum.Help;

[EntityKind(EntityKind.Part, EntityData.Master)]
[PrimaryKey(typeof(Guid))]
public class HelpImageEntity : Entity
{
    [ImplementedBy(typeof(AppendixHelpEntity), typeof(NamespaceHelpEntity), typeof(QueryHelpEntity), typeof(TypeHelpEntity))]
    public Lite<IHelpImageTarget> Target { get; set; }

    public DateTime CreationDate { get; set; } = Clock.Now;

    [DefaultFileType(nameof(HelpImageFileType.Image), nameof(HelpImageFileType))]
    public FilePathEmbedded File { get; set; }
}


public interface IHelpImageTarget : IEntity
{
    bool ForeachHtmlField(Func<string, string> processHtml);
}


[AutoInit]
public static class HelpImageFileType
{
    public static readonly FileTypeSymbol Image;
}
