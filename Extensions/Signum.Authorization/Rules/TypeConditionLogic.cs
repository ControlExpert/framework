using Signum.Utilities.Reflection;
using System.Data;
using System.Reflection.Metadata;

namespace Signum.Authorization.Rules;



public class TypeCondition
{
    public TypeCondition(LambdaExpression condition, Delegate? inMemoryCondition)
    {
        this.Condition = condition;
        this.InMemoryCondition = inMemoryCondition;
    }

    public TypeCondition(QueryAuditor auditor, Delegate? inMemoryCondition)
    {
        this.QueryAuditor = auditor ?? throw new ArgumentNullException(nameof(auditor));
        this.InMemoryCondition = inMemoryCondition;
    }

    public QueryAuditor? QueryAuditor;
    public LambdaExpression? Condition;
    public Delegate? InMemoryCondition;
}

public delegate LambdaExpression QueryAuditor(FilterQueryArgs ctx);



public static class TypeConditionLogic
{
    static Dictionary<Type, Dictionary<TypeConditionSymbol, TypeCondition>> infos = new Dictionary<Type, Dictionary<TypeConditionSymbol, TypeCondition>>();

    static readonly Variable<Dictionary<Type, Dictionary<TypeConditionSymbol, LambdaExpression>>?> tempConditions =
        Statics.ThreadVariable<Dictionary<Type, Dictionary<TypeConditionSymbol, LambdaExpression>>?>("tempConditions");

    public static IDisposable ReplaceTemporally<T>(TypeConditionSymbol typeAllowed, Expression<Func<T, bool>> condition)
        where T : Entity
    {
        var dic = tempConditions.Value ?? (tempConditions.Value = new Dictionary<Type, Dictionary<TypeConditionSymbol, LambdaExpression>>());

        var subDic = dic.GetOrCreate(typeof(T));

        subDic.Add(typeAllowed, condition);

        return new Disposable(() =>
        {
            subDic.Remove(typeAllowed);

            if (subDic.Count == 0)
                dic.Remove(typeof(T));

            if (dic.Count == 0)
                tempConditions.Value = null;
        });
    }

    public static IEnumerable<Type> Types
    {
        get { return infos.Keys; }
    }

    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
        {
            SymbolLogic<TypeConditionSymbol>.Start(sb, () => infos.SelectMany(a => a.Value.Keys).ToHashSet());
        }
    }

    public static void Register<T>(TypeConditionSymbol typeCondition, Expression<Func<T, bool>> condition)
          where T : Entity
    {
        Register<T>(typeCondition, condition, null);
    }

    public static void RegisterCompile<T>(TypeConditionSymbol typeCondition, Expression<Func<T, bool>> condition)
          where T : Entity
    {
        Register<T>(typeCondition, condition, condition.Compile());
    }

    public static void Register<T>(TypeConditionSymbol typeCondition, Expression<Func<T, bool>> condition, Func<T, bool>? inMemoryCondition)
        where T : Entity
    {
        if (Schema.Current.IsCompleted)
            throw new InvalidOperationException("Schema already completed");

        if (typeCondition == null)
            throw AutoInitAttribute.ArgumentNullException(typeof(TypeConditionSymbol), nameof(typeCondition));

        if (condition == null)
            throw new ArgumentNullException(nameof(condition));

        infos.GetOrCreate(typeof(T))[typeCondition] = new TypeCondition(condition, inMemoryCondition);
    }

    public static void RegisterWhenAlreadyFilteringBy<T, P>(TypeConditionSymbol typeCondition, Expression<Func<T, P>> property)
          where T : Entity
    {
        RegisterWhenAlreadyFiltering<T>(typeCondition, (FilterQueryArgs args) =>
        {
            var expr = QueryAuditorVisitor.FilterAuditor(args.FullQuery, args.BaseQuery);

            if (expr.Param == null || expr.Filters.IsEmpty())
                return a => false;

            var replaced = ExpressionReplacer.Replace(property.Body, new Dictionary<ParameterExpression, Expression>
            {
                {  property.Parameters[0], expr.Param }
            });

            Expression<Func<T, PrimaryKey>> idExpression = a => a.Id;

            var replacedID = ExpressionReplacer.Replace(idExpression.Body, new Dictionary<ParameterExpression, Expression>
            {
                {  idExpression.Parameters[0], expr.Param }
            });

            if (expr.Filters.Any(f =>
                QueryAuditorVisitor.IsEqualsConstant(replaced, f, out var constant) ||
                QueryAuditorVisitor.IsEqualsConstant(replacedID, f, out var constantId) ||
                QueryAuditorVisitor.IsEqualsConstant(expr.Param, f, out var constantLite)
            ))
                return e => true;

            return e => false;
        }, a => true);
    }

    public static void RegisterWhenAlreadyFilteringBy<T, P>(TypeConditionSymbol typeCondition, Expression<Func<T, P>> property, Func<P?, bool> isConstantAuthorized, bool useInDBForInMemoryCondition)
      where T : Entity
    {
        var func = useInDBForInMemoryCondition ? null : property.Compile();

        RegisterWhenAlreadyFiltering<T>(typeCondition, (FilterQueryArgs args) =>
        {
            var expr = QueryAuditorVisitor.FilterAuditor(args.FullQuery, args.BaseQuery);

            if (expr.Param == null || expr.Filters.IsEmpty())
                return a => false;

            var replaced = ExpressionReplacer.Replace(property.Body, new Dictionary<ParameterExpression, Expression>
            {
                {  property.Parameters[0], expr.Param }
            });

            Expression<Func<T, PrimaryKey>> idExpression = a => a.Id; 

            var replacedID = ExpressionReplacer.Replace(idExpression.Body, new Dictionary<ParameterExpression, Expression>
            {
                {  idExpression.Parameters[0], expr.Param }
            });

            if (expr.Filters.Any(f =>
            {
                if (QueryAuditorVisitor.IsEqualsConstant(replaced, f, out var constant))
                {
                    var val = ConvertValue<P?>(constant.Value);

                    if (isConstantAuthorized(val))
                        return true;
                }

                if (QueryAuditorVisitor.IsEqualsConstant(replacedID, f, out var constantId))
                {
                    var id = (PrimaryKey?)constantId.Value;
                    if (id == null)
                        return false;

                    using (TypeAuthLogic.DisableQueryFilter())
                    {
                        var value = Database.Query<T>().Where(a => a.Id == id).Select(property).SingleOrDefaultEx();

                        var val = ConvertValue<P?>(value);

                        if (isConstantAuthorized(val))
                            return true;
                    }
                }

                if (QueryAuditorVisitor.IsEqualsConstant(expr.Param, f, out var constantLite))
                {
                    var liteOrEntity = constantLite.Value;
                    if (liteOrEntity == null)
                        return false;

                    if (liteOrEntity is Lite<T> lite)
                    {
                        using (TypeAuthLogic.DisableQueryFilter())
                        {
                            var value = lite.InDB(property);

                            var val = ConvertValue<P?>(value);

                            if (isConstantAuthorized(val))
                                return true;

                            return false;
                        }
                    }

                    if(liteOrEntity is T entity)
                    {
                        using (TypeAuthLogic.DisableQueryFilter())
                        {
                            var value = useInDBForInMemoryCondition ? Database.InDB(entity, property) : func!(entity);

                            var val = ConvertValue<P?>(value);

                            if (isConstantAuthorized(val))
                                return true;

                            return false;
                        }
                    }
                }

                return false;
            }))
            {
                return e => true;
            }

            return e => false;
        }, inMemoryCondition: a =>
        {
            var value = useInDBForInMemoryCondition ? Database.InDB(a, property) : func!(a);

            var val = ConvertValue<P?>(value);

            if (isConstantAuthorized(val))
                return true;

            return false;
        });
    }

    private static P ConvertValue<P>(object? value)
    {
        if (value == null)
            return default!;

        if (value is P p)
            return p;

        if (value is Entity entity && typeof(P).IsLite())
            return (P)entity.ToLite();

        if (value is Lite<Entity> lite && typeof(P).IsIEntity())
            return (P)(object)lite.Retrieve();

        return ReflectionTools.ChangeType<P>(value);
    }

    public static void RegisterWhenAlreadyFiltering<T>(TypeConditionSymbol typeCondition, Func<FilterQueryArgs, Expression<Func<T, bool>>> queryAuditor, Func<T, bool>? inMemoryCondition)
     where T : Entity
    {
        if (Schema.Current.IsCompleted)
            throw new InvalidOperationException("Schema already completed");

        if (typeCondition == null)
            throw AutoInitAttribute.ArgumentNullException(typeof(TypeConditionSymbol), nameof(typeCondition));

        if (queryAuditor == null)
            throw new ArgumentNullException(nameof(queryAuditor));

        infos.GetOrCreate(typeof(T))[typeCondition] = new TypeCondition(args => queryAuditor(args), inMemoryCondition);
    }

    [MethodExpander(typeof(InConditionExpander))]
    public static bool InCondition(this Entity entity, TypeConditionSymbol typeCondition)
    {
        throw new InvalidProgramException("InCondition is meant to be used in database only");
    }

    class InConditionExpander : IMethodExpander
    {
        public Expression Expand(Expression? instance, Expression[] arguments, MethodInfo mi)
        {
            Expression entity = arguments[0];
            TypeConditionSymbol typeCondition = (TypeConditionSymbol)ExpressionEvaluator.Eval(arguments[1])!;

            var exp = GetCondition(entity.Type, typeCondition, args: null!);

            return Expression.Invoke(exp, entity);
        }
    }


    [MethodExpander(typeof(WhereConditionExpander))]
    public static IQueryable<T> WhereCondition<T>(this IQueryable<T> query, TypeConditionSymbol typeCondition)
        where T : Entity
    {
        Expression<Func<T, bool>> exp = (Expression<Func<T, bool>>)GetCondition(typeof(T), typeCondition, args: null!);

        return query.Where(exp);
    }

    class WhereConditionExpander : IMethodExpander
    {
        static MethodInfo miWhere = ReflectionTools.GetMethodInfo(() => Queryable.Where<int>(null!, i => i == 0)).GetGenericMethodDefinition();

        public Expression Expand(Expression? instance, Expression[] arguments, MethodInfo mi)
        {
            Type type = mi.GetGenericArguments()[0];

            Expression query = arguments[0];
            TypeConditionSymbol typeCondition = (TypeConditionSymbol)ExpressionEvaluator.Eval(arguments[1])!;

            LambdaExpression exp = GetCondition(type, typeCondition, args: null!);

            return Expression.Call(null, miWhere.MakeGenericMethod(type), query, exp);
        }
    }

    public static IEnumerable<TypeConditionSymbol> ConditionsFor(Type type)
    {
        var dic = infos.TryGetC(type);
        if (dic == null)
            return Enumerable.Empty<TypeConditionSymbol>();

        return dic.Keys;
    }

    public static bool IsQueryAuditor(Type type, TypeConditionSymbol typeCondition)
    {
        var tempExpr = infos?.TryGetC(type)?.TryGetC(typeCondition);

        return tempExpr?.QueryAuditor != null;
    }

    public static LambdaExpression GetCondition(Type type, TypeConditionSymbol typeCondition, FilterQueryArgs? args)
    {
        var tempExpr = tempConditions.Value?.TryGetC(type)?.TryGetC(typeCondition);
        if (tempExpr != null)
            return tempExpr;

        var pair = infos.GetOrThrow(type, "There's no TypeCondition registered for type {0}").GetOrThrow(typeCondition);

        if (pair.Condition != null)
            return pair.Condition;

        if (args == null)
            throw new InvalidOperationException("TypeCondition is implemented as a QueryAuditor and can not be used in this context");

        return pair.QueryAuditor!(args);
    }

    public static Func<T, bool>? GetInMemoryCondition<T>(TypeConditionSymbol typeCondition)
        where T : Entity
    {
        var pair = infos.GetOrThrow(typeof(T), "There's no TypeCondition registered for type {0}").GetOrThrow(typeCondition);

        return (Func<T, bool>?)pair.InMemoryCondition;
    }

    public static bool IsDefined(Type type, TypeConditionSymbol typeCondition)
    {
        return infos.TryGetC(type)?.TryGetC(typeCondition) != null;
    }
}
