﻿#pragma warning disable 1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
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
    using System.Text;
    using System.Web;
    using System.Web.Helpers;
    using System.Web.Mvc;
    using System.Web.Mvc.Ajax;
    using System.Web.Mvc.Html;
    using System.Web.Routing;
    using System.Web.Security;
    using System.Web.UI;
    using System.Web.WebPages;
    
    #line 3 "..\..\Signum\Views\FilterBuilder.cshtml"
    using Signum.Engine.DynamicQuery;
    
    #line default
    #line hidden
    using Signum.Entities;
    
    #line 1 "..\..\Signum\Views\FilterBuilder.cshtml"
    using Signum.Entities.DynamicQuery;
    
    #line default
    #line hidden
    
    #line 2 "..\..\Signum\Views\FilterBuilder.cshtml"
    using Signum.Entities.Reflection;
    
    #line default
    #line hidden
    using Signum.Utilities;
    using Signum.Web;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("RazorGenerator", "2.0.0.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Signum/Views/FilterBuilder.cshtml")]
    public partial class _Signum_Views_FilterBuilder_cshtml : System.Web.Mvc.WebViewPage<Context>
    {
        public _Signum_Views_FilterBuilder_cshtml()
        {
        }
        public override void Execute()
        {
            
            #line 5 "..\..\Signum\Views\FilterBuilder.cshtml"
  
    List<FilterOption> filterOptions = (List<FilterOption>)ViewData[ViewDataKeys.FilterOptions];
    QueryDescription queryDescription = (QueryDescription)ViewData[ViewDataKeys.QueryDescription];
    bool filtersVisible = (bool?)ViewData[ViewDataKeys.FiltersVisible] ?? true;
    bool showAddColumn = (bool?)ViewData[ViewDataKeys.ShowAddColumn] ?? false;
    if(filterOptions.HasItems())
    {
        FilterOption.SetFilterTokens(filterOptions, queryDescription, canAggregate: false);
    }

            
            #line default
            #line hidden
WriteLiteral("\r\n\r\n<div");

WriteAttribute("id", Tuple.Create(" id=\"", 636), Tuple.Create("\"", 675)
            
            #line 16 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 641), Tuple.Create<System.Object, System.Int32>(Model.Compose("tblFilterBuilder")
            
            #line default
            #line hidden
, 641), false)
);

WriteLiteral(" class=\"panel panel-default sf-filters form-xs\"");

WriteLiteral(" ");

            
            #line 16 "..\..\Signum\Views\FilterBuilder.cshtml"
                                                                                        Write(filtersVisible ? "" : "style=display:none");

            
            #line default
            #line hidden
WriteLiteral(">\r\n    <div");

WriteLiteral(" class=\"panel-heading sf-filters-body\"");

WriteLiteral(">\r\n");

WriteLiteral("        ");

            
            #line 18 "..\..\Signum\Views\FilterBuilder.cshtml"
   Write(Html.QueryTokenBuilder(null, new Context(Model, "tokenBuilder"), (QueryTokenBuilderSettings)ViewData[ViewDataKeys.QueryTokenSettings] ??
        SearchControlHelper.GetQueryTokenBuilderSettings(queryDescription, SubTokensOptions.CanAnyAll | SubTokensOptions.CanElement)));

            
            #line default
            #line hidden
WriteLiteral("\r\n\r\n        <div");

WriteLiteral(" class=\"btn-group\"");

WriteLiteral(">\r\n            <a");

WriteAttribute("id", Tuple.Create(" id=\"", 1152), Tuple.Create("\"", 1187)
            
            #line 22 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 1157), Tuple.Create<System.Object, System.Int32>(Model.Compose("btnAddFilter")
            
            #line default
            #line hidden
, 1157), false)
);

WriteLiteral(" class=\"sf-query-button sf-add-filter btn btn-default btn-sm\"");

WriteAttribute("title", Tuple.Create(" title=\"", 1249), Tuple.Create("\"", 1296)
            
            #line 22 "..\..\Signum\Views\FilterBuilder.cshtml"
                                       , Tuple.Create(Tuple.Create("", 1257), Tuple.Create<System.Object, System.Int32>(SearchMessage.AddFilter.NiceToString()
            
            #line default
            #line hidden
, 1257), false)
);

WriteLiteral(">\r\n                <span");

WriteLiteral(" class=\"glyphicon glyphicon-arrow-down\"");

WriteLiteral("></span>\r\n");

WriteLiteral("                ");

            
            #line 24 "..\..\Signum\Views\FilterBuilder.cshtml"
           Write(SearchMessage.AddFilter.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("\r\n            </a>\r\n        </div>\r\n\r\n");

            
            #line 28 "..\..\Signum\Views\FilterBuilder.cshtml"
        
            
            #line default
            #line hidden
            
            #line 28 "..\..\Signum\Views\FilterBuilder.cshtml"
         if (showAddColumn)
        {

            
            #line default
            #line hidden
WriteLiteral("            <div");

WriteLiteral(" class=\"btn-group\"");

WriteLiteral(">\r\n                <a");

WriteAttribute("id", Tuple.Create(" id=\"", 1558), Tuple.Create("\"", 1593)
            
            #line 31 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 1563), Tuple.Create<System.Object, System.Int32>(Model.Compose("btnAddColumn")
            
            #line default
            #line hidden
, 1563), false)
);

WriteLiteral(" class=\"sf-query-button sf-add-column btn btn-default btn-sm\"");

WriteAttribute("title", Tuple.Create(" title=\"", 1655), Tuple.Create("\"", 1702)
            
            #line 31 "..\..\Signum\Views\FilterBuilder.cshtml"
                                           , Tuple.Create(Tuple.Create("", 1663), Tuple.Create<System.Object, System.Int32>(SearchMessage.AddColumn.NiceToString()
            
            #line default
            #line hidden
, 1663), false)
);

WriteLiteral(">\r\n                    <span");

WriteLiteral(" class=\"glyphicon glyphicon-arrow-right\"");

WriteLiteral("></span>\r\n");

WriteLiteral("                    ");

            
            #line 33 "..\..\Signum\Views\FilterBuilder.cshtml"
               Write(SearchMessage.AddColumn.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("\r\n                </a>\r\n            </div>\r\n");

            
            #line 36 "..\..\Signum\Views\FilterBuilder.cshtml"
        }

            
            #line default
            #line hidden
WriteLiteral("    </div>\r\n\r\n    <div");

WriteLiteral(" class=\"panel-body sf-filters-list table-responsive\"");

WriteLiteral(" style=\"overflow-x: visible;\"");

WriteLiteral(">\r\n        <div");

WriteLiteral(" class=\"sf-explanation\"");

WriteAttribute("style", Tuple.Create(" style=\"", 2036), Tuple.Create("\"", 2121)
            
            #line 40 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 2044), Tuple.Create<System.Object, System.Int32>((filterOptions == null || filterOptions.Count == 0) ? "" : "display:none;"
            
            #line default
            #line hidden
, 2044), false)
);

WriteLiteral(">");

            
            #line 40 "..\..\Signum\Views\FilterBuilder.cshtml"
                                                                                                                     Write(SearchMessage.NoFiltersSpecified.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("</div>\r\n        <table");

WriteAttribute("id", Tuple.Create(" id=\"", 2193), Tuple.Create("\"", 2226)
            
            #line 41 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 2198), Tuple.Create<System.Object, System.Int32>(Model.Compose("tblFilters")
            
            #line default
            #line hidden
, 2198), false)
);

WriteAttribute("style", Tuple.Create(" style=\"", 2227), Tuple.Create("\"", 2313)
            
            #line 41 "..\..\Signum\Views\FilterBuilder.cshtml"
, Tuple.Create(Tuple.Create("", 2235), Tuple.Create<System.Object, System.Int32>((filterOptions == null || filterOptions.Count == 0) ? "display:none" : null
            
            #line default
            #line hidden
, 2235), false)
);

WriteLiteral(" class=\"table\"");

WriteLiteral(">\r\n            <thead>\r\n                <tr>\r\n                    <th></th>\r\n    " +
"                <th");

WriteLiteral(" class=\"sf-filter-field-header\"");

WriteLiteral(">\r\n");

WriteLiteral("                        ");

            
            #line 46 "..\..\Signum\Views\FilterBuilder.cshtml"
                   Write(SearchMessage.Field.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("\r\n                    </th>\r\n                    <th>\r\n");

WriteLiteral("                        ");

            
            #line 49 "..\..\Signum\Views\FilterBuilder.cshtml"
                   Write(SearchMessage.Operation.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("\r\n                    </th>\r\n                    <th>\r\n");

WriteLiteral("                        ");

            
            #line 52 "..\..\Signum\Views\FilterBuilder.cshtml"
                   Write(SearchMessage.Value.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("\r\n                    </th>\r\n                </tr>\r\n            </thead>\r\n       " +
"     <tbody>\r\n");

WriteLiteral("                ");

            
            #line 57 "..\..\Signum\Views\FilterBuilder.cshtml"
           Write(Html.Partial(Finder.Manager.FilterRowsView, Model));

            
            #line default
            #line hidden
WriteLiteral("\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n\r\n</div>\r\n");

        }
    }
}
#pragma warning restore 1591