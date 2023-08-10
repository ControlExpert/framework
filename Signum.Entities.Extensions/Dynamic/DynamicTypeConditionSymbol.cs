﻿
namespace Signum.Entities.Dynamic;

[EntityKind(EntityKind.Shared, EntityData.Transactional)]
public class DynamicTypeConditionSymbolEntity : Entity
{
    [StringLengthValidator(Min = 1, Max = 100), IdentifierValidator(IdentifierType.PascalAscii)]
    public string Name { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Name);
}

[AutoInit]
public static class DynamicTypeConditionSymbolOperation
{
    public static readonly ExecuteSymbol<DynamicTypeConditionSymbolEntity> Save;
}

