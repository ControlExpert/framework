﻿using Signum.Entities.UserAssets;
using Signum.React.Json;
using Signum.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Basics;
using Signum.React.UserAssets;
using Signum.Entities.Chart;
using Signum.Entities;
using Signum.React.ApiControllers;
using Signum.Entities.DynamicQuery;
using Signum.React.Facades;
using Signum.Engine.Chart;
using Signum.Engine.Authorization;
using Microsoft.AspNetCore.Builder;

namespace Signum.React.Chart
{
    public static class ChartServer
    {
        public static void Start(IApplicationBuilder app)
        {
            UserAssetServer.Start(app);

            SignumControllerFactory.RegisterArea(MethodInfo.GetCurrentMethod());

            CustomizeChartRequest();
            
            EntityJsonConverter.AfterDeserilization.Register((ChartRequestModel cr) =>
            {
                if (cr.ChartScript != null)
                    cr.GetChartScript().SynchronizeColumns(cr);

                if (cr.QueryName != null)
                {
                    var qd = QueryLogic.Queries.QueryDescription(cr.QueryName);

                    if (cr.Columns != null)
                        foreach (var c in cr.Columns)
                            c.ParseData(cr, qd, SubTokensOptions.CanElement | (c.IsGroupKey == false ? SubTokensOptions.CanAggregate : 0));
                }
            });

            EntityJsonConverter.AfterDeserilization.Register((UserChartEntity uc) =>
            {
                if (uc.ChartScript != null)
                    uc.GetChartScript().SynchronizeColumns(uc);

                if (uc.Query != null)
                {
                    var qd = QueryLogic.Queries.QueryDescription(uc.Query.ToQueryName());
                    uc.ParseData(qd);
                }
            });

            UserChartEntity.SetConverters(
                query => QueryLogic.ToQueryName(query.Key),
                queryName => QueryLogic.GetQueryEntity(queryName));

            EntityPackTS.AddExtension += ep =>
            {
                if (ep.entity.IsNew || !ChartPermission.ViewCharting.IsAuthorized())
                    return;

                var userCharts = UserChartLogic.GetUserChartsEntity(ep.entity.GetType());
                if (userCharts.Any())
                    ep.Extension.Add("userCharts", userCharts);
            };

        }

        private static void CustomizeChartRequest()
        {
            var converters = PropertyConverter.GetPropertyConverters(typeof(ChartRequestModel));
            converters.Remove("queryName");
            
            converters.Add("queryKey", new PropertyConverter()
            {
                AvoidValidate = true,
                CustomReadJsonProperty = ctx =>
                {
                    ((ChartRequestModel)ctx.Entity).QueryName = QueryLogic.ToQueryName((string)ctx.JsonReader.Value);
                },
                CustomWriteJsonProperty = ctx =>
                {
                    var cr = (ChartRequestModel)ctx.Entity;

                    ctx.JsonWriter.WritePropertyName(ctx.LowerCaseName);
                    ctx.JsonWriter.WriteValue(QueryLogic.GetQueryEntity(cr.QueryName).Key);
                }
            });
            
            converters.Add("filters", new PropertyConverter()
            {
                AvoidValidate = true,
                CustomReadJsonProperty = ctx =>
                {
                    var list = (List<FilterTS>)ctx.JsonSerializer.Deserialize(ctx.JsonReader, typeof(List<FilterTS>));

                    var cr = (ChartRequestModel)ctx.Entity;

                    var qd = QueryLogic.Queries.QueryDescription(cr.QueryName);

                    cr.Filters = list.Select(l => l.ToFilter(qd, canAggregate: true)).ToList();
                },
                CustomWriteJsonProperty = ctx =>
                {
                    var cr = (ChartRequestModel)ctx.Entity;

                    ctx.JsonWriter.WritePropertyName(ctx.LowerCaseName);
                    ctx.JsonSerializer.Serialize(ctx.JsonWriter, cr.Filters.Select(f => FilterTS.FromFilter(f)).ToList());
                }
            });
            
            converters.Add("orders", new PropertyConverter()
            {
                AvoidValidate = true,
                CustomReadJsonProperty = ctx =>
                {
                    var list = (List<OrderTS>)ctx.JsonSerializer.Deserialize(ctx.JsonReader, typeof(List<OrderTS>));

                    var cr = (ChartRequestModel)ctx.Entity;

                    var qd = QueryLogic.Queries.QueryDescription(cr.QueryName);

                    cr.Orders = list.Select(l => l.ToOrder(qd, canAggregate: true)).ToList();
                },
                CustomWriteJsonProperty = ctx =>
                {
                    var cr = (ChartRequestModel)ctx.Entity;

                    ctx.JsonWriter.WritePropertyName(ctx.LowerCaseName);
                    ctx.JsonSerializer.Serialize(ctx.JsonWriter, cr.Orders.Select(f => new OrderTS
                    {
                        token = f.Token.FullKey(),
                        orderType = f.OrderType
                    }));
                }
            });
        }
    }
}