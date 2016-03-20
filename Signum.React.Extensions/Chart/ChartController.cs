﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Signum.Engine.Authorization;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Services;
using Signum.Utilities;
using Signum.React.Facades;
using Signum.React.Authorization;
using Signum.React.ApiControllers;
using Signum.Engine.Basics;
using Signum.Entities.UserAssets;
using Signum.Entities.DynamicQuery;
using Signum.Engine.DynamicQuery;
using Signum.Engine;
using Signum.Entities.Chart;
using Signum.Engine.Chart;

namespace Signum.React.Chart
{
    public class ChartController : ApiController
    {
        [Route("api/chart/scripts"), HttpGet]
        public List<List<ChartScriptEntity>> ChartScripts()
        {
            return ChartUtils.PackInGroups(ChartScriptLogic.Scripts.Value.Values, 4);
        }

        [Route("api/chart/colorPalettes"), HttpGet]
        public List<string> ColorPelettes()
        {
            return ChartColorLogic.Colors.Value.Keys.Select(t => TypeLogic.GetCleanName(t)).ToList();
        }

        [Route("api/chart/execute"), HttpPost, ValidateModelFilter]
        public ExecuteChartResult Execute(ChartRequest request)
        {
            var resultTable = ChartLogic.ExecuteChart(request);

            var chartTable = ChartUtils.DataJson(request, resultTable);

            return new ExecuteChartResult { resultTable = resultTable, chartTable = chartTable };
        }

        public class ExecuteChartResult
        {
            public ResultTable resultTable;
            public object chartTable;
        }

        [Route("api/chart/syncronizeColumns"), HttpPost, ValidateModelFilter]
        public IChartBase SyncronizeColumns(ModifiableEntity chart)
        {
            var c = (IChartBase)chart;
            c.ChartScript.SyncronizeColumns(c);
            return c;
        }
    }
}