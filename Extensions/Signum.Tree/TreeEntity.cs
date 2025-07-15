using Microsoft.SqlServer.Types;
using System.ComponentModel;
using System.Data;

namespace Signum.Tree;

public abstract class TreeEntity : Entity
{
    [UniqueIndex]
    SqlHierarchyId route;
    [InTypeScript(false)]
    public SqlHierarchyId Route
    {
        get { return this.Get(route); }
        set
        {
            if (this.Set(ref route, value))
                this.ParentRoute = value.GetAncestor(1).ToString();
        }
    }


    [AutoExpressionField]
    public string RouteToString => As.Expression(() => Route.ToString());

    [NotNullValidator(Disabled = true)]
    [DbType(Size = 255, SqlDbType = SqlDbType.VarChar)]
    public string ParentRoute { get; set; }

    static Expression<Func<TreeEntity, short?>> LevelExpression = @this => (short?)@this.Route.GetLevel();
    [Ignore]
    short? level;
    [ExpressionField("LevelExpression"), InTypeScript(true)]
    public short? Level
    {
        get { return level; }
        set { level = value; }
    }

    protected override void PostRetrieving(PostRetrievingContext ctx)
    {
        UpdateLevel();
    }

    public void UpdateLevel()
    {
        this.level = (short)this.Route.GetLevel();
    }

    [Ignore, ImplementedByAll]
    public Lite<TreeEntity>? ParentOrSibling { get; set; }

    [Ignore]
    public bool IsSibling { get; set; }

    [StringLengthValidator(Min = 1, Max = 255)]
    public string Name { get; set; }

    [NotNullValidator(Disabled = true)]
    [StringLengthValidator(Min = 1, Max = int.MaxValue, DisabledInModelBinder = true)]
    public string FullName { get; private set; }

    public void SetFullName(string newFullName)
    {
        this.FullName = newFullName;
    }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Name);
}

[AutoInit]
public static class TreeOperation
{
    public static readonly ConstructSymbol<TreeEntity>.Simple CreateRoot;
    public static readonly ConstructSymbol<TreeEntity>.From<TreeEntity> CreateChild;
    public static readonly ConstructSymbol<TreeEntity>.From<TreeEntity> CreateNextSibling;
    public static readonly ExecuteSymbol<TreeEntity> Save;
    public static readonly ExecuteSymbol<TreeEntity> Move;
    public static readonly ConstructSymbol<TreeEntity>.From<TreeEntity> Copy;
    public static readonly DeleteSymbol<TreeEntity> Delete;
}



public enum TreeMessage
{
    Tree,
    Descendants,
    Parent,
    Ascendants,
    Children,
    Level,
    TreeInfo,
    TreeType,
    [Description("Level should not be greater than {0}")]
    LevelShouldNotBeGreaterThan0,
    [Description("Impossible to move {0} inside of {1}")]
    ImpossibleToMove0InsideOf1,
    [Description("Impossible to move {0} {1} of {2}")]
    ImpossibleToMove01Of2,
    [Description("Move {0}")]
    Move0,
    [Description("Copy {0}")]
    Copy0,
    ListView,
}


public enum TreeViewerMessage
{
    Search,
    AddRoot,
    AddChild,
    AddSibling,
    Remove,
    None,
    ExpandAll,
    CollapseAll,
}

public class MoveTreeModel : ModelEntity
{
    [ImplementedByAll]
    public Lite<TreeEntity>? NewParent { get; set; }

    public InsertPlace InsertPlace { get; set; }

    [ImplementedByAll]
    public Lite<TreeEntity>? Sibling { get; set; }

    protected override string? PropertyValidation(PropertyInfo pi)
    {
        if(pi.Name == nameof(Sibling) && Sibling == null &&
            (InsertPlace == InsertPlace.After || InsertPlace == InsertPlace.Before))
        {
            return ValidationMessage._0IsNotSet.NiceToString(pi.NiceName());
        }

        return base.PropertyValidation(pi);
    }
}

public enum InsertPlace
{
    FirstNode,
    After,
    Before,
    LastNode,
}

public class TreeInfo
{
    public string name { get; set; }
    public string fullName { get; set; }
    public Lite<TreeEntity> lite { get; set; }
    public bool disabled { get; set; }
    public int childrenCount { get; set; }
    public SqlHierarchyId route { get; set; }
    public short level { get; set; }
}
