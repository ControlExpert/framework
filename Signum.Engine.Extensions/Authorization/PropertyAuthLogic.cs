﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Basics;
using Signum.Entities;
using Signum.Utilities.DataStructures;
using Signum.Utilities;
using Signum.Entities.DynamicQuery;
using System.Reflection; 

namespace Signum.Engine.Authorization
{
    public static class PropertyAuthLogic
    {
        static AuthCache<RulePropertyDN, PropertyAllowedRule, PropertyDN, PropertyRoute, PropertyAllowed> cache;

        public static IManualAuth<PropertyRoute, PropertyAllowed> Manual { get { return cache; } }

        public static bool IsStarted { get { return cache != null; } }

        public static void Start(SchemaBuilder sb, bool queries)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                AuthLogic.AssertStarted(sb);
                PropertyLogic.Start(sb);

                cache = new AuthCache<RulePropertyDN, PropertyAllowedRule, PropertyDN, PropertyRoute, PropertyAllowed>(sb,
                    PropertyLogic.GetPropertyRoute,
                    PropertyLogic.GetEntity,
                    AuthUtils.MaxProperty,
                    AuthUtils.MinProperty);

                if (queries)
                {
                    PropertyRoute.SetIsAllowedCallback(pp => pp.GetAllowedFor(PropertyAllowed.Read));
                }

                AuthLogic.ExportToXml += () => cache.ExportXml("Properties", "Property", p => p.Type.CleanName + "|" + p.Path, pa => pa.ToString());
                AuthLogic.ImportFromXml += (x, roles, replacements) =>
                {
                    Dictionary<Type, Dictionary<string, PropertyRoute>> routesDicCache = new Dictionary<Type, Dictionary<string, PropertyRoute>>();

                    string replacementKey = typeof(OperationDN).Name;

                    var groups =  x.Element("Properties").Elements("Role").SelectMany(r => r.Elements("Property")).Select(p => new PropertyPair(p.Attribute("Resource").Value))
                        .AgGroupToDictionary(a=>a.Type, gr=>gr.Select(pp=> pp.Property).ToHashSet());

                    foreach (var item in groups)
                    {
                        Type type = TypeLogic.NameToType.TryGetC(replacements.Apply(typeof(TypeDN).Name, item.Key));

                        if (type == null)
                            continue;

                        var dic = PropertyRoute.GenerateRoutes(type).ToDictionary(a => a.PropertyString());

                        replacements.AskForReplacements(
                           item.Value,
                           dic.Keys.ToHashSet(),
                           type.Name + " Properties");


                        routesDicCache[type] = dic;
                    }

                    return cache.ImportXml(x, "Properties", "Property", roles, s =>
                    {
                        var pp = new PropertyPair(s);

                        Type type = TypeLogic.NameToType.TryGetC(replacements.Apply(typeof(TypeDN).Name, pp.Type));
                        if (type == null)
                            return null;

                        PropertyRoute route = routesDicCache[type].TryGetC(replacements.Apply(type.Name + " Properties", pp.Property));

                        if (route == null)
                            return null;

                        var property = PropertyLogic.GetEntity(route);
                        if (property.IsNew)
                            property.Save();
                            
                        return property;

                    }, EnumExtensions.ToEnum<PropertyAllowed>);
                };
            }
        }

        struct PropertyPair
        {
            public readonly string Type;
            public readonly  string Property;
            public PropertyPair(string str)
            {
                var index = str.IndexOf("|");
                Type = str.Substring(0, index);
                Property = str.Substring(index + 1);
            }
        }


        public static PropertyRulePack GetPropertyRules(Lite<RoleDN> roleLite, TypeDN typeDN)
        {
            var result = new PropertyRulePack {Role = roleLite, Type = typeDN }; 
            cache.GetRules(result, PropertyLogic.RetrieveOrGenerateProperties(typeDN));
            return result;
        }

        public static void SetPropertyRules(PropertyRulePack rules)
        {
            cache.SetRules(rules, r => r.Type == rules.Type); 
        }

        public static PropertyAllowed GetPropertyAllowed(Lite<RoleDN> role, PropertyRoute property)
        {
            return cache.GetAllowed(role, property);
        }

        public static PropertyAllowed GetPropertyAllowed(this PropertyRoute route)
        {
            if (!AuthLogic.IsEnabled || ExecutionMode.InGlobal)
                return PropertyAllowed.Modify;

            if (route.PropertyRouteType == PropertyRouteType.MListItems || route.PropertyRouteType == PropertyRouteType.LiteEntity)
                return GetPropertyAllowed(route.Parent);

            var typeRule = TypeAuthLogic.GetAllowed(route.RootType).Max(ExecutionMode.InUserInterface);

            if (typeRule == TypeAllowedBasic.None)
                return PropertyAllowed.None;

            if (typeRule == TypeAllowedBasic.Read)
                return PropertyAllowed.Read;

            return cache.GetAllowed(RoleDN.Current.ToLite(), route);
        }

        public static string GetAllowedFor(this PropertyRoute route, PropertyAllowed requested)
        {
            if (!AuthLogic.IsEnabled || ExecutionMode.InGlobal)
                return null;

            if (route.PropertyRouteType == PropertyRouteType.MListItems || route.PropertyRouteType == PropertyRouteType.LiteEntity)
                return GetAllowedFor(route.Parent, requested);

            if (TypeAuthLogic.GetAllowed(route.RootType).Max(ExecutionMode.InUserInterface) == TypeAllowedBasic.None)
                return "Type {0} is set to None for {1}".Formato(route.RootType.NiceName(), RoleDN.Current);

            var current = cache.GetAllowed(RoleDN.Current.ToLite(), route);

            if (current < requested)
                return "Property {0} is set to {1} for {2}".Formato(route, current, RoleDN.Current);

            return null;
        }

        public static DefaultDictionary<PropertyRoute, PropertyAllowed> AuthorizedProperties()
        {
            return cache.GetDefaultDictionary();
        }

        public static AuthThumbnail? GetAllowedThumbnail(Lite<RoleDN> role, Type entityType)
        {
            return PropertyRoute.GenerateRoutes(entityType).Select(pr => cache.GetAllowed(role, pr)).Collapse();
        }
    }
}
