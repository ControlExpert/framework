using Signum.React.Facades;
using Signum.Entities.Basics;
using Signum.Engine.Basics;
using Signum.React.Filters;
using Microsoft.AspNetCore.Http;

namespace Signum.React.ApiControllers;

public class ReflectionController : ControllerBase
{
    [HttpGet("api/reflection/types"), SignumAllowAnonymous]
    public ActionResult<Dictionary<string, TypeInfoTS>> Types()
    {
        this.Response.GetTypedHeaders().LastModified = ReflectionServer.LastModified;

        var requestHeaders = this.Request.GetTypedHeaders();
        if (requestHeaders.IfModifiedSince.HasValue &&
            (ReflectionServer.LastModified - requestHeaders.IfModifiedSince.Value).TotalSeconds < 1)
        {
            return this.StatusCode(StatusCodes.Status304NotModified);
        }

        return ReflectionServer.GetTypeInfoTS();
    }

    [HttpGet("api/reflection/typeEntity/{typeName}")]
    public TypeEntity? GetTypeEntity(string typeName)
    {
        return TypeLogic.TryGetType(typeName)?.ToTypeEntity();
    }
}
