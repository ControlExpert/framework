﻿using Signum.Utilities;
using System.Reflection;
using Signum.Engine.Basics;
using Signum.React.Maps;
using Signum.Engine.Disconnected;
using Microsoft.AspNetCore.Builder;

namespace Signum.React.Map
{
    public static class DisconnectedServer
    {
        public static void Start(IApplicationBuilder app)
        {
            SignumControllerFactory.RegisterArea(MethodInfo.GetCurrentMethod());

            SchemaMap.GetColorProviders += GetMapColors;
        }

        static MapColorProvider[] GetMapColors()
        {
            var strategies = DisconnectedLogic.GetStrategyPairs().SelectDictionary(t => TypeLogic.GetCleanName(t), p => p);

            return new[]
            {
                new MapColorProvider
                {
                    Name = "disconnected",
                    NiceName = "Disconnected",
                    AddExtra = t =>
                    {
                        var s = strategies.TryGetC(t.typeName);

                        if (s == null)
                            return;

                        t.extra["disc-upload"] = s.Upload.ToString();
                        foreach (var mt in t.mlistTables)
                            mt.extra["disc-upload"] = s.Upload.ToString();

                        t.extra["disc-download"] = s.Download.ToString();
                        foreach (var mt in t.mlistTables)
                            mt.extra["disc-download"] = s.Download.ToString();

                    },
                    Order = 4,
                },
            };
        }

    }
}
