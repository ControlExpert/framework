using OpenQA.Selenium;
using Signum.Entities.Reflection;
using Signum.Utilities.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Signum.Selenium.LineProxies;
public class DateTimeLineProxy : BaseLineProxy
{
    public DateTimeLineProxy(IWebElement element, PropertyRoute route)
       : base(element, route)
    {
    }

    // COM-8980 [Autonomer Test-Fix]: readonly date lines render via FormControlReadonly's "onlyText" branch
    // (DateTimeLine.tsx's s.ctx.readOnly path), which emits a plain <input readOnly> without the editable
    // rendering's "div.rw-date-picker" wrapper or "type" attribute -- same pattern as NumberLineProxy/
    // TextBoxLineProxy (see learnings.md Abschnitt 35/36). Match on the generic "input" tag instead --
    // this.Element is already scoped to this one line, so there is only a single candidate input either way.
    public WebElementLocator InputLocator => this.Element.WithLocator(By.CssSelector("input"));

    public void SetValue(IFormattable? value, string? format = null)
    {
        format ??= Reflector.FormatString(this.Route);

        var str = value == null ? null : value.ToString(format, null);

        InputLocator.Find().SafeSendKeys(str);
    }

    public IFormattable? GetValue()
    {
        var textLine = InputLocator.Find();

        var strValue = textLine.GetAttribute("value");

        return strValue == null ? null : (IFormattable?)ReflectionTools.Parse(strValue, this.Route.Type);
    }


    public override object? GetValueUntyped() => this.GetValue();
    public override void SetValueUntyped(object? value) => SetValue((IFormattable?)value);
}
