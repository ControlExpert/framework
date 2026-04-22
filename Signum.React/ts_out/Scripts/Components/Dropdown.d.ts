import * as React from 'react';
import * as PropTypes from 'prop-types';
import { BsSize } from './Basic';
export interface UncontrolledDropdownProps extends React.HTMLAttributes<any> {
    disabled?: boolean;
    direction?: "up" | "down" | "left" | "right";
    group?: boolean;
    nav?: boolean;
    addonType?: false | "prepend" | "append";
    size?: BsSize;
    tag?: string | boolean;
    className?: string;
    inNavbar?: boolean;
}
export interface DropdownProps extends UncontrolledDropdownProps {
    isOpen: boolean;
    toggle: () => void;
}
export declare class Dropdown extends React.Component<DropdownProps> {
    static defaultProps: {
        isOpen: boolean;
        direction: string;
        nav: boolean;
        addonType: boolean;
        inNavbar: boolean;
    };
    constructor(props: DropdownProps);
    static childContextTypes: {
        toggle: PropTypes.Validator<(...args: any[]) => any>;
        isOpen: PropTypes.Validator<boolean>;
        direction: PropTypes.Validator<string>;
        inNavbar: PropTypes.Validator<boolean>;
    };
    getChildContext(): {
        toggle: () => void;
        isOpen: boolean;
        direction: "left" | "right" | "down" | "up" | undefined;
        inNavbar: boolean | undefined;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: DropdownProps): void;
    componentWillUnmount(): void;
    getContainer(): HTMLElement;
    addEvents: () => void;
    removeEvents(): void;
    handleDocumentClick: (e: MouseEvent | TouchEvent) => void;
    handleDocumentKeyUp: (e: KeyboardEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent<any>) => void;
    handleProps(): void;
    toggle: (e: MouseEvent | KeyboardEvent | TouchEvent | React.KeyboardEvent<any>) => void;
    render(): JSX.Element;
}
export declare class UncontrolledDropdown extends React.Component<UncontrolledDropdownProps, {
    isOpen: boolean;
}> {
    constructor(props: UncontrolledDropdownProps);
    toggle(): void;
    render(): JSX.Element;
}
//# sourceMappingURL=Dropdown.d.ts.map