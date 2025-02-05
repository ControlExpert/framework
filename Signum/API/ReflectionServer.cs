using System.Collections.Concurrent;
using System.Globalization;
using System.Text.Json.Serialization;
using Signum.Engine.Maps;
using Signum.Utilities.Reflection;
using System.Diagnostics.CodeAnalysis;
using Signum.API.Json;
using System.Linq;
using Signum.Utilities;
using System.Collections.Generic;

namespace Signum.API;

public static class ReflectionServer
{
    public static Func<object> GetContext = GetCurrentValidCulture;

    public static object GetCurrentValidCulture()
    {
        var ci = CultureInfo.CurrentCulture;
        while (ci != CultureInfo.InvariantCulture && !EntityAssemblies.Keys.Any(a => DescriptionManager.GetLocalizedAssembly(a, ci) != null))
            ci = ci.Parent;

        return ci != CultureInfo.InvariantCulture ? ci : CultureInfo.GetCultureInfo("en");
    }

    public static DateTimeOffset LastModified { get; private set; } = DateTimeOffset.UtcNow;

    public static ConcurrentDictionary<object, Dictionary<string, TypeInfoTS>> cache =
     new ConcurrentDictionary<object, Dictionary<string, TypeInfoTS>>();

    public static Dictionary<Assembly, HashSet<string>> EntityAssemblies = new Dictionary<Assembly, HashSet<string>>();

    public static ResetLazy<Dictionary<string, Type>> TypesByName = new ResetLazy<Dictionary<string, Type>>(
        () => GetTypes().ToDictionaryEx(GetTypeName, "Types"));

    public static Dictionary<string, Func<bool>> OverrideIsNamespaceAllowed = new Dictionary<string, Func<bool>>();

    public static void RegisterLike(Type type, Func<bool> allowed)
    {
        TypesByName.Reset();
        EntityAssemblies.GetOrCreate(type.Assembly).Add(type.Namespace!);
        OverrideIsNamespaceAllowed[type.Namespace!] = allowed;
    }

    internal static void Start()
    {
        DescriptionManager.Invalidated += InvalidateCache;
        Schema.Current.OnMetadataInvalidated += InvalidateCache;
        Schema.Current.InvalidateCache += InvalidateCache;

        Schema.Current.SchemaCompleted += () =>
        {
            var mainTypes = Schema.Current.Tables.Keys;
            var mixins = mainTypes.SelectMany(t => MixinDeclarations.GetMixinDeclarations(t)).ToList();
            var symbols = SymbolLogic.AllSymbolContainers().ToList();

            var messages = mainTypes.Concat(mixins).Concat(symbols).Select(a => a.Assembly).SelectMany(a => a.GetTypes())
            .Where(t => t.IsPublic && t.IsEnum && LocalizedAssembly.GetDescriptionOptions(t) != DescriptionOptions.None).ToList();

            foreach (var item in mainTypes.Concat(mixins).Concat(symbols).Concat(messages))
            {
                EntityAssemblies.GetOrCreate(item.Assembly).Add(item.Namespace!);
            }
        };
    }

    public static void InvalidateCache()
    {
        cache.Clear();
        LastModified = DateTimeOffset.UtcNow;
    }

    const BindingFlags staticFlags = BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly;

    public static event Func<TypeInfoTS, Type, TypeInfoTS?>? TypeExtension;
    static TypeInfoTS? OnTypeExtension(TypeInfoTS ti, Type t)
    {
        foreach (var a in TypeExtension.GetInvocationListTyped())
        {
            ti = a(ti, t)!;
            if (ti == null)
                return null;
        }

        return ti;
    }

    public static event Func<MemberInfoTS, PropertyRoute, MemberInfoTS?>? PropertyRouteExtension;
    static MemberInfoTS? OnPropertyRouteExtension(MemberInfoTS mi, PropertyRoute m)
    {
        if (PropertyRouteExtension == null)
            return mi;

        foreach (var a in PropertyRouteExtension.GetInvocationListTyped())
        {
            mi = a(mi, m)!;
            if (mi == null)
                return null;
        }

        return mi;
    }


    public static event Func<MemberInfoTS, FieldInfo, MemberInfoTS?>? FieldInfoExtension;
    static MemberInfoTS? OnFieldInfoExtension(MemberInfoTS mi, FieldInfo m)
    {
        if (FieldInfoExtension == null)
            return mi;

        foreach (var a in FieldInfoExtension.GetInvocationListTyped())
        {
            mi = a(mi, m)!;
            if (mi == null)
                return null;
        }

        return mi;
    }

    public static event Func<OperationInfoTS, OperationInfo, Type, OperationInfoTS?>? OperationExtension;
    static OperationInfoTS? OnOperationExtension(OperationInfoTS oi, OperationInfo o, Type type)
    {
        if (OperationExtension == null)
            return oi;

        foreach (var a in OperationExtension.GetInvocationListTyped())
        {
            oi = a(oi, o, type)!;
            if (oi == null)
                return null;
        }

        return oi;
    }

    public static HashSet<Type> ExcludeTypes = new HashSet<Type>();

    internal static Dictionary<string, TypeInfoTS> GetTypeInfoTS()
    {
        SymbolLogic.LoadAll();

        return cache.GetOrAdd(GetContext(), ci =>
        {
            var result = new Dictionary<string, TypeInfoTS>();

            var allTypes = GetTypes().ToDictionary(t => t, t =>
            {
                if (t.IsModifiableEntity())
                    return GetEntityTypeInfo(t);

                if (t.IsEnum)
                    return GetEnumTypeInfo(t);

                if (t.IsStaticClass() && t.HasAttribute<AutoInitAttribute>())
                    return GetSymbolContainerTypeInfo(t);

                throw new InvalidOperationException("Unable to generate TypeInfoTS for " + t.FullName);
            });

            return allTypes.Where(kvp => kvp.Value != null).ToDictionaryEx(kvp => GetTypeName(kvp.Key), kvp => kvp.Value!);
        });
    }

    public static List<Type> GetTypes()
    {
        return EntityAssemblies.SelectMany(kvp =>
        {
            var name = kvp.Key.GetName().Name;

            var normalTypes = kvp.Key.GetTypes().Where(t => !ExcludeTypes.Contains(t) && kvp.Value.Contains(t.Namespace!)).ToList();

            var usedEnums = (from type in normalTypes
                             where typeof(ModifiableEntity).IsAssignableFrom(type)
                             from p in type.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                             let pt = (p.PropertyType.ElementType() ?? p.PropertyType).UnNullify()
                             where pt.IsEnum && !EntityAssemblies.ContainsKey(pt.Assembly)
                             select pt).ToList();


            var importedTypes = kvp.Key.GetCustomAttributes<ImportInTypeScriptAttribute>().Select(a => a.Type);
            var allTypes = normalTypes.Concat(importedTypes).Concat(usedEnums).ToList();

            var entities = allTypes.Where(a => a.IsModifiableEntity() && !a.IsAbstract && (!a.IsEntity() || TypeLogic.TypeToEntity.ContainsKey(a))).ToList();

            var enums = allTypes.Where(a => a.IsEnum && LocalizedAssembly.GetDescriptionOptions(a) != DescriptionOptions.None).ToList();

            var symbolContainers = allTypes.Where(a => a.IsStaticClass() && a.HasAttribute<AutoInitAttribute>()).ToList();

            return entities.Concat(enums).Concat(symbolContainers);

        }).Distinct().ToList();
    }

    static MethodInfo miToString = ReflectionTools.GetMethodInfo((object o) => o.ToString());

    public static TypeInfoTS? GetEntityTypeInfo(Type type)
    {
        if (!typeof(IRootEntity).IsAssignableFrom(type))
            return null;

        var queries = QueryLogic.Queries;

        var schema = Schema.Current;
        var settings = Schema.Current.Settings;

        var descOptions = LocalizedAssembly.GetDescriptionOptions(type);

        var isEntity = type.IsEntity();

        var allOperations = !isEntity ? null : OperationLogic.GetAllOperationInfos(type);

        var result = new TypeInfoTS
        {
            Kind = KindOfType.Entity,
            FullName = type.FullName!,
            NiceName = descOptions.HasFlag(DescriptionOptions.Description) ? type.NiceName() : null,
            NicePluralName = descOptions.HasFlag(DescriptionOptions.PluralDescription) ? type.NicePluralName() : null,
            Gender = descOptions.HasFlag(DescriptionOptions.Gender) ? type.GetGender().ToString() : null,
            EntityKind = type.IsIEntity() ? EntityKindCache.GetEntityKind(type) : (EntityKind?)null,
            EntityData = type.IsIEntity() ? EntityKindCache.GetEntityData(type) : (EntityData?)null,
            IsLowPopulation = type.IsIEntity() ? EntityKindCache.IsLowPopulation(type) : false,
            IsSystemVersioned = type.IsIEntity() ? schema.Table(type).SystemVersioned != null : false,
            ToStringFunction = LambdaToJavascriptConverter.ToJavascript(ExpressionCleaner.GetFieldExpansion(type, miToString)!, false),
            QueryDefined = queries.QueryDefined(type),
            Members = PropertyRoute.GenerateRoutes(type)
                .Where(pr => InTypeScript(pr) && !ReflectionServer.ExcludeTypes.Contains(pr.Type))
                .Select(pr =>
                {
                    var validators = Validator.TryGetPropertyValidator(pr)?.Validators;
                    var mi = new MemberInfoTS
                    {
                        NiceName = pr.PropertyInfo!.NiceName(),
                        Format = pr.PropertyRouteType == PropertyRouteType.FieldOrProperty ? Reflector.FormatString(pr) : null,
                        IsReadOnly = !IsId(pr) && (pr.PropertyInfo?.IsReadOnly() ?? false),
                        Required = !IsId(pr) && ((pr.Type.IsValueType && !pr.Type.IsNullable()) || (validators?.Any(v => !v.DisabledInModelBinder && (!pr.Type.IsMList() ? (v is NotNullValidatorAttribute) : (v is CountIsValidatorAttribute c && c.IsGreaterThanZero))) ?? false)),
                        Unit = UnitAttribute.GetTranslation(pr.PropertyInfo?.GetCustomAttribute<UnitAttribute>()?.UnitName),
                        Type = new TypeReferenceTS(IsId(pr) ? PrimaryKey.Type(type).Nullify() : pr.PropertyInfo!.PropertyType, pr.Type.IsMList() ? pr.Add("Item").TryGetImplementations() : pr.TryGetImplementations()),
                        IsMultiline = validators?.OfType<StringLengthValidatorAttribute>().FirstOrDefault()?.MultiLine ?? false,
                        IsVirtualMList = pr.IsVirtualMList(),
                        MaxLength = validators?.OfType<StringLengthValidatorAttribute>().FirstOrDefault()?.Max.DefaultToNull(-1),
                        PreserveOrder = settings.FieldAttributes(pr)?.OfType<PreserveOrderAttribute>().Any() ?? false,
                        AvoidDuplicates = validators?.OfType<NoRepeatValidatorAttribute>().Any() ?? false,
                        IsPhone = (validators?.OfType<TelephoneValidatorAttribute>().Any() ?? false) || (validators?.OfType<MultipleTelephoneValidatorAttribute>().Any() ?? false),
                        IsMail = validators?.OfType<EMailValidatorAttribute>().Any() ?? false,
                        HasFullTextIndex = isEntity && schema.HasFullTextIndex(pr),
                    };

                    return KeyValuePair.Create(pr.PropertyString(), OnPropertyRouteExtension(mi, pr)!);
                })
                .Where(kvp => kvp.Value != null)
                .ToDictionaryEx("properties"),
            CustomLiteModels = !type.IsEntity() ? null : Lite.LiteModelConstructors.TryGetC(type)?.Values
                    .ToDictionary(lmc => lmc.ModelType.TypeName(), lmc => new CustomLiteModelTS
                    {
                        IsDefault = lmc.IsDefault,
                        ConstructorFunctionString = LambdaToJavascriptConverter.ToJavascript(lmc.GetConstructorExpression(), true)!
                    }),


            HasConstructorOperation = allOperations != null && allOperations.Any(oi => oi.OperationType == OperationType.Constructor),
            Operations = allOperations == null ? null : allOperations.Select(oi => KeyValuePair.Create(oi.OperationSymbol.Key, OnOperationExtension(new OperationInfoTS(oi), oi, type)!)).Where(kvp => kvp.Value != null).ToDictionaryEx("operations"),

            RequiresEntityPack = allOperations != null && allOperations.Any(oi => oi.HasCanExecute != null),
        };

        return OnTypeExtension(result, type);
    }

    public static bool InTypeScript(PropertyRoute pr)
    {
        return (pr.Parent == null || InTypeScript(pr.Parent)) &&
            (pr.PropertyInfo == null || (pr.PropertyInfo.GetCustomAttribute<InTypeScriptAttribute>()?.GetInTypeScript() ?? !IsExpression(pr.Parent!.Type, pr.PropertyInfo)));
    }

    private static bool IsExpression(Type type, PropertyInfo propertyInfo)
    {
        return propertyInfo.SetMethod == null && ExpressionCleaner.HasExpansions(type, propertyInfo);
    }

    public static bool IsId(PropertyRoute p)
    {
        return p.PropertyRouteType == PropertyRouteType.FieldOrProperty &&
            p.PropertyInfo!.Name == nameof(Entity.Id) &&
            p.Parent!.PropertyRouteType == PropertyRouteType.Root;
    }

    public static TypeInfoTS? GetEnumTypeInfo(Type type)
    {
        var name = type.Name;
        var queries = QueryLogic.Queries;
        var descOptions = LocalizedAssembly.GetDescriptionOptions(type);

        var kind = type.Name.EndsWith("Query") ? KindOfType.Query :
               type.Name.EndsWith("Message") ? KindOfType.Message : KindOfType.Enum;

        var result = new TypeInfoTS
        {
            Kind = kind,
            FullName = type.FullName!,
            NiceName = descOptions.HasFlag(DescriptionOptions.Description) ? type.NiceName() : null,
            Members = type.GetFields(staticFlags)
                          .Where(fi => kind != KindOfType.Query || queries.QueryDefined(fi.GetValue(null)!))
                          .Select(fi => KeyValuePair.Create(fi.Name, OnFieldInfoExtension(new MemberInfoTS
                          {
                              NiceName = fi.NiceName(),
                              IsIgnoredEnum = kind == KindOfType.Enum && fi.HasAttribute<IgnoreAttribute>()
                          }, fi)!))
                    .Where(a => a.Value != null)
                    .ToDictionaryEx("query"),
        };

        return OnTypeExtension(result, type);
    }

    public static TypeInfoTS? GetSymbolContainerTypeInfo(Type type)
    {
        var result = new TypeInfoTS
        {
            Kind = KindOfType.SymbolContainer,
            FullName = type.FullName!,
            Members = type.GetFields(staticFlags)
                              .Select(f => GetSymbolInfo(f))
                              .Where(s =>
                              s.FieldInfo != null && /*Duplicated like in Dynamic*/
                              s.IdOrNull.HasValue /*Not registered*/)
                              .Select(s => KeyValuePair.Create(s.FieldInfo.Name, OnFieldInfoExtension(new MemberInfoTS
                              {
                                  NiceName = s.FieldInfo.NiceName(),
                                  Id = s.IdOrNull!.Value.Object
                              }, s.FieldInfo)!))
                              .Where(a => a.Value != null)
                              .ToDictionaryEx("fields"),
        };

        if (result.Members.IsEmpty())
            return null;

        return OnTypeExtension(result, type);
    }

    private static (FieldInfo FieldInfo, PrimaryKey? IdOrNull) GetSymbolInfo(FieldInfo m)
    {
        object? v = m.GetValue(null);
        if (v is IOperationSymbolContainer osc)
            v = osc.Symbol;

        if (v is Symbol s)
            return (s.FieldInfo, s.IdOrNull);

        if (v is SemiSymbol semiS)
            return (semiS.FieldInfo!, semiS.IdOrNull);

        throw new InvalidOperationException();
    }


    public static string GetTypeName(Type t)
    {
        if (typeof(ModifiableEntity).IsAssignableFrom(t))
            return TypeLogic.TryGetCleanName(t) ?? t.Name;

        return t.Name;
    }
}


public class TypeInfoTS
{
    public KindOfType Kind { get; set; }
    public string FullName { get; set; } = null!;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? NiceName { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? NicePluralName { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Gender { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public EntityKind? EntityKind { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public EntityData? EntityData { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsLowPopulation { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsSystemVersioned { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? ToStringFunction { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool QueryDefined { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public Dictionary<string, MemberInfoTS> Members { get; set; } = null!;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public Dictionary<string, CustomLiteModelTS>? CustomLiteModels { get; set; } = null!;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool HasConstructorOperation { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public Dictionary<string, OperationInfoTS>? Operations { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool RequiresEntityPack { get; set; }

    [JsonExtensionData]
    public Dictionary<string, object> Extension { get; set; } = new Dictionary<string, object>();


    public override string ToString() => $"{Kind} {NiceName} {EntityKind} {EntityData}";
}

public class CustomLiteModelTS
{
    public string? ConstructorFunctionString = null!;
    public bool IsDefault;
}

public class MemberInfoTS
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public TypeReferenceTS? Type { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? NiceName { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsReadOnly { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool Required { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Unit { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Format { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsIgnoredEnum { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsVirtualMList { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public int? MaxLength { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsMultiline { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool PreserveOrder { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool AvoidDuplicates { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public object? Id { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsPhone { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsMail { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool HasFullTextIndex { get; set; }

    [JsonExtensionData]
    public Dictionary<string, object> Extension { get; set; } = new Dictionary<string, object>();
}

public class OperationInfoTS
{
    public OperationType OperationType;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? CanBeNew;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? CanBeModified;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? HasCanExecute;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? HasCanExecuteExpression;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? HasStates;

    [JsonExtensionData]
    public Dictionary<string, object> Extension { get; set; } = new Dictionary<string, object>();

    public OperationInfoTS(OperationInfo oper)
    {
        this.CanBeNew = oper.CanBeNew;
        this.CanBeModified = oper.CanBeModified;
        this.HasCanExecute = oper.HasCanExecute;
        this.HasCanExecuteExpression = oper.HasCanExecuteExpression;
        this.HasStates = oper.HasStates;
        this.OperationType = oper.OperationType;
    }
}

public class TypeReferenceTS
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsCollection { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsLite { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsNotNullable { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] public bool IsEmbedded { get; set; }
    public required string Name { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? TypeNiceName { get; set; }

    public TypeReferenceTS() { }
    [SetsRequiredMembers]
    public TypeReferenceTS(Type type, Implementations? implementations)
    {
        this.IsCollection = type != typeof(string) && type != typeof(byte[]) && type.ElementType() != null;

        var clean = type == typeof(string) ? type : (type.ElementType() ?? type);
        this.IsLite = clean.IsLite();
        this.IsNotNullable = clean.IsValueType && !clean.IsNullable();
        this.IsEmbedded = clean.IsEmbeddedEntity();

        if (this.IsEmbedded && !this.IsCollection)
            this.TypeNiceName = type.NiceName();
        if (implementations != null)
        {
            try
            {
                this.Name = implementations.Value.Key();
            }
            catch (Exception) when (StartParameters.IgnoredCodeErrors != null)
            {
                this.Name = "ERROR";
            }
        }
        else
        {
            this.Name = TypeScriptType(type);
        }
    }

    private static string TypeScriptType(Type type)
    {
        type = CleanMList(type);

        type = type.UnNullify().CleanType();

        return BasicType(type) ?? ReflectionServer.GetTypeName(type) ?? "any";
    }

    private static Type CleanMList(Type type)
    {
        if (type.IsMList())
            type = type.ElementType()!;
        return type;
    }

    public static string? BasicType(Type type)
    {
        if (type.IsEnum)
            return null;

        switch (Type.GetTypeCode(type))
        {
            case TypeCode.Boolean: return "boolean";
            case TypeCode.Char: return "string";
            case TypeCode.SByte:
            case TypeCode.Byte:
            case TypeCode.Int16:
            case TypeCode.UInt16:
            case TypeCode.Int32:
            case TypeCode.UInt32:
            case TypeCode.Int64:
            case TypeCode.UInt64: return "number";
            case TypeCode.Single:
            case TypeCode.Double:
            case TypeCode.Decimal: return "decimal";
            case TypeCode.String: return "string";
        }
        return null;
    }

}

public enum KindOfType
{
    Entity,
    Enum,
    Message,
    Query,
    SymbolContainer,
}
