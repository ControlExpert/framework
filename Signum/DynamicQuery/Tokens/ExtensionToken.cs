namespace Signum.DynamicQuery.Tokens;

public class ExtensionToken : QueryToken
{
    QueryToken parent;
    public override QueryToken? Parent => parent;


    public ExtensionToken(QueryToken parent, string key, Type type, bool isProjection,
        string? unit, string? format, Implementations? implementations,
        Func<string?> isAllowed, PropertyRoute? propertyRoute, Func<string> displayName, bool autoExpandExtension)
    {
        this.parent = parent ?? throw new ArgumentNullException(nameof(parent));

        var shouldHaveImplementations = typeof(IEntity).IsAssignableFrom((isProjection ? type.ElementType()! : type).CleanType());

        if (shouldHaveImplementations && implementations == null)
        {
            var parentType = parent.Type.CleanType().TypeName();
            throw new ArgumentException($@"Impossible to determine automatically the implementations for extension token '{key}' (of type {type.TypeName()}) registered on type {parentType}.
Consider using QueryLogic.Expressions.Register(({parentType} e) => e.{key}()).ForceImplementations = Implementations.By(typeof({type.CleanType().TypeName()}));");

        }

        this.key = key;
        this.type = type;
        this.isProjection = isProjection;
        this.unit = unit;
        this.format = format;
        this.implementations = implementations;
        this.isAllowedFunc = isAllowed;
        this.propertyRoute = propertyRoute;
        this.autoExpandExtension = autoExpandExtension;
        this.DisplayNameFunc = displayName;
    }

    bool autoExpandExtension;

    protected override bool AutoExpandInternal => autoExpandExtension;

    Func<string> DisplayNameFunc;
    public string DisplayName => DisplayNameFunc();

    public override string ToString()
    {
        return DisplayName;
    }

    public override string NiceName()
    {
        return DisplayName;
    }

    Type type;
    public override Type Type { get { return type.BuildLiteNullifyUnwrapPrimaryKey(new[] { this.GetPropertyRoute()! }); } }

    string key;
    public override string Key { get { return key; } }

    bool isProjection;
    public bool IsProjection { get { return isProjection; } }

    string? format;
    public override string? Format { get { return isProjection ? null : format; } }
    public string? ElementFormat { get { return isProjection ? format : null; } }

    string? unit;
    public override string? Unit { get { return isProjection ? null : unit; } }
    public string? ElementUnit { get { return isProjection ? unit : null; } }

    protected override List<QueryToken> SubTokensOverride(SubTokensOptions options)
    {
        return base.SubTokensBase(type, options, implementations);
    }

    public static Func<Type, string, Expression, Expression>? BuildExtension;

    protected override Expression BuildExpressionInternal(BuildExpressionContext context)
    {
        if (BuildExtension == null)
            throw new InvalidOperationException("ExtensionToken.BuildExtension not set");

        var parentExpression = parent.BuildExpression(context);

        var result = BuildExtension(parent.Type, Key, parentExpression);

        return result.BuildLiteNullifyUnwrapPrimaryKey(new[] { this.propertyRoute! });
    }

    public PropertyRoute? propertyRoute;
    public override PropertyRoute? GetPropertyRoute()
    {
        return isProjection ? null : propertyRoute;
    }

    public PropertyRoute? GetElementPropertyRoute()
    {
        return isProjection ? propertyRoute : null;
    }

    public Implementations? implementations;
    public override Implementations? GetImplementations()
    {
        return isProjection ? null : implementations;
    }

    protected internal override Implementations? GetElementImplementations()
    {
        return isProjection ? implementations : null;
    }

    Func<string?> isAllowedFunc;
    public override string? IsAllowed()
    {
        string? parentAllowed = this.parent.IsAllowed();

        var isAllowed = isAllowedFunc();

        if (isAllowed.HasText() && parentAllowed.HasText())
            return QueryTokenMessage.And.NiceToString().Combine(isAllowed!, parentAllowed!);

        return isAllowed ?? parentAllowed;
    }

    public override QueryToken Clone()
    {
        return new ExtensionToken(this.parent.Clone(), key, type, isProjection, unit, format, implementations, isAllowedFunc, propertyRoute, DisplayNameFunc, autoExpandExtension);
    }
}
