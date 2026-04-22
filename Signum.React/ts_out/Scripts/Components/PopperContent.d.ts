import * as React from 'react';
import * as PropTypes from 'prop-types';
import PopperJS from 'popper.js';
interface PopperContentProps {
    children: React.ReactElement<any>;
    className?: string;
    placement?: PopperJS.Placement;
    placementPrefix?: string;
    hideArrow?: boolean;
    tag?: React.ReactType;
    isOpen: boolean;
    offset?: string | number;
    fallbackPlacement?: string | string[];
    flip?: boolean;
    container?: string | (() => HTMLElement) | HTMLElement;
    target: string | (() => HTMLElement) | HTMLElement;
    modifiers?: PopperJS.Modifiers;
}
interface PopperContentState {
    placement?: PopperJS.Placement;
}
export declare class PopperContent extends React.Component<PopperContentProps, PopperContentState> {
    static defaultProps: {
        placement: string;
        isOpen: boolean;
        offset: number;
        fallbackPlacement: string;
        flip: boolean;
        container: string;
        modifiers: {};
    };
    constructor(props: PopperContentProps);
    static childContextTypes: {
        popperManager: PropTypes.Validator<object>;
    };
    getChildContext(): {
        popperManager: {
            setTargetNode: (node: HTMLElement) => void;
            getTargetNode: () => HTMLElement;
        };
    };
    componentDidMount(): void;
    _element?: HTMLDivElement | null;
    componentDidUpdate(prevProps: PopperContentProps): void;
    componentWillUnmount(): void;
    targetNode?: HTMLElement;
    setTargetNode: (node: HTMLElement) => void;
    getTargetNode: () => HTMLElement;
    getContainerNode(): HTMLElement;
    handlePlacementChange: (data: PopperJS.Data) => PopperJS.Data;
    handleProps(): void;
    hide(): void;
    show(): void;
    renderIntoSubtree(): void;
    renderChildren(): JSX.Element;
    render(): JSX.Element | null;
}
export declare function getTarget(target: string | (() => HTMLElement) | HTMLElement): HTMLElement;
export {};
//# sourceMappingURL=PopperContent.d.ts.map