﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Diagnostics;
using Signum.Utilities;
using Signum.Utilities.ExpressionTrees;
using Signum.Entities;
using Signum.Utilities.DataStructures;
using Signum.Utilities.Reflection;
using Signum.Engine.Maps;
using Signum.Entities.Reflection;
using Signum.Engine.Properties;
using System.Collections.ObjectModel;
using Signum.Engine.DynamicQuery;
using Signum.Entities.DynamicQuery;

namespace Signum.Engine.Linq
{
    /// <summary>
    /// QueryBinder is a visitor that converts method calls to LINQ operations into 
    /// custom DbExpression nodes and references to class members into references to columns
    /// </summary>
    internal class MetadataVisitor : SimpleExpressionVisitor
    {
        Dictionary<ParameterExpression, Expression> map = new Dictionary<ParameterExpression, Expression>();

        private MetadataVisitor() { }

        static internal Dictionary<string, Meta> GatherMetadata(Expression expression)
        {
            if (expression == null)
                throw new ArgumentException("expression");

            if (!typeof(IQueryable).IsAssignableFrom(expression.Type))
                throw new InvalidOperationException("Expression type is not IQueryable");

            Expression simplified = MetaEvaluator.Clean(expression);

            MetaProjectorExpression meta = new MetadataVisitor().Visit(simplified) as MetaProjectorExpression;

            if (meta == null)
                return null;

            var proj = meta.Projector;

            if (proj.NodeType != ExpressionType.New &&  //anonymous types
                proj.NodeType != ExpressionType.MemberInit && // not-anonymous type
                !(proj.NodeType == (ExpressionType)MetaExpressionType.MetaExpression && ((MetaExpression)proj).IsEntity)) // raw-entity!
                return null;

            PropertyInfo[] props = proj.Type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            return props.ToDictionary(pi => pi.Name, pi =>
            {
                Expression ex = BindMember(proj, pi, pi.PropertyType);
                return (ex as MetaExpression).TryCC(c => c.Meta);
            });
        }

       

        //internal static Expression JustVisit(LambdaExpression expression, PropertyRoute route)
        //{
        //    if (route.Type.IsLite())
        //        route = route.Add("Entity");

        //    return JustVisit(expression, ));
        //}

        internal static Expression JustVisit(LambdaExpression expression, MetaExpression metaExpression)
        {
            var cleaned = MetaEvaluator.Clean(expression);

            var replaced = ExpressionReplacer.Replace(Expression.Invoke(cleaned, metaExpression));

            return new MetadataVisitor().Visit(replaced);
        }

        static MetaExpression MakeCleanMeta(Type type, Expression expression)
        {
            MetaExpression meta = expression as MetaExpression;

            return new MetaExpression(type, meta.Meta);
        }

        static MetaExpression MakeDirtyMeta(Type type, params Expression[] expression)
        {
            var metas = expression.OfType<MetaExpression>().Select(a => a.Meta).NotNull().ToArray();

            return new MetaExpression(type, new DirtyMeta(metas));
        }

        static internal Expression MakeVoidMeta(Type type)
        {
            return new MetaExpression(type, new DirtyMeta(new Meta[0]));
        }

        protected override Expression VisitMethodCall(MethodCallExpression m)
        {
            if (m.Method.DeclaringType == typeof(Queryable) ||
                m.Method.DeclaringType == typeof(Enumerable) || 
                m.Method.DeclaringType == typeof(EnumerableUniqueExtensions))
            {
                switch (m.Method.Name)
                {
                    case "Where":
                        return this.BindWhere(m.Type, m.GetArgument("source"), m.GetArgument("predicate").StripQuotes());
                    case "Select":
                        return this.BindSelect(m.Type, m.GetArgument("source"), m.GetArgument("selector").StripQuotes());
                    case "SelectMany":
                        if (m.Arguments.Count == 2)
                            return this.BindSelectMany(m.Type, m.GetArgument("source"), m.GetArgument("selector").StripQuotes(), null);
                        else
                            return this.BindSelectMany(m.Type, m.GetArgument("source"), m.GetArgument("collectionSelector").StripQuotes(), m.TryGetArgument("resultSelector").StripQuotes());
                    case "Join":
                        return this.BindJoin(
                            m.Type, m.GetArgument("outer"), m.GetArgument("inner"),
                            m.GetArgument("outerKeySelector").StripQuotes(),
                            m.GetArgument("innerKeySelector").StripQuotes(),
                            m.GetArgument("resultSelector").StripQuotes());
                    case "OrderBy":
                        return this.BindOrderBy(m.Type, m.GetArgument("source"), m.GetArgument("keySelector").StripQuotes(), OrderType.Ascending);
                    case "OrderByDescending":
                        return this.BindOrderBy(m.Type, m.GetArgument("source"), m.GetArgument("keySelector").StripQuotes(), OrderType.Descending);
                    case "ThenBy":
                        return this.BindThenBy(m.GetArgument("source"), m.GetArgument("keySelector").StripQuotes(), OrderType.Ascending);
                    case "ThenByDescending":
                        return this.BindThenBy(m.GetArgument("source"), m.GetArgument("keySelector").StripQuotes(), OrderType.Descending);
                    case "GroupBy":
                        return this.BindGroupBy(m.Type, m.GetArgument("source"),
                            m.GetArgument("keySelector").StripQuotes(),
                            m.GetArgument("elementSelector").StripQuotes());
                    case "Count":
                        return this.BindCount(m.Type, m.GetArgument("source"));
                    case "DefaultIfEmpty":
                       return Visit(m.GetArgument("source"));
                    case "Any":
                        return this.BindAny(m.Type, m.GetArgument("source"));
                    case "All":
                        return this.BindAll(m.Type, m.GetArgument("source"), m.GetArgument("predicate").StripQuotes());
                    case "Contains":
                        return this.BindContains(m.Type, m.GetArgument("source"), m.TryGetArgument("item") ?? m.GetArgument("value"));
                    case "Sum":
                    case "Min":
                    case "Max":
                    case "Average":
                        return this.BindAggregate(m.Type, m.Method.Name.ToEnum<AggregateFunction>(),
                            m.GetArgument("source"), m.TryGetArgument("selector").StripQuotes());
                    case "First":
                    case "FirstOrDefault":
                    case "Single":
                    case "SingleOrDefault":
                        return BindUniqueRow(m.Type, m.Method.Name.ToEnum<UniqueFunction>(),
                            m.GetArgument("source"), m.TryGetArgument("predicate").StripQuotes());
                    case "FirstEx":
                    case "SingleEx":
                    case "SingleOrDefaultEx":
                        return BindUniqueRow(m.Type, m.Method.Name.RemoveEnd(2).ToEnum<UniqueFunction>(),
                           m.GetArgument("collection"), m.TryGetArgument("predicate").StripQuotes());
                    case "Distinct":
                        return BindDistinct(m.Type, m.GetArgument("source"));
                    case "Take":
                        return BindTake(m.Type, m.GetArgument("source"), m.GetArgument("count"));
                    case "Skip":
                        return BindSkip(m.Type, m.GetArgument("source"), m.GetArgument("count"));
                }
            }


            if (m.Method.DeclaringType == typeof(Lite) && m.Method.Name == "ToLite")
                return MakeCleanMeta(m.Type, Visit(m.Arguments[0]));

            if (m.Method.DeclaringType == typeof(Math) &&
               (m.Method.Name == "Abs" ||
                m.Method.Name == "Ceiling" ||
                m.Method.Name == "Floor" ||
                m.Method.Name == "Round" ||
                m.Method.Name == "Truncate"))
                return MakeCleanMeta(m.Type, Visit(m.Arguments[0]));

            if (m.Method.Name == "ToString" && m.Object != null && typeof(IIdentifiable).IsAssignableFrom(m.Object.Type))
                return Visit(Expression.Property(m.Object, piToStringProperty));

            if (m.Object != null)
            {
                var a = this.Visit(m.Object);
                var list = this.VisitExpressionList(m.Arguments);
                return MakeDirtyMeta(m.Type, list.PreAnd(a).ToArray());
            }
            else
            {
                var list = this.VisitExpressionList(m.Arguments);
                return MakeDirtyMeta(m.Type, list.ToArray());
            }
        }

        static readonly PropertyInfo piToStringProperty = ReflectionTools.GetPropertyInfo((IIdentifiable ii) => ii.ToStringProperty);


        private Expression MapAndVisit(LambdaExpression lambda, params MetaProjectorExpression[] projs)
        {
            map.SetRange(lambda.Parameters, projs.Select(a => a.Projector));
            var result =  Visit(lambda.Body);
            map.RemoveRange(lambda.Parameters);
            return result;
        }

        private MetaProjectorExpression AsProjection(Expression expression)
        {
            MetaProjectorExpression mpe = expression as MetaProjectorExpression;
            if (mpe != null)
                return (MetaProjectorExpression)mpe;

            if (expression.NodeType == ExpressionType.New)
            {
                NewExpression nex = (NewExpression)expression;
                if (nex.Type.IsInstantiationOf(typeof(Grouping<,>)))
                    return (MetaProjectorExpression)nex.Arguments[1]; 
            }

            Type elementType = expression.Type.ElementType();
            if (elementType != null)
            {
                MetaExpression meta = expression as MetaExpression;
                if (meta != null && meta.Meta is CleanMeta)
                {
                    PropertyRoute route = ((CleanMeta)meta.Meta).PropertyRoutes.SingleEx(()=>"Metas don't work over polymorphic MLists").Add("Item");

                    return new MetaProjectorExpression(expression.Type,
                        new MetaExpression(elementType,
                            new CleanMeta(route)));
                }

                return new MetaProjectorExpression(expression.Type,
                     MakeVoidMeta(elementType)); 
            }

            throw new InvalidOperationException(); 
        }

        private Expression BindTake(Type resultType, Expression source, Expression count)
        {
            return AsProjection(Visit(source));
        }

        private Expression BindSkip(Type resultType, Expression source, Expression count)
        {
            return AsProjection(Visit(source));
        }

        private Expression BindUniqueRow(Type resultType, UniqueFunction function, Expression source, LambdaExpression predicate)
        {
            return AsProjection(Visit(source)).Projector;
        }

        private Expression BindDistinct(Type resultType, Expression source)
        {
            return AsProjection(Visit(source));
        }

        private Expression BindCount(Type resultType, Expression source)
        {
            return MakeVoidMeta(resultType);
        }

        private Expression BindAll(Type resultType, Expression source, LambdaExpression predicate)
        {
            return MakeVoidMeta(resultType);
        }

        private Expression BindAny(Type resultType, Expression source)
        {
            return MakeVoidMeta(resultType);
        }

        private Expression BindContains(Type resultType, Expression source, Expression item)
        {
            return MakeVoidMeta(resultType);
        }

        private Expression BindAggregate(Type resultType, AggregateFunction aggregateFunction, Expression source, LambdaExpression selector)
        {
            MetaProjectorExpression mp = AsProjection(Visit(source));
            if (selector == null)
                return mp.Projector;

            Expression projector = MapAndVisit(selector, mp);
            return projector; 
        }

        private Expression BindWhere(Type resultType, Expression source, LambdaExpression predicate)
        {
            return AsProjection(Visit(source)); 
        }

        private Expression BindSelect(Type resultType, Expression source, LambdaExpression selector)
        {
            MetaProjectorExpression mp = AsProjection(Visit(source));
            Expression projector = MapAndVisit(selector, mp);
            return new MetaProjectorExpression(resultType, projector); 
        }

        protected virtual Expression BindSelectMany(Type resultType, Expression source, LambdaExpression collectionSelector, LambdaExpression resultSelector)
        {
            MetaProjectorExpression mp = AsProjection(Visit(source));
            MetaProjectorExpression collectionProjector = AsProjection(MapAndVisit(collectionSelector, mp));

            if (resultSelector == null)
                return collectionProjector; 

            Expression resultProjection = MapAndVisit(resultSelector, mp, collectionProjector);
            return new MetaProjectorExpression(resultType, resultProjection); 
        }

        protected virtual Expression BindJoin(Type resultType, Expression outerSource, Expression innerSource, LambdaExpression outerKey, LambdaExpression innerKey, LambdaExpression resultSelector)
        {
            MetaProjectorExpression mpOuter = AsProjection(Visit(outerSource));
            MetaProjectorExpression mpInner = AsProjection(Visit(innerSource));
            Expression projector = MapAndVisit(resultSelector, mpOuter, mpInner);
            return new MetaProjectorExpression(resultType, projector); 
        }

        private Expression BindGroupBy(Type resultType, Expression source, LambdaExpression keySelector, LambdaExpression elementSelector)
        {
            MetaProjectorExpression mp = AsProjection(Visit(source));
            Expression key = MapAndVisit(keySelector, mp);
            Expression element = MapAndVisit(elementSelector, mp);

            Type colType = typeof(IEnumerable<>).MakeGenericType(element.Type);
            Type groupType = typeof(Grouping<,>).MakeGenericType(key.Type, element.Type);

            return new MetaProjectorExpression(resultType,
                Expression.New(groupType.GetConstructor(new Type[] { key.Type, colType }),
                key, new MetaProjectorExpression(colType, element)));
        }
   
        protected virtual Expression BindOrderBy(Type resultType, Expression source, LambdaExpression orderSelector, OrderType orderType)
        {
            return AsProjection(Visit(source)); 
        }

        protected virtual Expression BindThenBy(Expression source, LambdaExpression orderSelector, OrderType orderType)
        {
            return AsProjection(Visit(source)); 
        }

        public Type TableType(object value)
        {
            if (value == null)
                return null;

            Type t = value.GetType();
            return typeof(IQueryable).IsAssignableFrom(t) ?
                t.GetGenericArguments()[0] :
                null;
        }

        protected override Expression Visit(Expression exp)
        {
            if (exp is MetaExpression)
                return exp; 

            return base.Visit(exp);
        }

        protected override Expression VisitConstant(ConstantExpression c)
        {
            Type type = TableType(c.Value);
            if (type != null)
            {
                if (typeof(IRootEntity).IsAssignableFrom(type))
                    return new MetaProjectorExpression(c.Type, new MetaExpression(type, new CleanMeta(PropertyRoute.Root(type))));

                if(type.IsInstantiationOf(typeof(MListElement<,>)))
                {
                    var parentType = type.GetGenericArguments()[0];
                    PropertyRoute parent = PropertyRoute.Root(parentType);

                    ISignumTable st =  (ISignumTable)c.Value;
                    var rt = (RelationalTable)st.Table;

                    Table table = rt.BackReference.ReferenceTable;
                    FieldInfo fieldInfo = table.Fields.Values.Single(f=>f.Field is FieldMList && ((FieldMList)f.Field).RelationalTable == rt).FieldInfo; 

                    PropertyRoute element = parent.Add(fieldInfo).Add("Item");

                    return new MetaProjectorExpression(c.Type, new MetaMListExpression(type, new CleanMeta(parent), new CleanMeta(element))); 
                }
            }

            return MakeVoidMeta(c.Type);
        }

        protected override Expression VisitParameter(ParameterExpression p)
        {
            return map.TryGetC(p) ?? p;
        }

        protected override Expression VisitMemberAccess(MemberExpression m)
        {
            Expression source = Visit(m.Expression);

            return BindMember(source, m.Member, m.Type);
        }

        static Expression BindMember(Expression source, MemberInfo member, Type memberType)
        {
            switch (source.NodeType)
            {
                case ExpressionType.MemberInit:
                    return ((MemberInitExpression)source).Bindings
                        .OfType<MemberAssignment>()
                        .SingleEx(a => ReflectionTools.MemeberEquals(a.Member, member)).Expression;
                case ExpressionType.New:
                    NewExpression nex = (NewExpression)source;
                    if (nex.Type.IsInstantiationOf(typeof(Grouping<,>)) && member.Name == "Key")
                    {
                        return nex.Arguments[0];
                    }

                    if (nex.Members != null)
                    {
                        PropertyInfo pi = (PropertyInfo)member;
                        return nex.Members.Zip(nex.Arguments).SingleEx(p => ReflectionTools.PropertyEquals((PropertyInfo)p.Item1, pi)).Item2;
                    }
                    break;
                case (ExpressionType)MetaExpressionType.MetaMListExpression:
                    {
                        MetaMListExpression mme = (MetaMListExpression)source;
                        var ga = mme.Type.GetGenericArguments();
                        if (member.Name == "Parent")
                            return new MetaExpression(ga[0], mme.Parent);

                        if (member.Name == "Element")
                            return new MetaExpression(ga[1], mme.Element);

                        throw new InvalidOperationException("Property {0} not found on {1}".Formato(member.Name, mme.Type.TypeName()));
                    }
            }

            if (typeof(ModifiableEntity).IsAssignableFrom(source.Type) || typeof(IIdentifiable).IsAssignableFrom(source.Type))
            {
                var pi = member as PropertyInfo ?? Reflector.TryFindPropertyInfo((FieldInfo)member);

                if (pi == null)
                    return new MetaExpression(memberType, null);

                MetaExpression meta = (MetaExpression)source;

                if (meta.Meta is CleanMeta)
                {
                    PropertyRoute[] routes = ((CleanMeta)meta.Meta).PropertyRoutes.SelectMany(r => GetRoutes(r, source.Type, pi.Name)).ToArray();

                    return new MetaExpression(memberType, new CleanMeta(routes));
                }

                if (typeof(IdentifiableEntity).IsAssignableFrom(source.Type) && !source.Type.IsAbstract) //Works for simple entities and also for interface casting
                    return new MetaExpression(memberType, new CleanMeta(PropertyRoute.Root(source.Type).Add(pi)));
            }

            if (source.Type.IsLite() && member.Name == "Entity")
            {
                MetaExpression meta = (MetaExpression)source;

                if (meta.Meta is CleanMeta)
                {
                    PropertyRoute[] routes = ((CleanMeta)meta.Meta).PropertyRoutes.Select(pr=>pr.Add("Entity")).ToArray();

                    return new MetaExpression(memberType, new CleanMeta(routes));
                }
            }

            return MakeDirtyMeta(memberType, source);
        }

        private static PropertyRoute[] GetRoutes(PropertyRoute route, Type type, string piName)
        {
            if (route.PropertyRouteType == PropertyRouteType.Root)
                return new[] { PropertyRoute.Root(type).Add(piName) };

            Implementations? imp = route.TryGetImplementations();

            if (imp == null) //Embedded
                return new[] { route.Add(piName) };

            var fimp = ColumnDescriptionFactory.CastImplementations(imp.Value, type);

            return fimp.Types.Select(t => PropertyRoute.Root(t).Add(piName)).ToArray();
        }

        protected override Expression VisitTypeIs(TypeBinaryExpression b)
        {
            return MakeDirtyMeta(b.Type, Visit(b.Expression)); 
        }

        protected override Expression VisitUnary(UnaryExpression u)
        {
            return MakeCleanMeta(u.Type, Visit(u.Operand));
        }

        protected override Expression VisitBinary(BinaryExpression b)
        {
            var right = ((MetaExpression)Visit(b.Right));
            var left = ((MetaExpression)Visit(b.Left));

            if(b.NodeType == ExpressionType.Coalesce &&  right.Meta is CleanMeta && left.Meta is CleanMeta)
            {
                if(((CleanMeta)right.Meta).PropertyRoutes.SequenceEqual(((CleanMeta)left.Meta).PropertyRoutes))
                    return new MetaExpression(b.Type, right.Meta); 
            } 

            return MakeDirtyMeta(b.Type,  left,  right); 
        }

        protected override Expression VisitConditional(ConditionalExpression c)
        {
            var ifTrue = ((MetaExpression)Visit(c.IfTrue));
            var ifFalse = ((MetaExpression)Visit(c.IfFalse));

            if (ifTrue.Meta is CleanMeta && ifFalse.Meta is CleanMeta)
            {
                if (((CleanMeta)ifTrue.Meta).PropertyRoutes.SequenceEqual(((CleanMeta)ifFalse.Meta).PropertyRoutes))
                    return new MetaExpression(c.Type,  ifTrue.Meta);
            }

            return MakeDirtyMeta(c.Type, Visit(c.Test), ifTrue, ifFalse);
        }
    }
}
