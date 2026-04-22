/// <reference path="../../../Scripts/globals.d.ts" />
import * as React from 'react';
import { CellFormatter, EntityFormatter } from '../Finder';
import { ResultTable, ResultRow, FindOptions, FindOptionsParsed, FilterOptionParsed, FilterOption, QueryDescription } from '../FindOptions';
import { Lite, Entity } from '../Signum.Entities';
import * as Navigator from '../Navigator';
import SearchControlLoaded, { ShowBarExtensionOption } from './SearchControlLoaded';
import { MaxHeightProperty } from 'csstype';
import "./Search.css";
import { ButtonBarElement } from '../TypeContext';
export interface SimpleFilterBuilderProps {
    findOptions: FindOptions;
}
export interface SearchControlProps extends React.Props<SearchControl> {
    findOptions: FindOptions;
    formatters?: {
        [token: string]: CellFormatter;
    };
    rowAttributes?: (row: ResultRow, columns: string[]) => React.HTMLAttributes<HTMLTableRowElement> | undefined;
    entityFormatter?: EntityFormatter;
    extraButtons?: (searchControl: SearchControlLoaded) => (ButtonBarElement | null | undefined | false)[];
    getViewPromise?: (e: any) => undefined | string | Navigator.ViewPromise<any>;
    maxResultsHeight?: MaxHeightProperty<string | number> | any;
    tag?: string | {};
    searchOnLoad?: boolean;
    allowSelection?: boolean;
    showContextMenu?: boolean | "Basic";
    hideButtonBar?: boolean;
    hideFullScreenButton?: boolean;
    showHeader?: boolean | "PinnedFilters";
    showBarExtension?: boolean;
    showBarExtensionOption?: ShowBarExtensionOption;
    showFilters?: boolean;
    showSimpleFilterBuilder?: boolean;
    showFilterButton?: boolean;
    showSystemTimeButton?: boolean;
    showGroupButton?: boolean;
    showFooter?: boolean;
    allowChangeColumns?: boolean;
    allowChangeOrder?: boolean;
    create?: boolean;
    navigate?: boolean | "InPlace";
    largeToolbarButtons?: boolean;
    avoidAutoRefresh?: boolean;
    avoidChangeUrl?: boolean;
    throwIfNotFindable?: boolean;
    refreshKey?: string | number;
    enableAutoFocus?: boolean;
    simpleFilterBuilder?: (qd: QueryDescription, initialFilterOptions: FilterOptionParsed[]) => React.ReactElement<any> | undefined;
    onNavigated?: (lite: Lite<Entity>) => void;
    onDoubleClick?: (e: React.MouseEvent<any>, row: ResultRow) => void;
    onSelectionChanged?: (entity: ResultRow[]) => void;
    onFiltersChanged?: (filters: FilterOptionParsed[]) => void;
    onHeighChanged?: () => void;
    onSearch?: (fo: FindOptionsParsed, dataChange: boolean) => void;
    onResult?: (table: ResultTable, dataChange: boolean) => void;
    onCreate?: () => void;
}
export interface SearchControlState {
    findOptions?: FindOptionsParsed;
    queryDescription?: QueryDescription;
}
export default class SearchControl extends React.Component<SearchControlProps, SearchControlState> {
    static showSelectedButton: (sc: SearchControl) => boolean;
    static showSystemTimeButton: (sc: SearchControl) => boolean;
    static showGroupButton: (sc: SearchControl) => boolean;
    static defaultProps: {
        allowSelection: boolean;
        avoidFullScreenButton: boolean;
        maxResultsHeight: string;
    };
    constructor(props: SearchControlProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: SearchControlProps): void;
    doSearch(): void;
    doSearchPage1(): void;
    initialLoad(fo: FindOptions): void;
    searchControlLoaded?: SearchControlLoaded;
    handleFullScreenClick(ev: React.MouseEvent<any>): void;
    render(): JSX.Element | null;
}
export interface ISimpleFilterBuilder {
    getFilters(): FilterOption[];
}
//# sourceMappingURL=SearchControl.d.ts.map