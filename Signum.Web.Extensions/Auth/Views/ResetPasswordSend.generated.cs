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

namespace Signum.Web.Auth.Views
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
    using Signum.Entities.Authorization;
    using Signum.Utilities;
    using Signum.Web;
    using Signum.Web.Auth;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("RazorGenerator", "2.0.0.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Auth/Views/ResetPasswordSend.cshtml")]
    public partial class ResetPasswordSend : System.Web.Mvc.WebViewPage<dynamic>
    {
        public ResetPasswordSend()
        {
        }
        public override void Execute()
        {
            
            #line 1 "..\..\Auth\Views\ResetPasswordSend.cshtml"
  
    ViewBag.Title = AuthMessage.ResetPassword.NiceToString();

            
            #line default
            #line hidden
WriteLiteral("\r\n    <div");

WriteLiteral(" class=\"sf-reset-password-container col-sm-offset-4\"");

WriteLiteral(">    \r\n        <h2>");

            
            #line 5 "..\..\Auth\Views\ResetPasswordSend.cshtml"
       Write(AuthMessage.EmailSent.NiceToString());

            
            #line default
            #line hidden
WriteLiteral("</h2>\r\n        <p>");

            
            #line 6 "..\..\Auth\Views\ResetPasswordSend.cshtml"
      Write(AuthMessage.ResetPasswordCodeHasBeenSent.NiceToString().FormatWith(TempData["email"]));

            
            #line default
            #line hidden
WriteLiteral("</p>\r\n    </div>\r\n\r\n");

        }
    }
}
#pragma warning restore 1591
