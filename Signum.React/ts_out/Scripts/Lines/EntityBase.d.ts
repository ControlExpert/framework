import * as React from 'react';
import * as Navigator from '../Navigator';
import { FindOptions } from '../FindOptions';
import { TypeContext } from '../TypeContext';
import { PropertyRoute, TypeInfo, TypeReference } from '../Reflection';
import { ModifiableEntity, Lite, Entity } from '../Signum.Entities';
import { LineBase, LineBaseProps } from './LineBase';
export declare let TitleManager: {
    useTitle: boolean;
};
export interface EntityBaseProps extends LineBaseProps {
    view?: boolean | ((item: any) => boolean);
    viewOnCreate?: boolean;
    navigate?: boolean;
    create?: boolean;
    find?: boolean;
    remove?: boolean | ((item: any) => boolean);
    onView?: (entity: any, pr: PropertyRoute) => Promise<ModifiableEntity | undefined> | undefined;
    onCreate?: (pr: PropertyRoute) => Promise<ModifiableEntity | Lite<Entity> | undefined> | undefined;
    onFind?: () => Promise<ModifiableEntity | Lite<Entity> | undefined> | undefined;
    onRemove?: (entity: any) => Promise<boolean>;
    findOptions?: FindOptions;
    extraButtons?: (ec: EntityBase<EntityBaseProps, EntityBaseProps>) => React.ReactNode;
    getComponent?: (ctx: TypeContext<any>) => React.ReactElement<any>;
    getViewPromise?: (entity: any) => undefined | string | Navigator.ViewPromise<ModifiableEntity>;
}
export declare abstract class EntityBase<T extends EntityBaseProps, S extends EntityBaseProps> extends LineBase<T, S> {
    static hasChildrens(element: React.ReactElement<any>): number;
    static defaultIsCreable(type: TypeReference, customComponent: boolean): boolean;
    static defaultIsViewable(type: TypeReference, customComponent: boolean): boolean;
    static defaultIsFindable(type: TypeReference): boolean;
    shouldComponentUpdate(nextProps: T, nextState: S): boolean;
    calculateDefaultState(state: S): void;
    convert(entityOrLite: ModifiableEntity | Lite<Entity>): Promise<ModifiableEntity | Lite<Entity>>;
    doView(entity: ModifiableEntity | Lite<Entity>): Promise<ModifiableEntity | undefined> | undefined;
    defaultView(value: ModifiableEntity | Lite<Entity>, propertyRoute: PropertyRoute): Promise<ModifiableEntity | undefined>;
    getGetViewPromise(value: ModifiableEntity | Lite<Entity>): undefined | ((entity: ModifiableEntity) => undefined | string | Navigator.ViewPromise<ModifiableEntity>);
    handleViewClick: (event: React.MouseEvent<any, MouseEvent>) => void;
    renderViewButton(btn: boolean, item: ModifiableEntity | Lite<Entity>): JSX.Element | undefined;
    chooseType(predicate: (ti: TypeInfo) => boolean): Promise<string | undefined>;
    defaultCreate(pr: PropertyRoute): Promise<ModifiableEntity | Lite<Entity> | undefined>;
    handleCreateClick: (event: React.SyntheticEvent<any, Event>) => void;
    renderCreateButton(btn: boolean, createMessage?: string): JSX.Element | undefined;
    static entityHtmlAttributes(entity: ModifiableEntity | Lite<Entity> | undefined | null): React.HTMLAttributes<any>;
    defaultFind(): Promise<ModifiableEntity | Lite<Entity> | undefined>;
    handleFindClick: (event: React.SyntheticEvent<any, Event>) => void;
    renderFindButton(btn: boolean): JSX.Element | undefined;
    handleRemoveClick: (event: React.SyntheticEvent<any, Event>) => void;
    renderRemoveButton(btn: boolean, item: ModifiableEntity | Lite<Entity>): JSX.Element | undefined;
    canRemove(item: ModifiableEntity | Lite<Entity>): boolean | undefined;
    canView(item: ModifiableEntity | Lite<Entity>): boolean | undefined;
}
//# sourceMappingURL=EntityBase.d.ts.map