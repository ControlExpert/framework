using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Signum.Utilities.Reflection;
using Signum.Utilities.ExpressionTrees;
using System.Diagnostics.CodeAnalysis;

namespace Signum.Utilities
{
    public static class ArgsExtensions
    {
        public static T GetArg<T>(this IEnumerable<object?>? args)
        {
            return args!.SmartConvertTo<T>().SingleEx(() => "{0} in the argument list".FormatWith(typeof(T))); ;
        }

        public static T? TryGetArgC<T>(this IEnumerable<object?>? args) where T : class
        {
            return args?.SmartConvertTo<T?>().SingleOrDefaultEx(() => "There are more than one {0} in the argument list".FormatWith(typeof(T)));
        }

        public static T? TryGetArgS<T>(this IEnumerable<object?>? args) where T : struct
        {
            var casted = args?.SmartConvertTo<T>();

            if (casted.IsNullOrEmpty())
                return null;

            return casted.SingleEx(() => "{0} in the argument list".FormatWith(typeof(T)));
        }

        static IEnumerable<T> SmartConvertTo<T>(this IEnumerable<object?>? args)
        {
            if (args == null)
                yield break;

            foreach (var obj in args)
            {
                if (obj is T t)
                    yield return t;
                else if (obj is string s && typeof(T).IsEnum && Enum.IsDefined(typeof(T), s))
                    yield return (T)Enum.Parse(typeof(T), s);
                else if (obj is IComparable && ReflectionTools.IsNumber(obj.GetType()) && ReflectionTools.IsNumber(typeof(T)))
                    yield return ReflectionTools.ChangeType<T>(obj);
                else if (obj is IComparable && ReflectionTools.IsDate(obj.GetType()) && ReflectionTools.IsDate(typeof(T)))
                    yield return ReflectionTools.ChangeType<T>(obj);
                else if (obj is List<object> list)
                {
                    var type = typeof(T).ElementType();
                    if (type != null)
                    {
                        var converted = (T)giConvertListTo.GetInvoker(type)(list);
                        if (((IList)converted).Count == list.Count)
                            yield return converted;
                    }
                }
            }
        }

   

        static readonly GenericInvoker<Func<List<object>, IList>> giConvertListTo = new GenericInvoker<Func<List<object>, IList>>(list => ConvertListTo<int>(list));

        static List<S> ConvertListTo<S>(List<object> list)
        {
            return SmartConvertTo<S>(list).ToList();
        }
    }
}
