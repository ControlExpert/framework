import * as React from 'react';
import { EntityPack, ModifiableEntity } from '../Signum.Entities';
import { TypeContext } from '../TypeContext';
import "./Widgets.css";
export interface WidgetContext<T extends ModifiableEntity> {
    ctx: TypeContext<T>;
    pack: EntityPack<T>;
}
export declare const onWidgets: Array<(ctx: WidgetContext<ModifiableEntity>) => React.ReactElement<any> | undefined>;
export declare function clearWidgets(): void;
export declare function renderWidgets(wc: WidgetContext<ModifiableEntity>): React.ReactNode | undefined;
export interface EmbeddedWidget {
    embeddedWidget: React.ReactElement<any>;
    position: EmbeddedWidgetPosition;
}
export declare type EmbeddedWidgetPosition = "Top" | "Bottom";
export declare const onEmbeddedWidgets: Array<(ctx: WidgetContext<ModifiableEntity>) => EmbeddedWidget | undefined>;
export declare function renderEmbeddedWidgets(wc: WidgetContext<ModifiableEntity>): {
    top: React.ReactElement<any>[];
    bottom: React.ReactElement<any>[];
};
//# sourceMappingURL=Widgets.d.ts.map