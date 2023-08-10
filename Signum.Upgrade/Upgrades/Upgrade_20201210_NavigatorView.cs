namespace Signum.Upgrade.Upgrades;

class Upgrade_20201210_NavigatorView : CodeUpgradeBase
{
    public override string Description => "replace Navigator.navigate by Navigator.view";


    public override void Execute(UpgradeContext uctx)
    {
        uctx.ForeachCodeFile("*.ts, *.tsx", file =>
        {
            file.Replace("Navigator.navigate(", "Navigator.view(");
            file.Replace("Navigator.isNavigable(", "Navigator.isViewable(");
        });
    }
}
