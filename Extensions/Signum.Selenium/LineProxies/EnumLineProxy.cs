using OpenQA.Selenium;
using Signum.Entities.Reflection;
using Signum.Utilities.Reflection;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Signum.Selenium.LineProxies;
public class EnumLineProxy : BaseLineProxy
{
    public EnumLineProxy(IWebElement element, PropertyRoute route)
       : base(element, route)
    {
    }


    public override object? GetValueUntyped() => this.GetValue();
    public override void SetValueUntyped(object? value) => this.SetValue(value);

    // COM-8980 [Autonomer Test-Fix]: fields with a unit (e.g. the glasses Sphere/Cylinder/Axis/Add/Prisma
    // lines in ConfirmedDevice.Glasses.tsx) get wrapped by ValueBase.tsx's withItemGroup() in an extra
    // "div.input-group" around the actual <select>/<input> (for both the editable AND the readonly
    // rendering, since withItemGroup is also used on the readOnly branch whenever a unit is set). A bare
    // "div" selector alternative matches that wrapper div first (ancestor-before-descendant in DOM order),
    // so Find() returned the wrapper instead of the real element -- exclude it explicitly so the search
    // continues into its children instead of stopping there.
    public  WebElementLocator SelectLocator => this.Element.WithLocator(By.CssSelector("select, input, div:not(.input-group)"));

    public void SetValue(object? value)
    {
        if(value is bool b)
            value = b ? BooleanEnum.True : BooleanEnum.False;

        var strValue =
            value == null ? "" :
            value is Enum e ? e.ToString() :
            // COM-8980 [Autonomer Test-Fix]: EnumLine.tsx is also used for non-enum option lists (e.g. the
            // glasses lens Sphere/Cylinder/Axis/Add/Prisma fields in ConfirmedDevice.Glasses.tsx's
            // SpecsComponent, which render as a <select> with decimal optionItems instead of a C# enum).
            // Its toStr() helper there just does val.toString() for any non-bool value, so mirror that for
            // any other IFormattable (int/decimal/etc.) instead of only supporting bool/Enum.
            value is IFormattable f ? f.ToString(null, CultureInfo.InvariantCulture) :
            throw new UnexpectedValueException(value);

        SelectLocator.Find().SelectElement().SelectByValue(strValue);
    }

    public object? GetValue()
    {
        var elem = this.SelectLocator.Find();

        var strValue = elem.TagName == "select" ? elem.SelectElement().SelectedOption.GetAttribute("value").ToString() :
            elem.GetAttribute("data-value");

        if (strValue.IsNullOrEmpty())
            return null;

        if (Route.Type.UnNullify() == typeof(bool))
        {
            // COM-8980: readonly nullable-bool lines (EnumLine.tsx's FormControlReadonly branch) put the
            // raw JS boolean into data-value ("true"/"false", lower-case), while the editable <select>
            // branch uses BooleanEnum's option values ("True"/"False"). Try the raw-boolean form first so
            // both branches work instead of only the select-based one.
            if (bool.TryParse(strValue, out var boolValue))
                return boolValue;

            return ReflectionTools.Parse<BooleanEnum>(strValue) == BooleanEnum.True;
        }

        return ReflectionTools.Parse(strValue, Route.Type);
    }
}
