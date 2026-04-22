import * as React from 'react';
import * as PropTypes from 'prop-types';
import { BsColor } from '.';
interface DropdownToggleProps extends React.AnchorHTMLAttributes<any> {
    caret?: boolean;
    color?: BsColor;
    className?: string;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<any>) => void;
    'aria-haspopup'?: boolean;
    split?: boolean;
    nav?: boolean;
    tag?: React.ReactType<any>;
}
export declare class DropdownToggle extends React.Component<DropdownToggleProps> {
    static defaultProps: {
        'aria-haspopup': boolean;
        color: string;
    };
    constructor(props: DropdownToggleProps);
    static contextTypes: {
        isOpen: PropTypes.Validator<boolean>;
        toggle: PropTypes.Validator<(...args: any[]) => any>;
        inNavbar: PropTypes.Validator<boolean>;
    };
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DropdownToggle.d.ts.map