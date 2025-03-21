using Signum.Utilities.Reflection;

namespace Signum.Entities.Validation;

public static class Validator
{
    static readonly AsyncThreadVariable<bool> inModelBinderVariable = Statics.ThreadVariable<bool>("inModelBinder");
    public static bool InModelBinder
    {
        get { return inModelBinderVariable.Value; }
    }

    public static IDisposable ModelBinderScope()
    {
        var old = inModelBinderVariable.Value;
        inModelBinderVariable.Value = true;
        return new Disposable(() => inModelBinderVariable.Value = old);
    }

    public static Func<ModifiableEntity, PropertyInfo, string?>? GlobalValidation { get; set; }
    public static Func<ModifiableEntity, PropertyInfo, bool>? GlobalIsReadonly { get; set; }


    static readonly Polymorphic<Dictionary<string, IPropertyValidator>> validators =
        new Polymorphic<Dictionary<string, IPropertyValidator>>(PolymorphicMerger.InheritDictionary, typeof(ModifiableEntity));

    static void GenerateType(Type type)
    {
        giGenerateType.GetInvoker(type)();
    }

    static readonly GenericInvoker<Action> giGenerateType =
        new(() => GenerateType<ModifiableEntity>());

    static void GenerateType<T>() where T : ModifiableEntity
    {
        if (validators.GetDefinition(typeof(T)) != null)
            return;

        if (typeof(T) != typeof(ModifiableEntity))
            GenerateType(typeof(T).BaseType!);

        var dic = (from pi in typeof(T).GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                   where !(pi.HasAttribute<HiddenPropertyAttribute>() || pi.CanWrite == false && pi.HasAttribute<ExpressionFieldAttribute>())
                   select KeyValuePair.Create(pi.Name, (IPropertyValidator)new PropertyValidator<T>(pi))).ToDictionary();

        validators.SetDefinition(typeof(T), dic);
    }

    public static PropertyValidator<T> OverridePropertyValidator<T>(Expression<Func<T, object?>> property) where T : ModifiableEntity
    {
        GenerateType<T>();

        var pi = ReflectionTools.GetPropertyInfo(property);

        var dic = validators.GetDefinition(typeof(T))!;

        PropertyValidator<T>? result = (PropertyValidator<T>?)dic.TryGetC(pi.Name);

        if (result == null)
        {
            result = new PropertyValidator<T>(pi);
            dic.Add(pi.Name, result);
            validators.ClearCache();
        }

        return result;
    }

    public static PropertyValidator<T> PropertyValidator<T>(Expression<Func<T, object?>> property) where T : ModifiableEntity
    {
        GenerateType<T>();

        var pi = ReflectionTools.GetPropertyInfo(property);

        var dic = validators.GetDefinition(typeof(T));

        PropertyValidator<T>? result = (PropertyValidator<T>?)dic?.TryGetC(pi.Name);

        if (result == null)
            throw new InvalidOperationException("{0} is not defined in {1}, try calling OverridePropertyValidator".FormatWith(pi.PropertyName(), typeof(T).TypeName()));

        return result;
    }

    public static IPropertyValidator? TryGetPropertyValidator(PropertyRoute route)
    {
        if (route.PropertyRouteType != PropertyRouteType.FieldOrProperty)
            throw new InvalidOperationException("PropertyRoute of type Property expected");

        return TryGetPropertyValidator(route.Parent!.Type, route.PropertyInfo!.Name);
    }

    public static IPropertyValidator? TryGetPropertyValidator(Type type, string property)
    {
        GenerateType(type);

        return validators.GetValue(type).TryGetC(property);
    }


    public static Dictionary<string, IPropertyValidator> GetPropertyValidators(Type type)
    {
        GenerateType(type);

        return validators.GetValue(type);
    }

    public static void AllValidatorsApplicable<T>(Func<T, bool> condition)
        where T : ModifiableEntity
    {

        foreach (PropertyValidator<T> item in GetPropertyValidators(typeof(T)).Values)
        {
            if (item.IsApplicable == null)
                item.IsApplicable = condition;
            else
            {
                var old = item.IsApplicable;
                item.IsApplicable = m => old(m) && condition(m);
            }
        }


    }
}

public interface IPropertyValidator
{
    PropertyInfo PropertyInfo { get; }
    List<ValidatorAttribute> Validators { get; }


    string? PropertyCheck(ModifiableEntity modifiableEntity);
    object? GetValueUntyped(ModifiableEntity entity);

    bool IsPropertyReadonly(ModifiableEntity modifiableEntity);
}

public class PropertyValidator<T> : IPropertyValidator
    where T : ModifiableEntity
{
    public Func<T, object?> GetValue { get; private set; }
    public Action<T, object?> SetValue { get; private set; }
    public PropertyInfo PropertyInfo { get; private set; }
    public List<ValidatorAttribute> Validators { get; private set; }

    public Func<T, bool>? IsApplicable { get; set; }
    public Func<T, bool>? IsApplicablePropertyValidation { get; set; }
    public Func<T, bool>? IsApplicableParentChildPropertyValidation { get; set; }
    public Func<T, bool>? IsApplicableStaticPropertyValidation { get; set; }

    public Func<T, PropertyInfo, string?>? StaticPropertyValidation { get; set; }

    public Func<T, PropertyInfo, bool?>? IsReadonly { get; set; }

    internal PropertyValidator(PropertyInfo pi)
    {
        PropertyInfo = pi;

        Validators = pi.GetCustomAttributes(typeof(ValidatorAttribute), false).OfType<ValidatorAttribute>().OrderBy(va => va.Order).ThenBy(va => va.GetType().Name).ToList();

        var nullable = pi.IsNullable();
        if (nullable == false && !Validators.Any(v => v is NotNullValidatorAttribute))
            Validators.Add(new NotNullValidatorAttribute());

        GetValue = ReflectionTools.CreateGetter<T, object?>(pi)!;
        SetValue = ReflectionTools.CreateSetter<T, object?>(pi)!;
    }

    public void ReplaceValidators(params ValidatorAttribute[] validators)
    {
        Validators.Clear();
        Validators.AddRange(validators);
    }

    public string? PropertyCheck(T entity)
    {
        if (IsApplicable != null && !IsApplicable(entity))
            return null;

        if (entity.temporalErrors != null)
            return entity.temporalErrors.TryGetC(PropertyInfo.Name);

        if (Validators.Count > 0)
        {
            object? propertyValue = GetValue(entity);

            //ValidatorAttributes
            foreach (var validator in Validators)
            {
                string? result = validator.Error(entity, PropertyInfo, propertyValue);
                if (result != null)
                    return result;
            }
        }

        //Internal Validation
        if (IsApplicablePropertyValidation == null || IsApplicablePropertyValidation(entity))
        {
            string? result = entity.PropertyValidation(PropertyInfo);
            if (result != null)
                return result;
        }

        //Parent Validation
        if (IsApplicableParentChildPropertyValidation == null || IsApplicableParentChildPropertyValidation(entity))
        {
            string? result = entity.OnParentChildPropertyValidation(PropertyInfo);
            if (result != null)
                return result;
        }

        //Static validation
        if (StaticPropertyValidation != null && (IsApplicableStaticPropertyValidation == null || IsApplicableStaticPropertyValidation(entity)))
        {
            foreach (var item in StaticPropertyValidation.GetInvocationListTyped())
            {
                string? result = item(entity, PropertyInfo);
                if (result != null)
                    return result;
            }
        }

        //Global validation
        if (Validator.GlobalValidation != null)
        {
            foreach (var item in Validator.GlobalValidation.GetInvocationListTyped())
            {
                string? result = item(entity, PropertyInfo);
                if (result != null)
                    return result;
            }
        }

        return null;
    }

    public string? PropertyCheck(ModifiableEntity modifiableEntity)
    {
        return PropertyCheck((T)modifiableEntity);
    }

    public void IsApplicableValidator<V>(Func<T, bool> isApplicable) where V : ValidatorAttribute
    {
        V validator = Validators.OfType<V>().SingleEx();
        if (isApplicable == null)
            validator.IsApplicable = null;
        else
            validator.IsApplicable = m => isApplicable((T)m);
    }

    public object? GetValueUntyped(ModifiableEntity entity)
    {
        return GetValue((T)entity);
    }


    public bool IsPropertyReadonly(T modifiableEntity)
    {
        if (IsReadonly != null)
        {
            foreach (var item in IsReadonly.GetInvocationListTyped())
            {
                var result = item(modifiableEntity, PropertyInfo);
                if (result == true)
                    return true;
            }
        }

        if (modifiableEntity.IsPropertyReadonly(PropertyInfo))
            return true;

        if (Validator.GlobalIsReadonly != null)
        {
            foreach (var f in Validator.GlobalIsReadonly.GetInvocationListTyped())
            {
                if (f(modifiableEntity, PropertyInfo))
                    return true;
            }
        }

        if (PropertyInfo.CanWrite == false)
            return true;

        return false;
    }

    public bool IsPropertyReadonly(ModifiableEntity modifiableEntity)
    {
        return IsPropertyReadonly((T)modifiableEntity);
    }

}
