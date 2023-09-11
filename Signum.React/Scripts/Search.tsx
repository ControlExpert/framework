import type { FindOptions, ColumnOption, ColumnOptionsMode, FilterOption, FilterOperation, FilterOptionParsed, FindOptionsParsed, OrderOption, OrderType, Pagination, PaginationMode, ResultTable, FilterConditionOptionParsed } from './FindOptions'
import { isFilterGroupOption, isFilterGroupOptionParsed } from './FindOptions'
export { FindOptions, ColumnOption, ColumnOptionsMode, FilterOption, FilterOperation, FilterOptionParsed, FindOptionsParsed, OrderOption, OrderType, Pagination, PaginationMode, ResultTable };

import EntityLink from './SearchControl/EntityLink'
import type { EntityLinkProps } from './SearchControl/EntityLink'
export { EntityLink, EntityLinkProps };

import SearchControl from './SearchControl/SearchControl'
import type { SearchControlProps, ISimpleFilterBuilder, SearchControlHandler } from './SearchControl/SearchControl'
export { SearchControl, SearchControlProps, ISimpleFilterBuilder, SearchControlHandler };

import SearchControlLoaded from './SearchControl/SearchControlLoaded'
import type { SearchControlLoadedProps } from './SearchControl/SearchControlLoaded'
export { SearchControlLoaded, SearchControlLoadedProps };

import SearchValue from './SearchControl/SearchValue'
import type { SearchValueProps, SearchValueController } from './SearchControl/SearchValue'
export { SearchValue, SearchValueProps, SearchValueController };

import SearchValueLine from './SearchControl/SearchValueLine'
import type { SearchValueLineProps, SearchValueLineController } from './SearchControl/SearchValueLine'
import { QueryTokenString } from './Reflection';
export { SearchValueLine, SearchValueLineProps, SearchValueLineController };
import { AddToLite } from './Finder';
import { bool } from 'prop-types';

export function extractFilterValue<T>(filters: FilterOptionParsed[], token: QueryTokenString<T>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: AddToLite<T> | null) => boolean): AddToLite<T> | null | undefined;
export function extractFilterValue(filters: FilterOptionParsed[], token: string | QueryTokenString<any>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: any) => boolean): any;
export function extractFilterValue(filters: FilterOptionParsed[], token: string | QueryTokenString<any>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: any) => boolean): any {

  var f = extractFilter(filters, token, operation, valueCondition);
  if (f == null)
    return undefined; 

  return f.value;
}

export function extractFilter<T>(filters: FilterOptionParsed[], token: QueryTokenString<T>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: AddToLite<T> | null) => boolean): FilterConditionOptionParsed | undefined;
export function extractFilter(filters: FilterOptionParsed[], token: string | QueryTokenString<any>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: AddToLite<any> | null) => boolean): FilterConditionOptionParsed | undefined;
export function extractFilter<T>(filters: FilterOptionParsed[], token: string | QueryTokenString<any>, operation: FilterOperation | ((op: FilterOperation) => boolean), valueCondition?: (v: AddToLite<any> | null) => boolean): FilterConditionOptionParsed | undefined {
  var f = filters.firstOrNull(f => !isFilterGroupOptionParsed(f) &&
    f.token!.fullKey == token.toString() &&
    (typeof operation == "function" ? operation(f.operation!) : f.operation == operation) &&
    (valueCondition == null || valueCondition(f.value))) as FilterConditionOptionParsed | undefined;

  if (!f) {
    return undefined;
  }

  filters.remove(f);
  return f;
}
