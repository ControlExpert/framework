import * as React from 'react';
import { QueryDescription } from '../FindOptions';
import { Lite, Entity } from '../Signum.Entities';
import SearchControlLoaded from "./SearchControlLoaded";
export interface MenuItemBlock {
    header: string;
    menuItems: React.ReactElement<any>[];
}
export interface ContextualItemsContext<T extends Entity> {
    lites: Lite<T>[];
    queryDescription: QueryDescription;
    markRows: (dictionary: MarkedRowsDictionary) => void;
    container?: SearchControlLoaded | React.Component<any, any>;
}
export interface MarkedRowsDictionary {
    [liteKey: string]: string | MarkedRow;
}
export interface MarkedRow {
    className: string;
    message?: string;
}
export declare function clearContextualItems(): void;
export declare const onContextualItems: ((ctx: ContextualItemsContext<Entity>) => Promise<MenuItemBlock | undefined> | undefined)[];
export declare function renderContextualItems(ctx: ContextualItemsContext<Entity>): Promise<React.ReactElement<any>[]>;
//# sourceMappingURL=ContextualItems.d.ts.map