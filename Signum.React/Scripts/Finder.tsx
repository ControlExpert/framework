import * as React from "react";
import { DateTime, Duration } from 'luxon'
import * as AppContext from "./AppContext"
import * as Navigator from "./Navigator"
import { Dic, classes, softCast } from './Globals'
import { ajaxGet, ajaxPost } from './Services';

import {
  QueryDescription, QueryValueRequest, QueryRequest, QueryEntitiesRequest, FindOptions,
  FindOptionsParsed, FilterOption, FilterOptionParsed, OrderOptionParsed, ValueFindOptionsParsed,
  QueryToken, ColumnDescription, ColumnOption, ColumnOptionParsed, Pagination, ResultColumn,
  ResultTable, ResultRow, OrderOption, SubTokensOptions, toQueryToken, isList, ColumnOptionsMode, FilterRequest, ModalFindOptions, OrderRequest, ColumnRequest,
  isFilterGroupOption, FilterGroupOptionParsed, FilterConditionOptionParsed, isFilterGroupOptionParsed, FilterGroupOption, FilterConditionOption, FilterGroupRequest, FilterConditionRequest, PinnedFilter, SystemTime, QueryTokenType, hasAnyOrAll, hasAggregate, hasElement, toPinnedFilterParsed, isActive
} from './FindOptions';

import { PaginationMode, OrderType, FilterOperation, FilterType, UniqueType, QueryTokenMessage, FilterGroupOperation, PinnedFilterActive } from './Signum.Entities.DynamicQuery';

import { Entity, Lite, toLite, liteKey, parseLite, EntityControlMessage, isLite, isEntityPack, isEntity, External, SearchMessage, ModifiableEntity, is, JavascriptMessage } from './Signum.Entities';
import { TypeEntity, QueryEntity } from './Signum.Entities.Basics';

import {
  Type, IType, EntityKind, QueryKey, getQueryNiceName, getQueryKey, isQueryDefined, TypeReference,
  getTypeInfo, tryGetTypeInfos, getEnumInfo, toLuxonFormat, toNumberFormat, PseudoType, EntityData,
  TypeInfo, PropertyRoute, QueryTokenString, getTypeInfos, tryGetTypeInfo, onReloadTypesActions, 
  Anonymous, toLuxonDurationFormat, timeToString, toFormatWithFixes
} from './Reflection';

import SearchModal from './SearchControl/SearchModal';
import EntityLink from './SearchControl/EntityLink';
import SearchControlLoaded from './SearchControl/SearchControlLoaded';
import { ImportRoute } from "./AsyncImport";
import { SearchControl } from "./Search";
import { ButtonBarElement } from "./TypeContext";
import { EntityBaseController } from "./Lines";
import { clearContextualItems } from "./SearchControl/ContextualItems";
import { APIHookOptions, useAPI } from "./Hooks";
import { QueryString } from "./QueryString";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BsSize } from "./Components";


export const querySettings: { [queryKey: string]: QuerySettings } = {};

export function clearQuerySettings() {
  Dic.clear(querySettings);
}

export function start(options: { routes: JSX.Element[] }) {
  options.routes.push(<ImportRoute path="~/find/:queryName" onImportModule={() => Options.getSearchPage()} />);
  AppContext.clearSettingsActions.push(clearContextualItems);
  AppContext.clearSettingsActions.push(clearQuerySettings);
  AppContext.clearSettingsActions.push(clearQueryDescriptionCache);
  AppContext.clearSettingsActions.push(ButtonBarQuery.clearButtonBarElements);

  onReloadTypesActions.push(clearQueryDescriptionCache);
}

export function addSettings(...settings: QuerySettings[]) {
  settings.forEach(s => Dic.addOrThrow(querySettings, getQueryKey(s.queryName), s));
}

export function pinnedSearchFilter<T extends Entity>(type: Type<T>, ...tokens: ((t: QueryTokenString<Anonymous<T>>) => (QueryTokenString<any> | FilterConditionOption))[]): FilterGroupOption {
  return {
    groupOperation: "Or",
    pinned: { splitText: true },
    filters: tokens.map(t => {
      var res = t(type.token());

      if (res instanceof QueryTokenString)
        return { token: res, operation: "Contains" } as FilterConditionOption;

      return res;
    })
  };
}

export function getSettings(queryName: PseudoType | QueryKey): QuerySettings | undefined {
  return querySettings[getQueryKey(queryName)];
}

export function getOrAddSettings(queryName: PseudoType | QueryKey): QuerySettings {
  return querySettings[getQueryKey(queryName)] ?? (querySettings[getQueryKey(queryName)] = { queryName: queryName });
}

export const isFindableEvent: Array<(queryKey: string, fullScreen: boolean) => boolean> = [];

export function isFindable(queryName: PseudoType | QueryKey, fullScreen: boolean): boolean {

  if (!isQueryDefined(queryName))
    return false;

  const queryKey = getQueryKey(queryName);

  return isFindableEvent.every(f => f(queryKey, fullScreen));
}

export function find<T extends Entity = Entity>(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<T> | undefined>;
export function find<T extends Entity>(type: Type<T>, modalOptions?: ModalFindOptions): Promise<Lite<T> | undefined>;
export function find(obj: FindOptions | Type<any>, modalOptions?: ModalFindOptions): Promise<Lite<Entity> | undefined> {

  const fo = (obj as FindOptions).queryName ? obj as FindOptions :
    { queryName: obj as Type<any> } as FindOptions;

  if (fo.groupResults)
    throw new Error("Use findRow instead");

  var qs = getSettings(fo.queryName);
  if (qs?.onFind && !(modalOptions?.useDefaultBehaviour))
    return qs.onFind(fo, modalOptions);

  return defaultFind(fo, modalOptions);
}

export function defaultFind(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<Entity> | undefined> {
  let getPromiseSearchModal: () => Promise<Lite<Entity> | undefined> = () => Options.getSearchModal()
    .then(a => a.default.open(fo, modalOptions))
    .then(a => a?.row.entity);

  if (modalOptions?.autoSelectIfOne || modalOptions?.autoSkipIfZero)
    return fetchEntitiesLiteWithFilters(fo.queryName, fo.filterOptions ?? [], fo.orderOptions ?? [], 2)
      .then(data => {
        if (data.length == 1 && modalOptions?.autoSelectIfOne)
          return Promise.resolve(data[0]);

        if (data.length == 0 && modalOptions?.autoSkipIfZero)
          return Promise.resolve(undefined);

        return getPromiseSearchModal();
      });

  return getPromiseSearchModal();
}

export namespace Options {
  export function getSearchPage() {
    return import("./SearchControl/SearchPage");
  }
  export function getSearchModal() {
    return import("./SearchControl/SearchModal");
  }

  export let entityColumnHeader: () => React.ReactChild = () => "";

  export let tokenCanSetPropery = (qt: QueryToken) =>
    qt.filterType == "Lite" && qt.key != "Entity" ||
    qt.filterType == "Enum" && !isState(qt.type) ||
    qt.filterType == "DateTime" && qt.propertyRoute != null && PropertyRoute.tryParseFull(qt.propertyRoute)?.member?.type.name == "DateOnly";

  export let isState = (ti: TypeReference) => ti.name.endsWith("State");

  export let defaultPagination: Pagination = {
    mode: "Paginate",
    elementsPerPage: 20,
    currentPage: 1,
  };

}

export function findRow(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<{ row: ResultRow, searchControl: SearchControlLoaded } | undefined> {

  var qs = getSettings(fo.queryName);

  return Options.getSearchModal()
    .then(a => a.default.open(fo, modalOptions));
}


export function findMany<T extends Entity = Entity>(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<T>[] | undefined>;
export function findMany<T extends Entity>(type: Type<T>, modalOptions?: ModalFindOptions): Promise<Lite<T>[] | undefined>;
export function findMany(findOptions: FindOptions | Type<any>, modalOptions?: ModalFindOptions): Promise<Lite<Entity>[] | undefined> {

  const fo = (findOptions as FindOptions).queryName ? findOptions as FindOptions :
    { queryName: findOptions as Type<any> } as FindOptions;

  if (fo.groupResults)
    throw new Error("Use findManyRows instead");

  var qs = getSettings(fo.queryName);
  if (qs?.onFindMany && !(modalOptions?.useDefaultBehaviour))
    return qs.onFindMany(fo, modalOptions);

  return defaultFindMany(fo, modalOptions);
}

export function defaultFindMany(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<Lite<Entity>[] | undefined> {
  let getPromiseSearchModal: () => Promise<Lite<Entity>[] | undefined> = () => Options.getSearchModal()
    .then(a => a.default.openMany(fo, modalOptions))
    .then(a => a?.rows.map(a => a.entity!));

  if (modalOptions?.autoSelectIfOne || modalOptions?.autoSkipIfZero)
    return fetchEntitiesLiteWithFilters(fo.queryName, fo.filterOptions || [], fo.orderOptions || [], 2)
      .then(data => {
        if (data.length == 1 && modalOptions?.autoSelectIfOne)
          return Promise.resolve(data);

        if (data.length == 0 && modalOptions?.autoSkipIfZero)
          return Promise.resolve(data);

        return getPromiseSearchModal();
      });

  return getPromiseSearchModal();
}

export function findManyRows(fo: FindOptions, modalOptions?: ModalFindOptions): Promise<{ rows: ResultRow[], searchControl: SearchControlLoaded } | undefined> {

  var qs = getSettings(fo.queryName);

  return Options.getSearchModal()
    .then(a => a.default.openMany(fo, modalOptions));
}

export function exploreWindowsOpen(findOptions: FindOptions, e: React.MouseEvent<any>) {
  e.preventDefault();
  if (e.ctrlKey || e.button == 1)
    window.open(findOptionsPath(findOptions));
  else
    explore(findOptions).done();
}

export function explore(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<void> {

  var qs = getSettings(findOptions.queryName);
  if (qs?.onExplore && !(modalOptions?.useDefaultBehaviour))
    return qs.onExplore(findOptions, modalOptions);

  return Options.getSearchModal()
    .then(a => a.default.explore(findOptions, modalOptions));
}

export function findOptionsPath(fo: FindOptions, extra?: any): string {

  const query = findOptionsPathQuery(fo, extra);

  return AppContext.history.createHref({ pathname: "~/find/" + getQueryKey(fo.queryName), search: QueryString.stringify(query) });
}

export function findOptionsPathQuery(fo: FindOptions, extra?: any): any {
  fo = autoRemoveTrivialColumns(fo);

  const query = {
    groupResults: fo.groupResults || undefined,
    idf: fo.includeDefaultFilters,
    columnMode: (!fo.columnOptionsMode || fo.columnOptionsMode == "Add" as ColumnOptionsMode) ? undefined : fo.columnOptionsMode,
    paginationMode: fo.pagination && fo.pagination.mode,
    elementsPerPage: fo.pagination && fo.pagination.elementsPerPage,
    currentPage: fo.pagination && fo.pagination.currentPage,
    systemTimeMode: fo.systemTime && fo.systemTime.mode,
    systemTimeJoinMode: fo.systemTime && fo.systemTime.joinMode,
    systemTimeStartDate: fo.systemTime && fo.systemTime.startDate,
    systemTimeEndDate: fo.systemTime && fo.systemTime.endDate,
    ...extra
  };

  Encoder.encodeFilters(query, fo.filterOptions?.notNull());
  Encoder.encodeOrders(query, fo.orderOptions?.notNull());
  Encoder.encodeColumns(query, fo.columnOptions?.notNull());

  return query;
}

export function getTypeNiceName(tr: TypeReference) {

  const niceName = tr.typeNiceName ??
    tryGetTypeInfos(tr)
      .map(ti => ti == undefined ? getSimpleTypeNiceName(tr.name) : (ti.niceName ?? ti.name))
      .joinComma(External.CollectionMessage.Or.niceToString());

  return tr.isCollection ? QueryTokenMessage.ListOf0.niceToString(niceName) : niceName;
}

export function getSimpleTypeNiceName(name: string) {

  switch (name) {
    case "string":
    case "guid":
      return QueryTokenMessage.Text.niceToString();
    case "datetime": return QueryTokenMessage.DateTime.niceToString();
    case "datetimeoffset": return QueryTokenMessage.DateTimeOffset.niceToString();
    case "number": return QueryTokenMessage.Number.niceToString();
    case "decimal": return QueryTokenMessage.DecimalNumber.niceToString();
    case "boolean": return QueryTokenMessage.Check.niceToString();
  }

  return name;
}


export function parseFindOptionsPath(queryName: PseudoType | QueryKey, query: any): FindOptions {

  const result: FindOptions = {
    queryName: queryName,
    groupResults: parseBoolean(query.groupResults),
    includeDefaultFilters: parseBoolean(query.idf),
    filterOptions: Decoder.decodeFilters(query),
    orderOptions: Decoder.decodeOrders(query),
    columnOptions: Decoder.decodeColumns(query),
    columnOptionsMode: query.columnMode == undefined ? "Add" : query.columnMode,
    pagination: query.paginationMode && {
      mode: query.paginationMode,
      elementsPerPage: query.elementsPerPage,
      currentPage: query.currentPage,
    } as Pagination,
    systemTime: query.systemTimeMode && {
      mode: query.systemTimeMode,
      joinMode: query.systemTimeJoinMode,
      startDate: query.systemTimeStartDate,
      endDate: query.systemTimeEndDate,
    }
  };

  return Dic.simplify(result)!;
}

export function mergeColumns(columnDescriptions: ColumnDescription[], mode: ColumnOptionsMode, columnOptions: ColumnOption[]): ColumnOption[] {

  switch (mode) {
    case "Add":
      return columnDescriptions.filter(cd => cd.name != "Entity").map(cd => ({ token: cd.name, displayName: cd.displayName }) as ColumnOption)
        .concat(columnOptions);

    case "InsertStart":
      return columnOptions
        .concat(columnDescriptions.filter(cd => cd.name != "Entity").map(cd => ({ token: cd.name, displayName: cd.displayName }) as ColumnOption));

    case "Remove":
      return columnDescriptions.filter(cd => cd.name != "Entity" && !columnOptions.some(a => a.token == cd.name))
        .map(cd => ({ token: cd.name, displayName: cd.displayName }) as ColumnOption);

    case "Replace":
      return columnOptions;

    default: throw new Error("Unexpected column mode");
  }
}

export function smartColumns(current: ColumnOptionParsed[], ideal: ColumnDescription[]): { mode: ColumnOptionsMode; columns: ColumnOption[] } {

  const similar = (c: ColumnOptionParsed, d: ColumnDescription) =>
    c.token!.fullKey == d.name && (c.displayName == d.displayName) && c.summaryToken == null && !c.hiddenColumn;

  ideal = ideal.filter(a => a.name != "Entity");

  current = current.filter(a => a.token != null);

  if (ideal.every((idl, i) => i < current.length && similar(current[i], idl))) {
    return {
      mode: "Add",
      columns: current.slice(ideal.length).map(c => ({
        token: c.token!.fullKey,
        displayName: c.token!.niceName == c.displayName ? undefined : c.displayName,
        summaryToken: c.summaryToken?.fullKey,
        hiddenColumn: c.hiddenColumn,
      }) as ColumnOption)
    };
  }

  if (current.length < ideal.length) {
    const toRemove: ColumnOption[] = [];

    let j = 0;
    for (let i = 0; i < ideal.length; i++) {
      if (j < current.length && similar(current[j], ideal[i]))
        j++;
      else
        toRemove.push({ token: ideal[i].name, });
    }

    if (toRemove.length + current.length == ideal.length && toRemove.length < current.length) {
      return {
        mode: "Remove",
        columns: toRemove
      };
    }
  }
  

  return {
    mode: "Replace",
    columns: current.map(c => ({
      token: c.token!.fullKey,
      displayName: c.token!.niceName == c.displayName ? undefined : c.displayName,
      summaryToken: c.summaryToken?.fullKey,
      hiddenColumn: c.hiddenColumn,
    }) as ColumnOption),
  };
}

function parseBoolean(value: any): boolean | undefined {
  if (value === "true" || value === true)
    return true;

  if (value === "false" || value === false)
    return false;

  return undefined;
}

export function parseFilterOptions(fos: (FilterOption | null | undefined)[], groupResults: boolean, qd: QueryDescription): Promise<FilterOptionParsed[]> {

  const completer = new TokenCompleter(qd);
  var sto = SubTokensOptions.CanElement | SubTokensOptions.CanAnyAll | (groupResults ? SubTokensOptions.CanAggregate : 0);

  fos.notNull().forEach(fo => completer.requestFilter(fo, sto));

  return completer.finished()
    .then(() => fos.notNull().map(fo => completer.toFilterOptionParsed(fo)))
    .then(filters => parseFilterValues(filters).then(() => filters));
}



export function parseOrderOptions(orderOptions: (OrderOption | null | undefined)[], groupResults: boolean, qd: QueryDescription): Promise<OrderOptionParsed[]> {

  const completer = new TokenCompleter(qd);
  var sto = SubTokensOptions.CanElement | (groupResults ? SubTokensOptions.CanAggregate : 0);
  orderOptions.notNull().forEach(a => completer.request(a.token.toString(), sto));

  return completer.finished()
    .then(() => orderOptions.notNull().map(oo => ({
      token: completer.get(oo.token.toString()),
      orderType: oo.orderType ?? "Ascending",
    }) as OrderOptionParsed));
}

export function parseColumnOptions(columnOptions: ColumnOption[], groupResults: boolean, qd: QueryDescription): Promise<ColumnOptionParsed[]> {

  const completer = new TokenCompleter(qd);
  var sto = SubTokensOptions.CanElement | (groupResults ? SubTokensOptions.CanAggregate : 0);
  columnOptions.forEach(a => completer.request(a.token.toString(), sto));

  return completer.finished()
    .then(() => columnOptions.map(co => ({
      token: completer.get(co.token.toString()),
      displayName: (typeof co.displayName == "function" ? co.displayName() : co.displayName) ?? completer.get(co.token.toString()).niceName,
      summaryToken: co.summaryToken && completer.get(co.summaryToken.toString()),
      hiddenColumn: co.hiddenColumn,
    }) as ColumnOptionParsed));
}



export function getPropsFromFilters(type: PseudoType, filterOptionsParsed: FilterOptionParsed[], avoidCustom?: boolean): Promise<any> {

  const ti = getTypeInfo(type);

  if (!avoidCustom && querySettings[ti.name]?.customGetPropsFromFilter) {
    return querySettings[ti.name].customGetPropsFromFilter!([...filterOptionsParsed]);
  }


  function getMemberForToken(ti: TypeInfo, fullKey: string) {
    var token = fullKey.tryAfter("Entity.") ?? fullKey;

    if (token.contains("."))
      return null;

    return ti.members[token];
  }


  var result: any = {};

  return Promise.all(filterOptionsParsed.map(fo => {

    if (isFilterGroupOptionParsed(fo) ||
      fo.token == null ||
      !Options.tokenCanSetPropery(fo.token) ||
      fo.operation != "EqualTo" ||
      !isActive(fo))
      return null;

    const mi = getMemberForToken(ti, fo.token!.fullKey);

    if (!mi)
      return null;

    const promise = tryConvert(fo.value, mi.type);

    if (promise == null)
      return null;

    return promise.then(v => result[mi.name.firstLower()] = v);

  }).filter(p => !!p)).then(() => result);
}

export function tryConvert(value: any, type: TypeReference): Promise<any> | undefined {

  if (value == null)
    return Promise.resolve(null);

  if (type.isLite) {

    if (isLite(value))
      return Promise.resolve(value);

    if (isEntity(value))
      return Promise.resolve(toLite(value));

    return undefined;
  }

  const ti = tryGetTypeInfo(type.name);

  if (ti?.kind == "Entity") {

    if (isLite(value))
      return Navigator.API.fetch(value);

    if (isEntity(value))
      return Promise.resolve(value);

    return undefined;
  }

  if (type.name == "string" || type.name == "Guid" || type.name == "DateOnly" || ti?.kind == "Enum") {
    if (typeof value === "string")
      return Promise.resolve(value);

    return undefined;
  }

  if (type.name == "boolean") {
    if (typeof value === "boolean")
      return Promise.resolve(value);
  }

  if (type.name == "number") {
    if (typeof value === "number")
      return Promise.resolve(value);
  }

  return undefined;
}


export function getPropsFromFindOptions(type: PseudoType, fo: FindOptions | undefined): Promise<any> {
  if (fo == null)
    return Promise.resolve(undefined);

  return getQueryDescription(fo.queryName)
    .then(qd => parseFindOptions(fo, qd, true))
    .then(fop => getPropsFromFilters(type, fop.filterOptions));
}

export function toFindOptions(fo: FindOptionsParsed, qd: QueryDescription, defaultIncludeDefaultFilters: boolean): FindOptions {

  const pair = smartColumns(fo.columnOptions, Dic.getValues(qd.columns));

  const qs = getSettings(fo.queryKey);

  const defPagination = qs?.pagination ?? Options.defaultPagination;

  function equalsPagination(p1: Pagination, p2: Pagination) {
    return p1.mode == p2.mode && p1.elementsPerPage == p2.elementsPerPage && p1.currentPage == p2.currentPage;
  }

  var findOptions = {
    queryName: fo.queryKey,
    groupResults: fo.groupResults ? true : undefined,
    filterOptions: toFilterOptions(fo.filterOptions),
    orderOptions: fo.orderOptions.filter(a => !!a.token).map(o => ({ token: o.token.fullKey, orderType: o.orderType }) as OrderOption),
    columnOptions: pair.columns,
    columnOptionsMode: pair.mode,
    pagination: fo.pagination && !equalsPagination(fo.pagination, defPagination) ? fo.pagination : undefined,
    systemTime: fo.systemTime,
  } as FindOptions;

  if (!findOptions.groupResults && findOptions.orderOptions) {
    var defaultOrder = getDefaultOrder(qd, qs);

    if (equalOrders(defaultOrder, findOptions.orderOptions.notNull()))
      findOptions.orderOptions = undefined;
  }

  if (findOptions.filterOptions) {
    var defaultFilters = getDefaultFilter(qd, qs);
    var filterOptions = findOptions.filterOptions.notNull();
    if (defaultFilters && defaultFilters.length <= filterOptions.length) {
      if (equalFilters(defaultFilters, filterOptions.slice(0, defaultFilters.length))) {
        findOptions.filterOptions = filterOptions.slice(defaultFilters.length);
        findOptions.includeDefaultFilters = true;
      }
    }
  }
  if (!findOptions.includeDefaultFilters)
    findOptions.includeDefaultFilters = false;

  if (findOptions.includeDefaultFilters == defaultIncludeDefaultFilters)
    delete findOptions.includeDefaultFilters;

  return findOptions;
}

function equalOrders(as: OrderOption[] | undefined, bs: OrderOption[] | undefined): boolean {
  if (as == undefined && bs == undefined)
    return true;

  if (as == undefined || bs == undefined)
    return false;

  return as.length == bs.length && as.every((a, i) => {
    var b = bs![i];

    return (a.token && a.token.toString()) == (b.token && b.token.toString()) &&
      a.orderType == b.orderType;
  });
}

function equalFilters(as: FilterOption[] | undefined, bs: FilterOption[] | undefined): boolean {

  if (as == undefined && bs == undefined)
    return true;

  if (as == undefined || bs == undefined)
    return false;

  return as.length == bs.length && as.every((a, i) => {
    var b = bs![i];

    return (a.token && a.token.toString()) == (b.token && b.token.toString()) &&
      (a as FilterGroupOption).groupOperation == (b as FilterGroupOption).groupOperation &&
      ((a as FilterConditionOption).operation ?? "EqualTo") == ((b as FilterConditionOption).operation ?? "EqualTo") &&
      (a.value == b.value || is(a.value, b.value, false, false)) &&
      Dic.equals(a.pinned, b.pinned, true) &&
      equalFilters((a as FilterGroupOption).filters, (b as FilterGroupOption).filters);
  });
}

export const defaultOrderColumn: string = "Id";

export function getDefaultOrder(qd: QueryDescription, qs: QuerySettings | undefined): OrderOption[] | undefined {
  if (qs?.defaultOrders)
    return qs.defaultOrders;

  const tis = getTypeInfos(qd.columns["Entity"].type);

  if (!qd.columns[defaultOrderColumn])
    return undefined;

  return [{
    token: defaultOrderColumn,
    orderType: tis.some(a => a.entityData == "Transactional") ? "Descending" : "Ascending"
  }];
}

export function getDefaultFilter(qd: QueryDescription | undefined, qs: QuerySettings | undefined): FilterOption[] | undefined {
  if (qs?.simpleFilterBuilder)
    return undefined;

  if (qs?.defaultFilters)
    return qs.defaultFilters;

  if (qd == null || qd.columns["Entity"]) {
    return [
      {
        groupOperation: "Or",
        pinned: { label: SearchMessage.Search.niceToString(), splitText: true, active: "WhenHasValue" },
        filters: [
          { token: "Entity.ToString", operation: "Contains" },
          { token: "Entity.Id", operation: "EqualTo" },
        ]
      }
    ];
  }
  else {
    return undefined;
  }
}

export function isAggregate(fop: FilterOptionParsed): boolean {
  if (isFilterGroupOptionParsed(fop))
    return fop.filters.some(f => isAggregate(f));

  return fop.token != null && fop.token.queryTokenType == "Aggregate";
}

export function toFilterOptions(filterOptionsParsed: FilterOptionParsed[]): FilterOption[] {

  function toFilterOption(fop: FilterOptionParsed): FilterOption | null {


    var pinned = fop.pinned && Dic.simplify({ ...fop.pinned }) as PinnedFilter;
    if (isFilterGroupOptionParsed(fop))
      return ({
        token: fop.token && fop.token.fullKey,
        groupOperation: fop.groupOperation,
        value: fop.value === "" ? undefined : fop.value,
        pinned: pinned,
        filters: fop.filters.map(fp => toFilterOption(fp)).filter(fo => !!fo),
      }) as FilterGroupOption;
    else {
      if (fop.token == null)
        return null;

      return ({
        token: fop.token && fop.token.fullKey,
        operation: fop.operation,
        value: fop.value === "" ? undefined : fop.value,
        frozen: fop.frozen ? true : undefined,
        pinned: pinned
      }) as FilterConditionOption;
    }
  }

  return filterOptionsParsed.map(fop => toFilterOption(fop)).filter(fo => fo != null) as FilterOption[];
}

export function parseFindOptions(findOptions: FindOptions, qd: QueryDescription, defaultIncludeDefaultFilters: boolean): Promise<FindOptionsParsed> {

  const fo = autoRemoveTrivialColumns(findOptions);

  fo.columnOptions = mergeColumns(Dic.getValues(qd.columns), fo.columnOptionsMode ?? "Add", fo.columnOptions?.notNull() ?? []);

  var qs: QuerySettings | undefined = querySettings[qd.queryKey];
  const tis = tryGetTypeInfos(qd.columns["Entity"].type);

  if (!fo.groupResults && (!fo.orderOptions || fo.orderOptions.length == 0)) {
    var defaultOrder = getDefaultOrder(qd, qs);

    if (defaultOrder)
      fo.orderOptions = defaultOrder;
  }

  if (fo.includeDefaultFilters == null ? defaultIncludeDefaultFilters : fo.includeDefaultFilters) {
    var defaultFilters = getDefaultFilter(qd, qs);
    if (defaultFilters)
      fo.filterOptions = [...defaultFilters, ...fo.filterOptions ?? []];
  }

  var canAggregate = (findOptions.groupResults ? SubTokensOptions.CanAggregate : 0);
  const completer = new TokenCompleter(qd);


  if (fo.filterOptions)
    fo.filterOptions.notNull().forEach(fo => completer.requestFilter(fo, SubTokensOptions.CanElement | SubTokensOptions.CanAnyAll | canAggregate));

  if (fo.orderOptions)
    fo.orderOptions.notNull().forEach(oo => completer.request(oo.token.toString(), SubTokensOptions.CanElement | canAggregate));

  if (fo.columnOptions) {
    fo.columnOptions.notNull().forEach(co => completer.request(co.token.toString(), SubTokensOptions.CanElement | canAggregate));
    fo.columnOptions.notNull().filter(a => a.summaryToken).forEach(co => completer.request(co.summaryToken!.toString(), SubTokensOptions.CanElement | SubTokensOptions.CanAggregate));
  }

  return completer.finished().then(() => {

    var result: FindOptionsParsed = {
      queryKey: qd.queryKey,
      groupResults: fo.groupResults == true,
      pagination: fo.pagination != null ? fo.pagination : qs?.pagination ?? Options.defaultPagination,
      systemTime: fo.systemTime,

      columnOptions: (fo.columnOptions?.notNull() ?? []).map(co => ({
        token: completer.get(co.token.toString()),
        displayName: (typeof co.displayName == "function" ? co.displayName() : co.displayName) ?? completer.get(co.token.toString()).niceName,
        summaryToken: co.summaryToken && completer.get(co.summaryToken.toString()),
        hiddenColumn: co.hiddenColumn,
      }) as ColumnOptionParsed),

      orderOptions: (fo.orderOptions?.notNull() ?? []).map(oo => ({
        token: completer.get(oo.token.toString()),
        orderType: oo.orderType,
      }) as OrderOptionParsed),

      filterOptions: (fo.filterOptions?.notNull() ?? []).map(fo => completer.toFilterOptionParsed(fo)),
    };

    return parseFilterValues(result.filterOptions)
      .then(() => result)
  });
}

export function getQueryRequest(fo: FindOptionsParsed, qs?: QuerySettings): QueryRequest {

  return {
    queryKey: fo.queryKey,
    groupResults: fo.groupResults,
    filters: toFilterRequests(fo.filterOptions),
    columns: fo.columnOptions.filter(a => a.token != undefined).map(co => ({ token: co.token!.fullKey, displayName: co.displayName! }))
      .concat((!fo.groupResults && qs?.hiddenColumns || []).map(co => ({ token: co.token.toString(), displayName: "" }))),
    orders: fo.orderOptions.filter(a => a.token != undefined).map(oo => ({ token: oo.token.fullKey, orderType: oo.orderType })),
    pagination: fo.pagination,
    systemTime: fo.systemTime,
  };
}

export function getSummaryQueryRequest(fo: FindOptionsParsed): QueryRequest | null {

  var summaryTokens = fo.columnOptions.filter(a => a.summaryToken != undefined).map(a => a.summaryToken!)
    .filter(a => a.queryTokenType == "Aggregate");

  if (summaryTokens.length == 0)
    return null;

  return {
    queryKey: fo.queryKey,
    groupResults: true,
    filters: toFilterRequests(fo.filterOptions),
    columns: summaryTokens.map(sqt => ({ token: sqt.fullKey, displayName: sqt.niceName! })),
    orders: [],
    pagination: { mode: "All" }, //Should be 1 result anyway
    systemTime: fo.systemTime,
  };
}

export function validateNewEntities(fo: FindOptions): string | undefined {

  function getValues(fo: FilterOption): any[] {
    if (isFilterGroupOption(fo))
      return fo.filters.flatMap(f => getValues(f));

    return [fo.value];
  }

  var allValues = (fo.filterOptions?.notNull() ?? []).flatMap(fo => getValues(fo));

  var allNewTypes = allValues.flatMap(a => getTypeIfNew(a));

  if (allNewTypes.length == 0)
    return undefined;

  return `Filtering by new ${allNewTypes.joinComma(" and ")}. Consider hiding the control for new entities.`;
}

function getTypeIfNew(val: any): string[] {
  if (!val)
    return [];

  if (isEntity(val) && val.isNew)
    return [val.Type];

  if (isLite(val) && val.id == null)
    return [val.EntityType];

  if (Array.isArray(val))
    return val.flatMap(v => getTypeIfNew(v));

  return [];
}



export function exploreOrView(findOptions: FindOptions): Promise<void> {
  return fetchEntitiesLiteWithFilters(findOptions.queryName, findOptions.filterOptions ?? [], [], 2).then(list => {
    if (list.length == 1)
      return Navigator.view(list[0], { buttons: "close" }).then(() => undefined);
    else
      return explore(findOptions);
  });
}

export function getQueryValue(queryName: PseudoType | QueryKey, filterOptions: (FilterOption | null | undefined)[], valueToken?: string, multipleValues?: boolean): Promise<any> {
  return getQueryDescription(queryName).then(qd => {
    return parseFilterOptions(filterOptions, false, qd).then(fops => {

      let filters = toFilterRequests(fops);

      return API.queryValue({ queryKey: qd.queryKey, filters, valueToken, multipleValues });
    });
  });
}

export function toFilterRequests(fops: FilterOptionParsed[], overridenValue?: OverridenValue): FilterRequest[] {
  return fops.map(fop => toFilterRequest(fop, overridenValue)).filter(a => a != null) as FilterRequest[];
}

interface OverridenValue {
  value: any;
}

export function toFilterRequest(fop: FilterOptionParsed, overridenValue?: OverridenValue): FilterRequest | undefined {

  if (fop.pinned && fop.pinned.active == "Checkbox_StartUnchecked")
    return undefined;

  if (fop.pinned && fop.pinned.active == "DashboardFilter")
    return undefined;

  if (fop.pinned && overridenValue == null) {
    if (fop.pinned.splitText) {

      if (!fop.value)
        return undefined;

      if (typeof fop.value != "string")
        throw new Error("Split text only works with string");

      var parts = fop.value.split(/\s+/);

      return ({
        groupOperation: "And",
        token: fop.token && fop.token.fullKey,
        filters: parts.filter(a => a.length > 0).map(part => toFilterRequest(fop, { value: part })),
      }) as FilterGroupRequest;
    }
    else if (isFilterGroupOptionParsed(fop)) {

      if (fop.pinned.active == "WhenHasValue" && fop.value == null) {
        return undefined;
      }

      if (fop.pinned.active == "Checkbox_StartChecked") {

      } else {
        return toFilterRequest(fop, { value: fop.value });
      }

    }
  }

  if (isFilterGroupOptionParsed(fop))
    return ({
      groupOperation: fop.groupOperation,
      token: fop.token && fop.token.fullKey,
      filters: toFilterRequests(fop.filters, overridenValue)
    } as FilterGroupRequest);
  else {
    if (fop.token == null || fop.token.filterType == null || fop.operation == null)
      return undefined;

    if (overridenValue == null && fop.pinned && fop.pinned.active == "WhenHasValue" && (fop.value == null || fop.value === ""))
      return undefined;

    var value = overridenValue ? overridenValue.value : fop.value;

    if (fop.token && typeof value == "string") {
      if (fop.token.type.name == "number") {

        var numVal = parseInt(value);

        if (isNaN(numVal)) {
          if (overridenValue)
            return undefined;

          return ({
            token: fop.token.fullKey,
            operation: fop.operation,
            value: undefined,
          } as FilterConditionRequest);
        }

        return ({
          token: fop.token.fullKey,
          operation: fop.operation,
          value: numVal,
        } as FilterConditionRequest);
      }

      if (fop.token.type.name == "Guid") {
        if (!isValidGuid(value)) {
          if (overridenValue)
            return undefined;

          return ({
            token: fop.token.fullKey,
            operation: fop.operation,
            value: undefined,
          } as FilterConditionRequest);
        }

        return ({
          token: fop.token.fullKey,
          operation: fop.operation,
          value: value,
        } as FilterConditionRequest);
      }
    }

    return ({
      token: fop.token.fullKey,
      operation: fop.operation,
      value: value,
    } as FilterConditionRequest);
  }
}


function isValidGuid(str : string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function fetchEntitiesLiteWithFilters<T extends Entity>(queryName: Type<T>, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<Lite<T>[]>;
export function fetchEntitiesLiteWithFilters(queryName: PseudoType | QueryKey, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<Lite<Entity>[]>;
export function fetchEntitiesLiteWithFilters(queryName: PseudoType | QueryKey, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<Lite<Entity>[]> {
  return getQueryDescription(queryName).then(qd =>
    parseFilterOptions(filterOptions, false, qd)
      .then(fops =>
        parseOrderOptions(orderOptions, false, qd).then(oop =>
          API.fetchEntitiesLiteWithFilters({

            queryKey: qd.queryKey,

            filters: toFilterRequests(fops),

            orders: oop.map(oo => ({
              token: oo.token!.fullKey,
              orderType: oo.orderType
            }) as OrderRequest),

            count: count
          })
        )
      )
  );
}

export function fetchEntitiesFullWithFilters<T extends Entity>(queryName: Type<T>, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<T[]>;
export function fetchEntitiesFullWithFilters(queryName: PseudoType | QueryKey, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<Entity[]>;
export function fetchEntitiesFullWithFilters(queryName: PseudoType | QueryKey, filterOptions: (FilterOption | null | undefined)[], orderOptions: (OrderOption | null | undefined)[], count: number | null): Promise<Entity[]> {
  return getQueryDescription(queryName).then(qd =>
    parseFilterOptions(filterOptions, false, qd)
      .then(fops =>
        parseOrderOptions(orderOptions, false, qd).then(oop =>
          API.fetchEntitiesFullWithFilters({

            queryKey: qd.queryKey,

            filters: toFilterRequests(fops),

            orders: oop.map(oo => ({
              token: oo.token!.fullKey,
              orderType: oo.orderType
            }) as OrderRequest),

            count: count
          })
        )
      )
  );
}

export function defaultNoColumnsAllRows(fo: FindOptions, count: number | undefined): FindOptions {

  const newFO = { ...fo };

  if (newFO.columnOptions == undefined && newFO.columnOptionsMode == undefined) {

    newFO.columnOptions = [];
    newFO.columnOptionsMode = "Replace";
  }

  if (newFO.pagination == undefined) {
    newFO.pagination = count == undefined ? { mode: "All" } :  { mode: "Firsts", elementsPerPage: count };
  }

  return newFO;
}

export function autoRemoveTrivialColumns(fo: FindOptions): FindOptions {

  var newFO = { ...fo };

  if (newFO.columnOptions == undefined && newFO.columnOptionsMode == undefined && newFO.filterOptions) {
    var trivialColumns = getTrivialColumns(newFO.filterOptions.notNull());

    if (trivialColumns.length) {
      newFO.columnOptions = trivialColumns;
      newFO.columnOptionsMode = "Remove";
    }
  }

  return newFO;
}


export function getTrivialColumns(fos: FilterOption[]) {
  return fos
    .filter(fo => !isFilterGroupOption(fo) && (fo.operation == null || fo.operation == "EqualTo") && !fo.token.toString().contains(".") && fo.pinned == null && fo.value != null)
    .map(fo => ({ token: fo.token }) as ColumnOption);
}
export function parseSingleToken(queryName: PseudoType | QueryKey, token: string, subTokenOptions: SubTokensOptions): Promise<QueryToken> {

  return getQueryDescription(getQueryKey(queryName)).then(qd => {
    const completer = new TokenCompleter(qd);
    const result = completer.request(token, subTokenOptions);
    return completer.finished().then(() => completer.get(token));
  });
}

export class TokenCompleter {

  static globalCache: {
    [queryKey: string]: {
      [fullKey: string]: QueryToken
    }
  } = {};

  queryCache: {
    [fullKey: string]: QueryToken
  };

  tokensToRequest: {
    [fullKey: string]: (
      {
        options: SubTokensOptions,
        token?: QueryToken,
      })
  } = {};

  constructor(public queryDescription: QueryDescription)
  {
    this.queryCache = TokenCompleter.globalCache[queryDescription.queryKey] ??
      (TokenCompleter.globalCache[queryDescription.queryKey] = {});
  }

  requestFilter(fo: FilterOption, options: SubTokensOptions) {

    if (isFilterGroupOption(fo)) {
      fo.token && this.request(fo.token.toString(), options);

      fo.filters.forEach(f => this.requestFilter(f, options));
    } else {

      this.request(fo.token.toString(), options);
    }
  }

  request(fullKey: string, options: SubTokensOptions): void {

    if (this.isSimple(fullKey))
      return;

    var token = this.queryCache[fullKey];
    if (token) {
      if (hasAggregate(token) && (options & SubTokensOptions.CanAggregate) == 0)
        throw new Error(`Token with key '${fullKey}' not found on query '${this.queryDescription.queryKey} (aggregates not allowed)`);

      if (hasAnyOrAll(token) && (options & SubTokensOptions.CanAnyAll) == 0)
        throw new Error(`Token with key '${fullKey}' not found on query '${this.queryDescription.queryKey} (Any/All not allowed)`);

      if (hasElement(token) && (options & SubTokensOptions.CanElement) == 0)
        throw new Error(`Token with key '${fullKey}' not found on query '${this.queryDescription.queryKey} (Element not allowed)`);
      return;
    }

    if (this.tokensToRequest[fullKey])
      return;

    this.tokensToRequest[fullKey] = {
      options: options
    };
  }

  isSimple(fullKey: string) {
    return !fullKey.contains(".") && fullKey != "Count";
  }

  finished(): Promise<void> {

    const tokens = Dic.map(this.tokensToRequest, (token, val) => ({ token: token, options: val.options }));

    if (tokens.length == 0)
      return Promise.resolve(undefined);

    return API.parseTokens(this.queryDescription.queryKey, tokens).then(parsedTokens => {
      parsedTokens.forEach(t => {
        this.tokensToRequest[t.fullKey].token = t;
        if (!this.queryCache[t.fullKey])
          this.queryCache[t.fullKey] = t;
      });
    });
  }


  get(fullKey: string): QueryToken {
    if (this.isSimple(fullKey)) {
      const cd = this.queryDescription.columns[fullKey];

      if (cd == undefined)
        throw new Error(`Column '${fullKey}' is not a column of query '${this.queryDescription.queryKey}'. Maybe use 'Entity.${fullKey}' instead?`);

      return toQueryToken(cd);
    }

    if (this.queryCache[fullKey]) {
      return this.queryCache[fullKey];
    }

    return this.tokensToRequest[fullKey].token!;
  }

  toFilterOptionParsed(fo: FilterOption): FilterOptionParsed {
    if (isFilterGroupOption(fo)) {
      const token = fo.token && this.get(fo.token.toString())

      return ({
        token: token,
        groupOperation: fo.groupOperation,
        value: fo.value,
        pinned: fo.pinned && toPinnedFilterParsed(fo.pinned),
        filters: fo.filters.map(f => this.toFilterOptionParsed(f)),
        frozen: false,
        expanded: false,
      } as FilterGroupOptionParsed);
    }
    else
    {

      const token = this.get(fo.token.toString());

      return ({
        token: token,
        operation: fo.operation ?? "EqualTo",
        value: fo.value,
        frozen: fo.frozen || false,
        pinned: fo.pinned && toPinnedFilterParsed(fo.pinned),
      } as FilterConditionOptionParsed);
    }
  }
}

export function parseFilterValues(filterOptions: FilterOptionParsed[]): Promise<void> {

  const needToStr: Lite<any>[] = [];

  function parseFilterValue(fo: FilterOptionParsed) {
    if (isFilterGroupOptionParsed(fo))
      fo.filters.forEach(f => parseFilterValue(f));
    else {
      if (isList(fo.operation!)) {
        if (!Array.isArray(fo.value))
          fo.value = [fo.value];

        fo.value = (fo.value as any[]).map(v => parseValue(fo.token!, v, needToStr));
      }
      else {
        if (Array.isArray(fo.value))
          throw new Error("Unespected array for operation " + fo.operation);

        fo.value = parseValue(fo.token!, fo.value, needToStr);
      }
    }
  }

  filterOptions.forEach(fo => parseFilterValue(fo));

  if (needToStr.length == 0)
    return Promise.resolve(undefined);

  return Navigator.API.fillToStringsArray(needToStr)
}


function parseValue(token: QueryToken, val: any, needToStr: Array<any>): any {
  switch (token.filterType) {
    case "Boolean": return parseBoolean(val);
    case "Integer": return nanToNull(parseInt(val));
    case "Decimal": return nanToNull(parseFloat(val));
    case "DateTime": {

      if (val == null)
        return null;

      if (typeof val == "string") {

        const dt = val.endsWith("Z") ? DateTime.fromISO(val, { zone: "utc" }) : DateTime.fromISO(val);

        if (val.length == 10 && token.type.name == "DateTime") //Date -> DateTime
          return dt.toISO();

        if (val.length > 10 && token.type.name == "DateOnly") //DateTime -> Date
          return dt.toISODate();

        return val;
      }

      if (val instanceof DateTime) {
        if (token.type.name == "DateOnly") //DateTime -> Date
          return val.toISODate();
        return val.toISO();
      }

      if (val instanceof Date) {
        if (token.type.name == "DateOnly") //DateTime -> Date
          return DateTime.fromJSDate(val).toISODate();
        return DateTime.fromJSDate(val).toISO();
      }

      return val;
    }

    case "Lite":
      {
        const lite = convertToLite(val);

        if (lite && !lite.toStr)
          needToStr.push(lite);

        return lite;
      }
  }

  return val;
}

function nanToNull(n: number) {
  if (isNaN(n))
    return undefined;

  return n;
}

function convertToLite(val: string | Lite<Entity> | Entity | undefined): Lite<Entity> | undefined {
  if (val == undefined || val == "")
    return undefined;

  if (isLite(val)) {
    if (val.entity != undefined && val.entity.id != undefined)
      return toLite(val.entity, false);

    return val;
  }

  if (isEntity(val))
    return toLite(val);

  if (typeof val === "string")
    return parseLite(val);

  throw new Error(`Impossible to convert ${val} to Lite`);
}

function clearQueryDescriptionCache() {
  queryDescriptionCache = {};
  TokenCompleter.globalCache = {};
}

let queryDescriptionCache: { [queryKey: string]: Promise<QueryDescription> } = {};
export function getQueryDescription(queryName: PseudoType | QueryKey): Promise<QueryDescription> {
  const queryKey = getQueryKey(queryName);

  if (!queryDescriptionCache[queryKey]) {
    queryDescriptionCache[queryKey] = API.fetchQueryDescription(queryKey).then(qd => {
      return Dic.deepFreeze(qd);
    });
  }

  return queryDescriptionCache[queryKey];
}

export function inDB<R>(entity: Entity | Lite<Entity>, token: QueryTokenString<R> | string): Promise<AddToLite<R> | null> {

  var fo: FindOptions = {
    queryName: isEntity(entity) ? entity.Type : entity.EntityType,
    filterOptions: [{ token: "Entity", value: entity }],
    pagination: { mode: "Firsts", elementsPerPage: 1 },
    columnOptions: [{ token: token }],
    columnOptionsMode: "Replace",
  };

  return getQueryDescription(fo.queryName)
    .then(qd => parseFindOptions(fo!, qd, false))
    .then(fop => API.executeQuery(getQueryRequest(fop)))
    .then(rt => rt.rows[0].columns[0]);
}

export function inDBArray<R1, R2>(entity: Entity | Lite<Entity>, tokens: [QueryTokenString<R1> | string, QueryTokenString<R2> | string]): Promise<[AddToLite<R1> | null, AddToLite<R2> | null]>;
export function inDBArray<R1, R2, R3>(entity: Entity | Lite<Entity>, tokens: [QueryTokenString<R1> | string, QueryTokenString<R2> | string, QueryTokenString<R3> | string]): Promise<[AddToLite<R1> | null, AddToLite<R2> | null, AddToLite<R3> | null]>;
export function inDBArray<R1, R2, R3, R4>(entity: Entity | Lite<Entity>, tokens: [QueryTokenString<R1> | string, QueryTokenString<R2> | string, QueryTokenString<R3> | string, QueryTokenString<R4> | string]): Promise<[AddToLite<R1> | null, AddToLite<R2> | null, AddToLite<R3> | null, AddToLite<R4> | null]>;
export function inDBArray(entity: Entity | Lite<Entity>, tokens: (QueryTokenString<any> | string)[]): Promise<any[]> {

  var fo: FindOptions = {
    queryName: isEntity(entity) ? entity.Type : entity.EntityType,
    filterOptions: [{ token: "Entity", value: entity }],
    pagination: { mode: "Firsts", elementsPerPage: 1 },
    columnOptions: tokens.map(t => softCast<ColumnOption>({ token: t})),
    columnOptionsMode: "Replace",
  };

  return getQueryDescription(fo.queryName)
    .then(qd => parseFindOptions(fo!, qd, false))
    .then(fop => API.executeQuery(getQueryRequest(fop)))
    .then(rt => rt.rows[0].columns);
}

export type AddToLite<T> = T extends Entity ? Lite<T> : T;

export function useQuery(fo: FindOptions | null, additionalDeps?: any[], options?: APIHookOptions): ResultTable | undefined | null {
  return useAPI(
    signal => fo == null ? Promise.resolve<ResultTable | null>(null) : getResultTable(fo, signal),
    [fo && findOptionsPath(fo), ...(additionalDeps || [])],
    options);
}

export function getResultTable(fo: FindOptions, signal?: AbortSignal): Promise<ResultTable> {
  return getQueryDescription(fo.queryName)
    .then(qd => parseFindOptions(fo!, qd, false))
    .then(fop => API.executeQuery(getQueryRequest(fop), signal));
}

export function useInDB<R>(entity: Entity | Lite<Entity> | null, token: QueryTokenString<R> | string, additionalDeps?: any[], options?: APIHookOptions): AddToLite<R> | null | undefined {
  var resultTable = useQuery(entity == null ? null : {
    queryName: isEntity(entity) ? entity.Type : entity.EntityType,
    filterOptions: [{ token: "Entity", value: entity }],
    pagination: { mode: "Firsts", elementsPerPage: 1 },
    columnOptions: [{ token: token }],
    columnOptionsMode: "Replace",
  }, additionalDeps, options);

  if (entity == null)
    return null;

  if (resultTable == null)
    return undefined;

  return resultTable.rows[0]?.columns[0] ?? null;
}

export function useFetchAllLite<T extends Entity>(type: Type<T>, deps?: any[]): Lite<T>[] | undefined {
  return useAPI(() => API.fetchAllLites({ types: type.typeName }), deps ?? []) as Lite<T>[] | undefined;
}

export module API {

  export function fetchQueryDescription(queryKey: string): Promise<QueryDescription> {
    return ajaxGet({ url: "~/api/query/description/" + queryKey });
  }

  export function fetchQueryEntity(queryKey: string): Promise<QueryEntity> {
    return ajaxGet({ url: "~/api/query/queryEntity/" + queryKey });
  }

  interface QueryRequestUrl extends QueryRequest {
    queryUrl: string;
  }

  export function executeQuery(request: QueryRequest, signal?: AbortSignal): Promise<ResultTable> {
  
    const queryUrl = AppContext.history.location.pathname + AppContext.history.location.search;
    const qr: QueryRequestUrl = { ...request, queryUrl: queryUrl};
    return ajaxPost({ url: "~/api/query/executeQuery", signal }, qr);
  }

  export function queryValue(request: QueryValueRequest, avoidNotifyPendingRequest: boolean | undefined = undefined, signal?: AbortSignal): Promise<any> {
    return ajaxPost({ url: "~/api/query/queryValue", avoidNotifyPendingRequests: avoidNotifyPendingRequest, signal }, request);
  }

  export function fetchEntitiesLiteWithFilters(request: QueryEntitiesRequest): Promise<Lite<Entity>[]> {
    return ajaxPost({ url: "~/api/query/entitiesLiteWithFilter" }, request);
  }

  export function fetchEntitiesFullWithFilters(request: QueryEntitiesRequest): Promise<Entity[]>{
    return ajaxPost({ url: "~/api/query/entitiesFullWithFilter" }, request);
  }

  export function fetchAllLites(request: { types: string }): Promise<Lite<Entity>[]> {
    return ajaxGet({
      url: "~/api/query/allLites?" + QueryString.stringify(request)
    });
  }

  export function findTypeLike(request: { subString: string, count: number }): Promise<Lite<TypeEntity>[]> {
    return ajaxGet({
      url: "~/api/query/findTypeLike?" + QueryString.stringify(request)
    });
  }

  export function findLiteLike(request: AutocompleteRequest, signal?: AbortSignal): Promise<Lite<Entity>[]> {
    return ajaxGet({ url: "~/api/query/findLiteLike?" + QueryString.stringify({ ...request }), signal });
  }

  export interface AutocompleteRequest {
    types: string;
    subString: string;
    count: number;
  }

  export function parseTokens(queryKey: string, tokens: { token: string, options: SubTokensOptions }[]): Promise<QueryToken[]> {
    return ajaxPost({ url: "~/api/query/parseTokens" }, { queryKey, tokens });
  }

  export function getSubTokens(queryKey: string, token: QueryToken | undefined, options: SubTokensOptions): Promise<QueryToken[]> {
    return ajaxPost<QueryToken[]>({ url: "~/api/query/subTokens" }, { queryKey, token: token == undefined ? undefined : token.fullKey, options }).then(list => {

      if (token == undefined) {
        const entity = list.filter(a => a.key == "Entity").single();

        list.filter(a => a.fullKey.startsWith("Entity.")).forEach(t => t.parent = entity);
      } else {
        list.forEach(t => t.parent = token);
      }
      return list;
    });
  }
}



function shouldIgnoreValues(pinned?: PinnedFilter | null) {
  return pinned != null && (pinned.active == "Always" || pinned.active == "WhenHasValue");
}

export module Encoder {



  export function encodeFilters(query: any, filterOptions?: FilterOption[]) {

    var i: number = 0;

    function encodeFilter(fo: FilterOption, identation: number, ignoreValues: boolean) {
      var identSuffix = identation == 0 ? "" : ("_" + identation);

      var index = i++;

      if (fo.pinned) {
        var p = fo.pinned;
        query["filterPinned" + index + identSuffix] = scapeTilde(typeof p.label == "function" ? p.label() : p.label ?? "") +
          "~" + (p.column == null ? "" : p.column) +
          "~" + (p.row == null ? "" : p.row) +
          "~" + PinnedFilterActive.values().indexOf(p.active ?? "Always") +
          "~" + (p.splitText ? 1 : 0);
      }


      if (isFilterGroupOption(fo)) {
        query["filter" + index + identSuffix] = (fo.token ?? "") + "~" + (fo.groupOperation) + "~" + (ignoreValues ? "" : stringValue(fo.value));

        fo.filters.forEach(f => encodeFilter(f, identation + 1, ignoreValues || shouldIgnoreValues(fo.pinned)));
      } else {
        query["filter" + index + identSuffix] = fo.token + "~" + (fo.operation ?? "EqualTo") + "~" + (ignoreValues ? "" : stringValue(fo.value));
      }

    }

    if (filterOptions)
      filterOptions.forEach(fo => encodeFilter(fo, 0, false));
  }

  export function encodeOrders(query: any, orderOptions?: OrderOption[]) {
    if (orderOptions)
      orderOptions.forEach((oo, i) => query["order" + i] = (oo.orderType == "Descending" ? "-" : "") + oo.token);
  }

  export function encodeColumns(query: any, columnOptions?: ColumnOption[]) {
    if (columnOptions) {
      columnOptions.forEach((co, i) => {

        var displayName = co.hiddenColumn ? HIDDEN :
          co.displayName ? scapeTilde(typeof co.displayName == "function" ? co.displayName() : co.displayName) :
            undefined;

        query["column" + i] = co.token + (displayName ? ("~" + displayName) : "");
        if (co.summaryToken)
          query["summary" + i] = co.summaryToken.toString();
      });
    }
  }

  export function stringValue(value: any): string {

    if (value == undefined)
      return "";

    if (Array.isArray(value))
      return (value as any[]).map(a => stringValue(a)).join("~");

    if (isEntity(value))
      value = toLite(value, value.isNew);

    if (isLite(value))
      return liteKey(value);

    return scapeTilde(value.toString());
  }

  export function scapeTilde(str: string) {
    if (str == undefined)
      return "";

    return str.replace("~", "#|#");
  }
}




const HIDDEN = "__";

export module Decoder {

  interface FilterPart {
    order: number;
    identation: number;
    value: string;
  };

  export function filterInOrder(query: any, prefix: string): FilterPart[] {
    const regex = new RegExp("^" + prefix + "(\\d*)(_(\\d*))?$");

    return Dic.getKeys(query)
      .map(s => regex.exec(s))
      .filter(r => !!r)
      .map(m => ({ order: parseInt(m![1]), identation: parseInt(m![3] ?? "0"), value: query[m![0]] }))
      .orderBy(a => a.order);
  }

  export function decodeFilters(query: any): FilterOption[] {

    function parsePinnedFilter(str: string): PinnedFilter {
      var parts = str.split("~");
      return ({
        label: unscapeTildes(parts[0]),
        column: parts[1].length ? parseInt(parts[1]) : undefined,
        row: parts[2].length ? parseInt(parts[2]) : undefined,
        active: parseInt(parts[3]) == 0 ? undefined : PinnedFilterActive.values()[parseInt(parts[3])],
        splitText: parseInt(parts[4]) == 0 ? undefined : Boolean(parseInt(parts[4])),
      });
    }


    function toFilterList(filters: FilterPart[], identation: number, ignoreValues: boolean): FilterOption[] {

      return filters.groupWhen(a => a.identation == identation).map(gr => {

        var identSuffix = identation == 0 ? "" : ("_" + identation);

        var pinnedText = query["filterPinned" + gr.key.order + identSuffix] as string;

        var pinned = pinnedText == undefined ? null : parsePinnedFilter(pinnedText);

        const parts = gr.key.value.split("~");

        if (FilterOperation.isDefined(parts[1])) {
          return ({
            token: parts[0],
            operation: FilterOperation.assertDefined(parts[1]),
            value: ignoreValues ? null :
              parts.length == 3 ? unscapeTildes(parts[2]) :
                parts.slice(2).map(a => unscapeTildes(a)),
            pinned: pinned,
          }) as FilterConditionOption
        } else {
          return ({
            token: parts[0] == null || parts[0].length == 0 ? null : parts[0],
            groupOperation: FilterGroupOperation.assertDefined(parts[1]),
            value: ignoreValues ? null : unscapeTildes(parts[2]),
            pinned: pinned,
            filters: toFilterList(gr.elements, identation + 1, ignoreValues || shouldIgnoreValues(pinned)),
          }) as FilterGroupOption;
        }
      });
    }

    return toFilterList(filterInOrder(query, "filter"), 0, false)
  }

  export function unscapeTildes(str: string | undefined): string | undefined {
    if (!str)
      return undefined;

    return str.replace("#|#", "~");
  }

  export function valuesInOrder(query: any, prefix: string): { index: number, value: string }[] {
    const regex = new RegExp("^" + prefix + "(\\d*)$");

    return Dic.getKeys(query).map(s => regex.exec(s))
      .filter(r => !!r)
      .map(r => ({ index: parseInt(r![1]), value: query[r![0]] }))
      .orderBy(a => a.index);   
  }

  export function decodeOrders(query: any): OrderOption[] {
    return valuesInOrder(query, "order").map(p => ({
      orderType: p.value[0] == "-" ? "Descending" : "Ascending",
      token: p.value[0] == "-" ? p.value.tryAfter("-") : p.value
    } as OrderOption));
  }


  export function decodeColumns(query: any): ColumnOption[] {
    var summary = valuesInOrder(query, "summary");

    return valuesInOrder(query, "column").map(p => {

      var displayName = unscapeTildes(p.value.tryAfter("~")); 

      return ({
        token: p.value.tryBefore("~") ?? p.value,
        displayName: displayName == HIDDEN ? undefined : displayName,
        hiddenColumn: displayName == HIDDEN ? true : undefined,
        summaryToken: summary.firstOrNull(a => a.index == p.index)?.value
      }) as ColumnOption;
    });
  }
}


export module ButtonBarQuery {

  interface ButtonBarQueryContext {
    searchControl: SearchControlLoaded;
    findOptions: FindOptionsParsed;
  }

  export const onButtonBarElements: ((ctx: ButtonBarQueryContext) => ButtonBarElement | undefined)[] = [];

  export function getButtonBarElements(ctx: ButtonBarQueryContext): ButtonBarElement[] {
    return onButtonBarElements.map(f => f(ctx)).filter(a => a != undefined).map(a => a as ButtonBarElement);
  }

  export function clearButtonBarElements() {
    ButtonBarQuery.onButtonBarElements.clear();
  }

}



export interface QuerySettings {
  queryName: PseudoType | QueryKey;
  pagination?: Pagination;
  allowSystemTime?: boolean;
  defaultOrders?: OrderOption[];
  defaultFilters?: FilterOption[];
  hiddenColumns?: ColumnOption[];
  formatters?: { [token: string]: CellFormatter };
  rowAttributes?: (row: ResultRow, columns: string[]) => React.HTMLAttributes<HTMLTableRowElement> | undefined;
  entityFormatter?: EntityFormatter;
  inPlaceNavigation?: boolean;
  modalSize?: BsSize;
  showContextMenu?: (fop: FindOptionsParsed) => boolean | "Basic";
  allowSelection?: boolean;
  showFilters?: boolean;
  getViewPromise?: (e: ModifiableEntity | null) => (undefined | string | Navigator.ViewPromise<ModifiableEntity>);
  onDoubleClick?: (e: React.MouseEvent<any>, row: ResultRow, columns: string[], sc?: SearchControlLoaded) => void;
  simpleFilterBuilder?: (sfbc: SimpleFilterBuilderContext) => React.ReactElement<any> | undefined;
  onFind?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<Lite<Entity> | undefined>;
  onFindMany?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<Lite<Entity>[] | undefined>;
  onExplore?: (fo: FindOptions, mo?: ModalFindOptions) => Promise<void>;
  extraButtons?: (searchControl: SearchControlLoaded) => (ButtonBarElement | null | undefined | false)[];
  customGetPropsFromFilter?: (filters: FilterOptionParsed[]) => Promise<any>;
}


export interface SimpleFilterBuilderContext {
  queryDescription: QueryDescription;
  initialFilterOptions: FilterOptionParsed[];
  search: () => void;
  searchControl?: SearchControlLoaded
}

export interface FormatRule {
  name: string;
  formatter: (column: QueryToken, sc: SearchControlLoaded | undefined) => CellFormatter;
  isApplicable: (column: QueryToken, sc: SearchControlLoaded | undefined) => boolean;
}

export class CellFormatter {
  constructor(
    public formatter: (cell: any, ctx: CellFormatterContext) => React.ReactChild | undefined,
    public cellClass?: string) {
  }
}

export interface CellFormatterContext {
  refresh?: () => void;
  systemTime?: SystemTime;
  columns: string[];
  row: ResultRow;
  rowIndex: number;
}


export function getCellFormatter(qs: QuerySettings | undefined, qt: QueryToken, sc: SearchControlLoaded | undefined): CellFormatter {

  const result = qs?.formatters && qs.formatters[qt.fullKey];

  if (result)
    return result;

  const prRoute = registeredPropertyFormatters[qt.propertyRoute!];
  if (prRoute)
    return prRoute;

  const rule = formatRules.filter(a => a.isApplicable(qt, sc)).last("FormatRules");

  return rule.formatter(qt, sc);
}

export const registeredPropertyFormatters: { [typeAndProperty: string]: CellFormatter } = {};

export function registerPropertyFormatter(pr: PropertyRoute | string/*For expressions*/ |undefined, formater: CellFormatter) {
  if (pr == null)
    return;
  registeredPropertyFormatters[pr.toString()] = formater;
}

export const formatRules: FormatRule[] = [
  {
    name: "Object",
    isApplicable: qt => true,
    formatter: qt => new CellFormatter(cell => cell ? <span className="try-no-wrap">{cell.toStr ?? cell.toString()}</span> : undefined)
  },
  {
    name: "MultiLine",
    isApplicable: qt => {
      if (qt.type.name == "string" && qt.propertyRoute != null) {
        var pr = PropertyRoute.tryParseFull(qt.propertyRoute);
        if (pr != null && pr.member != null && (pr.member.isMultiline || pr.member.maxLength != null && pr.member.maxLength > 150))
          return true;
      }

      return false;
    },
    formatter: qt => new CellFormatter(cell => cell ? <span className="multi-line">{cell.toStr ?? cell.toString()}</span> : undefined)
  },
  {
    name: "Password",
    isApplicable: qt => qt.format == "Password",
    formatter: qt => new CellFormatter(cell => cell ? <span>•••••••</span> : undefined)
  },
  {
    name: "Enum",
    isApplicable: qt => qt.filterType == "Enum",
    formatter: qt => new CellFormatter(cell => {
      if (cell == undefined)
        return undefined;

      var ei = getEnumInfo(qt.type.name, cell);

      return <span className="try-no-wrap">{ei ? ei.niceName : cell}</span>
    })
  },
  {
    name: "Lite",
    isApplicable: qt => qt.filterType == "Lite",
    formatter: qt => new CellFormatter((cell: Lite<Entity> | undefined, ctx) => !cell ? undefined : <EntityLink lite={cell} onNavigated={ctx.refresh} />)
  },

  {
    name: "Guid",
    isApplicable: qt => qt.filterType == "Guid",
    formatter: qt => new CellFormatter((cell: string | undefined) => cell && <span className="guid try-no-wrap">{cell.substr(0, 4) + "…" + cell.substring(cell.length - 4)}</span>)
  },
  {
    name: "DateTime",
    isApplicable: qt => qt.filterType == "DateTime",
    formatter: qt => {
      const luxonFormat = toLuxonFormat(qt.format, qt.type.name as "DateOnly" | "DateTime");
      return new CellFormatter((cell: string | undefined) => cell == undefined || cell == "" ? "" : <bdi className="date try-no-wrap">{toFormatWithFixes(DateTime.fromISO(cell), luxonFormat)}</bdi>, "date-cell") //To avoid flippig hour and date (L LT) in RTL cultures
    }
  },
  {
    name: "Time",
    isApplicable: qt => qt.filterType == "Time",
    formatter: qt => {
      const durationFormat = toLuxonDurationFormat(qt.format) ?? "hh:mm:ss";

      return new CellFormatter((cell: string | undefined) => cell == undefined || cell == "" ? "" : <bdi className="date try-no-wrap">{Duration.fromISOTime(cell).toFormat(durationFormat)}</bdi>, "date-cell") //To avoid flippig hour and date (L LT) in RTL cultures
    }
  },
  {
    name: "SystemValidFrom",
    isApplicable: qt => qt.fullKey.tryAfterLast(".") == "SystemValidFrom",
    formatter: qt => {
      return new CellFormatter((cell: string | undefined, ctx) => {
        if (cell == undefined || cell == "")
          return "";

        var className = cell.startsWith("0001-") ? "date-start" :
          ctx.systemTime && ctx.systemTime.mode == "Between" && ctx.systemTime.startDate! < cell ? "date-created" :
            undefined;

        const luxonFormat = toLuxonFormat(qt.format, qt.type.name as "DateOnly" | "DateTime");
        return <bdi className={classes("date", "try-no-wrap", className)}>{toFormatWithFixes(DateTime.fromISO(cell), luxonFormat)}</bdi>; //To avoid flippig hour and date (L LT) in RTL cultures
      }, "date-cell");
    }
  },
  {
    name: "SystemValidTo",
    isApplicable: qt => qt.fullKey.tryAfterLast(".") == "SystemValidTo",
    formatter: qt => {
      return new CellFormatter((cell: string | undefined, ctx) => {
        if (cell == undefined || cell == "")
          return "";

        var className = cell.startsWith("9999-") ? "date-end" :
          ctx.systemTime && ctx.systemTime.mode == "Between" && cell < ctx.systemTime.endDate! ? "date-removed" :
            undefined;

        const luxonFormat = toLuxonFormat(qt.format, qt.type.name as "DateOnly" | "DateTime");
        return <bdi className={classes("date", "try-no-wrap", className)}>{DateTime.fromISO(cell).toFormat(luxonFormat)}</bdi>; //To avoid flippig hour and date (L LT) in RTL cultures
      }, "date-cell");
    }
  },
  {
    name: "Number",
    isApplicable: qt => qt.filterType == "Integer" || qt.filterType == "Decimal",
    formatter: qt => {
      const numberFormat = toNumberFormat(qt.format);
      return new CellFormatter((cell: number | undefined) => cell == undefined ? "" : <span className="try-no-wrap">{numberFormat.format(cell)}</span>, "numeric-cell");
    }
  },
  {
    name: "Number with Unit",
    isApplicable: qt => (qt.filterType == "Integer" || qt.filterType == "Decimal") && Boolean(qt.unit),
    formatter: qt => {
      const numberFormat = toNumberFormat(qt.format);
      return new CellFormatter((cell: number | undefined) => cell == undefined ? "" : <span className="try-no-wrap">{numberFormat.format(cell) + "\u00a0" + qt.unit}</span>, "numeric-cell");
    }
  },
  {
    name: "Bool",
    isApplicable: qt => qt.filterType == "Boolean",
    formatter: col => new CellFormatter((cell: boolean | undefined) => cell == undefined ? undefined : <input type="checkbox" className="form-check-input" disabled={true} checked={cell} />, "centered-cell")
  },
];

export interface EntityFormatRule {
  name: string;
  formatter: EntityFormatter;
  isApplicable: (sc: SearchControlLoaded | undefined) => boolean;
}

export class EntityFormatter {
  constructor(
    public formatter: (row: ResultRow, columns: string[], sc?: SearchControlLoaded) => React.ReactChild | undefined,
    public cellClass?: string) {
  }
}

export const entityFormatRules: EntityFormatRule[] = [
  {
    name: "View",
    isApplicable: sc => true,
    formatter: new EntityFormatter((row, columns, sc) => !row.entity || !Navigator.isViewable(row.entity.EntityType, { isSearch: true }) ? undefined :
      <EntityLink lite={row.entity}
        inSearch={true}
        onNavigated={sc?.handleOnNavigated}
        getViewPromise={sc && (sc.props.getViewPromise ?? sc.props.querySettings?.getViewPromise)}
        inPlaceNavigation={sc?.props.view == "InPlace"} className="sf-line-button sf-view">
        <span title={EntityControlMessage.View.niceToString()}>
          {EntityBaseController.viewIcon}
        </span>
      </EntityLink>, "centered-cell")
  },
  {
    name: "View",
    isApplicable: sc => sc?.state.resultFindOptions?.groupResults == true,
    formatter: new EntityFormatter((row, columns, sc) => 
      <a href="#"
        className="sf-line-button sf-view"
        onClick={e => { e.preventDefault(); sc!.openRowGroup(row); }}
      >
        <span title={JavascriptMessage.ShowGroup.niceToString()}>
          <FontAwesomeIcon icon="layer-group"/>
        </span>
      </a>, "centered-cell")
  },
];
