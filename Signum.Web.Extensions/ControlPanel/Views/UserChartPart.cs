﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.17626
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ASP
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Web;
    using System.Web.Helpers;
    using System.Web.Security;
    using System.Web.UI;
    using System.Web.WebPages;
    using System.Web.Mvc;
    using System.Web.Mvc.Ajax;
    using System.Web.Mvc.Html;
    using System.Web.Routing;
    using Signum.Utilities;
    using Signum.Entities;
    using Signum.Web;
    using System.Collections;
    using System.Collections.Specialized;
    using System.ComponentModel.DataAnnotations;
    using System.Configuration;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web.Caching;
    using System.Web.DynamicData;
    using System.Web.SessionState;
    using System.Web.Profile;
    using System.Web.UI.WebControls;
    using System.Web.UI.WebControls.WebParts;
    using System.Web.UI.HtmlControls;
    using System.Xml.Linq;
    using Signum.Web.Properties;
    using Signum.Entities.ControlPanel;
    using Signum.Web.ControlPanel;
    using Signum.Entities.DynamicQuery;
    using Signum.Entities.Chart;
    using Signum.Web.Chart;
    using Signum.Engine.Chart;
    using Signum.Engine.DynamicQuery;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("MvcRazorClassGenerator", "1.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/ControlPanel/Views/UserChartPart.cshtml")]
    public class _Page_ControlPanel_Views_UserChartPart_cshtml : System.Web.Mvc.WebViewPage<PanelPart>
    {


        public _Page_ControlPanel_Views_UserChartPart_cshtml()
        {
        }
        protected System.Web.HttpApplication ApplicationInstance
        {
            get
            {
                return ((System.Web.HttpApplication)(Context.ApplicationInstance));
            }
        }
        public override void Execute()
        {











Write(Html.ScriptsJs("~/Chart/Scripts/SF_Chart.js",
                "~/Chart/Scripts/SF_Chart_Utils.js",
                "~/scripts/d3.v2.min.js",
                "~/scripts/underscore-min.js"));

WriteLiteral("\r\n");


Write(Html.ScriptCss("~/Chart/Content/SF_Chart.css"));

WriteLiteral("\r\n");


   
    UserChartDN uc = ((UserChartPartDN)Model.Content).UserChart;
    ChartRequest request = uc.ToRequest();

    using (var ucTc = new TypeContext<ChartRequest>(request, "r{0}c{1}".Formato(Model.Row, Model.Column)))
    {
        ResultTable resultTable = ChartLogic.ExecuteChart(request);

        var json = ChartClient.DataJson(ucTc.Value, resultTable);


WriteLiteral("    <div id=\"");


        Write(ucTc.Compose("sfChartControl"));

WriteLiteral("\" class=\"sf-search-control sf-chart-control\" data-prefix=\"");


                                                                                                 Write(ucTc.ControlID);

WriteLiteral("\">\r\n        <div style=\"display: none\">\r\n            ");


       Write(Html.HiddenRuntimeInfo(ucTc));

WriteLiteral("\r\n            ");


       Write(Html.Hidden(ucTc.Compose("sfOrders"), request.Orders.IsNullOrEmpty() ? "" :
                    (request.Orders.ToString(oo => (oo.OrderType == OrderType.Ascending ? "" : "-") + oo.Token.FullKey(), ";") + ";")));

WriteLiteral("\r\n");


              
        ViewData[ViewDataKeys.QueryDescription] = DynamicQueryManager.Current.QueryDescription(request.QueryName);
        ViewData[ViewDataKeys.FilterOptions] = request.Filters.Select(f => new FilterOption { Token = f.Token, Operation = f.Operation, Value = f.Value }).ToList();
            

WriteLiteral("            ");


       Write(Html.Partial(Navigator.Manager.FilterBuilderView, ucTc));

WriteLiteral("\r\n            <div id=\"");


                Write(ucTc.Compose("sfChartBuilderContainer"));

WriteLiteral("\">\r\n                ");


           Write(Html.Partial(ChartClient.ChartBuilderView, request));

WriteLiteral("\r\n            </div>\r\n            <script type=\"text/javascript\">\r\n              " +
"          $(\'#");


                       Write(ucTc.Compose("sfChartBuilderContainer"));

WriteLiteral("\').chartBuilder($.extend({ prefix: \'");


                                                                                                   Write(ucTc.ControlID);

WriteLiteral("\'}, ");


                                                                                                                      Write(MvcHtmlString.Create(uc.ToJS()));

WriteLiteral("));\r\n            </script>\r\n        </div>\r\n        <div id=\"");


            Write(ucTc.Compose("sfChartContainer"));

WriteLiteral("\">\r\n            <div class=\"sf-chart-container\" \r\n                    data-open-u" +
"rl=\"");


                               Write(Url.Action<ChartController>(cc => cc.OpenSubgroup(ucTc.ControlID)));

WriteLiteral("\" \r\n                    data-fullscreen-url=\"");


                                     Write(Url.Action<ChartController>(cc => cc.FullScreen(ucTc.ControlID)));

WriteLiteral("\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n");


    
        MvcHtmlString divSelector = MvcHtmlString.Create("#" + ucTc.Compose("sfChartContainer") + " > .sf-chart-container");

WriteLiteral("    <script type=\"text/javascript\">\r\n            $(function() {\r\n                " +
"var $chartContainer = $(\'");


                                    Write(divSelector);

WriteLiteral("\');\r\n                        \r\n                $chartContainer.html(\"\");\r\n       " +
"                 \r\n                var width = $chartContainer.width();\r\n       " +
"         var height = $chartContainer.height();\r\n\r\n                var data = ");


                      Write(Html.Json(json));

WriteLiteral(";\r\n\r\n                var myChart = SF.Chart.Factory.getGraphType(\'");


                                                        Write(ucTc.Value.ChartScript.ToString());

WriteLiteral("\');\r\n                \r\n                eval(myChart.createChartSVG(\'");


                                        Write(divSelector);

WriteLiteral("\') + myChart.paintChart(\'");


                                                                             Write(divSelector);

WriteLiteral("\'));\r\n\r\n                $(\"#\" + SF.compose(\"");


                               Write(ucTc.ControlID);

WriteLiteral("\", \"sfFullScreen\")).on(\"mousedown\", function(e){\r\n                    SF.Chart.ge" +
"tFor(\'");


                                Write(ucTc.ControlID);

WriteLiteral("\').fullScreen(e);\r\n                });\r\n            });\r\n    </script>\r\n");


    
    }



        }
    }
}
