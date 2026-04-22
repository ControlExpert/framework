import * as React from 'react';
import { BsSize, BsColor } from './Basic';
export interface ButtonProps extends React.AnchorHTMLAttributes<any> {
    active?: boolean;
    block?: boolean;
    color?: BsColor;
    disabled?: boolean;
    outline?: boolean;
    tag?: React.ReactType;
    innerRef?: (e: HTMLElement | null) => void;
    onClick?: (e: React.MouseEvent<any>) => void;
    size?: BsSize;
    className?: string;
}
export declare class Button extends React.Component<ButtonProps> {
    static defaultProps: {
        color: string;
        tag: string;
    };
    constructor(props: ButtonProps);
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=Button.d.ts.map