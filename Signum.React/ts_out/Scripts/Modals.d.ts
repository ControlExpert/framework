import * as React from 'react';
declare global {
    interface KeyboardEvent {
        openedModals?: boolean;
    }
}
export interface IModalProps {
    onExited?: (val: any) => void;
}
export interface IHandleKeyboard {
    handleKeyDown?: (e: KeyboardEvent) => void;
}
export interface GlobalModalContainerState {
    modals: React.ReactElement<IModalProps>[];
    currentUrl: string;
}
export declare class GlobalModalContainer extends React.Component<{}, GlobalModalContainerState> {
    constructor(props: {});
    componentDidMount(): void;
    componentWillUnmount(): void;
    hanldleKeyDown: (e: KeyboardEvent) => void;
    componentWillReceiveProps(nextProps: {}, nextContext: any): void;
    render(): JSX.Element;
}
export declare function openModal<T>(modal: React.ReactElement<IModalProps>): Promise<T | undefined>;
//# sourceMappingURL=Modals.d.ts.map