import * as React from "react";
import * as Navigator from "./Navigator";
import { QueryDescription, QueryValueRequest, QueryRequest, QueryEntitiesRequest, FindOptions, FindOptionsParsed, FilterOption, FilterOptionParsed, OrderOptionParsed, QueryToken, ColumnDescription, ColumnOption, ColumnOptionParsed, Pagination, ResultTable, ResultRow, OrderOption, SubTokensOptions, ColumnOptionsMode, FilterRequest, ModalFindOptions, OrderRequest, ColumnRequest, FilterGroupOption, SystemTime } from './FindOptions';
import { OrderType } from './Signum.Entities.DynamicQuery';
import { Entity, Lite, ModifiableEntity } from './Signum.Entities';
import { TypeEntity, QueryEntity } from './Signum.Entities.Basics';
import { Type, QueryKey, TypeReference, PseudoType, PropertyRoute, QueryTokenString } from './Reflection';
import SearchControlLoaded from './SearchControl/SearchControlLoaded';
import { ButtonBarElement } from "./TypeContext";
export declare const querySettings: {
    [queryKey: string]: QuerySettings;
};
export declare function clearQuerySettings(): void;
export declare function start(options: {
    routes: JSX.Element[];
}): void;
export declare function addSettings(...settings: QuerySettings[]): void;
export declare function pinnedSearchFilter<T extends Entity>(type: Type<T>, ...tokens: ((t: QueryTokenString<T>) => QueryTokenString<any>)[]): FilterGroupOption;
export declare function getSettings(queryName: PseudoType | QueryKey): QuerySettings | undefined;
export declare const isFindableEvent: Array<(queryKey: string, fullScreen: boolean) => boolean>;
export declare function isFindable(queryName: PseudoType | QueryKey, fullScreen: boolean): boolean;
export declare function find<T extends Entity = Entity>(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<T> | undefined>;
export declare function find<T extends Entity>(type: Type<T>, modalOptions?: ModalFindOptions): Promise<Lite<T> | undefined>;
export declare namespace FinderFindManager {
    function getSearchPage(): Promise<typeof import("./SearchControl/SearchPage")>;
    function getSearchModal(): Promise<typeof import("./SearchControl/SearchModal")>;
}
export declare function findRow(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<ResultRow | undefined>;
export declare function findMany<T extends Entity = Entity>(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<T>[] | undefined>;
export declare function findMany<T extends Entity>(type: Type<T>, modalOptions?: ModalFindOptions): Promise<Lite<T>[] | undefined>;
export declare function findManyRows(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<ResultRow[] | undefined>;
export declare function exploreWindowsOpen(findOptions: FindOptions, e: React.MouseEvent<any>): void;
export declare function explore(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<void>;
export declare function findOptionsPath(fo: FindOptions, extra?: any): string;
export declare function findOptionsPathQuery(fo: FindOptions, extra?: any): any;
export declare function getTypeNiceName(tr: TypeReference): string;
export declare function getSimpleTypeNiceName(name: string): string;
export declare function parseFindOptionsPath(queryName: PseudoType | QueryKey, query: any): FindOptions;
export declare function mergeColumns(columnDescriptions: ColumnDescription[], mode: ColumnOptionsMode, columnOptions: ColumnOption[]): ColumnOption[];
export declare function smartColumns(current: ColumnOptionParsed[], ideal: ColumnDescription[]): {
    mode: ColumnOptionsMode;
    columns: ColumnOption[];
};
export declare function parseFilterOptions(fos: FilterOption[], groupResults: boolean, qd: QueryDescription): Promise<FilterOptionParsed[]>;
export declare function parseOrderOptions(orderOptions: OrderOption[], groupResults: boolean, qd: QueryDescription): Promise<OrderOptionParsed[]>;
export declare function parseColumnOptions(columnOptions: ColumnOption[], groupResults: boolean, qd: QueryDescription): Promise<ColumnOptionParsed[]>;
export declare function setFilters(e: Entity, filterOptionsParsed: FilterOptionParsed[]): Promise<Entity>;
export declare function toFindOptions(fo: FindOptionsParsed, qd: QueryDescription): FindOptions;
export declare const defaultOrderColumn: string;
export declare function getDefaultOrder(qd: QueryDescription, qs: QuerySettings | undefined): OrderOption | undefined;
export declare function getDefaultFilter(qd: QueryDescription, qs: QuerySettings | undefined): FilterOption[] | undefined;
export declare function isAggregate(fop: FilterOptionParsed): boolean;
export declare function toFilterOptions(filterOptionsParsed: FilterOptionParsed[]): FilterOption[];
export declare function parseFindOptions(findOptions: FindOptions, qd: QueryDescription): Promise<FindOptionsParsed>;
export declare function getQueryRequest(fo: FindOptionsParsed, qs?: QuerySettings): QueryRequest;
export declare function validateNewEntities(fo: FindOptions): string | undefined;
export declare function exploreOrNavigate(findOptions: FindOptions): Promise<void>;
export declare function getQueryValue(queryName: PseudoType | QueryKey, filterOptions: FilterOption[], valueToken?: string): Promise<any>;
export declare function toFilterRequests(fops: FilterOptionParsed[], overridenValue?: OverridenValue): FilterRequest[];
interface OverridenValue {
    value: any;
}
export declare function toFilterRequest(fop: FilterOptionParsed, overridenValue?: OverridenValue): FilterRequest | undefined;
export declare function fetchEntitiesWithFilters<T extends Entity>(queryName: Type<T>, filterOptions: FilterOption[], orderOptions: OrderOption[], count: number): Promise<Lite<T>[]>;
export declare function fetchEntitiesWithFilters(queryName: PseudoType | QueryKey, filterOptions: FilterOption[], orderOptions: OrderOption[], count: number): Promise<Lite<Entity>[]>;
export declare function expandParentColumn(fo: FindOptions): FindOptions;
export declare function parseSingleToken(queryName: PseudoType | QueryKey, token: string, subTokenOptions: SubTokensOptions): Promise<QueryToken>;
export declare class TokenCompleter {
    queryDescription: QueryDescription;
    constructor(queryDescription: QueryDescription);
    tokensToRequest: {
        [fullKey: string]: ({
            options: SubTokensOptions;
            token?: QueryToken;
        });
    };
    requestFilter(fo: FilterOption, options: SubTokensOptions): void;
    request(fullKey: string, options: SubTokensOptions): void;
    isSimple(fullKey: string): boolean;
    finished(): Promise<void>;
    get(fullKey: string): QueryToken;
    toFilterOptionParsed(fo: FilterOption): FilterOptionParsed;
}
export declare function parseFilterValues(filterOptions: FilterOptionParsed[]): Promise<void>;
export declare function clearQueryDescriptionCache(): void;
export declare function getQueryDescription(queryName: PseudoType | QueryKey): Promise<QueryDescription>;
export declare module API {
    function fetchQueryDescription(queryKey: string): Promise<QueryDescription>;
    function fetchQueryEntity(queryKey: string): Promise<QueryEntity>;
    function executeQuery(request: QueryRequest, signal?: AbortSignal): Promise<ResultTable>;
    function queryValue(request: QueryValueRequest, avoidNotifyPendingRequest?: boolean | undefined, signal?: AbortSignal): Promise<any>;
    function fetchEntitiesWithFilters(request: QueryEntitiesRequest): Promise<Lite<Entity>[]>;
    function fetchAllLites(request: {
        types: string;
    }): Promise<Lite<Entity>[]>;
    function findTypeLike(request: {
        subString: string;
        count: number;
    }): Promise<Lite<TypeEntity>[]>;
    function findLiteLike(request: AutocompleteRequest, signal?: AbortSignal): Promise<Lite<Entity>[]>;
    interface AutocompleteRequest {
        types: string;
        subString: string;
        count: number;
    }
    function FindRowsLike(request: AutocompleteQueryRequest, signal?: AbortSignal): Promise<ResultTable>;
    function parseTokens(queryKey: string, tokens: {
        token: string;
        options: SubTokensOptions;
    }[]): Promise<QueryToken[]>;
    function getSubTokens(queryKey: string, token: QueryToken | undefined, options: SubTokensOptions): Promise<QueryToken[]>;
    interface AutocompleteQueryRequest {
        queryKey: string;
        filters: FilterRequest[];
        columns: ColumnRequest[];
        orders: OrderRequest[];
        subString: string;
        count: number;
    }
}
export declare module Encoder {
    function encodeFilters(query: any, filterOptions?: FilterOption[]): void;
    function encodeOrders(query: any, orderOptions?: OrderOption[]): void;
    function encodeColumns(query: any, columnOptions?: ColumnOption[]): void;
    function stringValue(value: any): string;
    function scapeTilde(str: string): string;
}
export declare module Decoder {
    interface FilterPart {
        order: number;
        identation: number;
        value: string;
    }
    function filterInOrder(query: any, prefix: string): FilterPart[];
    function decodeFilters(query: any): FilterOption[];
    function unscapeTildes(str: string | undefined): string | undefined;
    function valuesInOrder(query: any, prefix: string): string[];
    function decodeOrders(query: any): OrderOption[];
    function decodeColumns(query: any): ColumnOption[];
}
export declare module ButtonBarQuery {
    interface ButtonBarQueryContext {
        searchControl: SearchControlLoaded;
        findOptions: FindOptionsParsed;
    }
    const onButtonBarElements: ((ctx: ButtonBarQueryContext) => ButtonBarElement | undefined)[];
    function getButtonBarElements(ctx: ButtonBarQueryContext): ButtonBarElement[];
    function clearButtonBarElements(): void;
}
export declare let defaultPagination: Pagination;
export interface QuerySettings {
    queryName: PseudoType | QueryKey;
    pagination?: Pagination;
    allowSystemTime?: boolean;
    defaultOrderColumn?: string;
    defaultOrderType?: OrderType;
    defaultFilters?: FilterOption[];
    hiddenColumns?: ColumnOption[];
    formatters?: {
        [token: string]: CellFormatter;
    };
    rowAttributes?: (row: ResultRow, columns: string[]) => React.HTMLAttributes<HTMLTableRowElement> | undefined;
    entityFormatter?: EntityFormatter;
    inPlaceNavigation?: boolean;
    getViewPromise?: (e: ModifiableEntity | null) => (undefined | string | Navigator.ViewPromise<ModifiableEntity>);
    onDoubleClick?: (e: React.MouseEvent<any>, row: ResultRow) => void;
    simpleFilterBuilder?: (qd: QueryDescription, initialFilterOptions: FilterOptionParsed[], refresh: () => void) => React.ReactElement<any> | undefined;
    onFind?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<Lite<Entity> | undefined>;
    onFindMany?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<Lite<Entity>[] | undefined>;
    onExplore?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<void>;
}
export interface FormatRule {
    name: string;
    formatter: (column: ColumnOptionParsed) => CellFormatter;
    isApplicable: (column: ColumnOptionParsed, sc: SearchControlLoaded | undefined) => boolean;
}
export declare class CellFormatter {
    formatter: (cell: any, ctx: CellFormatterContext) => React.ReactChild | undefined;
    cellClass?: string | undefined;
    constructor(formatter: (cell: any, ctx: CellFormatterContext) => React.ReactChild | undefined, cellClass?: string | undefined);
}
export interface CellFormatterContext {
    refresh?: () => void;
    systemTime?: SystemTime;
}
export declare function getCellFormatter(qs: QuerySettings | undefined, co: ColumnOptionParsed, sc: SearchControlLoaded | undefined): CellFormatter | undefined;
export declare const registeredPropertyFormatters: {
    [typeAndProperty: string]: CellFormatter;
};
export declare function registerPropertyFormatter(pr: PropertyRoute, formater: CellFormatter): void;
export declare const formatRules: FormatRule[];
export interface EntityFormatRule {
    name: string;
    formatter: EntityFormatter;
    isApplicable: (row: ResultRow, sc: SearchControlLoaded | undefined) => boolean;
}
export declare type EntityFormatter = (row: ResultRow, columns: string[], sc?: SearchControlLoaded) => React.ReactChild | undefined;
export declare const entityFormatRules: EntityFormatRule[];
export {};
//# sourceMappingURL=Finder.d.ts.map