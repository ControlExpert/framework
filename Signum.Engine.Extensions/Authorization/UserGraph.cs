using Signum.Entities.Authorization;

namespace Signum.Engine.Authorization;

public class UserGraph : Graph<UserEntity, UserState>
{
    public static void Register()
    {
        GetState = u => u.State;

        new Construct(UserOperation.Create)
        {
            ToStates = { UserState.New },
            Construct = args => new UserEntity { State = UserState.New }
        }.Register();

        new Execute(UserOperation.Save)
        {
            FromStates = { UserState.Active, UserState.New },
            ToStates = { UserState.Active },
            CanBeNew = true,
            CanBeModified = true,
            Execute = (u, _) => { u.State = UserState.Active; }
        }.Register();

        new Execute(UserOperation.Deactivate)
        {
            FromStates = { UserState.Active },
            ToStates = { UserState.Deactivated },
            Execute = (u, _) =>
            {
                u.DisabledOn = Clock.Now;
                u.State = UserState.Deactivated;
            },
        }.Register();

        new Execute(UserOperation.Reactivate)
        {
            FromStates = { UserState.Deactivated },
            ToStates = { UserState.Active },
            Execute = (u, _) =>
            {
                u.DisabledOn = null;
                u.State = UserState.Active;
            },
        }.Register();

        new Graph<UserEntity>.Execute(UserOperation.SetPassword)
        {
            Execute = (u, args) =>
            {
                byte[] passwordHash = args.GetArg<byte[]>();
                u.PasswordHash = passwordHash;
            }
        }.Register();

        new Delete(UserOperation.Delete)
        {
            FromStates = { UserState.Deactivated, UserState.Active },
            Delete = (u, _) =>
            {
                u.Delete();
            },
        }.Register();
    }
}
