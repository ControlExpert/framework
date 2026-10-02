using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Signum.Selenium.LineProxies;
public abstract class TextBoxBaseLineProxy : BaseLineProxy
{
    public TextBoxBaseLineProxy(IWebElement element, PropertyRoute route)
       : base(element, route)
    {
    }


    public override object? GetValueUntyped() => this.GetValue();
    public override void SetValueUntyped(object? value) => this.SetValue((string?)value);

    public abstract WebElementLocator InputLocator { get; }

    public void SetValue(string? value)
    {
        InputLocator.Find().SafeSendKeys(value);
    }

    public string GetValue()
    {
        var textLine = InputLocator.Find(); 

        return /*textLine.GetAttribute("data-value") ??*/ textLine.GetAttribute("value");
    }

    public bool IsReadonly()
    {
        var element = InputLocator.Find();

        return element.HasClass("readonly") || element.HasClass("form-control-plaintext") || element.GetAttribute("readonly") != null;
    }
}

public class TextBoxLineProxy : TextBoxBaseLineProxy
{
    public TextBoxLineProxy(IWebElement element, PropertyRoute route) : base(element, route)
    {
    }

    // COM-8980 [Autonomer Test-Fix]: readonly text lines render via FormControlReadonly's "onlyText" branch,
    // which emits <input readOnly value={...}> without a "type" attribute, unlike the editable TextBox's
    // <input type="text" ...>. Match on the generic "input" tag instead -- this.Element is already scoped
    // to this one line, so there is only a single candidate input either way.
    public override WebElementLocator InputLocator => this.Element.WithLocator(By.CssSelector("input"));
}

public class PasswordBoxLineProxy : TextBoxBaseLineProxy
{
    public PasswordBoxLineProxy(IWebElement element, PropertyRoute route) : base(element, route)
    {
    }

    public override WebElementLocator InputLocator => this.Element.WithLocator(By.CssSelector("input[type=password]"));
}


public class ColorBoxLineProxy : TextBoxBaseLineProxy
{
    public ColorBoxLineProxy(IWebElement element, PropertyRoute route) : base(element, route)
    {
    }

    public override WebElementLocator InputLocator => this.Element.WithLocator(By.CssSelector("input[type=color]"));
}
