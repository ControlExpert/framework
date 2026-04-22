import * as React from 'react';
import * as Navigator from '../Navigator';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps, DragConfig } from './EntityListBase';
export interface EntityRepeaterProps extends EntityListBaseProps {
    createAsLink?: boolean | ((er: EntityRepeater) => React.ReactElement<any>);
    avoidFieldSet?: boolean;
    createMessage?: string;
}
export declare class EntityRepeater extends EntityListBase<EntityRepeaterProps, EntityRepeaterProps> {
    calculateDefaultState(state: EntityRepeaterProps): void;
    renderInternal(): JSX.Element;
    renderButtons(): JSX.Element | undefined;
    renderElements(): JSX.Element;
}
export interface EntityRepeaterElementProps {
    ctx: TypeContext<Lite<Entity> | ModifiableEntity>;
    getComponent?: (ctx: TypeContext<ModifiableEntity>) => React.ReactElement<any>;
    getViewPromise?: (entity: ModifiableEntity) => undefined | string | Navigator.ViewPromise<ModifiableEntity>;
    onRemove?: (event: React.MouseEvent<any>) => void;
    draggable?: DragConfig;
    title?: React.ReactElement<any>;
}
export declare class EntityRepeaterElement extends React.Component<EntityRepeaterElementProps> {
    render(): JSX.Element;
}
//# sourceMappingURL=EntityRepeater.d.ts.map