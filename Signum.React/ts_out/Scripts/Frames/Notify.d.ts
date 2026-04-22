import * as React from 'react';
import "./Notify.css";
declare type NotifyType = "warning" | "error" | "success" | "loading";
interface NotifyOptions {
    text: React.ReactChild;
    type: NotifyType;
}
interface NotifyState {
    text?: React.ReactChild;
    type?: NotifyType;
}
export default class Notify extends React.Component<{}, NotifyState> {
    static singleton: Notify;
    static lockScreenOnNotify: boolean;
    constructor(props: {});
    _isMounted: boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    handler?: number;
    notifyTimeout(options: NotifyOptions, timeout?: number): void;
    notify(options: NotifyOptions): void;
    clear(): void;
    notifyPendingRequest(pending: number): void;
    getIcon(): JSX.Element | undefined;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=Notify.d.ts.map