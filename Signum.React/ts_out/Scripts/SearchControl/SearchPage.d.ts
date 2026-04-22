import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { FindOptions } from '../FindOptions';
import SearchControl from './SearchControl';
interface SearchPageProps extends RouteComponentProps<{
    queryName: string;
}> {
}
interface SearchPageState {
    findOptions: FindOptions;
}
export default class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
    static marginDown: number;
    static minHeight: number;
    static showFilters: (fo: FindOptions) => boolean;
    constructor(props: SearchPageProps);
    searchControl: SearchControl;
    componentWillReceiveProps(nextProps: SearchPageProps): void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    onResize: () => void;
    calculateState(props: SearchPageProps): SearchPageState;
    changeUrl(): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=SearchPage.d.ts.map