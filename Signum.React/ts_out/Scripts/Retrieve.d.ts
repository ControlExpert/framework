import * as React from 'react';
import { Entity, Lite } from './Signum.Entities';
interface RetrieveProps {
    lite?: Lite<Entity> | null;
    children: (entity?: Entity | null) => React.ReactElement<any> | null | undefined | false;
}
interface RetrieveState {
    entity?: Entity | null;
}
export declare class Retrieve extends React.Component<RetrieveProps, RetrieveState> {
    static create<T extends Entity>(lite: Lite<T> | null | undefined, render: (entity?: T | null) => React.ReactElement<any> | null | undefined | false): React.ReactElement<any>;
    constructor(props: RetrieveProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: RetrieveProps): void;
    loadData(props: RetrieveProps): void;
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
}
export {};
//# sourceMappingURL=Retrieve.d.ts.map