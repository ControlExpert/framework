﻿#pragma warning disable 1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Signum.Web.AuthAdmin.Views
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
    
    #line 2 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
    using Signum.Engine.Authorization;
    
    #line default
    #line hidden
    using Signum.Entities;
    using Signum.Entities.Authorization;
    
    #line 1 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
    using Signum.Entities.Basics;
    
    #line default
    #line hidden
    using Signum.Utilities;
    using Signum.Web;
    using Signum.Web.Auth;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("RazorGenerator", "2.0.0.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/AuthAdmin/Views/PasswordValidInterval.cshtml")]
    public partial class PasswordValidInterval : System.Web.Mvc.WebViewPage<dynamic>
    {
        public PasswordValidInterval()
        {
        }
        public override void Execute()
        {
            
            #line 3 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
 using (var e = Html.TypeContext<PasswordExpiresIntervalEntity>())
{
    
            
            #line default
            #line hidden
            
            #line 5 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
Write(Html.ValueLine(e, f => f.Enabled));

            
            #line default
            #line hidden
            
            #line 5 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
                                      
    
            
            #line default
            #line hidden
            
            #line 6 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
Write(Html.ValueLine(e, f => f.Days));

            
            #line default
            #line hidden
            
            #line 6 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
                                   
    
            
            #line default
            #line hidden
            
            #line 7 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
Write(Html.ValueLine(e, f => f.DaysWarning));

            
            #line default
            #line hidden
            
            #line 7 "..\..\AuthAdmin\Views\PasswordValidInterval.cshtml"
                                          

}
            
            #line default
            #line hidden
WriteLiteral(" ");

        }
    }
}
#pragma warning restore 1591
