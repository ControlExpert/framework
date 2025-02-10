using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;
using System.DirectoryServices.AccountManagement;
using Signum.Utilities.Reflection;

namespace Signum.Authorization.ActiveDirectory.WindowsAuthentication;

#pragma warning disable CA1416 // Validate platform compatibility

public class WindowsAuthenticationServer
{
    private static PrincipalContext GetPrincipalContext(WindowsActiveDirectoryEmbedded windowsAD)
    {
        if (windowsAD.DirectoryRegistry_Username.HasText())
            return new PrincipalContext(ContextType.Domain, windowsAD.DomainName, windowsAD.DirectoryRegistry_Username, windowsAD.DirectoryRegistry_Password);

        return new PrincipalContext(ContextType.Domain, windowsAD.DomainName); //Uses current user
    }

    public static bool LoginWindowsAuthentication(ActionContext ac, bool throwError)
    {
        using (AuthLogic.Disable())
        {
            try
            {
                if (!(ac.HttpContext.User is WindowsPrincipal wp))
                    return throwError ? throw new InvalidOperationException($"User is not a WindowsPrincipal ({ac.HttpContext.User.GetType().Name})")
                        : false;

                if (AuthLogic.Authorizer is not ActiveDirectoryAuthorizer ada)
                    return throwError ? throw new InvalidOperationException("No AuthLogic.Authorizer set")
                        : false;

                var config = ada.GetConfig();
                var windows = config.WindowsAD;

                if (windows == null)
                {
                    if (throwError)
                        throw new Exception($"{ReflectionTools.GetPropertyInfo((ActiveDirectoryConfigurationEmbedded ac) => ac.WindowsAD)} is not set");

                    return false;
                }

                if (!windows.LoginWithWindowsAuthenticator)
                {
                    if (throwError)
                        throw new Exception($"{ReflectionTools.GetPropertyInfo((WindowsActiveDirectoryEmbedded e) => e.LoginWithWindowsAuthenticator)} is set to false");
                    return false;
                }

                var userName = wp.Identity.Name!; ;
                var localName = userName.TryBeforeLast('@') ?? userName.TryAfter('\\') ?? userName;


                var sid = ((WindowsIdentity)wp.Identity).User!.Value;

                UserEntity? user = Database.Query<UserEntity>().SingleOrDefaultEx(a => a.Mixin<UserADMixin>().SID == sid);

                if (user == null)
                {
                    user = Database.Query<UserEntity>().SingleOrDefault(a => a.UserName == userName) ??
                    (config.AllowMatchUsersBySimpleUserName ? Database.Query<UserEntity>().SingleOrDefault(a => a.Email == userName || a.UserName == localName) : null);
                }

                try
                {
                    if (user == null)
                    {
                        if (!config.AutoCreateUsers)
                        {
                            return throwError ? throw new InvalidOperationException("AutoCreateUsers is false") : false;
                        }

                        using (PrincipalContext pc = GetPrincipalContext(windows))
                        {
                            user = Database.Query<UserEntity>().SingleOrDefaultEx(a => a.Mixin<UserADMixin>().SID == sid);

                            if (user == null)
                            {
                                user = ada.OnCreateUser(new DirectoryServiceAutoCreateUserContext(pc, localName, userName));
                            }
                        }
                    }
                    else
                    {
                        if(user.State == UserState.Deactivated)
                            return throwError ? throw new InvalidOperationException(LoginAuthMessage.User0IsDeactivated.NiceToString(user)) : false;

                        if (config.AutoUpdateUsers)
                        {
                            using (PrincipalContext pc = GetPrincipalContext(windows))
                            {
                                ada.UpdateUser(user, new DirectoryServiceAutoCreateUserContext(pc, localName, userName));
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    e.Data["Identity.Name"] = wp.Identity.Name;
                    e.Data["localName"] = localName;

                    throw;
                }

                AuthServer.OnUserPreLogin(ac, user);
                AuthServer.AddUserSession(ac, user);
                return true;
            }
            catch (Exception e)
            {
                e.LogException();

                if (throwError)
                    throw;

                return false;
            }
        }
    }
}

