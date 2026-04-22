import * as React from "react";
import { Lite, Entity, EntityPack, OperationSymbol, ConstructSymbol_From, ConstructSymbol_FromMany, ConstructSymbol_Simple, ExecuteSymbol, DeleteSymbol } from './Signum.Entities';
import { PseudoType, TypeInfo, OperationInfo, OperationType } from './Reflection';
import { TypeContext, EntityFrame } from './TypeContext';
import { ContextualItemsContext } from './SearchControl/ContextualItems';
import { BsColor } from "./Components/Basic";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
export declare function start(): void;
export declare const operationSettings: {
    [operationKey: string]: OperationSettings;
};
export declare function clearOperationSettings(): void;
export declare function addSettings(...settings: OperationSettings[]): void;
export declare function getSettings(operation: OperationSymbol | string): OperationSettings | undefined;
export declare const isOperationInfoAllowedEvent: Array<(oi: OperationInfo) => boolean>;
export declare function isOperationInfoAllowed(oi: OperationInfo): boolean;
export declare function isOperationAllowed(operation: OperationSymbol | string, type: PseudoType): boolean;
export declare function isSomeOperationAllowed(operations: (OperationSymbol | string)[], type: PseudoType): boolean;
export declare function getOperationInfo(operation: OperationSymbol | string, type: PseudoType): OperationInfo;
export declare function assertOperationInfoAllowed(operation: OperationInfo): void;
export declare function assertOperationAllowed(operation: OperationSymbol | string, type: PseudoType): void;
export declare function operationInfos(ti: TypeInfo): OperationInfo[];
/**
 * Operation Settings
 */
export declare abstract class OperationSettings {
    text?: () => string;
    operationSymbol: OperationSymbol;
    constructor(operationSymbol: OperationSymbol);
}
/**
 * Constructor Operation Settings
 */
export declare class ConstructorOperationSettings<T extends Entity> extends OperationSettings {
    isVisible?: (coc: ConstructorOperationContext<T>) => boolean;
    onConstruct?: (coc: ConstructorOperationContext<T>) => Promise<EntityPack<T> | undefined> | undefined;
    constructor(operationSymbol: ConstructSymbol_Simple<T>, options: ConstructorOperationOptions<T>);
}
export interface ConstructorOperationOptions<T extends Entity> {
    text?: () => string;
    isVisible?: (coc: ConstructorOperationContext<T>) => boolean;
    onConstruct?: (coc: ConstructorOperationContext<T>) => Promise<EntityPack<T> | undefined> | undefined;
}
export declare class ConstructorOperationContext<T extends Entity> {
    operationInfo: OperationInfo;
    settings: ConstructorOperationSettings<T>;
    typeInfo: TypeInfo;
    constructor(operationInfo: OperationInfo, settings: ConstructorOperationSettings<T>, typeInfo: TypeInfo);
    defaultConstruct(...args: any[]): Promise<EntityPack<T> | undefined>;
}
/**
 * Contextual Operation Settings
 */
export declare class ContextualOperationSettings<T extends Entity> extends OperationSettings {
    isVisible?: (coc: ContextualOperationContext<T>) => boolean;
    hideOnCanExecute?: boolean;
    confirmMessage?: (coc: ContextualOperationContext<T>) => string | undefined | null;
    onClick?: (coc: ContextualOperationContext<T>) => void;
    color?: BsColor;
    icon?: IconProp;
    iconColor?: string;
    order?: number;
    constructor(operationSymbol: ConstructSymbol_FromMany<any, T>, options: ContextualOperationOptions<T>);
}
export interface ContextualOperationOptions<T extends Entity> {
    text?: () => string;
    isVisible?: (coc: ContextualOperationContext<T>) => boolean;
    hideOnCanExecute?: boolean;
    confirmMessage?: (coc: ContextualOperationContext<T>) => string | undefined | null;
    onClick?: (coc: ContextualOperationContext<T>) => void;
    color?: BsColor;
    icon?: IconProp;
    iconColor?: string;
    order?: number;
}
export declare class ContextualOperationContext<T extends Entity> {
    context: ContextualItemsContext<T>;
    operationInfo: OperationInfo;
    settings?: ContextualOperationSettings<T>;
    entityOperationSettings?: EntityOperationSettings<T>;
    canExecute?: string;
    event?: React.MouseEvent<any>;
    onContextualSuccess?: (pack: API.ErrorReport) => void;
    onConstructFromSuccess?: (pack: EntityPack<Entity>) => void;
    defaultContextualClick(...args: any[]): void;
    constructor(operationInfo: OperationInfo, context: ContextualItemsContext<T>);
}
export declare class EntityOperationContext<T extends Entity> {
    static fromTypeContext<T extends Entity>(ctx: TypeContext<T>, operation: ExecuteSymbol<T> | DeleteSymbol<T> | ConstructSymbol_From<T, any> | string): EntityOperationContext<T>;
    frame: EntityFrame;
    tag?: string;
    entity: T;
    operationInfo: OperationInfo;
    settings?: EntityOperationSettings<T>;
    canExecute?: string;
    event?: React.MouseEvent<any>;
    onExecuteSuccess?: (pack: EntityPack<T>) => void;
    onConstructFromSuccess?: (pack: EntityPack<Entity>) => void;
    onDeleteSuccess?: () => void;
    color?: BsColor;
    group?: EntityOperationGroup;
    keyboardShortcut?: KeyboardShortcut;
    alternatives?: AlternativeOperationSetting<T>[];
    constructor(frame: EntityFrame, entity: T, operationInfo: OperationInfo);
    complete(): void;
    defaultClick(...args: any[]): void;
    click(): void;
    isAllowed(): boolean;
    textOrNiceName(): string;
    onKeyDown(e: KeyboardEvent): boolean;
}
export interface AlternativeOperationSetting<T extends Entity> {
    name: string;
    text: () => string;
    color?: BsColor;
    classes?: string;
    icon?: IconProp;
    iconAlign?: "start" | "end";
    iconColor?: string;
    isVisible?: boolean;
    confirmMessage?: (eoc: EntityOperationContext<T>) => string | undefined | null;
    onClick: (eoc: EntityOperationContext<T>) => void;
    keyboardShortcut?: KeyboardShortcut;
}
export declare class EntityOperationSettings<T extends Entity> extends OperationSettings {
    contextual?: ContextualOperationSettings<T>;
    contextualFromMany?: ContextualOperationSettings<T>;
    isVisible?: (eoc: EntityOperationContext<T>) => boolean;
    confirmMessage?: (eoc: EntityOperationContext<T>) => string | undefined | null;
    onClick?: (eoc: EntityOperationContext<T>) => void;
    hideOnCanExecute?: boolean;
    group?: EntityOperationGroup | null;
    order?: number;
    color?: BsColor;
    classes?: string;
    icon?: IconProp;
    iconAlign?: "start" | "end";
    iconColor?: string;
    alternatives?: (ctx: EntityOperationContext<T>) => AlternativeOperationSetting<T>[];
    keyboardShortcut?: KeyboardShortcut | null;
    constructor(operationSymbol: ExecuteSymbol<T> | DeleteSymbol<T> | ConstructSymbol_From<any, T>, options: EntityOperationOptions<T>);
}
export interface EntityOperationOptions<T extends Entity> {
    contextual?: ContextualOperationOptions<T>;
    contextualFromMany?: ContextualOperationOptions<T>;
    text?: () => string;
    isVisible?: (ctx: EntityOperationContext<T>) => boolean;
    confirmMessage?: (ctx: EntityOperationContext<T>) => string | undefined | null;
    onClick?: (ctx: EntityOperationContext<T>) => void;
    hideOnCanExecute?: boolean;
    group?: EntityOperationGroup | null;
    order?: number;
    color?: BsColor;
    classes?: string;
    icon?: IconProp;
    iconAlign?: "start" | "end";
    iconColor?: string;
    keyboardShortcut?: KeyboardShortcut | null;
    alternatives?: (ctx: EntityOperationContext<T>) => AlternativeOperationSetting<T>[];
}
export interface KeyboardShortcut {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    key?: string;
    keyCode?: number;
}
export declare function isShortcut(e: KeyboardEvent, ks: KeyboardShortcut): boolean;
export declare function getShortcutToString(ks: KeyboardShortcut): string;
export declare const CreateGroup: EntityOperationGroup;
export interface EntityOperationGroup {
    key: string;
    text: () => string;
    simplifyName?: (complexName: string) => string;
    cssClass?: string;
    color?: BsColor;
    order?: number;
}
export declare namespace Defaults {
    function isSave(oi: OperationInfo): boolean;
    function getColor(oi: OperationInfo): BsColor;
    function getGroup(oi: OperationInfo): EntityOperationGroup | undefined;
    function getKeyboardShortcut(oi: OperationInfo): KeyboardShortcut | undefined;
    function getAlternatives<T extends Entity>(eoc: EntityOperationContext<T>): AlternativeOperationSetting<T>[] | undefined;
}
export declare function isEntityOperation(operationType: OperationType): boolean;
export declare namespace API {
    function construct<T extends Entity>(type: string, operationKey: string | ConstructSymbol_Simple<T>, ...args: any[]): Promise<EntityPack<T>>;
    function constructFromEntity<T extends Entity, F extends Entity>(entity: F, operationKey: string | ConstructSymbol_From<T, F>, ...args: any[]): Promise<EntityPack<T>>;
    function constructFromLite<T extends Entity, F extends Entity>(lite: Lite<F>, operationKey: string | ConstructSymbol_From<T, F>, ...args: any[]): Promise<EntityPack<T>>;
    function constructFromMultiple<T extends Entity, F extends Entity>(lites: Lite<F>[], operationKey: string | ConstructSymbol_From<T, F>, ...args: any[]): Promise<ErrorReport>;
    function constructFromMany<T extends Entity, F extends Entity>(lites: Lite<F>[], operationKey: string | ConstructSymbol_From<T, F>, ...args: any[]): Promise<EntityPack<T>>;
    function executeEntity<T extends Entity>(entity: T, operationKey: string | ExecuteSymbol<T>, ...args: any[]): Promise<EntityPack<T>>;
    function executeLite<T extends Entity>(lite: Lite<T>, operationKey: string | ExecuteSymbol<T>, ...args: any[]): Promise<EntityPack<T>>;
    function executeMultiple<T extends Entity>(lites: Lite<T>[], operationKey: string | ExecuteSymbol<T>, ...args: any[]): Promise<ErrorReport>;
    function deleteEntity<T extends Entity>(entity: T, operationKey: string | DeleteSymbol<T>, ...args: any[]): Promise<void>;
    function deleteLite<T extends Entity>(lite: Lite<T>, operationKey: string | DeleteSymbol<T>, ...args: any[]): Promise<void>;
    function deleteMultiple<T extends Entity>(lites: Lite<T>[], operationKey: string | DeleteSymbol<T>, ...args: any[]): Promise<ErrorReport>;
    interface ErrorReport {
        errors: {
            [liteKey: string]: string;
        };
    }
    function getOperationKey(operationKey: string | OperationSymbol): string;
    interface MultiOperationRequest {
        operationKey: string;
        type?: string;
        lites: Lite<Entity>[];
        args: any[];
    }
    interface ConstructOperationRequest {
        operationKey: string;
        type?: string;
        args: any[];
    }
    interface EntityOperationRequest {
        operationKey: string;
        entity: Entity;
        type?: string;
        args: any[];
    }
    interface LiteOperationRequest {
        operationKey: string;
        lite: Lite<Entity>;
        type?: string;
        args: any[];
    }
    function stateCanExecutes<T extends Entity>(lites: Lite<T>[], operationKeys: string[]): Promise<CanExecutesResponse>;
    interface CanExecutesResponse {
        canExecutes: {
            [operationKey: string]: string;
        };
    }
}
//# sourceMappingURL=Operations.d.ts.map