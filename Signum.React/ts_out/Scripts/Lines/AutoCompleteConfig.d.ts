import * as React from 'react';
import * as Finder from '../Finder';
import { AbortableRequest } from '../Services';
import { FindOptions, FilterOptionParsed, OrderOptionParsed, ResultRow, ColumnOptionParsed } from '../FindOptions';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { Typeahead } from '../Components';
export interface AutocompleteConfig<T> {
    getItems: (subStr: string) => Promise<T[]>;
    getItemsDelay?: number;
    minLength?: number;
    renderItem(item: T, subStr?: string): React.ReactNode;
    renderList?(typeahead: Typeahead): React.ReactNode;
    getEntityFromItem(item: T): Promise<Lite<Entity> | ModifiableEntity | undefined>;
    getDataKeyFromItem(item: T): string | undefined;
    getItemFromEntity(entity: Lite<Entity> | ModifiableEntity): Promise<T>;
    abort(): void;
}
export declare class LiteAutocompleteConfig<T extends Entity> implements AutocompleteConfig<Lite<T>> {
    getItemsFunction: (signal: AbortSignal, subStr: string) => Promise<Lite<T>[]>;
    requiresInitialLoad: boolean;
    showType: boolean;
    constructor(getItemsFunction: (signal: AbortSignal, subStr: string) => Promise<Lite<T>[]>, requiresInitialLoad: boolean, showType: boolean);
    abortableRequest: AbortableRequest<string, Lite<T>[]>;
    abort(): void;
    getItems(subStr: string): Promise<Lite<T>[]>;
    renderItem(item: Lite<T>, subStr: string): {} | null | undefined;
    getEntityFromItem(item: Lite<T>): Promise<Lite<Entity> | ModifiableEntity>;
    getDataKeyFromItem(item: Lite<T>): string | undefined;
    getItemFromEntity(entity: Lite<Entity> | ModifiableEntity): Promise<Lite<T>>;
    convertToLite(entity: Lite<Entity> | ModifiableEntity): Lite<T>;
}
export declare class FindOptionsAutocompleteConfig implements AutocompleteConfig<ResultRow> {
    findOptions: FindOptions;
    count: number;
    requiresInitialLoad: boolean;
    showType: boolean;
    constructor(findOptions: FindOptions, count?: number, requiresInitialLoad?: boolean, showType?: boolean);
    abort(): void;
    parsedFilters?: FilterOptionParsed[];
    getParsedFilters(): Promise<FilterOptionParsed[]>;
    parsedOrders?: OrderOptionParsed[];
    getParsedOrders(): Promise<OrderOptionParsed[]>;
    parsedColumns?: ColumnOptionParsed[];
    getParsedColumns(): Promise<ColumnOptionParsed[]>;
    abortableRequest: AbortableRequest<Finder.API.AutocompleteQueryRequest, import("../FindOptions").ResultTable>;
    getItems(subStr: string): Promise<ResultRow[]>;
    renderItem(item: ResultRow, subStr: string): {} | null | undefined;
    getEntityFromItem(item: ResultRow): Promise<Lite<Entity> | ModifiableEntity>;
    getDataKeyFromItem(item: ResultRow): string | undefined;
    getItemFromEntity(entity: Lite<Entity> | ModifiableEntity): Promise<ResultRow>;
    convertToLite(entity: Lite<Entity> | ModifiableEntity): Lite<Entity>;
}
//# sourceMappingURL=AutoCompleteConfig.d.ts.map