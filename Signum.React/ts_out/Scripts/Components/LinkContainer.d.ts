import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as H from 'history';
import { match } from 'react-router';
interface LinkContainerProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: H.LocationDescriptor;
    replace?: boolean;
    onClick?: (e: React.MouseEvent<any>) => void;
    innerRef?: (e: any) => void;
    strict?: boolean;
    exact?: boolean;
    isActive?: (m: match<any> | null, l: H.Location) => boolean;
}
export declare class LinkContainer extends React.Component<LinkContainerProps> {
    static propTypes: {
        onClick: PropTypes.Requireable<(...args: any[]) => any>;
        target: PropTypes.Requireable<string>;
        replace: PropTypes.Requireable<boolean>;
        to: PropTypes.Validator<string | object>;
        innerRef: PropTypes.Requireable<string | ((...args: any[]) => any)>;
    };
    static defaultProps: {
        replace: boolean;
    };
    static contextTypes: {
        router: PropTypes.Validator<PropTypes.InferProps<{
            history: PropTypes.Validator<PropTypes.InferProps<{
                push: PropTypes.Validator<(...args: any[]) => any>;
                replace: PropTypes.Validator<(...args: any[]) => any>;
                createHref: PropTypes.Validator<(...args: any[]) => any>;
            }>>;
        }>>;
    };
    handleClick: (event: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=LinkContainer.d.ts.map