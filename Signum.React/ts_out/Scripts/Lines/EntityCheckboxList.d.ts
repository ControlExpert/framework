import * as React from 'react';
import { FindOptions } from '../FindOptions';
import { TypeContext } from '../TypeContext';
import { TypeReference } from '../Reflection';
import { ModifiableEntity, Lite, Entity, MList } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps } from './EntityListBase';
export interface EntityCheckboxListProps extends EntityListBaseProps {
    data?: Lite<Entity>[];
    columnCount?: number;
    columnWidth?: number;
    avoidFieldSet?: boolean;
}
export declare class EntityCheckboxList extends EntityListBase<EntityCheckboxListProps, EntityCheckboxListProps> {
    calculateDefaultState(state: EntityCheckboxListProps): void;
    renderInternal(): JSX.Element;
    renderButtons(): JSX.Element;
    renderCheckboxList(): JSX.Element;
    handleOnChange: (lite: Lite<Entity>) => void;
}
interface EntityCheckboxListSelectProps {
    ctx: TypeContext<MList<Lite<Entity> | ModifiableEntity>>;
    onChange: (lite: Lite<Entity>) => void;
    type: TypeReference;
    findOptions?: FindOptions;
    data?: Lite<Entity>[];
    columnCount?: number;
    columnWidth?: number;
}
interface EntityCheckboxListSelectState {
    data?: Lite<Entity>[];
}
export default class EntityCheckboxListSelect extends React.Component<EntityCheckboxListSelectProps, EntityCheckboxListSelectState> {
    constructor(props: EntityCheckboxListSelectProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: EntityCheckboxListSelectProps, newContext: any): void;
    static getFindOptions(fo: FindOptions | undefined): string | undefined;
    render(): JSX.Element;
    getColumnStyle(): React.CSSProperties | undefined;
    maybeToLite(entityOrLite: Entity | Lite<Entity>): Lite<Entity>;
    renderContent(): JSX.Element[] | undefined;
    reloadData(props: EntityCheckboxListSelectProps): void;
}
export {};
//# sourceMappingURL=EntityCheckboxList.d.ts.map