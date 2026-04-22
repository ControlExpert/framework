/// <reference types="react" />
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { EntityBase, EntityBaseProps } from './EntityBase';
export interface EntityDetailProps extends EntityBaseProps {
    ctx: TypeContext<ModifiableEntity | Lite<Entity> | null | undefined>;
    avoidFieldSet?: boolean;
    onEntityLoaded?: () => void;
}
export declare class EntityDetail extends EntityBase<EntityDetailProps, EntityDetailProps> {
    calculateDefaultState(state: EntityDetailProps): void;
    renderInternal(): JSX.Element;
    renderButtons(): JSX.Element | undefined;
    renderElements(): JSX.Element;
}
//# sourceMappingURL=EntityDetail.d.ts.map