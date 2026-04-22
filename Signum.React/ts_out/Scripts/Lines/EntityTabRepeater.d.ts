import * as React from 'react';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity, MListElement } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps } from './EntityListBase';
export interface EntityTabRepeaterProps extends EntityListBaseProps {
    createAsLink?: boolean | ((er: EntityTabRepeater) => React.ReactElement<any>);
    createMessage?: string;
    avoidFieldSet?: boolean;
    selectedIndex?: number;
    getTitle?: (ctx: TypeContext<any>) => React.ReactChild;
    extraTabs?: (c: EntityTabRepeater) => React.ReactNode;
    onSelectTab?: (newIndex: number) => void;
}
export interface EntityTabRepeaterState extends EntityTabRepeaterProps {
    selectedIndex?: number;
}
export declare class EntityTabRepeater extends EntityListBase<EntityTabRepeaterProps, EntityTabRepeaterState> {
    calculateDefaultState(state: EntityTabRepeaterProps): void;
    renderInternal(): JSX.Element;
    renderButtons(): JSX.Element | undefined;
    handleSelectTab: (activeKey: string | number) => void;
    renderTabs(): JSX.Element;
    removeElement(mle: MListElement<ModifiableEntity | Lite<Entity>>): void;
    addElement(entityOrLite: Lite<Entity> | ModifiableEntity): void;
}
//# sourceMappingURL=EntityTabRepeater.d.ts.map