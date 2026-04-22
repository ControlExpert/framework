import * as React from 'react';
import * as PropTypes from 'prop-types';
interface UncontrolledTabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultEventKey?: string | number;
    onToggled?: (eventKey: string | number) => void;
    children?: React.ReactFragment;
    hideOnly?: boolean;
    pills?: boolean;
    fill?: boolean;
}
interface UncontrolledTabsState {
    activeEventKey: string | number | undefined;
}
export declare class UncontrolledTabs extends React.Component<UncontrolledTabsProps, UncontrolledTabsState> {
    constructor(props: UncontrolledTabsProps);
    componentWillReceiveProps(newProps: UncontrolledTabsProps): void;
    handleToggle: (eventKey: string | number) => void;
    render(): JSX.Element;
}
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    activeEventKey: string | number | undefined;
    toggle: (eventKey: string | number) => void;
    hideOnly?: boolean;
    pills?: boolean;
    fill?: boolean;
}
export declare class Tabs extends React.Component<TabsProps> {
    render(): JSX.Element;
}
interface TabProps extends React.HTMLAttributes<any> {
    eventKey: string | number;
    title?: string;
    anchorHtmlProps?: React.HTMLAttributes<HTMLAnchorElement>;
}
export declare class Tab extends React.Component<TabProps> {
    static contextTypes: {
        activeTabId: PropTypes.Requireable<any>;
    };
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=Tabs.d.ts.map