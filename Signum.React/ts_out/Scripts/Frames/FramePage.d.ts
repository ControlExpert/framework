import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ButtonBar from './ButtonBar';
import { Entity, EntityPack } from '../Signum.Entities';
import { TypeContext } from '../TypeContext';
import { TypeInfo } from '../Reflection';
import ValidationErrors from './ValidationErrors';
import "./Frames.css";
interface FramePageProps extends RouteComponentProps<{
    type: string;
    id?: string;
}> {
}
interface FramePageState {
    pack?: EntityPack<Entity>;
    getComponent?: (ctx: TypeContext<Entity>) => React.ReactElement<any>;
    refreshCount: number;
}
export default class FramePage extends React.Component<FramePageProps, FramePageState> {
    constructor(props: FramePageProps);
    componentWillMount(): void;
    componentDidMount(): void;
    getTypeInfo(): TypeInfo;
    newState(props: FramePageProps): FramePageState;
    componentWillReceiveProps(newProps: FramePageProps): void;
    componentWillUnmount(): void;
    hanldleKeyDown: (e: KeyboardEvent) => void;
    load(props: FramePageProps): void;
    loadEntity(props: FramePageProps): Promise<EntityPack<Entity>>;
    loadComponent(pack: EntityPack<Entity>): Promise<(ctx: TypeContext<Entity>) => React.ReactElement<any>>;
    onClose(): void;
    entityComponent?: React.Component<any, any> | null;
    setComponent(c: React.Component<any, any> | null): void;
    buttonBar?: ButtonBar | null;
    render(): JSX.Element;
    validationErrors?: ValidationErrors | null;
    renderTitle(): JSX.Element;
}
export {};
//# sourceMappingURL=FramePage.d.ts.map