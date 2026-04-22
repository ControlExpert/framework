import * as React from 'react';
import 'react-widgets/dist/css/react-widgets.css';
import { QueryToken, SubTokensOptions } from '../FindOptions';
import * as PropTypes from "prop-types";
import "./QueryTokenBuilder.css";
interface QueryTokenBuilderProps extends React.Props<QueryTokenBuilder> {
    prefixQueryToken?: QueryToken | undefined;
    queryToken: QueryToken | undefined | null;
    onTokenChange: (newToken: QueryToken | undefined) => void;
    queryKey: string;
    subTokenOptions: SubTokensOptions;
    readOnly: boolean;
    className?: string;
}
export default class QueryTokenBuilder extends React.Component<QueryTokenBuilderProps, {
    expanded: boolean;
}> {
    lastTokenChanged: string | undefined;
    static copiedToken: {
        fullKey: string;
        queryKey: string;
    } | undefined;
    constructor(props: QueryTokenBuilderProps);
    componentWillReceiveProps(newProps: QueryTokenBuilderProps): void;
    handleExpandButton: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
    handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}
interface QueryTokenPartProps extends React.Props<QueryTokenPart> {
    parentToken: QueryToken | undefined;
    selectedToken: QueryToken | undefined;
    onTokenSelected: (newToken: QueryToken | undefined) => void;
    queryKey: string;
    subTokenOptions: SubTokensOptions;
    readOnly: boolean;
    defaultOpen: boolean;
}
export declare class QueryTokenPart extends React.Component<QueryTokenPartProps, {
    subTokens?: (QueryToken | null)[];
}> {
    constructor(props: QueryTokenPartProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: QueryTokenPartProps): void;
    requestSubTokens(props: QueryTokenPartProps): void;
    getChildContext(): {
        parentToken: QueryToken | undefined;
    };
    static childContextTypes: {
        "parentToken": PropTypes.Requireable<object>;
    };
    handleOnChange: (value: any) => void;
    handleKeyUp: (e: React.KeyboardEvent<any>) => void;
    render(): JSX.Element | null;
}
export declare class QueryTokenItem extends React.Component<{
    item: QueryToken | null;
}> {
    render(): JSX.Element | null;
}
export declare class QueryTokenOptionalItem extends React.Component<{
    item: QueryToken | null;
}> {
    static contextTypes: {
        "parentToken": PropTypes.Requireable<object>;
    };
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=QueryTokenBuilder.d.ts.map