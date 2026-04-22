import * as React from 'react';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps } from './EntityListBase';
export interface EntityListProps extends EntityListBaseProps {
    size?: number;
}
export declare abstract class EntityList extends EntityListBase<EntityListProps, EntityListProps> {
    static defaultProps: EntityListProps;
    moveUp(index: number): void;
    moveDown(index: number): void;
    handleOnSelect: (e: React.FormEvent<HTMLSelectElement>) => void;
    selectElement?: HTMLSelectElement | null;
    handleSelectLoad: (sel: HTMLSelectElement | null) => void;
    getSelectedIndex(): number | undefined;
    renderInternal(): JSX.Element;
    handleRemoveClick: (event: React.SyntheticEvent<any, Event>) => void;
    handleViewClick: (event: React.MouseEvent<any, MouseEvent>) => void;
    getTitle(e: Lite<Entity> | ModifiableEntity): string;
}
//# sourceMappingURL=EntityList.d.ts.map