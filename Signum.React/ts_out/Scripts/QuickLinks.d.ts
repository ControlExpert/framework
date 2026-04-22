import * as React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Type } from './Reflection';
import { FindOptions } from './FindOptions';
import { ModifiableEntity, Lite, Entity } from './Signum.Entities';
import { WidgetContext } from './Frames/Widgets';
import { ContextualItemsContext, MenuItemBlock } from './SearchControl/ContextualItems';
export declare function start(): void;
export interface QuickLinkContext<T extends Entity> {
    lite: Lite<T>;
    widgetContext?: WidgetContext<T>;
    contextualContext?: ContextualItemsContext<T>;
}
declare type Seq<T> = (T | undefined)[] | T | undefined;
export declare function clearQuickLinks(): void;
export declare const onGlobalQuickLinks: Array<(ctx: QuickLinkContext<Entity>) => Seq<QuickLink> | Promise<Seq<QuickLink>>>;
export declare function registerGlobalQuickLink(quickLinkGenerator: (ctx: QuickLinkContext<Entity>) => Seq<QuickLink> | Promise<Seq<QuickLink>>): void;
export declare const onQuickLinks: {
    [typeName: string]: Array<(ctx: QuickLinkContext<any>) => Seq<QuickLink> | Promise<Seq<QuickLink>>>;
};
export declare function registerQuickLink<T extends Entity>(type: Type<T>, quickLinkGenerator: (ctx: QuickLinkContext<T>) => Seq<QuickLink> | Promise<Seq<QuickLink>>): void;
export declare function getQuickLinks(ctx: QuickLinkContext<Entity>): Promise<QuickLink[]>;
export declare function getQuickLinkWidget(ctx: WidgetContext<ModifiableEntity>): React.ReactElement<any>;
export declare function getQuickLinkContextMenus(ctx: ContextualItemsContext<Entity>): Promise<MenuItemBlock | undefined>;
export interface QuickLinkWidgetProps {
    ctx: WidgetContext<ModifiableEntity>;
}
export declare function QuickLinkWidget(p: QuickLinkWidgetProps): JSX.Element | null;
export interface QuickLinkOptions {
    isVisible?: boolean;
    text?: string;
    order?: number;
    icon?: IconProp;
    iconColor?: string;
}
export declare abstract class QuickLink {
    isVisible: boolean;
    text: string;
    order: number;
    name: string;
    icon?: IconProp;
    iconColor?: string;
    constructor(name: string, options?: QuickLinkOptions);
    abstract toDropDownItem(): React.ReactElement<any>;
    renderIcon(): JSX.Element | undefined;
}
export declare class QuickLinkAction extends QuickLink {
    action: (e: React.MouseEvent<any>) => void;
    constructor(name: string, text: string, action: (e: React.MouseEvent<any>) => void, options?: QuickLinkOptions);
    toDropDownItem(): JSX.Element;
    handleClick: (e: React.MouseEvent<any, MouseEvent>) => void;
}
export declare class QuickLinkLink extends QuickLink {
    url: string;
    constructor(name: string, text: string, url: string, options?: QuickLinkOptions);
    toDropDownItem(): JSX.Element;
    handleClick: (e: React.MouseEvent<any, MouseEvent>) => void;
}
export declare class QuickLinkExplore extends QuickLink {
    findOptions: FindOptions;
    constructor(findOptions: FindOptions, options?: QuickLinkOptions);
    toDropDownItem(): JSX.Element;
    exploreOrPopup: (e: React.MouseEvent<any, MouseEvent>) => void;
}
export declare class QuickLinkNavigate extends QuickLink {
    lite: Lite<Entity>;
    constructor(lite: Lite<Entity>, options?: QuickLinkOptions);
    toDropDownItem(): JSX.Element;
    navigateOrPopup: (e: React.MouseEvent<any, MouseEvent>) => void;
}
export {};
//# sourceMappingURL=QuickLinks.d.ts.map