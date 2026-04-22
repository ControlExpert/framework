import * as React from 'react';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { Typeahead } from '../Components';
import { EntityBase, EntityBaseProps } from './EntityBase';
import { AutocompleteConfig } from './AutoCompleteConfig';
export interface EntityLineProps extends EntityBaseProps {
    ctx: TypeContext<ModifiableEntity | Lite<Entity> | undefined | null>;
    autocomplete?: AutocompleteConfig<unknown> | null;
    renderItem?: React.ReactNode;
    showType?: boolean;
    itemHtmlAttributes?: React.HTMLAttributes<HTMLSpanElement | HTMLAnchorElement>;
}
export interface EntityLineState extends EntityLineProps {
    currentItem?: {
        entity: ModifiableEntity | Lite<Entity>;
        item?: unknown;
    };
}
export declare class EntityLine extends EntityBase<EntityLineProps, EntityLineState> {
    overrideProps(state: EntityLineState, overridenProps: EntityLineProps): void;
    componentWillUnmount(): void;
    componentWillMount(): void;
    componentWillReceiveProps(newProps: EntityLineProps, nextContext: any): void;
    refreshItem(props: EntityLineProps): void;
    typeahead?: Typeahead | null;
    writeInTypeahead(query: string): void;
    handleOnSelect: (item: any, event: React.SyntheticEvent<any, Event>) => string;
    setValue(val: any): void;
    renderInternal(): JSX.Element;
    renderAutoComplete(): JSX.Element;
    focusNext?: boolean;
    setLinkOrSpan(linkOrSpan?: HTMLElement | null): void;
    renderLink(): JSX.Element;
}
//# sourceMappingURL=EntityLine.d.ts.map