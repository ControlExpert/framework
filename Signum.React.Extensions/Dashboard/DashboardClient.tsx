import * as React from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { ajaxGet, ajaxPost } from '@framework/Services';
import * as Constructor from '@framework/Constructor';
import { EntitySettings } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import * as Operations from '@framework/Operations'
import * as AppContext from '@framework/AppContext'
import * as Finder from '@framework/Finder'
import { Entity, Lite, liteKey, toLite, EntityPack, getToString, SelectorMessage } from '@framework/Signum.Entities'
import * as QuickLinks from '@framework/QuickLinks'
import { getTypeName, PseudoType, Type } from '@framework/Reflection'
import { onEmbeddedWidgets, EmbeddedWidget } from '@framework/Frames/Widgets'
import * as AuthClient from '../Authorization/AuthClient'
import * as ChartClient from '../Chart/ChartClient'
import * as UserChartClient from '../Chart/UserChart/UserChartClient'
import * as UserQueryClient from '../UserQueries/UserQueryClient'
import { DashboardPermission, DashboardEntity, ValueUserQueryListPartEntity, LinkListPartEntity, UserChartPartEntity, UserQueryPartEntity, IPartEntity, DashboardMessage, PanelPartEmbedded, UserTreePartEntity, CombinedUserChartPartEntity, CachedQueryEntity, DashboardOperation, TokenEquivalenceGroupEntity } from './Signum.Entities.Dashboard'
import * as UserAssetClient from '../UserAssets/UserAssetClient'
import { ImportRoute } from "@framework/AsyncImport";
import { useAPI } from '@framework/Hooks';
import { ChartPermission } from '../Chart/Signum.Entities.Chart';
import SelectorModal from '@framework/SelectorModal';
import { translated } from '../Translation/TranslatedInstanceTools';
import { DashboardFilterController } from "./View/DashboardFilterController";
import { EntityFrame } from '../../Signum.React/Scripts/TypeContext';
import { CachedQueryJS } from './CachedQueryExecutor';
import { QueryEntity } from '../../Signum.React/Scripts/Signum.Entities.Basics';


export interface PanelPartContentProps<T extends IPartEntity> {
  partEmbedded: PanelPartEmbedded;
  part: T;
  entity?: Lite<Entity>;
  deps?: React.DependencyList;
  filterController: DashboardFilterController;
  cachedQueries: { [userAssetKey: string]: Promise<CachedQueryJS> }
}

interface IconColor {
  icon: IconProp;
  iconColor: string;
}

export interface PartRenderer<T extends IPartEntity> {
  component: () => Promise<React.ComponentType<PanelPartContentProps<T>>>;
  defaultIcon: () => IconColor;
  defaultTitle?: (elenent: T) => string;
  withPanel?: (element: T) => boolean;
  getQueryNames?: (element: T) => QueryEntity[];
  handleTitleClick?: (part: T, entity: Lite<Entity> | undefined, e: React.MouseEvent<any>) => void;
  handleEditClick?: (part: T, entity: Lite<Entity> | undefined, e: React.MouseEvent<any>) => Promise<boolean>;
}


export const partRenderers: { [typeName: string]: PartRenderer<IPartEntity> } = {};

export function start(options: { routes: JSX.Element[] }) {

  UserAssetClient.start({ routes: options.routes });
  UserAssetClient.registerExportAssertLink(DashboardEntity);

  Constructor.registerConstructor(DashboardEntity, () => DashboardEntity.New({ owner: AppContext.currentUser && toLite(AppContext.currentUser) }));

  Navigator.addSettings(new EntitySettings(DashboardEntity, e => import('./Admin/Dashboard')));
  Navigator.addSettings(new EntitySettings(CachedQueryEntity, e => import('./Admin/CachedQuery')));

  Navigator.addSettings(new EntitySettings(ValueUserQueryListPartEntity, e => import('./Admin/ValueUserQueryListPart')));
  Navigator.addSettings(new EntitySettings(LinkListPartEntity, e => import('./Admin/LinkListPart')));
  Navigator.addSettings(new EntitySettings(UserChartPartEntity, e => import('./Admin/UserChartPart')));
  Navigator.addSettings(new EntitySettings(CombinedUserChartPartEntity, e => import('./Admin/CombinedUserChartPart')));
  Navigator.addSettings(new EntitySettings(UserQueryPartEntity, e => import('./Admin/UserQueryPart')));


  Operations.addSettings(new Operations.EntityOperationSettings(DashboardOperation.RegenerateCachedQueries, {
    isVisible: () => false,
    color: "warning",
    icon: "cogs",
    contextual: { isVisible: () => true },
    contextualFromMany: { isVisible: () => true },
  }));

  Finder.addSettings({
    queryName: DashboardEntity,
    defaultOrders: [{ token: DashboardEntity.token(d => d.dashboardPriority), orderType: "Descending" }]
  });

  options.routes.push(<ImportRoute path="~/dashboard/:dashboardId" onImportModule={() => import("./View/DashboardPage")} />);

  registerRenderer(ValueUserQueryListPartEntity, {
    component: () => import('./View/ValueUserQueryListPart').then(a => a.default),
    defaultIcon: () => ({ icon: ["fas", "list"], iconColor: "#21618C" }),
    getQueryNames: p => p.userQueries.map(a => a.element.userQuery?.query).notNull(),
  });
  registerRenderer(LinkListPartEntity, {
    component: () => import('./View/LinkListPart').then(a => a.default),
    defaultIcon: () => ({ icon: ["fas", "list"], iconColor: "#B9770E" })
  });
  registerRenderer(UserChartPartEntity, {
    component: () => import('./View/UserChartPart').then(a => a.default),
    defaultIcon: () => ({ icon: "chart-bar", iconColor: "#6C3483" }),
    defaultTitle: e => translated(e.userChart, uc => uc.displayName),
    getQueryNames: p => [p.userChart?.query].notNull(),
    handleEditClick: !Navigator.isViewable(UserChartPartEntity) || Navigator.isReadOnly(UserChartPartEntity) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        return Navigator.view(p.userChart!).then(e => Boolean(e));
      },
    handleTitleClick: !AuthClient.isPermissionAuthorized(ChartPermission.ViewCharting) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        ev.persist();
        UserChartClient.Converter.toChartRequest(p.userChart!, e)
          .then(cr => ChartClient.Encoder.chartPathPromise(cr, toLite(p.userChart!)))
          .then(path => AppContext.pushOrOpenInTab(path, ev))
          .done();
      },
  });
  registerRenderer(CombinedUserChartPartEntity, {
    component: () => import('./View/CombinedUserChartPart').then(a => a.default),
    defaultIcon: () => ({ icon: "chart-line", iconColor: "#8E44AD" }),
    getQueryNames: p => p.userCharts.map(a => a.element.userChart?.query).notNull(),
    handleEditClick: !Navigator.isViewable(UserChartPartEntity) || Navigator.isReadOnly(UserChartPartEntity) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        return SelectorModal.chooseElement(p.userCharts.map(a => a.element), {
          buttonDisplay: a => a.userChart.displayName ?? "",
          buttonName: a => a.userChart.id!.toString(),
          title: SelectorMessage.SelectAnElement.niceToString(),
          message: SelectorMessage.PleaseSelectAnElement.niceToString()
        })
          .then(lite => lite && Navigator.view(lite!))
          .then(entity => Boolean(entity));
      },
    handleTitleClick: !AuthClient.isPermissionAuthorized(ChartPermission.ViewCharting) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        ev.persist();
        SelectorModal.chooseElement(p.userCharts.map(a => a.element), {
          buttonDisplay: a => a.userChart.displayName ?? "",
          buttonName: a => a.userChart.id!.toString(),
          title: SelectorMessage.SelectAnElement.niceToString(),
          message: SelectorMessage.PleaseSelectAnElement.niceToString()
        }).then(uc => {
          if (uc) {
            UserChartClient.Converter.toChartRequest(uc.userChart, e)
              .then(cr => ChartClient.Encoder.chartPathPromise(cr, toLite(uc.userChart)))
              .then(path => AppContext.pushOrOpenInTab(path, ev))
              .done();
          }
        }).done();
      },
  });

  registerRenderer(UserQueryPartEntity, {
    component: () => import('./View/UserQueryPart').then((a: any) => a.default),
    defaultIcon: () => ({ icon: ["far", "list-alt"], iconColor: "#2E86C1" }),
    defaultTitle: e => translated(e.userQuery, uc => uc.displayName),
    withPanel: p => p.renderMode != "BigValue",
    getQueryNames: p => [p.userQuery?.query].notNull(),
    handleEditClick: !Navigator.isViewable(UserQueryPartEntity) || Navigator.isReadOnly(UserQueryPartEntity) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        return Navigator.view(p.userQuery!).then(uq => Boolean(uq));
      },
    handleTitleClick:
      (p, e, ev) => {
        ev.preventDefault();
        ev.persist();
        UserQueryClient.Converter.toFindOptions(p.userQuery!, e)
          .then(cr => AppContext.pushOrOpenInTab(Finder.findOptionsPath(cr, { userQuery: liteKey(toLite(p.userQuery!)) }), ev))
          .done()
      }
  });


  registerRenderer(UserTreePartEntity, {
    component: () => import('./View/UserTreePart').then((a: any) => a.default),
    defaultIcon: () => ({ icon: ["far", "network-wired"], iconColor: "#B7950B" }),
    withPanel: p => true,
    getQueryNames: p => [p.userQuery?.query].notNull(),
    handleEditClick: !Navigator.isViewable(UserTreePartEntity) || Navigator.isReadOnly(UserTreePartEntity) ? undefined :
      (p, e, ev) => {
        ev.preventDefault();
        return Navigator.view(p.userQuery!).then(uq => Boolean(uq));
      },
    handleTitleClick:
      (p, e, ev) => {
        ev.preventDefault();
        ev.persist();
        UserQueryClient.Converter.toFindOptions(p.userQuery!, e)
          .then(cr => AppContext.pushOrOpenInTab(Finder.findOptionsPath(cr, { userQuery: liteKey(toLite(p.userQuery!)) }), ev))
          .done()
      }
  });

  onEmbeddedWidgets.push(wc => {
    if (!wc.frame.pack.embeddedDashboards)
      return undefined;

    return wc.frame.pack.embeddedDashboards.map(d => {
      return {
        position: d.embeddedInEntity as "Top" | "Tab" | "Bottom",
        embeddedWidget: <DashboardWidget dashboard={d} pack={wc.frame.pack as EntityPack<Entity>} frame={wc.frame} />,
        eventKey: liteKey(toLite(d)),
        title: d.displayName,
      } as EmbeddedWidget;
    });
  });

  QuickLinks.registerGlobalQuickLink(ctx => {
    if (!AuthClient.isPermissionAuthorized(DashboardPermission.ViewDashboard))
      return undefined;

    var promise = ctx.widgetContext ?
      Promise.resolve(ctx.widgetContext.frame.pack.dashboards ?? []) :
      API.forEntityType(ctx.lite.EntityType);

    return promise.then(das =>
      das.map(d => new QuickLinks.QuickLinkAction(liteKey(d), () => d.toStr ?? "", e => {
        AppContext.pushOrOpenInTab(dashboardUrl(d, ctx.lite), e)
      }, { icon: "tachometer-alt", iconColor: "darkslateblue" })));
  });

  QuickLinks.registerQuickLink(DashboardEntity, ctx => new QuickLinks.QuickLinkAction("preview", () => DashboardMessage.Preview.niceToString(),
    e => Navigator.API.fetchAndRemember(ctx.lite)
      .then(db => {
        if (db.entityType == undefined)
          AppContext.pushOrOpenInTab(dashboardUrl(ctx.lite), e);
        else
          Navigator.API.fetchAndRemember(db.entityType)
            .then(t => Finder.find({ queryName: t.cleanName }))
            .then(entity => {
              if (!entity)
                return;

              AppContext.pushOrOpenInTab(dashboardUrl(ctx.lite, entity), e);
            }).done();
      }).done(), { group: null, icon: "eye", iconColor: "blue", color: "info" }));
}

export function home(): Promise<Lite<DashboardEntity> | null> {
  if (!Navigator.isViewable(DashboardEntity))
    return Promise.resolve(null);

  return API.home();
}

export function defaultIcon(type: PseudoType) {
  return partRenderers[getTypeName(type)].defaultIcon();
}

export function getQueryNames(part: IPartEntity) {
  return partRenderers[getTypeName(part)].getQueryNames?.(part) ?? [];
}

export function dashboardUrl(lite: Lite<DashboardEntity>, entity?: Lite<Entity>) {
  return "~/dashboard/" + lite.id + (!entity ? "" : "?entity=" + liteKey(entity));
}

export function registerRenderer<T extends IPartEntity>(type: Type<T>, renderer: PartRenderer<T>) {
  partRenderers[type.typeName] = renderer as PartRenderer<any> as PartRenderer<IPartEntity>;
}

export module API {
  export function forEntityType(type: string): Promise<Lite<DashboardEntity>[]> {
    return ajaxGet({ url: `~/api/dashboard/forEntityType/${type}` });
  }

  export function home(): Promise<Lite<DashboardEntity> | null> {
    return ajaxGet({ url: "~/api/dashboard/home" });
  }

  export function get(dashboard: Lite<DashboardEntity>): Promise<DashboardWithCachedQueries | null> {
    return ajaxPost({ url: "~/api/dashboard/get" }, dashboard);
  }
}

export interface DashboardWithCachedQueries {
  dashboard: DashboardEntity
  cachedQueries: Array<CachedQueryEntity>;
}

declare module '@framework/Signum.Entities' {

  export interface EntityPack<T extends ModifiableEntity> {
    dashboards?: Array<Lite<DashboardEntity>>;
    embeddedDashboards?: DashboardEntity[];
  }
}

export interface DashboardWidgetProps {
  pack: EntityPack<Entity>;
  dashboard: DashboardEntity;
  frame: EntityFrame;
}

export function DashboardWidget(p: DashboardWidgetProps) {

  const component = useAPI(() => import("./View/DashboardView").then(mod => mod.default), []);

  if (!component)
    return null;

  return React.createElement(component, {
    dashboard: p.dashboard,
    entity: p.pack.entity,
    reload: () => p.frame.onReload(),
    cachedQueries: {} /*for now*/
  });
}

