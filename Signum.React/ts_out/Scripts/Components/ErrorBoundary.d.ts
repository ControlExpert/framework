import * as React from 'react';
interface ErrorBoundaryProps {
}
interface ErrorBoundaryState {
    error?: Error;
    info?: React.ErrorInfo;
}
export declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    render(): {} | null;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map