import * as React from 'react';
import PopperJS from "popper.js";
interface PopoverProps {
    placement: PopperJS.Placement;
    target: string | (() => HTMLElement) | HTMLElement;
    container?: string | (() => HTMLElement) | HTMLElement;
    disabled?: boolean;
    hideArrow?: boolean;
    className?: string;
    innerClassName?: string;
    placementPrefix?: string;
    delay?: number | {
        show: number;
        hide: number;
    };
    modifiers?: PopperJS.Modifiers;
    isOpen?: boolean;
    toggle?: () => void;
}
export declare class Popover extends React.Component<PopoverProps> {
    static defaultProps: {
        isOpen: boolean;
        hideArrow: boolean;
        placement: string;
        placementPrefix: string;
        delay: {
            show: number;
            hide: number;
        };
        toggle: () => void;
    };
    _target?: HTMLElement;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    _popover?: HTMLDivElement | null;
    getRef: (ref: HTMLDivElement | null) => void;
    _hideTimeout?: number;
    _showTimeout?: number;
    getDelay(key: "show" | "hide"): number | undefined;
    handleProps(): void;
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
export {};
//# sourceMappingURL=Popover.d.ts.map