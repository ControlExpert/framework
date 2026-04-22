import * as React from "react";
import { Lite, Entity, ModifiableEntity } from '../Signum.Entities';
import * as Navigator from '../Navigator';
export interface EntityLinkProps extends React.HTMLAttributes<HTMLAnchorElement>, React.Props<EntityLink> {
    lite: Lite<Entity>;
    inSearch?: boolean;
    inPlaceNavigation?: boolean;
    onNavigated?: (lite: Lite<Entity>) => void;
    getViewPromise?: (e: ModifiableEntity | null) => undefined | string | Navigator.ViewPromise<ModifiableEntity>;
    innerRef?: (node: HTMLAnchorElement | null) => void;
}
export default class EntityLink extends React.Component<EntityLinkProps> {
    render(): JSX.Element;
    handleClick: (event: React.MouseEvent<any, MouseEvent>) => void;
}
//# sourceMappingURL=EntityLink.d.ts.map