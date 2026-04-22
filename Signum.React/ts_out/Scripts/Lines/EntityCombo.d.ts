import * as React from 'react';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { FindOptions } from '../FindOptions';
import { TypeContext } from '../TypeContext';
import { TypeReference } from '../Reflection';
import { EntityBase, EntityBaseProps } from './EntityBase';
export interface EntityComboProps extends EntityBaseProps {
    ctx: TypeContext<ModifiableEntity | Lite<Entity> | null | undefined>;
    data?: Lite<Entity>[];
    labelTextWithData?: (data: Lite<Entity>[] | undefined | null) => React.ReactChild;
    refreshKey?: string;
}
export declare class EntityCombo extends EntityBase<EntityComboProps, EntityComboProps> {
    calculateDefaultState(state: EntityComboProps): void;
    entityComboSelect?: EntityComboSelect | null;
    renderInternal(): JSX.Element;
    doView(entity: ModifiableEntity | Lite<Entity>): Promise<ModifiableEntity | undefined> | undefined;
    handleOnChange: (lite: Lite<Entity> | null) => void;
}
export interface EntityComboSelectProps {
    ctx: TypeContext<ModifiableEntity | Lite<Entity> | null | undefined>;
    onChange: (lite: Lite<Entity> | null) => void;
    type: TypeReference;
    findOptions?: FindOptions;
    data?: Lite<Entity>[];
    mandatoryClass: string | null;
    onDataLoaded?: (data: Lite<Entity>[] | undefined) => void;
    refreshKey?: string;
}
declare class EntityComboSelect extends React.Component<EntityComboSelectProps, {
    data?: Lite<Entity>[];
}> {
    constructor(props: EntityComboSelectProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: EntityComboSelectProps, newContext: any): void;
    static getFindOptions(fo: FindOptions | undefined): string | undefined;
    render(): JSX.Element;
    handleOnChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    getLite(): Lite<Entity> | undefined;
    getLiteKey(): string | undefined;
    renderOptions(): JSX.Element[] | undefined;
    reloadData(props: EntityComboSelectProps): void;
    setData(data: Lite<Entity>[]): void;
}
export {};
//# sourceMappingURL=EntityCombo.d.ts.map