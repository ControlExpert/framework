using Signum.Utilities;
using System.Collections.Generic;

namespace Signum.Upgrade.Upgrades;

class Upgrade_20231013_AutoLine : CodeUpgradeBase
{
    public override string Description => "Updates ValueLine => AutoLine";

    public override void Execute(UpgradeContext uctx)
    {
        uctx.ForeachCodeFile(@"*.tsx, *.ts", file =>
        {
            file.Replace(new Regex(@"\bValueLine\b"), m => "AutoLine");
            file.Replace(new Regex(@"<ValueLine"), m => "<AutoLine");
            file.Replace(new Regex(@"ValueLineModal"), m => "AutoLineModal");
            file.Replace(new Regex(@"<AutoLine(?<atts>[^/]*)/>"), m =>
            {
                var atts = m.Groups["atts"].Value;

                if (atts.Contains("inlineCheckbox"))
                    return "<CheckboxLine" + atts + "/>";

                if (atts.Contains("optionItems"))
                    return "<EnumLine" + atts + "/>";

                return m.Value;

            });
        });
    }
}



