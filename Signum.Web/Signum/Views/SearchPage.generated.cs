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
    using Signum.Entities;
    using Signum.Utilities;
    using Signum.Web;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("RazorGenerator", "2.0.0.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Signum/Views/SearchPage.cshtml")]
    public partial class _Signum_Views_SearchPage_cshtml : System.Web.Mvc.WebViewPage<Context>
    {
        public _Signum_Views_SearchPage_cshtml()
        {
        }
        public override void Execute()
        {
            
            #line 3 "..\..\Signum\Views\SearchPage.cshtml"
 using (Html.BeginForm())
{

            
            #line default
            #line hidden
WriteLiteral("    <div");

WriteLiteral(" id=\"divSearchPage\"");

WriteLiteral(">\r\n        <h2>\r\n            <span");

WriteLiteral(" class=\"sf-entity-title\"");

WriteLiteral(">");

            
            #line 7 "..\..\Signum\Views\SearchPage.cshtml"
                                      Write(ViewBag.Title);

            
            #line default
            #line hidden
WriteLiteral("</span>\r\n            <a");

WriteAttribute("id", Tuple.Create(" id=\"", 173), Tuple.Create("\"", 208)
            
            #line 8 "..\..\Signum\Views\SearchPage.cshtml"
, Tuple.Create(Tuple.Create("", 178), Tuple.Create<System.Object, System.Int32>(Model.Compose("sfFullScreen")
            
            #line default
            #line hidden
, 178), false)
);

WriteLiteral(" class=\"sf-popup-fullscreen\"");

WriteLiteral(" href=\"#\"");

WriteLiteral(">\r\n                <span");

WriteLiteral(" class=\"glyphicon glyphicon-new-window\"");

WriteLiteral("></span>\r\n            </a>\r\n        </h2>\r\n");

            
            #line 12 "..\..\Signum\Views\SearchPage.cshtml"
        
            
            #line default
            #line hidden
            
            #line 12 "..\..\Signum\Views\SearchPage.cshtml"
           ViewData[ViewDataKeys.AvoidFullScreenButton] = true; 
            
            #line default
            #line hidden
WriteLiteral("\r\n");

WriteLiteral("        ");

            
            #line 13 "..\..\Signum\Views\SearchPage.cshtml"
   Write(Html.Partial(Finder.Manager.SearchControlView));

            
            #line default
            #line hidden
WriteLiteral("\r\n");

WriteLiteral("        ");

            
            #line 14 "..\..\Signum\Views\SearchPage.cshtml"
   Write(Html.AntiForgeryToken());

            
            #line default
            #line hidden
WriteLiteral("\r\n    </div>\r\n");

            
            #line 16 "..\..\Signum\Views\SearchPage.cshtml"
}
            
            #line default
            #line hidden
        }
    }
}
#pragma warning restore 1591