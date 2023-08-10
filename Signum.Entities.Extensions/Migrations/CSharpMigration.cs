
namespace Signum.Entities.Migrations;

[EntityKind(EntityKind.System, EntityData.Transactional), TicksColumn(false)]
public class CSharpMigrationEntity : Entity
{
    [UniqueIndex]
    [StringLengthValidator(Max = 200)]
    public string UniqueName { get; set; }

    public DateTime ExecutionDate { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => UniqueName);
}
