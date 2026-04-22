import { TypeReference, PseudoType, QueryKey, QueryTokenString } from './Reflection';
import { Lite, Entity } from './Signum.Entities';
import { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType, SystemTimeMode, FilterGroupOperation } from './Signum.Entities.DynamicQuery';
import { SearchControlProps } from "./Search";
export { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType };
export interface ValueFindOptions {
    queryName: PseudoType | QueryKey;
    filterOptions?: FilterOption[];
}
export interface ValueFindOptionsParsed {
    queryKey: string;
    filterOptions: FilterOptionParsed;
}
export interface ModalFindOptions {
    title?: string;
    useDefaultBehaviour?: boolean;
    autoSelectIfOne?: boolean;
    searchControlProps?: Partial<SearchControlProps>;
}
export interface FindOptions {
    queryName: PseudoType | QueryKey;
    groupResults?: boolean;
    parentToken?: string | QueryTokenString<any>;
    parentValue?: any;
    filterOptions?: FilterOption[];
    orderOptions?: OrderOption[];
    columnOptionsMode?: ColumnOptionsMode;
    columnOptions?: ColumnOption[];
    pagination?: Pagination;
    systemTime?: SystemTime;
}
export interface FindOptionsParsed {
    queryKey: string;
    groupResults: boolean;
    filterOptions: FilterOptionParsed[];
    orderOptions: OrderOptionParsed[];
    columnOptions: ColumnOptionParsed[];
    pagination: Pagination;
    systemTime?: SystemTime;
}
export declare type FilterOption = FilterConditionOption | FilterGroupOption;
export declare function isFilterGroupOption(fo: FilterOption): fo is FilterGroupOption;
export interface FilterConditionOption {
    token: string | QueryTokenString<any>;
    frozen?: boolean;
    operation?: FilterOperation;
    value?: any;
    pinned?: PinnedFilter;
}
export interface FilterGroupOption {
    token?: string | QueryTokenString<any>;
    groupOperation: FilterGroupOperation;
    filters: FilterOption[];
    pinned?: PinnedFilter;
    value?: string;
}
export declare type FilterOptionParsed = FilterConditionOptionParsed | FilterGroupOptionParsed;
export declare function isFilterGroupOptionParsed(fo: FilterOptionParsed): fo is FilterGroupOptionParsed;
export interface FilterConditionOptionParsed {
    token?: QueryToken;
    frozen: boolean;
    operation?: FilterOperation;
    value: any;
    pinned?: PinnedFilter;
}
export interface PinnedFilter {
    label?: string;
    row?: number;
    column?: number;
    disableOnNull?: boolean;
    splitText?: boolean;
}
export interface FilterGroupOptionParsed {
    groupOperation: FilterGroupOperation;
    frozen: boolean;
    token?: QueryToken;
    filters: FilterOptionParsed[];
    pinned?: PinnedFilter;
    value?: string;
}
export interface OrderOption {
    token: string | QueryTokenString<any>;
    orderType: OrderType;
}
export interface OrderOptionParsed {
    token: QueryToken;
    orderType: OrderType;
}
export interface ColumnOption {
    token: string | QueryTokenString<any>;
    displayName?: string;
}
export interface ColumnOptionParsed {
    token?: QueryToken;
    displayName?: string;
}
export declare const DefaultPagination: Pagination;
export declare type FindMode = "Find" | "Explore";
export declare enum SubTokensOptions {
    CanAggregate = 1,
    CanAnyAll = 2,
    CanElement = 4
}
export interface QueryToken {
    toString: string;
    niceName: string;
    key: string;
    format?: string;
    unit?: string;
    type: TypeReference;
    typeColor: string;
    niceTypeName: string;
    isGroupable: boolean;
    hasOrderAdapter?: boolean;
    preferEquals?: boolean;
    filterType?: FilterType;
    fullKey: string;
    queryTokenType?: QueryTokenType;
    parent?: QueryToken;
    propertyRoute?: string;
}
export declare type QueryTokenType = "Aggregate" | "Element" | "AnyOrAll";
export declare function hasAnyOrAll(token: QueryToken | undefined): boolean;
export declare function isPrefix(prefix: QueryToken, token: QueryToken): boolean;
export declare function hasAggregate(token: QueryToken | undefined): boolean;
export declare function withoutAggregateAndPinned(fop: FilterOptionParsed): FilterOptionParsed | undefined;
export declare function getTokenParents(token: QueryToken | null | undefined): QueryToken[];
export declare function toQueryToken(cd: ColumnDescription): QueryToken;
export declare type FilterRequest = FilterConditionRequest | FilterGroupRequest;
export declare function isFilterGroupRequest(fr: FilterRequest): fr is FilterGroupRequest;
export interface FilterGroupRequest {
    groupOperation: FilterGroupOperation;
    token?: string;
    filters: FilterRequest[];
}
export interface FilterConditionRequest {
    token: string;
    operation: FilterOperation;
    value: any;
}
export interface OrderRequest {
    token: string;
    orderType: OrderType;
}
export interface ColumnRequest {
    token: string;
    displayName: string;
}
export interface QueryEntitiesRequest {
    queryKey: string;
    filters: FilterRequest[];
    orders: OrderRequest[];
    count: number;
}
export interface QueryRequest {
    queryKey: string;
    groupResults: boolean;
    filters: FilterRequest[];
    orders: OrderRequest[];
    columns: ColumnRequest[];
    pagination: Pagination;
    systemTime?: SystemTime;
}
export declare type AggregateType = "Count" | "Average" | "Sum" | "Min" | "Max";
export interface QueryValueRequest {
    queryKey: string;
    filters: FilterRequest[];
    valueToken?: string;
    systemTime?: SystemTime;
}
export interface ResultColumn {
    displayName: string;
    token: QueryToken;
}
export interface ResultTable {
    queryKey: string;
    entityColumn: string;
    columns: string[];
    rows: ResultRow[];
    pagination: Pagination;
    totalElements: number;
}
export interface ResultRow {
    entity?: Lite<Entity>;
    columns: any[];
}
export interface Pagination {
    mode: PaginationMode;
    elementsPerPage?: number;
    currentPage?: number;
}
export interface SystemTime {
    mode: SystemTimeMode;
    startDate?: string;
    endDate?: string;
}
export declare module PaginateMath {
    function startElementIndex(p: Pagination): number;
    function endElementIndex(p: Pagination, rows: number): number;
    function totalPages(p: Pagination, totalElements: number): number;
    function maxElementIndex(p: Pagination): number;
}
export interface QueryDescription {
    queryKey: string;
    columns: {
        [name: string]: ColumnDescription;
    };
}
export interface ColumnDescription {
    name: string;
    type: TypeReference;
    filterType: FilterType;
    typeColor: string;
    niceTypeName: string;
    unit?: string;
    format?: string;
    displayName: string;
    isGroupable: boolean;
    hasOrderAdapter?: boolean;
    preferEquals?: boolean;
    propertyRoute?: string;
}
export declare function isList(fo: FilterOperation): boolean;
export declare const filterOperations: {
    [a: string]: FilterOperation[];
};
//# sourceMappingURL=FindOptions.d.ts.map