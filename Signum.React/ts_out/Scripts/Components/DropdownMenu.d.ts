import * as React from 'react';
import * as PropTypes from 'prop-types';
export interface DropdownMenuProps extends React.HTMLAttributes<any> {
    tag?: React.ReactType<any>;
    right?: boolean;
    flip?: boolean;
    className?: string;
}
export declare class DropdownMenu extends React.Component<DropdownMenuProps> {
    static contextTypes: {
        isOpen: PropTypes.Validator<boolean>;
        direction: PropTypes.Validator<string>;
        inNavbar: PropTypes.Validator<boolean>;
    };
    static defaultProps: {
        tag: string;
        flip: boolean;
    };
    render(): JSX.Element;
}
//# sourceMappingURL=DropdownMenu.d.ts.map