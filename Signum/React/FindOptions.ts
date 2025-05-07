import { TypeReference, PseudoType, QueryKey, getLambdaMembers, QueryTokenString, tryGetTypeInfos, PropertyRoute, isTypeEnum, TypeInfo, Type } from './Reflection';
import { Lite, Entity } from './Signum.Entities';
import { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType, SystemTimeMode, FilterGroupOperation, PinnedFilterActive, SystemTimeJoinMode, DashboardBehaviour, CombineRows } from './Signum.DynamicQuery';
import { SearchControlProps, SearchControlLoaded } from "./Search";
import { BsSize } from './Components';

export { PaginationMode, OrderType, FilterOperation, FilterType, ColumnOptionsMode, UniqueType };

export interface ValueFindOptions {
  queryName: PseudoType | QueryKey;
  filterOptions?: FilterOption[];
}

export interface ValueFindOptionsParsed {
  queryKey: string;
  filterOptions: FilterOptionParsed;
}

export interface ModalFindOptionsMany extends ModalFindOptions{
  allowNoSelection?: boolean;
}

export interface ModalFindOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  forProperty?: string;
  useDefaultBehaviour?: boolean;
  autoSelectIfOne?: boolean;
  autoSkipIfZero?: boolean;
  autoCheckSingleRowResult?: boolean;
  modalSize?: BsSize;
  searchControlProps?: Partial<SearchControlProps>;
  onOKClicked?: (sc: SearchControlLoaded) => Promise<boolean>;
}

export interface FindOptions {
  queryName: PseudoType | QueryKey;
  groupResults?: boolean;

  includeDefaultFilters?: boolean;
  filterOptions?: (FilterOption | null | undefined)[];
  orderOptions?: (OrderOption | null | undefined)[];
  columnOptionsMode?: ColumnOptionsMode;
  columnOptions?: (ColumnOption | null | undefined)[];
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


export type FilterOption = FilterConditionOption | FilterGroupOption;

export function isFilterGroup(fo: FilterOptionParsed): fo is FilterGroupOptionParsed
export function isFilterGroup(fo: FilterOption): fo is FilterGroupOption
export function isFilterGroup(fr: FilterRequest): fr is FilterGroupRequest 
export function isFilterGroup(fo: FilterOption | FilterOptionParsed | FilterRequest): boolean{
  return (fo as FilterGroupOptionParsed | FilterGroupOption | FilterGroupRequest).groupOperation != undefined;
}

export function isFilterCondition(fo: FilterOptionParsed): fo is FilterConditionOptionParsed
export function isFilterCondition(fo: FilterOption): fo is FilterConditionOption
export function isFilterCondition(fr: FilterRequest): fr is FilterConditionRequest
export function isFilterCondition(fo: FilterOptionParsed | FilterOption | FilterRequest): boolean {
  return (fo as FilterGroupOptionParsed | FilterGroupOption | FilterGroupRequest).groupOperation == undefined;
}


export interface FilterConditionOption {
  token: string | QueryTokenString<any>;
  frozen?: boolean;
  removeElementWarning?: boolean;
  operation?: FilterOperation;
  value?: any;
  pinned?: PinnedFilter;
  dashboardBehaviour?: DashboardBehaviour;
}

export interface FilterGroupOption {
  token?: string | QueryTokenString<any>;
  groupOperation: FilterGroupOperation;
  filters: (FilterOption | null | undefined)[];
  pinned?: PinnedFilter;
  frozen?: boolean;
  dashboardBehaviour?: DashboardBehaviour;
  value?: string; /*For search in multiple columns*/
}

export interface PinnedFilter {
  label?: (() => string) | string;
  row?: number;
  column?: number;
  colSpan?: number;
  active?: PinnedFilterActive;
  splitValue?: boolean;
}

export type FilterOptionParsed = FilterConditionOptionParsed | FilterGroupOptionParsed;



export function isActive(fo: FilterOptionParsed) {
  return !(fo.dashboardBehaviour == "UseAsInitialSelection" || fo.pinned && (fo.pinned.active == "Checkbox_Unchecked" || fo.pinned.active == "NotCheckbox_Unchecked" || fo.pinned.active == "WhenHasValue" && fo.value == null));
}

export function isCheckBox(active: PinnedFilterActive | undefined) {
  return active == "Checkbox_Checked" ||
    active == "Checkbox_Unchecked" ||
    active == "NotCheckbox_Checked" ||
    active == "NotCheckbox_Unchecked";
}

export interface FilterConditionOptionParsed {
  token?: QueryToken;
  frozen: boolean;
  removeElementWarning?: boolean;
  operation?: FilterOperation;
  value: any;
  pinned?: PinnedFilterParsed;
  dashboardBehaviour?: DashboardBehaviour;
}

export interface PinnedFilterParsed {
  label?: string;
  row?: number;
  column?: number;
  colSpan?: number;
  active?: PinnedFilterActive;
  splitValue?: boolean;
}

export function toPinnedFilterParsed(pf: PinnedFilter): PinnedFilterParsed {
  return {
    label: typeof pf.label == "function" ? pf.label() : pf.label,
    column: pf.column,
    colSpan: pf.colSpan,
    row: pf.row,
    active: pf.active,
    splitValue: pf.splitValue
  };
}

export interface FilterGroupOptionParsed {
  groupOperation: FilterGroupOperation;
  frozen: boolean;
  token?: QueryToken;
  filters: FilterOptionParsed[];
  pinned?: PinnedFilterParsed;
  dashboardBehaviour?: DashboardBehaviour;
  value?: string; /*For search in multiple columns*/
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
  displayName?: string | (() => string);
  summaryToken?: string | QueryTokenString<any>;
  hiddenColumn?: boolean;
  combineRows?: CombineRows;
}

export interface ColumnOptionParsed {
  token?: QueryToken;
  displayName?: string;
  summaryToken?: QueryToken;
  hiddenColumn?: boolean;
  combineRows?: CombineRows;
}

export const DefaultPagination: Pagination = {
  mode: "Paginate",
  elementsPerPage: 20,
  currentPage: 1
};


export type FindMode = "Find" | "Explore";

export enum SubTokensOptions {
  CanAggregate = 1,
  CanAnyAll = 2,
  CanElement = 4,
  CanOperation = 8,
  CanToArray = 16,
  CanSnippet= 32,
  CanManual = 64,
}

export interface QueryToken {
  toStr: string;
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

export interface ManualToken { 
  toStr: string;
  niceName: string;
  key: string;
  typeColor?: string;
  niceTypeName: string;
  subToken?: Promise<ManualToken[]>;
}
export interface ManualCellDto {
  lite: Lite<Entity>;
  manualContainerTokenKey: string;
  manualTokenKey: string;
}

function getFullKey(token: QueryToken | QueryTokenString<any> | string) : string {
  if (token instanceof QueryTokenString)
    return token.token;

  if (typeof token == "object")
    return token.fullKey;

  return token;
}

export function tokenStartsWith(token: QueryToken | QueryTokenString<any> | string, tokenStart: QueryToken | QueryTokenString<any> | string) {

  token = getFullKey(token);
  tokenStart = getFullKey(token);

  return token == tokenStart || token.startsWith(tokenStart + ".");
}

export type QueryTokenType = "Aggregate" | "Element" | "AnyOrAll" | "Operation"  | "ToArray" | "Manual";

export function hasAnyOrAll(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "AnyOrAll")
    return true;

  return hasAnyOrAll(token.parent);
}

export function hasAny(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "AnyOrAll" && token.key == "Any")
    return true;

  return hasAny(token.parent);
}

export function isPrefix(prefix: QueryToken, token: QueryToken): boolean {
  return prefix.fullKey == token.fullKey || token.fullKey.startsWith(prefix.fullKey + ".");
}

export function hasAggregate(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "Aggregate")
    return true;

  return hasAggregate(token.parent);
}

export function hasElement(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "Element")
    return true;

  return hasElement(token.parent);
}

export function hasOperation(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "Operation")
    return true;

  return hasOperation(token.parent);
}

export function hasManual(token: QueryToken | undefined): boolean {
  if (token == undefined)
    return false;

  if (token.queryTokenType == "Manual")
    return true;

  return hasManual(token.parent);
}

export function hasToArray(token: QueryToken | undefined): QueryToken | undefined {
  if (token == undefined)
    return undefined;

  if (token.queryTokenType == "ToArray")
    return token;

  return hasToArray(token.parent);
}

export function withoutAggregate(fop: FilterOptionParsed): FilterOptionParsed | undefined {

  if (hasAggregate(fop.token))
    return undefined;

  if (isFilterGroup(fop)) {
    var newFilters = fop.filters.map(f => withoutAggregate(f)).filter(Boolean);
    if (newFilters.length == 0)
      return undefined;
    return ({
      ...fop,
      filters: newFilters,
    }) as FilterOptionParsed;
  };

  return {
    ...fop,
  };
}

export function withoutPinned(fop: FilterOptionParsed): FilterOptionParsed | undefined {

  if (!isActive(fop)) {
    return undefined;
  }

  if (isFilterGroup(fop)) {
    var newFilters = fop.filters.map(f => withoutPinned(f)).filter(Boolean);
    if (newFilters.length == 0)
      return undefined;

    return ({
      ...fop,
      filters: newFilters,
      pinned: undefined,
    }) as FilterOptionParsed;
  };

  return {
    ...fop,
    pinned: undefined
  };
}

export function canSplitValue(fo: FilterOptionParsed) {
  if (isFilterGroup(fo))
    return fo.pinned != null;

  else {
    return fo.operation && isList(fo.operation) && hasAny(fo.token) ||
      fo.token && fo.token.filterType == "String";
  }
}

export function mapFilterTokens(fo: FilterOption, mapToken : (token: string) => string): FilterOption {
  
  if (isFilterGroup(fo)) {
    return {
      ...fo,
      groupOperation: fo.groupOperation,
      filters: fo.filters.map(f => f && mapFilterTokens(f, mapToken)),
      token: fo.token && mapToken(fo.token.toString())
    };
  }
  else {
    return {
      ...fo,
      token: fo.token && mapToken(fo.token.toString()),
    }
  }
}

export function getTokenParents(token: QueryToken | null | undefined): QueryToken[] {
  const result: QueryToken[] = [];
  while (token) {
    result.insertAt(0, token);
    token = token.parent;
  }
  return result;
}

export function toQueryToken(cd: ColumnDescription): QueryToken {
  return {
    toStr: cd.displayName,
    niceName: cd.displayName,
    key: cd.name,
    fullKey: cd.name,
    unit: cd.unit,
    format: cd.format,
    type: cd.type,
    typeColor: cd.typeColor,
    niceTypeName: cd.niceTypeName,
    filterType: cd.filterType,
    isGroupable: cd.isGroupable,
    hasOrderAdapter: cd.hasOrderAdapter,
    preferEquals: cd.preferEquals,
    propertyRoute: cd.propertyRoute
  };
}

export type FilterRequest = FilterConditionRequest | FilterGroupRequest;


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
  orderType: OrderType
}

export interface ColumnRequest {
  token: string;
  displayName: string;
}

export interface QueryEntitiesRequest {
  queryKey: string;
  filters: FilterRequest[];
  orders: OrderRequest[];
  count: number | null;
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

export type AggregateType = "Count" | "Average" | "Sum" | "Min" | "Max";

export interface QueryValueRequest {
  queryKey: string;
  filters: FilterRequest[];
  multipleValues?: boolean;
  valueToken?: string;
  systemTime?: SystemTime;
}

export interface ResultTable {
  columns: string[];
  uniqueValues: { [token: string]: any[] }
  rows: ResultRow[];
  pagination: Pagination
  totalElements?: number;
}

export interface ResultRow {
  entity: Lite<Entity> | undefined;
  columns: any[];
}

export interface Pagination {
  mode: PaginationMode;
  elementsPerPage?: number;
  currentPage?: number;
}

export interface SystemTime {
  mode: SystemTimeMode;
  joinMode?: SystemTimeJoinMode;
  startDate?: string;
  endDate?: string;
}

export module PaginateMath {
  export function startElementIndex(p: Pagination) {
    return (p.elementsPerPage! * (p.currentPage! - 1)) + 1;
  }

  export function endElementIndex(p: Pagination, rows: number) {
    return startElementIndex(p) + rows - 1;
  }

  export function totalPages(p: Pagination, totalElements: number) {
    return Math.max(1, Math.ceil(totalElements / p.elementsPerPage!)); //Round up
  }

  export function maxElementIndex(p: Pagination) {
    return (p.elementsPerPage! * (p.currentPage! + 1)) - 1;
  }
}





export interface QueryDescription {
  queryKey: string;
  columns: { [name: string]: ColumnDescription };
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

export function isList(fo: FilterOperation) {
  return fo == "IsIn" ||
    fo == "IsNotIn";
}


export function getFilterType(tr: TypeReference): FilterType | null {
  if (tr.name == "number")
    return "Integer";

  if (tr.name == "decmial")
    return "Decimal";

  if (tr.name == "boolean")
    return "Boolean";

  if (tr.name == "string")
    return "String";

  if (tr.name == "DateTime")
    return "DateTime";

  if (tr.name == "Guid")
    return "Guid";

  if (tr.isEmbedded)
    return "Embedded";

  if (isTypeEnum(tr.name))
    return "Enum";

  if (tr.isLite || tryGetTypeInfos(tr)[0]?.name)
    return "Lite";

  return null;
}

export function getFilterOperations(qt: QueryToken): FilterOperation[] {

  if (qt.filterType == null)
    return [];

  var fops = filterOperations[qt.filterType];

  if (qt.queryTokenType == null && qt.propertyRoute != null) {
    var pr = PropertyRoute.tryParseFull(qt.propertyRoute);

    if (pr && pr.member?.hasFullTextIndex)
      return ["ComplexCondition", "FreeText", ...fops];
  }
  return fops;
}

export function getFilterGroupUnifiedFilterType(tr: TypeReference): FilterType | null {
  if (tr.name == "number" || tr.name == "decmial" || tr.name == "boolean" || tr.name == "string" || tr.name == "Guid")
    return "String";

  if (tr.name == "DateTime")
    return "DateTime";

  if (tr.isEmbedded)
    return "Embedded";

  if (isTypeEnum(tr.name))
    return "Enum";

  if (tr.isLite || tryGetTypeInfos(tr)[0]?.name)
    return "Lite";

  return null;
}

export const filterOperations: { [a: string /*FilterType*/]: FilterOperation[] } = {};
filterOperations["String"] = [
  "Contains",
  "EqualTo",
  "StartsWith",
  "EndsWith",
  "Like",
  "NotContains",
  "DistinctTo",
  "NotStartsWith",
  "NotEndsWith",
  "NotLike",
  "IsIn",
  "IsNotIn"
];

filterOperations["DateTime"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Time"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Integer"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Decimal"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn"
];

filterOperations["Enum"] = [
  "EqualTo",
  "DistinctTo",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsIn",
  "IsNotIn",
];

filterOperations["Guid"] = [
  "EqualTo",
  "DistinctTo",
  "IsIn",
  "IsNotIn"
];

filterOperations["Lite"] = [
  "EqualTo",
  "DistinctTo",
  "IsIn",
  "IsNotIn"
];

filterOperations["Embedded"] = [
  "EqualTo",
  "DistinctTo",
];

filterOperations["Model"] = [
  "EqualTo",
  "DistinctTo",
];

filterOperations["Boolean"] = [
  "EqualTo",
  "DistinctTo",
];
