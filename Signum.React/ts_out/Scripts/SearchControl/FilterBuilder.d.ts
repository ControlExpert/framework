import * as React from 'react';
import { FilterOptionParsed, QueryDescription, QueryToken, SubTokensOptions, FilterConditionOptionParsed, FilterGroupOptionParsed, PinnedFilter } from '../FindOptions';
import { Binding } from '../Reflection';
import { TypeContext } from '../TypeContext';
import "./FilterBuilder.css";
interface FilterBuilderProps {
    filterOptions: FilterOptionParsed[];
    subTokensOptions: SubTokensOptions;
    queryDescription: QueryDescription;
    onTokenChanged?: (token: QueryToken | undefined) => void;
    lastToken?: QueryToken;
    onFiltersChanged?: (filters: FilterOptionParsed[]) => void;
    onHeightChanged?: () => void;
    readOnly?: boolean;
    title?: React.ReactNode;
    renderValue?: (fc: FilterConditionComponent | FilterGroupComponent) => React.ReactElement<any> | undefined;
    showPinnedFilters?: boolean;
}
export default class FilterBuilder extends React.Component<FilterBuilderProps> {
    handlerNewFilter: (e: React.MouseEvent<any, MouseEvent>, isGroup: boolean) => void;
    handlerDeleteFilter: (filter: FilterOptionParsed) => void;
    handleFilterChanged: () => void;
    handleHeightChanged: () => void;
    render(): JSX.Element;
}
export interface FilterGroupComponentsProps extends React.Props<FilterConditionComponent> {
    prefixToken: QueryToken | undefined;
    filterGroup: FilterGroupOptionParsed;
    readOnly: boolean;
    onDeleteFilter: (fo: FilterGroupOptionParsed) => void;
    queryDescription: QueryDescription;
    subTokensOptions: SubTokensOptions;
    onTokenChanged?: (token: QueryToken | undefined) => void;
    onFilterChanged: () => void;
    onHeightChanged: () => void;
    lastToken: QueryToken | undefined;
    renderValue?: (fc: FilterConditionComponent | FilterGroupComponent) => React.ReactElement<any> | undefined;
    showPinnedFilters: boolean;
    disableValue: boolean;
}
export declare class FilterGroupComponent extends React.Component<FilterGroupComponentsProps> {
    handleDeleteFilter: (e: React.MouseEvent<any, MouseEvent>) => void;
    handleTokenChanged: (newToken: QueryToken | null | undefined) => void;
    handleChangeOperation: (event: React.FormEvent<HTMLSelectElement>) => void;
    handlerDeleteFilter: (filter: FilterOptionParsed) => void;
    handlerNewFilter: (e: React.MouseEvent<any, MouseEvent>, isGroup: boolean) => void;
    render(): JSX.Element;
    renderValue(): JSX.Element;
    handleValueChange: () => void;
    changeFilter(): void;
}
export interface FilterConditionComponentProps extends React.Props<FilterConditionComponent> {
    filter: FilterConditionOptionParsed;
    prefixToken: QueryToken | undefined;
    readOnly: boolean;
    onDeleteFilter: (fo: FilterConditionOptionParsed) => void;
    queryDescription: QueryDescription;
    subTokensOptions: SubTokensOptions;
    onTokenChanged?: (token: QueryToken | undefined) => void;
    onFilterChanged: () => void;
    renderValue?: (fc: FilterConditionComponent | FilterGroupComponent) => React.ReactElement<any> | undefined;
    showPinnedFilters: boolean;
    disableValue: boolean;
}
export declare class FilterConditionComponent extends React.Component<FilterConditionComponentProps> {
    handleDeleteFilter: (e: React.MouseEvent<any, MouseEvent>) => void;
    handleTokenChanged: (newToken: QueryToken | null | undefined) => void;
    trimDateToFormat(date: string, momentFormat: string | undefined): string;
    handleChangeOperation: (event: React.FormEvent<HTMLSelectElement>) => void;
    render(): JSX.Element;
    changeFilter(): void;
    renderValue(): JSX.Element;
    handleValueChange: () => void;
}
interface PinnedFilterEditorProps {
    pinned: PinnedFilter;
    onChange: () => void;
}
export declare class PinnedFilterEditor extends React.Component<PinnedFilterEditorProps> {
    render(): JSX.Element;
    renderButton(binding: Binding<boolean | undefined>, label: string, title: string): JSX.Element;
}
export declare function createFilterValueControl(ctx: TypeContext<any>, token: QueryToken, handleValueChange: () => void, labelText?: string): React.ReactElement<any>;
export interface MultiValueProps {
    values: any[];
    onRenderItem: (ctx: TypeContext<any>) => React.ReactElement<any>;
    readOnly: boolean;
    onChange: () => void;
}
export declare class MultiValue extends React.Component<MultiValueProps> {
    handleDeleteValue: (e: React.MouseEvent<any, MouseEvent>, index: number) => void;
    handleAddValue: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=FilterBuilder.d.ts.map