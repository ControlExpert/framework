import * as React from 'react';
import './VersionChangedAlert.css';
export default class VersionChangedAlert extends React.Component<{
    blink?: boolean;
}> {
    static defaultProps: {
        blink: boolean;
    };
    handleRefresh: (e: React.MouseEvent<any, MouseEvent>) => void;
    static singleton: VersionChangedAlert | undefined;
    componentWillMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element | null;
}
//# sourceMappingURL=VersionChangedAlert.d.ts.map