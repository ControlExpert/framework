using OpenQA.Selenium;
using Signum.Entities.Reflection;
using Signum.Utilities.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Signum.Selenium.LineProxies;
public class NumberLineProxy : BaseLineProxy
{
    public NumberLineProxy(IWebElement element, PropertyRoute route)
       : base(element, route)
    {
    }

    public override object? GetValueUntyped() => this.GetValue();
    public override void SetValueUntyped(object? value) => this.SetValue((IFormattable?)value);

    // COM-8980: readonly numeric lines render via FormControlReadonly's "onlyText" branch, which emits
    // <input readOnly value={...} className="... numeric"> without a "type" attribute, unlike the editable
    // NumberBox's <input type="text" className="... numeric">. Match on the shared "numeric" class only so
    // both the editable and readonly DOM shapes resolve (element is already scoped to this one line).
    public  WebElementLocator InputLocator => this.Element.WithLocator(By.CssSelector("input.numeric"));

    public void SetValue(IFormattable? value, string? format = null)
    {
        format ??= Reflector.FormatString(this.Route);

        var str = value == null ? null : value.ToString(format, null);

        if (str.HasText() && format.HasText() && format.ToUpper() == "P")
            str = str.Replace("%", "").Trim();

        InputLocator.Find().SafeSendKeys(str);
    }

    public IFormattable? GetValue()
    {
        var textLine = InputLocator.Find();

        var strValue = textLine.GetAttribute("value");

        return strValue == null ? null : (IFormattable?)ReflectionTools.Parse(strValue, this.Route.Type);
    }
}
