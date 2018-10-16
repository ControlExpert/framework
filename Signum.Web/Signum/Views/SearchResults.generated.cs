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
    
    #line 3 "..\..\Signum\Views\SearchResults.cshtml"
    using Signum.Engine;
    
    #line default
    #line hidden
    using Signum.Entities;
    
    #line 1 "..\..\Signum\Views\SearchResults.cshtml"
    using Signum.Entities.DynamicQuery;
    
    #line default
    #line hidden
    
    #line 2 "..\..\Signum\Views\SearchResults.cshtml"
    using Signum.Entities.Reflection;
    
    #line default
    #line hidden
    using Signum.Utilities;
    using Signum.Web;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("RazorGenerator", "2.0.0.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Signum/Views/SearchResults.cshtml")]
    public partial class _Signum_Views_SearchResults_cshtml : System.Web.Mvc.WebViewPage<Context>
    {
        public _Signum_Views_SearchResults_cshtml()
        {
        }
        public override void Execute()
        {
            
            #line 6 "..\..\Signum\Views\SearchResults.cshtml"
  
    QueryDescription queryDescription = (QueryDescription)ViewData[ViewDataKeys.QueryDescription];
    var entityColumn = queryDescription.Columns.SingleEx(a => a.IsEntity);
    Implementations implementations = entityColumn.Implementations.Value;
    bool navigable = (bool)ViewData[ViewDataKeys.Navigate] && (implementations.IsByAll ? true : implementations.Types.Any(t => Navigator.IsNavigable(t, null, isSearch: true)));
    bool allowSelection = (bool)ViewData[ViewDataKeys.AllowSelection];
    RowAttributes rowAttributes = (RowAttributes)ViewData[ViewDataKeys.RowAttributes];
    QueryRequest queryRequest = (QueryRequest)ViewData[ViewDataKeys.QueryRequest];
    ResultTable queryResult = (ResultTable)ViewData[ViewDataKeys.Results];
    Dictionary<int, CellFormatter> formatters = (Dictionary<int, CellFormatter>)ViewData[ViewDataKeys.Formatters];
    EntityFormatter entityFormatter = (EntityFormatter)ViewData[ViewDataKeys.EntityFormatter];

    int columnsCount = queryResult.Columns.Count() + (navigable ? 1 : 0) + (allowSelection ? 1 : 0);

            
            #line default
            #line hidden
WriteLiteral("\r\n\r\n");

            
            #line 21 "..\..\Signum\Views\SearchResults.cshtml"
 if (ViewData.ContainsKey(ViewDataKeys.MultipliedMessage))
{

            
            #line default
            #line hidden
WriteLiteral("    <tr");

WriteLiteral(" class=\"extract\"");

WriteLiteral(">\r\n        <td>\r\n            <div");

WriteLiteral(" class=\"sf-td-multiply alert alert-warning\"");

WriteLiteral(">\r\n                <span");

WriteLiteral(" class=\"glyphicon glyphicon-exclamation-sign\"");

WriteLiteral("></span>\r\n");

WriteLiteral("                ");

            
            #line 27 "..\..\Signum\Views\SearchResults.cshtml"
           Write(ViewData[ViewDataKeys.MultipliedMessage]);

            
            #line default
            #line hidden
WriteLiteral("\r\n            </div>\r\n        </td>\r\n    </tr>\r\n");

            
            #line 31 "..\..\Signum\Views\SearchResults.cshtml"
}

            
            #line default
            #line hidden
WriteLiteral("\r\n");

            
            #line 33 "..\..\Signum\Views\SearchResults.cshtml"
 foreach (var row in queryResult.Rows)
{
    Lite<IEntity> entityField = row.Entity;

            
            #line default
            #line hidden
WriteLiteral("    <tr");

WriteLiteral(" data-entity=\"");

            
            #line 36 "..\..\Signum\Views\SearchResults.cshtml"
                 Write(entityField?.Key() ?? "");

            
            #line default
            #line hidden
WriteLiteral("\"");

WriteLiteral(" ");

            
            #line 36 "..\..\Signum\Views\SearchResults.cshtml"
                                              Write(rowAttributes == null ? null : rowAttributes(Html, row));

            
            #line default
            #line hidden
WriteLiteral(">\r\n");

            
            #line 37 "..\..\Signum\Views\SearchResults.cshtml"
        
            
            #line default
            #line hidden
            
            #line 37 "..\..\Signum\Views\SearchResults.cshtml"
         if (allowSelection)
        {

            
            #line default
            #line hidden
WriteLiteral("            <td");

WriteLiteral(" style=\"text-align:center\"");

WriteLiteral(">");

            
            #line 39 "..\..\Signum\Views\SearchResults.cshtml"
                                           if (entityField != null)
                {
                    
            
            #line default
            #line hidden
            
            #line 41 "..\..\Signum\Views\SearchResults.cshtml"
               Write(Html.CheckBox(Model.Compose("rowSelection", row.Index.ToString()),
                    new
                    {
                        @class = "sf-td-selection",
                        value = entityField.Id.ToString() + "__" + Navigator.ResolveWebTypeName(entityField.EntityType) + "__" + entityField.ToString()
                    }));

            
            #line default
            #line hidden
            
            #line 46 "..\..\Signum\Views\SearchResults.cshtml"
                      
                }
            
            #line default
            #line hidden
WriteLiteral("</td>\r\n");

            
            #line 48 "..\..\Signum\Views\SearchResults.cshtml"
        }

            
            #line default
            #line hidden
WriteLiteral("        ");

            
            #line 49 "..\..\Signum\Views\SearchResults.cshtml"
         if (navigable)
        {

            
            #line default
            #line hidden
WriteLiteral("            <td>");

            
            #line 51 "..\..\Signum\Views\SearchResults.cshtml"
                 if (entityField != null)
                {
                    
            
            #line default
            #line hidden
            
            #line 53 "..\..\Signum\Views\SearchResults.cshtml"
                Write((entityFormatter ?? QuerySettings.EntityFormatRules.Last(fr => fr.IsApplyable(row)).Formatter)(Html, row));

            
            #line default
            #line hidden
            
            #line 53 "..\..\Signum\Views\SearchResults.cshtml"
                                                                                                                                
                }
            
            #line default
            #line hidden
WriteLiteral("</td>\r\n");

            
            #line 55 "..\..\Signum\Views\SearchResults.cshtml"
        }

            
            #line default
            #line hidden
WriteLiteral("        ");

            
            #line 56 "..\..\Signum\Views\SearchResults.cshtml"
         foreach (var col in queryResult.Columns.Where(a => a.Column.IsVisible))
        {
            var value = row[col];
            var ft = formatters[col.Index];


            
            #line default
            #line hidden
WriteLiteral("            <td ");

            
            #line 61 "..\..\Signum\Views\SearchResults.cshtml"
           Write(ft.WriteDataAttribute(value));

            
            #line default
            #line hidden
WriteLiteral(" style=\"");

            
            #line 61 "..\..\Signum\Views\SearchResults.cshtml"
                                                 Write(ft.TextAlign == null ? null : "text-align:" + ft.TextAlign);

            
            #line default
            #line hidden
WriteLiteral("\">");

            
            #line 61 "..\..\Signum\Views\SearchResults.cshtml"
                                                                                                               Write(ft.Formatter(Html, value));

            
            #line default
            #line hidden
WriteLiteral("</td>\r\n");

            
            #line 62 "..\..\Signum\Views\SearchResults.cshtml"
        }

            
            #line default
            #line hidden
WriteLiteral("    </tr>\r\n");

            
            #line 64 "..\..\Signum\Views\SearchResults.cshtml"
}

            
            #line default
            #line hidden
WriteLiteral("\r\n");

            
            #line 66 "..\..\Signum\Views\SearchResults.cshtml"
 if (queryResult.Rows.IsNullOrEmpty())
{

            
            #line default
            #line hidden
WriteLiteral("    <tr>\r\n        <td");

WriteAttribute("colspan", Tuple.Create(" colspan=\"", 2945), Tuple.Create("\"", 2968)
            
            #line 69 "..\..\Signum\Views\SearchResults.cshtml"
, Tuple.Create(Tuple.Create("", 2955), Tuple.Create<System.Object, System.Int32>(columnsCount
            
            #line default
            #line hidden
, 2955), false)
);

WriteLiteral(">");

            
            #line 69 "..\..\Signum\Views\SearchResults.cshtml"
                               Write(SearchMessage.NoResultsFound.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("</td>\r\n    </tr>\r\n");

            
            #line 71 "..\..\Signum\Views\SearchResults.cshtml"
}

            
            #line default
            #line hidden
WriteLiteral("\r\n");

            
            #line 73 "..\..\Signum\Views\SearchResults.cshtml"
  
    ViewData[ViewDataKeys.Pagination] = queryResult.Pagination;


            
            #line default
            #line hidden
WriteLiteral("    <tr");

WriteLiteral(" class=\"extract\"");

WriteLiteral(">\r\n        <td>\r\n");

WriteLiteral("            ");

            
            #line 78 "..\..\Signum\Views\SearchResults.cshtml"
       Write(Html.Partial(Finder.Manager.PaginationSelectorView, Model));

            
            #line default
            #line hidden
WriteLiteral("\r\n        </td>\r\n    </tr>\r\n");

            
            #line 81 "..\..\Signum\Views\SearchResults.cshtml"

            
            #line default
            #line hidden
WriteLiteral("\r\n");

        }
    }
}
#pragma warning restore 1591