/// <reference types="react" />
import { Entity } from '../Signum.Entities';
import { ContextualItemsContext, MenuItemBlock } from '../SearchControl/ContextualItems';
import { ContextualOperationContext } from '../Operations';
import { IconProp } from "@fortawesome/fontawesome-svg-core";
export declare function getConstructFromManyContextualItems(ctx: ContextualItemsContext<Entity>): Promise<MenuItemBlock | undefined> | undefined;
export declare function getEntityOperationsContextualItems(ctx: ContextualItemsContext<Entity>): Promise<MenuItemBlock | undefined> | undefined;
export declare function confirmInNecessary(coc: ContextualOperationContext<Entity>): Promise<boolean>;
export declare namespace MenuItemConstructor {
    function simplifyName(niceName: string): string;
    function createContextualMenuItem(coc: ContextualOperationContext<Entity>, defaultClick: (coc: ContextualOperationContext<Entity>) => void): (JSX.Element | undefined)[];
}
export declare function notifySuccess(): void;
export declare function defaultContextualClick(coc: ContextualOperationContext<any>, ...args: any[]): void;
export declare function coalesceIcon(icon: IconProp | undefined, icon2: IconProp | undefined): IconProp | undefined;
//# sourceMappingURL=ContextualOperations.d.ts.map