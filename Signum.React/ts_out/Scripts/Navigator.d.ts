import * as React from "react";
import * as H from "history";
import { Lite, Entity, ModifiableEntity, EntityPack } from './Signum.Entities';
import { IUserEntity, TypeEntity } from './Signum.Entities.Basics';
import { PropertyRoute, PseudoType, Type, TypeReference } from './Reflection';
import { TypeContext } from './TypeContext';
import * as Operations from './Operations';
import { ViewReplacer } from './Frames/ReactVisitor';
import { AutocompleteConfig } from './Lines/AutoCompleteConfig';
import { FindOptions } from './FindOptions';
import { BsSize } from "./Components/Basic";
export declare let currentUser: IUserEntity | undefined;
export declare function setCurrentUser(user: IUserEntity | undefined): void;
export declare let history: H.History;
export declare function setCurrentHistory(h: H.History): void;
export declare let setTitle: (pageTitle?: string) => void;
export declare function setTitleFunction(titleFunction: (pageTitle?: string) => void): void;
export declare function createAppRelativeHistory(): H.History;
export declare let resetUI: () => void;
export declare function setResetUI(reset: () => void): void;
export declare namespace Expander {
    let onGetExpanded: () => boolean;
    let onSetExpanded: (isExpanded: boolean) => void;
    function setExpanded(expanded: boolean): boolean;
}
export declare namespace NavigatorManager {
    function getFramePage(): Promise<typeof import("./Frames/FramePage")>;
    function getFrameModal(): Promise<typeof import("./Frames/FrameModal")>;
}
export declare function start(options: {
    routes: JSX.Element[];
}): void;
export declare function getTypeTitle(entity: ModifiableEntity, pr: PropertyRoute | undefined): string | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | undefined;
export declare function setRenderIdFunction(newFunction: (entity: Entity) => React.ReactChild): void;
export declare function navigateRoute(entity: Entity, viewName?: string): string;
export declare function navigateRoute(lite: Lite<Entity>, viewName?: string): string;
export declare function navigateRouteDefault(typeName: string, id: number | string, viewName?: string): string;
export declare function createRoute(type: PseudoType, viewName?: string): string;
export declare const clearSettingsActions: Array<() => void>;
export declare function clearAllSettings(): void;
export declare function clearEntitySettings(): void;
export declare const entitySettings: {
    [type: string]: EntitySettings<ModifiableEntity>;
};
export declare function addSettings(...settings: EntitySettings<any>[]): void;
export declare function getOrAddSettings<T extends ModifiableEntity>(type: Type<T>): EntitySettings<T>;
export declare function getOrAddSettings(type: PseudoType): EntitySettings<ModifiableEntity>;
export declare function getSettings<T extends ModifiableEntity>(type: Type<T>): EntitySettings<T> | undefined;
export declare function getSettings(type: PseudoType): EntitySettings<ModifiableEntity> | undefined;
export declare function setViewDispatcher(newDispatcher: ViewDispatcher): void;
export interface ViewDispatcher {
    hasDefaultView(typeName: string): boolean;
    getViewNames(typeName: string): Promise<string[]>;
    getViewPromise(entity: ModifiableEntity, viewName?: string): ViewPromise<ModifiableEntity>;
    getViewOverrides(typeName: string, viewName?: string): Promise<ViewOverride<ModifiableEntity>[]>;
}
export declare class BasicViewDispatcher implements ViewDispatcher {
    hasDefaultView(typeName: string): boolean;
    getViewNames(typeName: string): Promise<string[]>;
    getViewOverrides(typeName: string, viewName?: string): Promise<ViewOverride<ModifiableEntity>[]>;
    getViewPromise(entity: ModifiableEntity, viewName?: string): ViewPromise<ModifiableEntity>;
}
export declare class DynamicComponentViewDispatcher implements ViewDispatcher {
    hasDefaultView(typeName: string): boolean;
    getViewNames(typeName: string): Promise<string[]>;
    getViewOverrides(typeName: string, viewName?: string): Promise<ViewOverride<ModifiableEntity>[]>;
    getViewPromise(entity: ModifiableEntity, viewName?: string): ViewPromise<ModifiableEntity>;
}
export declare let viewDispatcher: ViewDispatcher;
export declare function getViewPromise<T extends ModifiableEntity>(entity: T, viewName?: string): ViewPromise<T>;
export declare const isCreableEvent: Array<(typeName: string) => boolean>;
export declare function isCreable(type: PseudoType, customView?: boolean, isSearch?: boolean): boolean;
export declare const isReadonlyEvent: Array<(typeName: string, entity?: EntityPack<ModifiableEntity>) => boolean>;
export declare function isReadOnly(typeOrEntity: PseudoType | EntityPack<ModifiableEntity>): boolean;
export declare function typeRequiresSaveOperation(typeName: string): boolean;
export declare const isFindableEvent: Array<(typeName: string) => boolean>;
export declare function isFindable(type: PseudoType, isSearch?: boolean): boolean;
export declare const isViewableEvent: Array<(typeName: string, entityPack?: EntityPack<ModifiableEntity>) => boolean>;
export declare function isViewable(typeOrEntity: PseudoType | EntityPack<ModifiableEntity>, customView?: boolean): boolean;
export declare function isNavigable(typeOrEntity: PseudoType | EntityPack<ModifiableEntity>, customComponent?: boolean, isSearch?: boolean): boolean;
export declare function defaultFindOptions(type: TypeReference): FindOptions | undefined;
export declare function getAutoComplete(type: TypeReference, findOptions: FindOptions | undefined, showType?: boolean): AutocompleteConfig<any> | null;
export interface ViewOptions {
    title?: string;
    propertyRoute?: PropertyRoute;
    readOnly?: boolean;
    modalSize?: BsSize;
    isOperationVisible?: (eoc: Operations.EntityOperationContext<any>) => boolean;
    validate?: boolean;
    requiresSaveOperation?: boolean;
    avoidPromptLooseChange?: boolean;
    getViewPromise?: (entity: ModifiableEntity) => undefined | string | ViewPromise<ModifiableEntity>;
    extraComponentProps?: {};
}
export declare function view<T extends ModifiableEntity>(options: EntityPack<T>, viewOptions?: ViewOptions): Promise<T | undefined>;
export declare function view<T extends ModifiableEntity>(entity: T, viewOptions?: ViewOptions): Promise<T | undefined>;
export declare function view<T extends Entity>(entity: Lite<T>, viewOptions?: ViewOptions): Promise<T | undefined>;
export declare function view(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, viewOptions?: ViewOptions): Promise<ModifiableEntity | undefined>;
export declare function viewDefault(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, viewOptions?: ViewOptions): Promise<Entity | undefined>;
export interface NavigateOptions {
    readOnly?: boolean;
    modalSize?: BsSize;
    avoidPromptLooseChange?: boolean;
    getViewPromise?: (entity: ModifiableEntity) => undefined | string | ViewPromise<ModifiableEntity>;
    extraComponentProps?: {};
    createNew?: () => Promise<ModifiableEntity>;
}
export declare function navigate(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, navigateOptions?: NavigateOptions): Promise<void>;
export declare function navigateDefault(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, navigateOptions?: NavigateOptions): Promise<void>;
export declare function createInNewTab(pack: EntityPack<ModifiableEntity>): void;
export declare function createNavigateOrTab(pack: EntityPack<Entity>, event: React.MouseEvent<any>): void;
export declare function pushOrOpenInTab(path: string, e: React.MouseEvent<any> | React.KeyboardEvent<any>): void;
export declare function toEntityPack(entityOrEntityPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>): Promise<EntityPack<ModifiableEntity>>;
export declare module API {
    function fillToStrings(...lites: (Lite<Entity> | null | undefined)[]): Promise<void>;
    function fillToStringsArray(lites: Lite<Entity>[]): Promise<void>;
    function fetchAll<T extends Entity>(type: Type<T>): Promise<Array<T>>;
    function fetchAndRemember<T extends Entity>(lite: Lite<T>): Promise<T>;
    function fetchAndForget<T extends Entity>(lite: Lite<T>): Promise<T>;
    function fetchEntity<T extends Entity>(type: Type<T>, id: any): Promise<T>;
    function fetchEntity(type: PseudoType, id: number | string): Promise<Entity>;
    function fetchEntityPack<T extends Entity>(lite: Lite<T>): Promise<EntityPack<T>>;
    function fetchEntityPack<T extends Entity>(type: Type<T>, id: number | string): Promise<EntityPack<T>>;
    function fetchEntityPack(type: PseudoType, id: number | string): Promise<EntityPack<Entity>>;
    function fetchEntityPackEntity<T extends Entity>(entity: T): Promise<EntityPack<T>>;
    function validateEntity(entity: ModifiableEntity): Promise<void>;
    function getType(typeName: string): Promise<TypeEntity | null>;
}
export interface EntitySettingsOptions<T extends ModifiableEntity> {
    isCreable?: EntityWhen;
    isFindable?: boolean;
    isViewable?: boolean;
    isNavigable?: EntityWhen;
    isReadOnly?: boolean;
    avoidPopup?: boolean;
    autocomplete?: AutocompleteConfig<any>;
    autocompleteDelay?: number;
    getViewPromise?: (entity: T) => ViewPromise<T>;
    onNavigateRoute?: (typeName: string, id: string | number) => string;
    onNavigate?: (entityOrPack: Lite<Entity & T> | T | EntityPack<T>, navigateOptions?: NavigateOptions) => Promise<void>;
    onView?: (entityOrPack: Lite<Entity & T> | T | EntityPack<T>, viewOptions?: ViewOptions) => Promise<T | undefined>;
    namedViews?: NamedViewSettings<T>[];
}
export interface ViewOverride<T extends ModifiableEntity> {
    viewName?: string;
    override: (replacer: ViewReplacer<T>) => void;
}
export declare class EntitySettings<T extends ModifiableEntity> {
    typeName: string;
    avoidPopup: boolean;
    getViewPromise?: (entity: T) => ViewPromise<T>;
    viewOverrides?: Array<ViewOverride<T>>;
    isCreable?: EntityWhen;
    isFindable?: boolean;
    isViewable?: boolean;
    isNavigable?: EntityWhen;
    isReadOnly?: boolean;
    autocomplete?: AutocompleteConfig<any>;
    autocompleteDelay?: number;
    findOptions?: FindOptions;
    onNavigate?: (entityOrPack: Lite<Entity & T> | T | EntityPack<T>, navigateOptions?: NavigateOptions) => Promise<void>;
    onView?: (entityOrPack: Lite<Entity & T> | T | EntityPack<T>, viewOptions?: ViewOptions) => Promise<T | undefined>;
    onNavigateRoute?: (typeName: string, id: string | number, viewName?: string) => string;
    namedViews?: {
        [viewName: string]: NamedViewSettings<T>;
    };
    overrideView(override: (replacer: ViewReplacer<T>) => void, viewName?: string): void;
    constructor(type: Type<T> | string, getViewModule?: (entity: T) => Promise<ViewModule<any>>, options?: EntitySettingsOptions<T>);
    registerNamedView(settings: NamedViewSettings<T>): void;
}
interface NamedViewSettingsOptions<T extends ModifiableEntity> {
    getViewPromise?: (entity: T) => ViewPromise<T>;
}
export declare class NamedViewSettings<T extends ModifiableEntity> {
    type: Type<T>;
    viewName: string;
    getViewPromise: (entity: T) => ViewPromise<T>;
    constructor(type: Type<T>, viewName: string, getViewModule?: (entity: T) => Promise<ViewModule<T>>, options?: NamedViewSettingsOptions<T>);
}
export declare type ViewModule<T extends ModifiableEntity> = {
    default: React.ComponentClass<any> | React.FunctionComponent<any>;
};
export declare class ViewPromise<T extends ModifiableEntity> {
    promise: Promise<(ctx: TypeContext<T>) => React.ReactElement<any>>;
    constructor(promise?: Promise<ViewModule<T>>);
    static resolve<T extends ModifiableEntity>(getComponent: (ctx: TypeContext<T>) => React.ReactElement<any>): ViewPromise<T>;
    withProps(props: {}): ViewPromise<T>;
    applyViewOverrides(typeName: string, viewName?: string): ViewPromise<T>;
    static flat<T extends ModifiableEntity>(promise: Promise<ViewPromise<T>>): ViewPromise<T>;
}
export declare function checkFlag(entityWhen: EntityWhen, isSearch: boolean): boolean;
export declare type EntityWhen = "Always" | "IsSearch" | "IsLine" | "Never";
declare global {
    interface String {
        formatHtml(...parameters: any[]): React.ReactElement<any>;
    }
    interface Array<T> {
        joinCommaHtml(this: Array<T>, lastSeparator: string): React.ReactElement<any>;
    }
}
export declare function toAbsoluteUrl(appRelativeUrl: string): string;
export declare function tryConvert(value: any, type: TypeReference): Promise<any> | undefined;
export {};
//# sourceMappingURL=Navigator.d.ts.map