import * as React from 'react';
interface NavItemProps extends React.HTMLAttributes<any> {
    tag?: React.ReactType;
    active?: boolean;
    className?: string;
}
export declare class NavItem extends React.Component<NavItemProps> {
    static defaultProps: {
        tag: string;
    };
    render(): JSX.Element;
}
export interface NavLinkProps {
    tag?: React.ReactType;
    innerRef?: (a: React.ReactElement<any> | null) => void;
    disabled?: boolean;
    active?: boolean;
    className?: string;
    onClick?: (e: React.MouseEvent<any>) => void;
    href?: string;
    style?: React.CSSProperties;
}
export declare class NavLink extends React.Component<NavLinkProps> {
    static defaultProps: {
        tag: string;
    };
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=NavItem.d.ts.map