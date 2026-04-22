import * as React from 'react';
import * as PropTypes from 'prop-types';
export interface DropdownItemProps extends React.AnchorHTMLAttributes<any> {
    active?: boolean;
    disabled?: boolean;
    divider?: boolean;
    tag?: React.ReactType<any>;
    header?: boolean;
    onClick?: (e: React.MouseEvent<any>) => void;
    className?: string;
    toggle?: boolean;
    innerRef?: (r: HTMLElement | null) => void;
}
export declare class DropdownItem extends React.Component<DropdownItemProps> {
    static contextTypes: {
        toggle: PropTypes.Requireable<(...args: any[]) => any>;
    };
    static defaultProps: {
        tag: string;
        toggle: boolean;
    };
    constructor(props: DropdownItemProps);
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    getTabIndex(): "0" | "-1";
    render(): JSX.Element;
}
//# sourceMappingURL=DropdownItem.d.ts.map