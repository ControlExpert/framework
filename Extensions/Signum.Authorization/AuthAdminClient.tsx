import * as React from 'react'
import { RouteObject } from 'react-router'
import { ModifiableEntity, EntityPack, is, SearchMessage, Lite, getToString, EntityControlMessage, liteKeyLong, Entity } from '@framework/Signum.Entities';
import { ifError, softCast } from '@framework/Globals';
import { ajaxPost, ajaxGet, ajaxGetRaw, saveFile, ServiceError } from '@framework/Services';
import * as Services from '@framework/Services';
import { EntitySettings } from '@framework/Navigator'
import { tasks, LineBaseProps, LineBaseController } from '@framework/Lines/LineBase'
import { EntityBaseController, FormGroup, TypeContext } from '@framework/Lines'
import * as AppContext from '@framework/AppContext'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import * as QuickLinks from '@framework/QuickLinks'
import { EntityOperationSettings } from '@framework/Operations'
import { PropertyRouteEntity } from '@framework/Signum.Basics'
import { PseudoType, getTypeInfo, OperationInfo, getQueryInfo, GraphExplorer, PropertyRoute, tryGetTypeInfo, getAllTypes, Type, QueryTokenString, QueryKey, getQueryKey, getTypeInfos, symbolNiceName, getSymbol } from '@framework/Reflection'
import * as Operations from '@framework/Operations'
import {
  PropertyAllowed, TypeAllowedBasic, AuthAdminMessage, BasicPermission,
  PermissionRulePack, TypeRulePack, OperationRulePack, PropertyRulePack, QueryRulePack, QueryAllowed, TypeConditionSymbol
} from './Rules/Signum.Authorization.Rules'
import * as OmniboxSpecialAction from '@framework/OmniboxSpecialAction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProfilePhoto, { SmallProfilePhoto, urlProviders } from './Templates/ProfilePhoto';
import { TypeaheadOptions } from '@framework/Components/Typeahead';
import { EntityLink, similarToken } from '@framework/Search';
import UserCircle from './Templates/UserCircle';
import { AuthMessage, RoleEntity, UserEntity, UserLiteModel, UserOperation, UserState } from './Signum.Authorization';
import { QueryDescription, SubTokensOptions, getTokenParents, isFilterCondition } from '@framework/FindOptions';
import { similarTokenToStr } from '@framework/FinderRules';
import { CollectionMessage } from '@framework/Signum.External';
import { useAPI } from '@framework/Hooks';
import { registerChangeLogModule } from '@framework/Basics/ChangeLogClient';

export let types: boolean;
export let properties: boolean;
export let operations: boolean;
export let queries: boolean;
export let permissions: boolean;

export function start(options: { routes: RouteObject[], types: boolean; properties: boolean, operations: boolean, queries: boolean; permissions: boolean }) {

  registerChangeLogModule("Signum.Authorization", () => import("./Changelog"));

  types = options.types;
  properties = options.properties;
  operations = options.operations;
  queries = options.queries;
  permissions = options.permissions;

  AppContext.clearSettingsActions.push(() => urlProviders.clear());

  Navigator.addSettings(new EntitySettings(UserEntity, e => import('./Templates/User'), {
    renderLite: (lite, hl) => {
      if (UserLiteModel.isInstance(lite.model))
        return (
          <span className="d-inline-flex align-items-center"><SmallProfilePhoto user={lite} className="me-1" /><span>{hl.highlight(getToString(lite))}</span></span>
        );

      if (typeof lite.model == "string")
        return hl.highlight(getToString(lite));

      return lite.EntityType;
    }
  }));


  Navigator.addSettings(new EntitySettings(RoleEntity, e => import('./Templates/Role')));
  Operations.addSettings(new EntityOperationSettings(UserOperation.SetPassword, { isVisible: ctx => false }));

  AppContext.clearSettingsActions.push(() => queryAuditorTokens.clear());

  Finder.addSettings({
    queryName: UserEntity,
    defaultFilters: [
      {
        groupOperation: "Or",
        pinned: { label: SearchMessage.Search.niceToString(), splitValue: true, active: "WhenHasValue" },
        filters: [
          { token: "Entity.ToString", operation: "Contains" },
          { token: "Entity.Id", operation: "EqualTo" },
          { token: UserEntity.token(a => a.userName), operation: "Contains" },
        ]
      },
      {
        token: UserEntity.token(a => a.state),
        value: UserState.value("Active"),
        pinned: { label: () => AuthMessage.OnlyActive.niceToString(), column: 1, active: "Checkbox_Checked" },
      },
    ],
    entityFormatter: new Finder.EntityFormatter(({ row, searchControl: sc }) => !row.entity || !Navigator.isViewable(row.entity.EntityType, { isSearch: "main" }) ? undefined : <EntityLink lite={row.entity}
      inSearch="main"
      onNavigated={sc?.handleOnNavigated}
      getViewPromise={sc && (sc.props.getViewPromise ?? sc.props.querySettings?.getViewPromise)}
      inPlaceNavigation={sc?.props.view == "InPlace"} className="sf-line-button sf-view">
      <div title={EntityControlMessage.View.niceToString()} className="d-inline-flex align-items-center">
        <SmallProfilePhoto user={row.entity as Lite<UserEntity>} className="me-1" />
        {EntityBaseController.getViewIcon()}
      </div>
    </EntityLink>)
  });

  Finder.addSettings({
    queryName: RoleEntity,
    defaultFilters: [
      {
        groupOperation: "Or",
        pinned: { label: SearchMessage.Search.niceToString(), splitValue: true, active: "WhenHasValue" },
        filters: [
          { token: "Entity.Id", operation: "EqualTo" },
          { token: "Entity.ToString", operation: "Contains" },
        ]
      },
      {
        token: RoleEntity.token(a => a.entity.isTrivialMerge),
        value: false,
        pinned: { active: "NotCheckbox_Unchecked", label: () => AuthMessage.IncludeTrivialMerges.niceToString(), column: 1 }
      }
    ],
    extraButtons: scl => [AppContext.isPermissionAuthorized(BasicPermission.AdminRules) && {
      order: -1,
      button: <button className="btn btn-info"
        onClick={e => { e.preventDefault(); API.downloadAuthRules(); }}>
        <FontAwesomeIcon icon="download" /> Download AuthRules.xml
      </button>
    }]
  });

  if (options.properties) {
    tasks.push(taskAuthorizeProperties);
    GraphExplorer.TypesLazilyCreated.push(PropertyRouteEntity.typeName);
    Navigator.addSettings(new EntitySettings(PropertyRulePack, e => import('./Rules/PropertyRulePackControl')));
  }

  if (options.types) {
    Navigator.isCreableEvent.push(navigatorIsCreable);
    Navigator.isReadonlyEvent.push(navigatorIsReadOnly);
    Navigator.isViewableEvent.push(navigatorIsViewable);
    Operations.Options.maybeReadonly = ti => ti.maxTypeAllowed == "Write" && ti.minTypeAllowed != "Write";
    Navigator.addSettings(new EntitySettings(TypeRulePack, e => import('./Rules/TypeRulePackControl')));

    QuickLinks.registerQuickLink(RoleEntity, new QuickLinks.QuickLinkAction("types", () => AuthAdminMessage.TypeRules.niceToString(),  (ctx, e) => API.fetchTypeRulePack(ctx.lite.id!)
          .then(pack => Navigator.view(pack, { buttons: "close", readOnly: ctx.widgetContext?.ctx.value.isTrivialMerge == true ? true : undefined })), {
      isVisible: AppContext.isPermissionAuthorized(BasicPermission.AdminRules), icon: "shield-halved", iconColor: "red", color: "danger", group: null
    }));

    getAllTypes().filter(a => a.queryAuditors != null)
      .forEach(t => {
        Finder.getOrAddSettings(t).noResultMessage = sc => {

          var fo = sc.state.resultFindOptions!;

          var tokens = queryAuditorTokens.filter(a => fo.queryKey == a.queryKey && t.queryAuditors.contains(a.typeCondition.key));

          var type = getTypeInfos(sc.props.queryDescription.columns["Entity"].type).map(ti => <strong>{ti.nicePluralName}</strong>).joinCommaHtml(CollectionMessage.Or.niceToString());
          
          if (tokens.length == 0) {
            if (!fo.filterOptions.some(f => isFilterCondition(f) && f.operation == "EqualTo")) {
              var symbols = t.queryAuditors.map(a => <strong>{a}</strong>).joinCommaHtml(CollectionMessage.And.niceToString());
              return (
                <span className="text-warning">
                  <FontAwesomeIcon icon="hand" /> {SearchMessage.NoResultsFoundBecauseTheRule0DoesNotAllowedToExplore1WithoutFilteringFirst.niceToString().formatHtml(symbols, type)}
                </span>
              );
  }

            return undefined;
          } else {
            if (!fo.filterOptions.some(f => isFilterCondition(f) && f.operation == "EqualTo" && tokens.some(t => similarToken(f.token?.fullKey, t.token)))) {
              var tokenCode = tokens.map(a => <strong><QuerytokenRenderer token={a.token} queryKey={fo.queryKey} /></strong>).joinCommaHtml(CollectionMessage.Or.niceToString());
              return (
                <span className="text-warning">
                  <FontAwesomeIcon icon="hand" /> {SearchMessage.NoResultsFoundBecauseYouAreNotAllowedToExplore0WithoutFilteringBy1First.niceToString().formatHtml(type, tokenCode)}
                </span>
              );
            }
            return undefined;
          }
        }
      });
  }

  if (options.operations) {
    Navigator.addSettings(new EntitySettings(OperationRulePack, e => import('./Rules/OperationRulePackControl')));
  }

  if (options.queries) {
    Finder.isFindableEvent.push(queryIsFindable);

    Navigator.addSettings(new EntitySettings(QueryRulePack, e => import('./Rules/QueryRulePackControl')));
  }

  if (options.permissions) {

    Navigator.addSettings(new EntitySettings(PermissionRulePack, e => import('./Rules/PermissionRulePackControl')));

    QuickLinks.registerQuickLink(RoleEntity, new QuickLinks.QuickLinkAction("permissions", () => AuthAdminMessage.PermissionRules.niceToString(), (ctx, e) => API.fetchPermissionRulePack(ctx.lite.id!)
      .then(pack => Navigator.view(pack, { buttons: "close", readOnly: ctx.widgetContext?.ctx.value.isTrivialMerge == true ? true : undefined })),
      {
        isVisible: AppContext.isPermissionAuthorized(BasicPermission.AdminRules), icon: "shield-halved", iconColor: "orange", color: "warning", group: null
      }
    ));
  }

  OmniboxSpecialAction.registerSpecialAction({
    allowed: () => AppContext.isPermissionAuthorized(BasicPermission.AdminRules),
    key: "DownloadAuthRules",
    onClick: () => { API.downloadAuthRules(); return Promise.resolve(undefined); }
  });

  PropertyRoute.prototype.canModify = function () {
    return this.member != null && this.member.propertyAllowed == "Write"
  }
}

const queryAuditorTokens: { queryKey: string; token: string; typeCondition: TypeConditionSymbol }[] = []; 

export function registerQueryAuditorToken<T extends Entity>(queryName: Type<T> | QueryKey, token: QueryTokenString<any> | string, typeCondition: TypeConditionSymbol) {
  queryAuditorTokens.push({ queryKey: getQueryKey(queryName), token: token.toString(), typeCondition: typeCondition });
}

export function queryIsFindable(queryKey: string, fullScreen: boolean) {
  var allowed = getQueryInfo(queryKey).queryAllowed;

  return allowed == "Allow" || allowed == "EmbeddedOnly" && !fullScreen;
}

export function taskAuthorizeProperties(lineBase: LineBaseController<LineBaseProps>, state: LineBaseProps) {
  if (state.ctx.propertyRoute &&
    state.ctx.propertyRoute.propertyRouteType == "Field") {

    const member = state.ctx.propertyRoute.member;

    switch (member!.propertyAllowed) {
      case "None":
        //state.visible = false;  //None is just not retuning the member info, LineBaseController.isHidden
        break;
      case "Read":
        state.ctx.readOnly = true;
        break;
      case "Write":
        break;
    }
  }
}

export function navigatorIsReadOnly(typeName: PseudoType, entityPack?: EntityPack<ModifiableEntity>, options?: Navigator.IsReadonlyOptions) {

  if (options?.isEmbedded)
    return false;

  const ti = tryGetTypeInfo(typeName);
  if (ti == undefined)
    return true;

  if (entityPack?.typeAllowed)
    return entityPack.typeAllowed == "None" || entityPack.typeAllowed == "Read";

  return ti.maxTypeAllowed == "None" || ti.maxTypeAllowed == "Read";
}

export function navigatorIsViewable(typeName: PseudoType, entityPack?: EntityPack<ModifiableEntity>, options?: Navigator.IsViewableOptions) {

  if (options?.isEmbedded)
    return true;

  const ti = tryGetTypeInfo(typeName);

  if (ti == undefined)
    return false;

  if (entityPack?.typeAllowed)
    return entityPack.typeAllowed != "None";

  return ti.maxTypeAllowed != "None";
}

export function navigatorIsCreable(typeName: PseudoType, options?: Navigator.IsCreableOptions) {

  if (options?.isEmbedded)
    return true;

  const ti = tryGetTypeInfo(typeName);

  return ti != null && ti.maxTypeAllowed == "Write";
}

export module API {

  export function fetchPermissionRulePack(roleId: number | string): Promise<PermissionRulePack> {
    return ajaxGet({ url: "/api/authAdmin/permissionRules/" + roleId, cache: "no-cache" });
  }

  export function savePermissionRulePack(rules: PermissionRulePack): Promise<void> {
    return ajaxPost({ url: "/api/authAdmin/permissionRules" }, rules);
  }


  export function fetchTypeRulePack(roleId: number | string): Promise<TypeRulePack> {
    return ajaxGet({ url: "/api/authAdmin/typeRules/" + roleId, cache: "no-cache" });
  }

  export function saveTypeRulePack(rules: TypeRulePack): Promise<void> {
    return ajaxPost({ url: "/api/authAdmin/typeRules" }, rules);
  }


  export function fetchPropertyRulePack(typeName: string, roleId: number | string): Promise<PropertyRulePack> {
    return ajaxGet({ url: "/api/authAdmin/propertyRules/" + typeName + "/" + roleId, cache: "no-cache" });
  }

  export function savePropertyRulePack(rules: PropertyRulePack): Promise<void> {
    return ajaxPost({ url: "/api/authAdmin/propertyRules" }, rules);
  }



  export function fetchOperationRulePack(typeName: string, roleId: number | string): Promise<OperationRulePack> {
    return ajaxGet({ url: "/api/authAdmin/operationRules/" + typeName + "/" + roleId, cache: "no-cache" });
  }

  export function saveOperationRulePack(rules: OperationRulePack): Promise<void> {
    return ajaxPost({ url: "/api/authAdmin/operationRules" }, rules);
  }



  export function fetchQueryRulePack(typeName: string, roleId: number | string): Promise<QueryRulePack> {
    return ajaxGet({ url: "/api/authAdmin/queryRules/" + typeName + "/" + roleId, cache: "no-cache" });
  }

  export function saveQueryRulePack(rules: QueryRulePack): Promise<void> {
    return ajaxPost({ url: "/api/authAdmin/queryRules" }, rules);
  }



  export function downloadAuthRules(): void {
    ajaxGetRaw({ url: "/api/authAdmin/downloadAuthRules" })
      .then(response => saveFile(response));
  }

  export function trivialMergeRole(rule: Lite<RoleEntity>[]): Promise<Lite<RoleEntity>> {
    return ajaxPost({ url: "/api/authAdmin/trivialMergeRole" }, rule);
  }
}

declare module '@framework/Reflection' {

  export interface TypeInfo {
    minTypeAllowed: TypeAllowedBasic;
    maxTypeAllowed: TypeAllowedBasic;
    queryAuditors: string[];
    queryAllowed: QueryAllowed;
  }

  export interface MemberInfo {
    propertyAllowed: PropertyAllowed;
    queryAllowed: QueryAllowed;
  }

  export interface PropertyRoute {
    canModify(): boolean;
  }
}

declare module '@framework/Signum.Entities' {

  export interface EntityPack<T extends ModifiableEntity> {
    typeAllowed?: TypeAllowedBasic;
  }
}

export function QuerytokenRenderer(p: { queryKey: string, token: string, subTokenOptions?: SubTokensOptions }) {
  var token = useAPI(() => Finder.parseSingleToken(p.queryKey, p.token, p.subTokenOptions ?? (SubTokensOptions.CanElement | SubTokensOptions.CanAnyAll)), [p.queryKey, p.token, p.subTokenOptions]);

  return getTokenParents(token).map(a => <strong>[{a.niceName}]</strong>).joinCommaHtml(".");
}

