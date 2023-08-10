using Signum.Entities.Basics;

namespace Signum.Entities.Migrations;

[EntityKind(EntityKind.System, EntityData.Transactional), TicksColumn(false)]
public class LoadMethodLogEntity : Entity
{
    [StringLengthValidator(Min = 3, Max = 400)]
    public string? MethodName { get; set; }

    [StringLengthValidator(Min = 3, Max = 400)]
    public string? ClassName { get; set; }

    [StringLengthValidator(Min = 3, Max = 400)]
    public string? Description { get; set; }

    public DateTime Start { get; set; }

    public DateTime? End { get; set; }

    static Expression<Func<LoadMethodLogEntity, double?>> DurationExpression =
        log => (double?)(log.End - log.Start)!.Value.TotalMilliseconds;
    [ExpressionField("DurationExpression"), Unit("ms")]
    public double? Duration
    {
        get { return End == null ? null : DurationExpression.Evaluate(this); }
    }

    public Lite<ExceptionEntity>? Exception { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => MethodName!);
}
