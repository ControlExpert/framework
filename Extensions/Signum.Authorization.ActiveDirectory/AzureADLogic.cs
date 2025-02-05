using Azure.Core;
using Microsoft.Graph;
using Microsoft.Graph.DeviceManagement.Reports.GetReportFilters;
using Microsoft.Graph.Models;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Identity.Client;
using Signum.Authorization.ActiveDirectory;
using Signum.Authorization;
using Signum.DynamicQuery.Tokens;
using Signum.Scheduler;
using System.Collections.Concurrent;
using System.IO;
using System.Text.Json;
using Signum.API;

namespace Signum.Authorization.ActiveDirectory;

public static class AzureADLogic
{
    public static Func<TokenCredential> GetTokenCredential = () => ((ActiveDirectoryAuthorizer)AuthLogic.Authorizer!).GetConfig().GetTokenCredential();

    public static async Task<List<ActiveDirectoryUser>> FindActiveDirectoryUsers(string subStr, int top, CancellationToken token)
    {
        var tokenCredential = GetTokenCredential();
        GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);

        subStr = subStr.Replace("'", "''");

        var query = subStr.Contains("@") ? $"mail eq '{subStr}'" :
            subStr.Contains(",") ? $"startswith(givenName, '{subStr.After(",").Trim()}') AND startswith(surname, '{subStr.Before(",").Trim()}') OR startswith(displayname, '{subStr.Trim()}')" :
            subStr.Contains(" ") ? $"startswith(givenName, '{subStr.Before(" ").Trim()}') AND startswith(surname, '{subStr.After(" ").Trim()}') OR startswith(displayname, '{subStr.Trim()}')" :
             $"startswith(givenName, '{subStr}') OR startswith(surname, '{subStr}') OR startswith(displayname, '{subStr.Trim()}') OR startswith(mail, '{subStr.Trim()}')";

        var result = await graphClient.Users.GetAsync(req =>
        {
            req.QueryParameters.Top = top;
            req.QueryParameters.Filter = query;
        }, token);

        return result!.Value!.Select(a => new ActiveDirectoryUser
        {
            UPN = a.UserPrincipalName!,
            DisplayName = a.DisplayName!,
            JobTitle = a.JobTitle!,
            ObjectID = Guid.Parse(a.Id!),
            SID = null,
        }).ToList();
    }

    public static TimeSpan CacheADGroupsFor = new TimeSpan(0, minutes: 30, 0);

    static ConcurrentDictionary<Lite<UserEntity>, (DateTime date, List<SimpleGroup> groups)> ADGroupsCache = new ConcurrentDictionary<Lite<UserEntity>, (DateTime date, List<SimpleGroup> groups)>();

    public static List<SimpleGroup> CurrentADGroups()
    {
        var oid = UserADMixin.CurrentOID;
        if (oid == null)
            return new List<SimpleGroup>();

        var tuple = ADGroupsCache.AddOrUpdate(UserEntity.Current,
            addValueFactory: user => (Clock.Now, CurrentADGroupsInternal(oid.Value)),
            updateValueFactory: (user, old) => old.date.Add(CacheADGroupsFor) > Clock.Now ? old : (Clock.Now, CurrentADGroupsInternal(oid.Value)));

        return tuple.groups;
    }

    public static List<SimpleGroup> CurrentADGroupsInternal(Guid oid)
    {
        using (HeavyProfiler.Log("Microsoft Graph", () => "CurrentADGroups for OID: " + oid))
        {
            var tokenCredential = AzureADLogic.GetTokenCredential();
            GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);
            var result = graphClient.Users[oid.ToString()].TransitiveMemberOf.GraphGroup.GetAsync(req => 
            {
                req.QueryParameters.Top = 999;
                req.QueryParameters.Select = new[] { "id", "displayName", "ODataType" };
            }).Result;

            return result!.Value!.Select(di => new SimpleGroup(Guid.Parse(di.Id!), di.DisplayName)).ToList();
        }
    }


    public static void Start(SchemaBuilder sb, bool adGroups, bool deactivateUsersTask)
    {
        if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
        {
            if (MixinDeclarations.IsDeclared(typeof(UserEntity), typeof(UserADMixin)))
            {
                PermissionLogic.RegisterTypes(typeof(ActiveDirectoryPermission));
                

                //As.OverrideExpression

                //[AutoExpressionField]
                //public EmailOwnerData EmailOwnerData => As.Expression(() => new EmailOwnerData
                //{
                //    Owner = this.ToLite(),
                //    CultureInfo = CultureInfo,
                //    DisplayName = UserName,
                //    Email = Email,
                //    AzureUserId = null MixinDeclarations.IsDeclared(typeof(UserEntity), typeof(UserADMixin)) ? this.Mixin<UserADMixin>().OID : null
                //});

                UserWithClaims.FillClaims += (userWithClaims, user) =>
                {
                    var mixin = ((UserEntity)user).Mixin<UserADMixin>();
                    userWithClaims.Claims["OID"] = mixin.OID;
                    userWithClaims.Claims["SID"] = mixin.SID;
                };

                var lambda = As.GetExpression((UserEntity u) => u.ToString());

                if (lambda.Body is MemberExpression me && me.Member is PropertyInfo pi && pi.Name == nameof(UserEntity.UserName))
                {
                    Lite.RegisterLiteModelConstructor((UserEntity u) => new UserLiteModel
                    {
                        UserName = u.UserName,
                        ToStringValue = null,
                        OID = u.Mixin<UserADMixin>().OID,
                        SID = u.Mixin<UserADMixin>().SID,
                    });
                }
                else
                {
                    Lite.RegisterLiteModelConstructor((UserEntity u) => new UserLiteModel
                    {
                        UserName = u.UserName,
                        ToStringValue = u.ToString(),
                        OID = u.Mixin<UserADMixin>().OID,
                        SID = u.Mixin<UserADMixin>().SID,
                    });
                }

            }

            if (deactivateUsersTask)
            {
                SimpleTaskLogic.Register(ActiveDirectoryTask.DeactivateUsers, stc =>
                {
                    var list = Database.Query<UserEntity>().Where(u => u.Mixin<UserADMixin>().OID != null).ToList();

                    var tokenCredential = GetTokenCredential();
                    GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);
                    stc.ForeachWriting(list.Chunk(10), gr => gr.Length + " user(s)...", gr =>
                    {
                        var filter = gr.Select(a => "id eq '" + a.Mixin<UserADMixin>().OID + "'").Combined(FilterGroupOperation.Or);
                        var users = graphClient.Users.GetAsync(r =>
                        {
                            r.QueryParameters.Select = new[] { "id", "accountEnabled" };
                        }).Result;

                        var isEnabledDictionary = users!.Value!.ToDictionary(a => Guid.Parse(a.Id!), a => a.AccountEnabled!.Value);

                        foreach (var u in gr)
                        {
                            if (u.State == UserState.Active && !isEnabledDictionary.GetOrThrow(u.Mixin<UserADMixin>().OID!.Value))
                            {
                                stc.StringBuilder.AppendLine($"User {u.Id} ({u.UserName}) with OID {u.Mixin<UserADMixin>().OID} has been deactivated in Azure AD");
                                u.Execute(UserOperation.Deactivate);
                            }
                        }
                    });

                    return null;
                });
            }

            if (adGroups)
            {

                sb.Include<ADGroupEntity>()
                    .WithQuery(() => e => new
                    {
                        Entity = e,
                        e.Id,
                        e.DisplayName
                    });

                Schema.Current.OnMetadataInvalidated += () => ADGroupsCache.Clear();

                new Graph<ADGroupEntity>.Execute(ADGroupOperation.Save)
                {
                    CanBeNew = true,
                    CanBeModified = true,
                    Execute = (e, _) =>
                    {
                        if (e.IsNew && e.IdOrNull != null)
                            Administrator.SaveDisableIdentity(e);
                    },
                }.Register();

                new Graph<ADGroupEntity>.Delete(ADGroupOperation.Delete)
                {
                    Delete = (e, _) => e.Delete(),
                }.Register();


            

                QueryLogic.Queries.Register(UserADQuery.ActiveDirectoryUsers, () => DynamicQueryCore.Manual(async (request, queryDescription, cancellationToken) =>
                 {
                     using (HeavyProfiler.Log("Microsoft Graph", () => "ActiveDirectoryUsers"))
                     {
                         var tokenCredential = GetTokenCredential();
                         GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);

                         var inGroup = (FilterCondition?)request.Filters.Extract(f => f is FilterCondition fc && fc.Token.Key == "InGroup" && fc.Operation == FilterOperation.EqualTo).SingleOrDefaultEx();


                         UserCollectionResponse response;
                         if (inGroup?.Value is Lite<ADGroupEntity> group)
                         {
                             response = (await graphClient.Groups[group.Id.ToString()].TransitiveMembers.GraphUser.GetAsync(req =>
                             {
                                 req.QueryParameters.Filter = GetFilters(request.Filters);
                                 req.QueryParameters.Search = GetSearch(request.Filters);
                                 req.QueryParameters.Select = GetSelect(request.Columns);
                                 req.QueryParameters.Orderby = GetOrderBy(request.Orders);
                                 req.QueryParameters.Top = GetTop(request.Pagination);
                                 req.QueryParameters.Count = true;
                                 req.Headers.Add("ConsistencyLevel", "eventual");
                             }))!;
                         }
                         else
                         {
                             response = (await graphClient.Users.GetAsync(req =>
                             {
                                 req.QueryParameters.Filter = GetFilters(request.Filters);
                                 req.QueryParameters.Search = GetSearch(request.Filters);
                                 req.QueryParameters.Select = GetSelect(request.Columns);
                                 req.QueryParameters.Orderby = GetOrderBy(request.Orders);
                                 req.QueryParameters.Top = GetTop(request.Pagination);
                                 req.QueryParameters.Count = true;
                                 req.Headers.Add("ConsistencyLevel", "eventual");
                             }))!;
                         }

                         var skip = request.Pagination is Pagination.Paginate p ? (p.CurrentPage - 1) * p.ElementsPerPage : 0;

                         return response.Value!.Skip(skip).Select(u => new
                         {
                             Entity = (Lite<Entities.Entity>?)null,
                             u.Id,
                             u.DisplayName,
                             u.UserPrincipalName,
                             u.Mail,
                             u.GivenName,
                             u.Surname,
                             u.JobTitle,
                             u.Department,
                             u.OfficeLocation,
                             u.EmployeeType,
                             OnPremisesExtensionAttributes = u.OnPremisesExtensionAttributes?.Let(ea => new OnPremisesExtensionAttributesModel
                             {
                                 ExtensionAttribute1 = ea.ExtensionAttribute1,
                                 ExtensionAttribute2 = ea.ExtensionAttribute2,
                                 ExtensionAttribute3 = ea.ExtensionAttribute3,
                                 ExtensionAttribute4 = ea.ExtensionAttribute4,
                                 ExtensionAttribute5 = ea.ExtensionAttribute5,
                                 ExtensionAttribute6 = ea.ExtensionAttribute6,
                                 ExtensionAttribute7 = ea.ExtensionAttribute7,
                                 ExtensionAttribute8 = ea.ExtensionAttribute8,
                                 ExtensionAttribute9 = ea.ExtensionAttribute9,
                                 ExtensionAttribute10 = ea.ExtensionAttribute10,
                                 ExtensionAttribute11 = ea.ExtensionAttribute11,
                                 ExtensionAttribute12 = ea.ExtensionAttribute12,
                                 ExtensionAttribute13 = ea.ExtensionAttribute13,
                                 ExtensionAttribute14 = ea.ExtensionAttribute14,
                                 ExtensionAttribute15 = ea.ExtensionAttribute15,
                             }),
                             u.OnPremisesImmutableId,
                             u.CompanyName,
                             u.CreationType,
                             u.AccountEnabled,
                             InGroup = (Lite<ADGroupEntity>?)null,
                         }).ToDEnumerable(queryDescription).Select(request.Columns).WithCount((int?)response.OdataCount);
                     }
                 })
                .Column(a => a.Entity, c => c.Implementations = Implementations.By())
                .ColumnDisplayName(a => a.Id, () => ActiveDirectoryMessage.Id.NiceToString())
                .ColumnDisplayName(a => a.DisplayName, () => ActiveDirectoryMessage.DisplayName.NiceToString())
                .ColumnDisplayName(a => a.Mail, () => ActiveDirectoryMessage.Mail.NiceToString())
                .ColumnDisplayName(a => a.GivenName, () => ActiveDirectoryMessage.GivenName.NiceToString())
                .ColumnDisplayName(a => a.Surname, () => ActiveDirectoryMessage.Surname.NiceToString())
                .ColumnDisplayName(a => a.JobTitle, () => ActiveDirectoryMessage.JobTitle.NiceToString())
                .ColumnDisplayName(a => a.OnPremisesExtensionAttributes, () => ActiveDirectoryMessage.OnPremisesExtensionAttributes.NiceToString())
                .ColumnDisplayName(a => a.OnPremisesImmutableId, () => ActiveDirectoryMessage.OnPremisesImmutableId.NiceToString())
                .ColumnDisplayName(a => a.CompanyName, () => ActiveDirectoryMessage.CompanyName.NiceToString())
                .ColumnDisplayName(a => a.AccountEnabled, () => ActiveDirectoryMessage.AccountEnabled.NiceToString())
                .Column(a => a.InGroup, c => { c.Implementations = Implementations.By(typeof(ADGroupEntity)); c.OverrideDisplayName = () => ActiveDirectoryMessage.InGroup.NiceToString(); })
                ,
                Implementations.By());

                QueryLogic.Queries.Register(UserADQuery.ActiveDirectoryGroups, () => DynamicQueryCore.Manual(async (request, queryDescription, cancellationToken) =>
                {
                    using (HeavyProfiler.Log("Microsoft Graph", () => "ActiveDirectoryGroups"))
                    {
                        var tokenCredential = GetTokenCredential();
                        GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);

                        var inGroup = (FilterCondition?)request.Filters.Extract(f => f is FilterCondition fc && fc.Token.Key == "HasUser" && fc.Operation == FilterOperation.EqualTo).SingleOrDefaultEx();


                        GroupCollectionResponse response;
                        if (inGroup?.Value is Lite<UserEntity> user)
                        {
                            var oid = user.InDB(a => a.Mixin<UserADMixin>().OID);
                            if (oid == null)
                                throw new InvalidOperationException($"User {user} has no OID");

                            response = (await graphClient.Users[oid.ToString()].TransitiveMemberOf.GraphGroup.GetAsync(req =>
                            {
                                req.QueryParameters.Filter = GetFilters(request.Filters);
                                req.QueryParameters.Search = GetSearch(request.Filters);
                                req.QueryParameters.Select = GetSelect(request.Columns);
                                req.QueryParameters.Orderby = GetOrderBy(request.Orders);
                                req.QueryParameters.Top = GetTop(request.Pagination);
                                req.QueryParameters.Count = true;
                                req.Headers.Add("ConsistencyLevel", "eventual");
                            }))!;
                        }
                        else
                        {
                            response = (await graphClient.Groups.GetAsync(req =>
                            {
                                req.QueryParameters.Filter = GetFilters(request.Filters);
                                req.QueryParameters.Search = GetSearch(request.Filters);
                                req.QueryParameters.Select = GetSelect(request.Columns);
                                req.QueryParameters.Orderby = GetOrderBy(request.Orders);
                                req.QueryParameters.Top = GetTop(request.Pagination);
                                req.QueryParameters.Count = true;
                                req.Headers.Add("ConsistencyLevel", "eventual");
                            }))!;
                        }
             
                        var skip = request.Pagination is Pagination.Paginate p ? (p.CurrentPage - 1) * p.ElementsPerPage : 0;

                        return response.Value!.Skip(skip).Select(u => new
                        {
                            Entity = (Lite<Entities.Entity>?)null,
                            u.Id,
                            u.DisplayName,
                            u.Description,
                            u.SecurityEnabled,
                            u.Visibility,
                            HasUser = (Lite<UserEntity>?)null,
                        }).ToDEnumerable(queryDescription).Select(request.Columns).WithCount((int?)response.OdataCount);
                    }
                })
                .Column(a => a.Entity, c => c.Implementations = Implementations.By())
                .ColumnDisplayName(a => a.Id, () => ActiveDirectoryMessage.Id.NiceToString())
                .ColumnDisplayName(a => a.DisplayName, () => ActiveDirectoryMessage.DisplayName.NiceToString())
                .ColumnDisplayName(a => a.Description, () => ActiveDirectoryMessage.Description.NiceToString())
                .ColumnDisplayName(a => a.SecurityEnabled, () => ActiveDirectoryMessage.SecurityEnabled.NiceToString())
                .ColumnDisplayName(a => a.Visibility, () => ActiveDirectoryMessage.Visibility.NiceToString())
                .Column(a => a.HasUser, c => { c.Implementations = Implementations.By(typeof(UserEntity)); c.OverrideDisplayName = () => ActiveDirectoryMessage.HasUser.NiceToString(); })
                ,
                Implementations.By());
            }
            else
            {
                if (sb.WebServerBuilder != null)
                    ReflectionServer.RegisterLike(typeof(OnPremisesExtensionAttributesModel), () => false);
            }

        }
    }

    private static string[]? GetOrderBy(List<Order> orders)
    {
        return orders.Select(c => ToGraphField(c.Token) + " " + (c.OrderType == OrderType.Ascending ? "asc" : "desc")).ToArray();
    }

    static string ToGraphField(QueryToken token, bool simplify = false)
    {
        var field = token.FullKey().Split(".").ToString(a => a.FirstLower(), "/");

        if (simplify)
            return field.TryBefore("/") ?? field;

        return field;
    }


    private static string ToStringValue(object? value)
    {
        return value is string str ? $"'{str}'" :
            value is DateOnly date ? $"'{date.ToIsoString()}'" :
            value is DateTime dt ? $"'{dt.ToIsoString()}'" :
            value is DateTimeOffset dto ? $"'{dto.DateTime.ToIsoString()}'" :
            value is Guid guid ? $"'{guid}'" :
            value is bool b ? b.ToString().ToLower() :
            value?.ToString() ?? "";
    }

    private static string? GetFilters(List<Filter> filters)
    {
        return filters.Select(f => ToFilter(f)).Combined(FilterGroupOperation.And);
    }

    static string? ToFilter(Filter f)
    {
        if (f is FilterCondition fc)
        {
            return fc.Operation switch
            {
                FilterOperation.EqualTo => ToGraphField(fc.Token) + " eq " + ToStringValue(fc.Value),
                FilterOperation.DistinctTo => ToGraphField(fc.Token) + " ne " + ToStringValue(fc.Value),
                FilterOperation.GreaterThan => ToGraphField(fc.Token) + " gt " + ToStringValue(fc.Value),
                FilterOperation.GreaterThanOrEqual => ToGraphField(fc.Token) + " ge " + ToStringValue(fc.Value),
                FilterOperation.LessThan => ToGraphField(fc.Token) + " lt " + ToStringValue(fc.Value),
                FilterOperation.LessThanOrEqual => ToGraphField(fc.Token) + " le " + ToStringValue(fc.Value),
                FilterOperation.Contains => null,
                FilterOperation.NotContains => "NOT (" + ToGraphField(fc.Token) + ":" + ToStringValue(fc.Value) + ")",
                FilterOperation.StartsWith => "startswith(" + ToGraphField(fc.Token) + "," + ToStringValue(fc.Value) + ")",
                FilterOperation.EndsWith => "endswith(" + ToGraphField(fc.Token) + "," + ToStringValue(fc.Value) + ")",
                FilterOperation.NotStartsWith => "not startswith(" + ToGraphField(fc.Token) + "," + ToStringValue(fc.Value) + ")",
                FilterOperation.NotEndsWith => "not endswith(" + ToGraphField(fc.Token) + "," + ToStringValue(fc.Value) + ")",
                FilterOperation.IsIn => "(" + ((object[])fc.Value!).ToString(a => ToGraphField(fc.Token) + " eq " + ToStringValue(a), " OR ") + ")",
                FilterOperation.IsNotIn => "not (" + ((object[])fc.Value!).ToString(a => ToGraphField(fc.Token) + " eq " + ToStringValue(a), " OR ") + ")",
                FilterOperation.Like or
                FilterOperation.NotLike or
                _ => throw new InvalidOperationException(fc.Operation + " is not implemented in Microsoft Graph API")
            };
        }
        else if (f is FilterGroup fg)
        {
            return fg.Filters.Select(f2 => ToFilter(f2)).Combined(fg.GroupOperation);
        }
        else
            throw new UnexpectedValueException(f);
    }

    private static string? GetSearch(List<Filter> filters)
    {
        return filters.Select(f => ToSearch(f)).Combined(FilterGroupOperation.And);
    }

    static string? ToSearch(Filter f)
    {
        if (f is FilterCondition fc)
        {
            return fc.Operation switch
            {
                FilterOperation.Contains => "\"" +  ToGraphField(fc.Token) + ":" + fc.Value?.ToString()?.Replace(@"""", @"\""") + "\"",
                _ => null
            };
        }
        else if (f is FilterGroup fg)
        {
            return fg.Filters.Select(f2 => ToSearch(f2)).Combined(fg.GroupOperation);
        }
        else
            throw new UnexpectedValueException(f);
    }


    static string? Combined(this IEnumerable<string?> filterEnumerable, FilterGroupOperation groupOperation)
    {
        var filters = filterEnumerable.ToList();
        var cleanFilters = filters.NotNull().ToList();

        if(groupOperation == FilterGroupOperation.And)
        {
            if (cleanFilters.IsEmpty())
                return null;

            return cleanFilters.ToString(" AND ");
        }
        else
        {
            if (cleanFilters.IsEmpty())
                return null;

            if (cleanFilters.Count != filters.Count)
                throw new InvalidOperationException("Unable to convert filter (mix $filter and $search in an OR");

            if (cleanFilters.Count == 1)
                return cleanFilters.SingleEx();

            return "(" + cleanFilters.ToString(" OR ") + ")";
        }
    }

    private static string[]? GetSelect(List<Column> columns)
    {
        return columns.Select(c => ToGraphField(c.Token, simplify: true)).Distinct().ToArray();
    }

    static int? GetTop(Pagination pagination)
    {
        var top = pagination switch
        {
            Pagination.All => (int?)null,
            Pagination.Firsts f => f.TopElements,
            Pagination.Paginate p => p.ElementsPerPage * p.CurrentPage,
            _ => throw new UnexpectedValueException(pagination)
        };

        return top;
    }

    public static UserEntity CreateUserFromAD(ActiveDirectoryUser adUser)
    {
        var adAuthorizer = (ActiveDirectoryAuthorizer)AuthLogic.Authorizer!;
        var config = adAuthorizer.GetConfig();
        
        var acuCtx = GetMicrosoftGraphContext(adUser);

        using (ExecutionMode.Global())
        {
            using (var tr = new Transaction())
            {
                var user = Database.Query<UserEntity>().SingleOrDefaultEx(a => a.Mixin<UserADMixin>().OID == acuCtx.OID);
                if (user == null)
                {
                    user = Database.Query<UserEntity>().SingleOrDefault(a => a.UserName == acuCtx.UserName) ??
                           (acuCtx.UserName.Contains("@") && config.AllowMatchUsersBySimpleUserName ? Database.Query<UserEntity>().SingleOrDefault(a => a.Email == acuCtx.UserName || a.UserName == acuCtx.UserName.Before("@")) : null);
                }

                if (user != null)
                {
                    adAuthorizer.UpdateUser(user, acuCtx);

                    return user;
                }

                var result = adAuthorizer.OnCreateUser(acuCtx);

                return tr.Commit(result);
            }
        }
    }

    private static MicrosoftGraphCreateUserContext GetMicrosoftGraphContext(ActiveDirectoryUser adUser)
    {
        var tokenCredential = GetTokenCredential();
        GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);
        var msGraphUser = graphClient.Users[adUser.ObjectID.ToString()].GetAsync().Result;

        return new MicrosoftGraphCreateUserContext(msGraphUser!);
    }


    public static Task<MemoryStream> GetUserPhoto(Guid OId, int size)
    {
        var tokenCredential = GetTokenCredential();
        GraphServiceClient graphClient = new GraphServiceClient(tokenCredential);
        int imageSize = 
            size <= 48 ? 48 : 
            size <= 64 ? 64 : 
            size <= 96 ? 96 : 
            size <= 120 ? 120 : 
            size <= 240 ? 240 : 
            size <= 360 ? 360 : 
            size <= 432 ? 432 : 
            size <= 504 ? 504 : 648;

        return graphClient.Users[OId.ToString()].Photos[$"{imageSize}x{imageSize}"].Content.GetAsync().ContinueWith(photo =>
        {
            MemoryStream ms = new MemoryStream();
            photo.Result!.CopyTo(ms);
            return ms;
        }, TaskContinuationOptions.OnlyOnRanToCompletion);
    }
}

public record SimpleGroup(Guid Id, string? DisplayName);

public class MicrosoftGraphCreateUserContext : IAutoCreateUserContext
{
    public MicrosoftGraphCreateUserContext(User user)
    {
        User = user;
    }

    public User User { get; set; }

    public string UserName => User.UserPrincipalName!;
    public string? EmailAddress => User.UserPrincipalName;

    public string FirstName => User.GivenName!;
    public string LastName => User.Surname!;

    public Guid? OID => Guid.Parse(User.Id!);

    public string? SID => null;
}

public class ActiveDirectoryUser
{
    public required string DisplayName;
    public required string UPN;
    public required Guid? ObjectID;
    public required string JobTitle;
    public required string? SID;
}
