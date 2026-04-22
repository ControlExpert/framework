import * as React from "react";
import { match, RouterChildContext } from "react-router-dom";
import * as H from "history";
import * as PropTypes from "prop-types";
export interface ComponentModule {
    default: React.ComponentClass<any> | React.FunctionComponent<any>;
}
interface ImportComponentProps {
    onImportModule: () => Promise<ComponentModule>;
    componentProps?: any;
    onRender?: (module: ComponentModule) => React.ReactElement<any>;
}
interface ImportComponentState {
    module?: ComponentModule;
}
export declare class ImportComponent extends React.Component<ImportComponentProps, ImportComponentState> {
    constructor(props: ImportComponentProps);
    componentWillMount(): void;
    _isMounted: boolean;
    componentWillUnmount(): void;
    componentWillReceiveProps(newProps: ImportComponentProps): void;
    requestIndex: number;
    importModule(props: ImportComponentProps): void;
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
}
interface ImportRouteProps {
    path?: string;
    exact?: boolean;
    strict?: boolean;
    onImportModule: () => Promise<ComponentModule>;
    location?: H.Location;
    computedMatch?: match<any>;
}
interface ImportRouteState {
    match: match<any> | null;
}
export declare class ImportRoute extends React.Component<ImportRouteProps, ImportRouteState> {
    static contextTypes: {
        router: PropTypes.Requireable<PropTypes.InferProps<{
            history: PropTypes.Validator<object>;
            route: PropTypes.Validator<object>;
            staticContext: PropTypes.Requireable<object>;
        }>>;
    };
    static childContextTypes: {
        router: PropTypes.Validator<object>;
    };
    getChildContext(): {
        router: any;
    };
    constructor(props: ImportRouteProps);
    componentWillReceiveProps(nextProps: ImportRouteProps, nextContext: RouterChildContext<any>): void;
    computeMatch(props: ImportRouteProps, context: RouterChildContext<any>): match<any> | null;
    render(): JSX.Element | null;
}
export {};
//# sourceMappingURL=AsyncImport.d.ts.map