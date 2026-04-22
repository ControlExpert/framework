import * as React from 'react';
import { FindOptions, FindOptionsParsed, QueryToken, QueryValueRequest } from '../FindOptions';
import { QueryTokenString } from '../Reflection';
import { AbortableRequest } from "../Services";
import { SearchControlProps } from "./SearchControl";
import { BsColor } from '../Components';
export interface ValueSearchControlProps extends React.Props<ValueSearchControl> {
    valueToken?: string | QueryTokenString<any>;
    findOptions: FindOptions;
    isLink?: boolean;
    isBadge?: boolean | "MoreThanZero";
    badgeColor?: BsColor;
    formControlClass?: string;
    avoidAutoRefresh?: boolean;
    onValueChange?: (value: any) => void;
    onExplored?: () => void;
    onTokenLoaded?: () => void;
    initialValue?: any;
    customClass?: string;
    customStyle?: React.CSSProperties;
    format?: string;
    avoidNotifyPendingRequest?: boolean;
    refreshKey?: string | number;
    searchControlProps?: Partial<SearchControlProps>;
    onRender?: (value: any | undefined, vsc: ValueSearchControl) => React.ReactNode;
}
export interface ValueSearchControlState {
    value?: any;
    token?: QueryToken;
}
export default class ValueSearchControl extends React.Component<ValueSearchControlProps, ValueSearchControlState> {
    static defaultProps: {
        isLink: boolean;
        isBadge: string;
    };
    constructor(props: ValueSearchControlProps);
    getQueryRequest(fo: FindOptionsParsed): QueryValueRequest;
    componentDidMount(): void;
    componentWillReceiveProps(newProps: ValueSearchControlProps): void;
    loadToken(props: ValueSearchControlProps): void;
    componentWillUnmount(): void;
    abortableQuery: AbortableRequest<{
        request: QueryValueRequest;
        avoidNotify: boolean | undefined;
    }, number>;
    refreshValue(props?: ValueSearchControlProps): void;
    isNumeric(): boolean | undefined;
    render(): {} | null | undefined;
    renderValue(): any;
    handleClick: (e: React.MouseEvent<any, MouseEvent>) => void;
}
//# sourceMappingURL=ValueSearchControl.d.ts.map