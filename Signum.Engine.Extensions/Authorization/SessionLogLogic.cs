using Signum.Entities.Authorization;
using Signum.Entities.Basics;

namespace Signum.Engine.Authorization;

public static class SessionLogLogic
{
    public static bool IsStarted { get; private set; }

    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
        {
            AuthLogic.AssertStarted(sb);

            sb.Include<SessionLogEntity>()
                .WithQuery(() => sl => new
                {
                    Entity = sl,
                    sl.Id,
                    sl.User,
                    sl.SessionStart,
                    sl.SessionEnd,
                    sl.SessionTimeOut
                });

            PermissionAuthLogic.RegisterPermissions(SessionLogPermission.TrackSession);

            ExceptionLogic.DeleteLogs += ExceptionLogic_DeleteLogs;

            IsStarted = true;
        }
    }

    public static void ExceptionLogic_DeleteLogs(DeleteLogParametersEmbedded parameters, StringBuilder sb, CancellationToken token)
    {
        var dateLimit = parameters.GetDateLimitDelete(typeof(SessionLogEntity).ToTypeEntity());
        if (dateLimit != null)
            Database.Query<SessionLogEntity>().Where(a => a.SessionStart < dateLimit.Value).UnsafeDeleteChunksLog(parameters, sb, token);
    }

    static bool RoleTracked(Lite<RoleEntity> role)
    {
        return SessionLogPermission.TrackSession.IsAuthorized(role);
    }

    public static void SessionStart(string userHostAddress, string? userAgent)
    {
        if (SessionLogLogic.RoleTracked(RoleEntity.Current))
        {
            using (AuthLogic.Disable())
            {
                new SessionLogEntity
                {
                    User = UserEntity.Current,
                    SessionStart = Clock.Now.TrimToSeconds(),
                    UserHostAddress = userHostAddress,
                    UserAgent = userAgent
                }.Save();
            }
        }
    }

    public static void SessionEnd(UserEntity user, TimeSpan? timeOut)
    {
        if (user == null || !RoleTracked(user.Role))
            return;

        using (AuthLogic.Disable())
        {
            var sessionEnd = timeOut.HasValue ? Clock.Now.Subtract(timeOut.Value).TrimToSeconds() : Clock.Now.TrimToSeconds();

            var rows = Database.Query<SessionLogEntity>()
                .Where(sl => sl.User.Is(user))
                .OrderByDescending(sl => sl.SessionStart)
                .Take(1)
                .Where(sl => sl.SessionEnd == null)
                .UnsafeUpdate()
                .Set(a => a.SessionEnd, a => sessionEnd)
                .Set(a => a.SessionTimeOut, a => timeOut.HasValue)
                .Execute();
        }
    }
}
