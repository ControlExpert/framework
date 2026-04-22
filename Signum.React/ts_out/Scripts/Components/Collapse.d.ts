import * as React from 'react';
import { EnterHandler, ExitHandler } from 'react-transition-group/Transition';
interface CollapseProps {
    isOpen?: boolean;
    tag?: React.ComponentType<React.HTMLAttributes<any>>;
    attrs?: React.HTMLAttributes<any>;
    navbar?: boolean;
    timeout?: number | {
        enter?: number;
        exit?: number;
    };
    onEnter?: EnterHandler;
    onEntering?: EnterHandler;
    onEntered?: EnterHandler;
    onExit?: ExitHandler;
    onExiting?: ExitHandler;
    onExited?: ExitHandler;
}
export declare class Collapse extends React.Component<CollapseProps, {
    height: number | null;
}> {
    static defaultProps: any;
    constructor(props: CollapseProps);
    onEntering: (node: HTMLElement, isAppearing: boolean) => void;
    onEntered: (node: HTMLElement, isAppearing: boolean) => void;
    onExit: (node: HTMLElement) => void;
    onExiting: (node: HTMLElement) => void;
    onExited: (node: HTMLElement) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=Collapse.d.ts.map