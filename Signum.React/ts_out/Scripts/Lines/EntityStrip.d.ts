import * as React from 'react';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps, DragConfig } from './EntityListBase';
import { AutocompleteConfig } from './AutoCompleteConfig';
export interface EntityStripProps extends EntityListBaseProps {
    vertical?: boolean;
    iconStart?: boolean;
    autocomplete?: AutocompleteConfig<any> | null;
    onRenderItem?: (item: Lite<Entity> | ModifiableEntity) => React.ReactNode;
    showType?: boolean;
    onItemHtmlAttributes?: (item: Lite<Entity> | ModifiableEntity) => React.HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>;
}
export declare class EntityStrip extends EntityListBase<EntityStripProps, EntityStripProps> {
    calculateDefaultState(state: EntityStripProps): void;
    componentWillUnmount(): void;
    overrideProps(state: EntityStripProps, overridenProps: EntityStripProps): void;
    renderInternal(): JSX.Element;
    handleOnSelect: (item: any, event: React.SyntheticEvent<any, Event>) => string;
    handleViewElement: (event: React.MouseEvent<any, MouseEvent>, index: number) => void;
    renderAutoComplete(): JSX.Element | undefined;
}
export interface EntityStripElementProps {
    iconStart?: boolean;
    onRemove?: (event: React.MouseEvent<any>) => void;
    onView?: (event: React.MouseEvent<any>) => void;
    ctx: TypeContext<Lite<Entity> | ModifiableEntity>;
    autoComplete?: AutocompleteConfig<any> | null;
    onRenderItem?: (item: Lite<Entity> | ModifiableEntity) => React.ReactNode;
    onItemHtmlAttributes?: (item: Lite<Entity> | ModifiableEntity) => React.HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>;
    drag?: DragConfig;
}
export interface EntityStripElementState {
    currentItem?: {
        entity: ModifiableEntity | Lite<Entity>;
        item?: unknown;
    };
}
export declare class EntityStripElement extends React.Component<EntityStripElementProps, EntityStripElementState> {
    constructor(props: EntityStripElementProps);
    componentWillMount(): void;
    componentWillReceiveProps(newProps: EntityStripElementProps, nextContext: any): void;
    refreshItem(props: EntityStripElementProps): void;
    render(): JSX.Element;
    removeIcon(): JSX.Element | undefined;
    dragIcon(): JSX.Element | undefined;
}
//# sourceMappingURL=EntityStrip.d.ts.map