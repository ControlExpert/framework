using Signum.UserAssets;
using System.Xml.Linq;
using Signum.Utilities.DataStructures;
using System.ComponentModel;

namespace Signum.Dashboard;

public class PanelPartEmbedded : EmbeddedEntity, IGridEntity
{
    [StringLengthValidator(Min = 3, Max = 100)]
    public string? Title { get; set; }

    [StringLengthValidator(Min = 3, Max = 100)]
    public string? IconName { get; set; }

    [StringLengthValidator(Min = 3, Max = 20)]
    [Format(FormatAttribute.Color)]
    public string? IconColor { get; set; }

    [NumberIsValidator(ComparisonType.GreaterThanOrEqualTo, 0)]
    public int Row { get; set; }

    [NumberBetweenValidator(0, 11)]
    public int StartColumn { get; set; }

    [NumberBetweenValidator(1, 12)]
    public int Columns { get; set; }

    public InteractionGroup? InteractionGroup { get; set; }

    [Format(FormatAttribute.Color)]
    public string? CustomColor { get; set; }

    public bool UseIconColorForTitle { get; set; }

    [BindParent]
    [ImplementedBy(
        typeof(LinkListPartEntity),
        typeof(ImagePartEntity),
        typeof(SeparatorPartEntity))]
    public IPartEntity Content { get; set; }

    public override string ToString()
    {
        return Title.HasText() ? Title :
            Content == null ? "" :
            Content.ToString()!;
    }

    protected override string? PropertyValidation(PropertyInfo pi)
    {
        if (pi.Name == nameof(Title) && string.IsNullOrEmpty(Title))
        {
            if (Content != null && Content.RequiresTitle)
                return DashboardMessage.DashboardDN_TitleMustBeSpecifiedFor0.NiceToString().FormatWith(Content.GetType().NicePluralName());
        }

        return base.PropertyValidation(pi);
    }

    public PanelPartEmbedded Clone()
    {
        return new PanelPartEmbedded
        {
            Columns = Columns,
            StartColumn = StartColumn,
            Content = Content.Clone(),
            Title = Title,
            Row = Row,
            InteractionGroup = InteractionGroup,
            IconColor = IconColor,
            IconName = IconName,
            CustomColor = CustomColor,
            UseIconColorForTitle = UseIconColorForTitle,
        };
    }

    internal void NotifyRowColumn()
    {
        Notify(() => StartColumn);
        Notify(() => Columns);
    }

    internal XElement ToXml(IToXmlContext ctx)
    {
        return new XElement("Part",
            new XAttribute("Row", Row),
            new XAttribute("StartColumn", StartColumn),
            new XAttribute("Columns", Columns),
            Title == null ? null! : new XAttribute("Title", Title),
            IconName == null ? null! : new XAttribute("IconName", IconName),
            IconColor == null ? null! : new XAttribute("IconColor", IconColor),
            InteractionGroup == null ? null! : new XAttribute("InteractionGroup", InteractionGroup),
            string.IsNullOrEmpty(CustomColor) ? null! : new XAttribute("CustomColor", CustomColor),
            UseIconColorForTitle == false ? null! : new XAttribute("UseIconColorForTitle", true),
            Content.ToXml(ctx));
    }

    internal void FromXml(XElement x, IFromXmlContext ctx)
    {
        Row = int.Parse(x.Attribute("Row")!.Value);
        StartColumn = int.Parse(x.Attribute("StartColumn")!.Value);
        Columns = int.Parse(x.Attribute("Columns")!.Value);
        Title = x.Attribute("Title")?.Value;
        IconName = x.Attribute("IconName")?.Value;
        IconColor = x.Attribute("IconColor")?.Value;
        InteractionGroup = x.Attribute("InteractionGroup")?.Value.ToEnum<InteractionGroup>();
        CustomColor = x.Attribute("CustomColor")?.Value;
        UseIconColorForTitle = x.Attribute("UseIconColorForTitle")?.Let(a => bool.Parse(a.Value)) ?? false;
        Content = DashboardLogic.GetPart(ctx, Content, x.Elements().Single());
    }

    internal Interval<int> ColumnInterval()
    {
        return new Interval<int>(this.StartColumn, this.StartColumn + this.Columns);
    }
}

public interface IGridEntity
{
    int Row { get; set; }
    int StartColumn { get; set; }
    int Columns { get; set; }
}

public interface IPartEntity : IEntity
{
    bool RequiresTitle { get; }
    IPartEntity Clone();

    XElement ToXml(IToXmlContext ctx);
    void FromXml(XElement element, IFromXmlContext ctx);
}

public enum InteractionGroup
{
    [Description("Group 1")] Group1,
    [Description("Group 2")] Group2,
    [Description("Group 3")] Group3,
    [Description("Group 4")] Group4,
    [Description("Group 5")] Group5,
    [Description("Group 6")] Group6,
    [Description("Group 7")] Group7,
    [Description("Group 8")] Group8,
}


[EntityKind(EntityKind.Part, EntityData.Master)]
public class LinkListPartEntity : Entity, IPartEntity
{

    public MList<LinkElementEmbedded> Links { get; set; } = new MList<LinkElementEmbedded>();

    public override string ToString()
    {
        return "{0} {1}".FormatWith(Links.Count, typeof(LinkElementEmbedded).NicePluralName());
    }

    public bool RequiresTitle
    {
        get { return true; }
    }

    public IPartEntity Clone()
    {
        return new LinkListPartEntity
        {
            Links = this.Links.Select(e => e.Clone()).ToMList(),
        };
    }

    public XElement ToXml(IToXmlContext ctx)
    {
        return new XElement("LinkListPart",
            Links.Select(lin => lin.ToXml(ctx)));
    }


    public void FromXml(XElement element, IFromXmlContext ctx)
    {
        Links.Synchronize(element.Elements().ToList(), (le, x) => le.FromXml(x));
    }
}

public class LinkElementEmbedded : EmbeddedEntity
{
    [StringLengthValidator(Max = 200)]
    public string Label { get; set; }

    [URLValidator(absolute: true, aspNetSiteRelative: true), StringLengthValidator(Max = int.MaxValue)]
    public string Link { get; set; }

    public bool OpensInNewTab { get; set; }

    public LinkElementEmbedded Clone()
    {
        return new LinkElementEmbedded
        {
            Label = this.Label,
            Link = this.Link
        };
    }

    internal XElement ToXml(IToXmlContext ctx)
    {
        return new XElement("LinkElement",
            new XAttribute("Label", Label),
            new XAttribute("Link", Link),
            OpensInNewTab == false ? null! : new XAttribute("OpensInNewTab", OpensInNewTab));
    }

    internal void FromXml(XElement element)
    {
        Label = element.Attribute("Label")!.Value;
        Link = element.Attribute("Link")!.Value;
        OpensInNewTab = (bool?)element.Attribute("OpensInNewTab") ?? false;
    }
}

[Serializable, EntityKind(EntityKind.Part, EntityData.Master)]
public class ImagePartEntity : Entity, IPartEntity
{
    [StringLengthValidator(Max = int.MaxValue)]
    public string ImageSrcContent { get; set; }

    public string? ClickActionURL { get; set; }
    
    public string? AltText { get; set; }

    public bool RequiresTitle => false;

    public IPartEntity Clone()
    {
        return new ImagePartEntity
        {
            ImageSrcContent = this.ImageSrcContent,
            ClickActionURL = this.ClickActionURL,
        };
    }

    public XElement ToXml(IToXmlContext ctx)
    {
        return new XElement("UserQueryPart",
            new XAttribute("ImageSrcContent", ImageSrcContent),
            new XAttribute("ClickActionURL", ClickActionURL!)
            );
    }

    public void FromXml(XElement element, IFromXmlContext ctx)
    {
        ImageSrcContent = element.Attribute("ImageSrcContent")?.Value ?? "";
        ClickActionURL = element.Attribute("ClickActionURL")?.Value;
    }
}

[EntityKind(EntityKind.Part, EntityData.Master)]
public class SeparatorPartEntity : Entity, IPartEntity
{
    public string? Title { get; set; }

    public bool RequiresTitle => Title != null;

    public override string ToString()
    {
        return "{0}".FormatWith(Title);
    }

    public IPartEntity Clone()
    {
        return new SeparatorPartEntity
        {
            Title = this.Title
        };
    }

    public XElement ToXml(IToXmlContext ctx)
    {
        throw new NotImplementedException();
    }

    public void FromXml(XElement element, IFromXmlContext ctx)
    {
        throw new NotImplementedException();
    }
}
