import * as React from 'react';
import * as Navigator from '../Navigator';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
export interface RenderEntityProps {
    ctx: TypeContext<ModifiableEntity | Lite<Entity> | undefined | null>;
    getComponent?: (ctx: TypeContext<any>) => React.ReactElement<any>;
    getViewPromise?: (e: any) => undefined | string | Navigator.ViewPromise<any>;
    onEntityLoaded?: () => void;
}
export interface RenderEntityState {
    getComponent?: (ctx: TypeContext<ModifiableEntity>) => React.ReactElement<any>;
    lastLoadedType?: string;
    lastLoadedViewName?: string;
}
export declare class RenderEntity extends React.Component<RenderEntityProps, RenderEntityState> {
    constructor(props: RenderEntityProps);
    isDead: boolean;
    componentWillUnmount(): void;
    componentWillMount(): void;
    componentWillReceiveProps(nextProps: RenderEntityProps): void;
    loadEntity(nextProps: RenderEntityProps): Promise<void>;
    toEntity(entityOrLite: ModifiableEntity | Lite<Entity> | undefined | null): ModifiableEntity | undefined;
    loadComponent(nextProps: RenderEntityProps): Promise<void>;
    static toViewName(result: undefined | string | Navigator.ViewPromise<ModifiableEntity>): string | undefined;
    entityComponent?: React.Component<any, any> | null;
    setComponent(c: React.Component<any, any> | null): void;
    render(): JSX.Element | null;
}
//# sourceMappingURL=RenderEntity.d.ts.map