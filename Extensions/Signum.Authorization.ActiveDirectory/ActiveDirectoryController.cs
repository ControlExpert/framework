using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Signum.API.Filters;
using Signum.Authorization;
using Signum.Authorization.AuthToken;
using Signum.Authorization.Rules;
using Signum.Authorization.ActiveDirectory.Azure;
using Signum.Authorization.ActiveDirectory.Windows;

namespace Signum.Authorization.ActiveDirectory;

[ValidateModelFilter]
public class ActiveDirectoryController : ControllerBase
{
   
    [HttpGet("api/findADUsers")]
    public Task<List<ActiveDirectoryUser>> FindADUsers(string subString, int count, CancellationToken token)
    {
        ActiveDirectoryPermission.InviteUsersFromAD.AssertAuthorized();

        var config = ((ActiveDirectoryAuthorizer)AuthLogic.Authorizer!).GetConfig();
        if (config.Azure_ApplicationID != null)
            return AzureADLogic.FindActiveDirectoryUsers(subString, count, token);

        if (config.DomainName.HasText())
            return WindowsActiveDirectoryLogic.SearchUser(subString);

        throw new InvalidOperationException($"Neither {nameof(config.Azure_ApplicationID)} or {nameof(config.DomainName)} are set in {config.GetType().Name}");
    }


    [HttpPost("api/createADUser")]
    public Lite<UserEntity> CreateADUser([FromBody][Required] ActiveDirectoryUser user)
    {
        ActiveDirectoryPermission.InviteUsersFromAD.AssertAuthorized();

        var config = ((ActiveDirectoryAuthorizer)AuthLogic.Authorizer!).GetConfig();

        if (config.Azure_ApplicationID != null)
            return AzureADLogic.CreateUserFromAD(user).ToLite();

        if (config.DomainName.HasText())
            return WindowsActiveDirectoryLogic.CreateUserFromAD(user).ToLite();

        throw new InvalidOperationException($"Neither {nameof(config.Azure_ApplicationID)} or {nameof(config.DomainName)} are set in {config.GetType().Name}");
    }


    [HttpPost("api/createADGroup")]
    public Lite<ADGroupEntity> CreateADGroup([FromBody][Required] ADGroupRequest groupRequest)
    {
        ActiveDirectoryPermission.InviteUsersFromAD.AssertAuthorized();

        var group = Database.Query<ADGroupEntity>().SingleOrDefault(a => a.Id == groupRequest.Id);
        if (group != null)
            return group.ToLite();

        group = new ADGroupEntity
        {
            DisplayName = groupRequest.DisplayName,
        }.SetId(groupRequest.Id);

        return group.Execute(ADGroupOperation.Save).ToLite();
    }

    public static TimeSpan PictureMaxAge = new TimeSpan(7, 0, 0);


   
    [HttpGet("api/adThumbnailphoto/{username}"), SignumAllowAnonymous]
    public ActionResult GetThumbnail(string username)
    {
        this.Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
        {
            MaxAge = PictureMaxAge,
        };

        using (AuthLogic.Disable())
        {
            var byteArray = WindowsActiveDirectoryLogic.GetProfilePicture(username);

            if (byteArray != null)
            {
                var memStream = new MemoryStream();

                memStream.Write(byteArray);
                memStream.Position = 0;

                var streamResult = new FileStreamResult(memStream, "image/jpeg");

                return streamResult;
            }

            return (ActionResult)new NotFoundResult(); 
        }
    }

    [HttpGet("api/cachedAzureUserPhoto/{size}/{oID}")]
    public async Task<string?> GetCachedUserPhotoUrl(string oId, int size)
    {
        this.Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
        {
            MaxAge = PictureMaxAge,
        };

        var cpp = await CachedProfilePhotoLogic.GetOrCreateCachedPicture(new Guid(oId), size);

        return cpp.Photo?.FullWebPath();
    }

    [HttpGet("api/azureUserPhoto/{size}/{oID}"), SignumAllowAnonymous]
    public Task<ActionResult> GetUserPhoto(string oId, int size)
    {
        this.Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
        {
            MaxAge = PictureMaxAge,
        };

        return AzureADLogic.GetUserPhoto(new Guid(oId), size).ContinueWith(task =>
        {
            if (task.IsFaulted || task.IsCanceled)
                return (ActionResult)new NotFoundResult();

            var photo = task.Result;
            return new FileStreamResult(photo, "image/jpeg");
        });
    }

    public class ADGroupRequest
    {
        public Guid Id; 
        public string DisplayName;
    }
}
