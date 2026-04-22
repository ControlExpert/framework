import * as React from 'react';
import { ModifiableEntity, Lite, Entity, MListElement, MList } from '../Signum.Entities';
import { TypeContext } from '../TypeContext';
import { EntityBase, EntityBaseProps } from './EntityBase';
export interface EntityListBaseProps extends EntityBaseProps {
    move?: boolean | ((item: ModifiableEntity | Lite<Entity>) => boolean);
    onFindMany?: () => Promise<(ModifiableEntity | Lite<Entity>)[] | undefined> | undefined;
    ctx: TypeContext<MList<any>>;
}
export interface EntityListBaseState extends EntityListBaseProps {
    dragIndex?: number;
    dropBorderIndex?: number;
}
export declare abstract class EntityListBase<T extends EntityListBaseProps, S extends EntityListBaseState> extends EntityBase<T, S> {
    calculateDefaultState(state: S): void;
    setValue(list: MList<Lite<Entity> | ModifiableEntity>): void;
    moveUp(index: number): void;
    renderMoveUp(btn: boolean, index: number): JSX.Element | undefined;
    doView(entity: ModifiableEntity | Lite<Entity>): Promise<ModifiableEntity | undefined> | undefined;
    moveDown(index: number): void;
    renderMoveDown(btn: boolean, index: number): JSX.Element | undefined;
    handleCreateClick: (event: React.SyntheticEvent<any, Event>) => void;
    defaultFindMany(): Promise<(ModifiableEntity | Lite<Entity>)[] | undefined>;
    addElement(entityOrLite: Lite<Entity> | ModifiableEntity): void;
    handleFindClick: (event: React.SyntheticEvent<any, Event>) => void;
    handleRemoveElementClick: (event: React.SyntheticEvent<any, Event>, index: number) => void;
    removeElement(mle: MListElement<ModifiableEntity | Lite<Entity>>): void;
    canMove(item: ModifiableEntity | Lite<Entity>): boolean | undefined;
    handleDragStart: (de: React.DragEvent<any>, index: number) => void;
    handleDragEnd: (de: React.DragEvent<any>) => void;
    getOffsetHorizontal(dragEvent: DragEvent, rect: ClientRect): 1 | 0 | undefined;
    getOffsetVertical(dragEvent: DragEvent, rect: ClientRect): 1 | 0 | undefined;
    handlerDragOver: (de: React.DragEvent<any>, index: number, orientation: "v" | "h") => void;
    getDragConfig(index: number, orientation: "h" | "v"): DragConfig;
    dropClass(index: number, orientation: "h" | "v"): "drag-left" | "drag-top" | "drag-right" | "drag-bottom" | undefined;
    handleDrop: (de: React.DragEvent<any>) => void;
}
export interface DragConfig {
    onDragStart?: React.DragEventHandler<any>;
    onDragEnd?: React.DragEventHandler<any>;
    onDragOver?: React.DragEventHandler<any>;
    onDrop?: React.DragEventHandler<any>;
    dropClass?: string;
}
//# sourceMappingURL=EntityListBase.d.ts.map