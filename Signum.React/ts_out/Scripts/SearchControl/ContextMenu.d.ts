import * as React from 'react';
import * as PropTypes from "prop-types";
export interface ContextMenuPosition {
    left: number;
    top: number;
    width: number;
    children: React.ReactElement<any>[];
}
export interface ContextMenuProps extends React.Props<ContextMenu>, React.HTMLAttributes<HTMLUListElement> {
    position: ContextMenuPosition;
    onHide: () => void;
}
export default class ContextMenu extends React.Component<ContextMenuProps> {
    handleToggle: () => void;
    getChildContext(): {
        toggle: () => void;
    };
    static childContextTypes: {
        "toggle": PropTypes.Requireable<(...args: any[]) => any>;
    };
    static getPosition(e: React.MouseEvent<any>, container: HTMLElement): ContextMenuPosition;
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleDocumentClick: (e: MouseEvent | TouchEvent) => void;
}
//# sourceMappingURL=ContextMenu.d.ts.map