import * as React from 'react';
import PopperJS from "popper.js";
interface UncontrolledTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
    placement: PopperJS.Placement;
    target: string | (() => HTMLElement) | HTMLElement;
    container?: string | (() => HTMLElement) | HTMLElement;
    disabled?: boolean;
    hideArrow?: boolean;
    className?: string;
    innerClassName?: string;
    autohide?: boolean;
    placementPrefix?: string;
    delay?: number | {
        show: number;
        hide: number;
    };
    modifiers?: PopperJS.Modifiers;
}
interface TooltipProps extends UncontrolledTooltipProps {
    isOpen?: boolean;
    toggle?: () => void;
}
export declare class Tooltip extends React.Component<TooltipProps> {
    static DEFAULT_DELAYS: {
        show: number;
        hide: number;
    };
    static defaultProps: {
        isOpen: boolean;
        placement: string;
        placementPrefix: string;
        delay: {
            show: number;
            hide: number;
        };
        autohide: boolean;
        hideArrow: boolean;
        toggle: () => void;
    };
    constructor(props: TooltipProps);
    _target: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    _hideTimeout?: number;
    _showTimeout?: number;
    onMouseOverTooltip: () => void;
    onMouseLeaveTooltip: () => void;
    onMouseOverTooltipContent: () => void;
    onMouseLeaveTooltipContent: () => void;
    getDelay(key: "show" | "hide"): number | undefined;
    show: () => void;
    hide: () => void;
    clearShowTimeout(): void;
    clearHideTimeout(): void;
    handleDocumentClick: (e: MouseEvent | TouchEvent) => void;
    addTargetEvents: () => void;
    removeTargetEvents: () => void;
    toggle: () => void;
    render(): JSX.Element | null;
}
export declare class UncontrolledTooltip extends React.Component<UncontrolledTooltipProps, {
    isOpen: boolean;
}> {
    constructor(props: TooltipProps);
    toggle: () => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=Tooltip.d.ts.map