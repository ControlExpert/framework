using Signum.Entities.Scheduler;
using System;
using System.Linq.Expressions;
using Signum.Utilities;

namespace Signum.Entities.Authorization
{
    [Serializable, EntityKind(EntityKind.System, EntityData.Transactional)]
    public class ResetPasswordRequestEntity : Entity
    {
        [UniqueIndex(AvoidAttachToUniqueIndexes = true)]
        public string Code { get; set; }
        
        public UserEntity User { get; set; }

        public DateTime RequestDate { get; set; }

        public bool Used { get; set; }

        private static Expression<Func<ResetPasswordRequestEntity, bool>> IsValidExpression = r =>
            !r.Used && TimeZoneManager.Now < r.RequestDate.AddHours(24);

        [ExpressionField(nameof(IsValidExpression))]
        public bool IsValid => IsValidExpression.Evaluate(this);
    }

    [AutoInit]
    public static class ResetPasswordRequestOperation
    {
        public static readonly ExecuteSymbol<ResetPasswordRequestEntity> Execute;
    }
}
