import * as React from 'react';
import { PropertyRoute, IBinding, Type, PseudoType } from './Reflection';
import { ModelState, MList, ModifiableEntity, EntityPack, MixinEntity } from './Signum.Entities';
import { EntityOperationContext } from './Operations';
export declare type FormGroupStyle = "None" | /// Only the value is rendered. Unaffected by FormGroupSize
"Basic" | /// Label on top, value below. Requires form-vertical container
"BasicDown" | /// Value on top, label below. Requires form-vertical container
"SrOnly" | /// Label visible only for Screen-Readers. Requires form-vertical / form-inline container
"LabelColumns";
export declare type FormSize = "ExtraSmall" | "Small" | "Normal" | "Large";
export declare class StyleContext {
    styleOptions: StyleOptions;
    parent: StyleContext;
    constructor(parent: StyleContext | undefined, styleOptions: StyleOptions | undefined);
    static default: StyleContext;
    readonly formGroupStyle: FormGroupStyle;
    readonly formSize: FormSize;
    readonly formGroupClass: string | undefined;
    readonly colFormLabelClass: string | undefined;
    readonly labelClass: string | undefined;
    readonly rwWidgetClass: string | undefined;
    readonly inputGroupClass: string | undefined;
    readonly formControlClass: string | undefined;
    readonly formControlPlainTextClass: string | undefined;
    readonly buttonClass: string | undefined;
    readonly placeholderLabels: boolean;
    readonly titleLabels: boolean;
    readonly readonlyAsPlainText: boolean;
    readonly labelColumns: BsColumns;
    readonly labelColumnsCss: string;
    readonly valueColumns: BsColumns;
    readonly valueColumnsCss: string;
    readOnly: boolean;
    readonly frame: EntityFrame | undefined;
    static bsColumnsCss(bsColumns: BsColumns): string;
    static bsColumnsInvert(bs: BsColumns): BsColumns;
}
export interface StyleOptions {
    formGroupStyle?: FormGroupStyle;
    formSize?: FormSize;
    placeholderLabels?: boolean;
    titleLabels?: boolean;
    readonlyAsPlainText?: boolean;
    labelColumns?: BsColumns | number;
    valueColumns?: BsColumns | number;
    readOnly?: boolean;
    frame?: EntityFrame;
}
export interface BsColumns {
    xs?: number;
    sm: number;
    md?: number;
    lg?: number;
}
export declare class TypeContext<T> extends StyleContext {
    propertyRoute: PropertyRoute;
    binding: IBinding<T>;
    prefix: string;
    value: T;
    error: string | undefined;
    static root<T extends ModifiableEntity>(value: T, styleOptions?: StyleOptions, parent?: StyleContext): TypeContext<T>;
    constructor(parent: StyleContext | undefined, styleOptions: StyleOptions | undefined, propertyRoute: PropertyRoute, binding: IBinding<T>, prefix?: string);
    subCtx(styleOptions: StyleOptions): TypeContext<T>;
    subCtx<R>(property: (val: T) => R, styleOptions?: StyleOptions): TypeContext<R>;
    subCtx<M extends MixinEntity>(mixin: Type<M>, styleOptions?: StyleOptions): TypeContext<M>;
    subCtx(field: string, styleOptions?: StyleOptions): TypeContext<any>;
    cast<R extends T & ModifiableEntity>(type: Type<R>): TypeContext<R>;
    as<R extends T & ModifiableEntity>(type: Type<R>): TypeContext<R> | undefined;
    niceName(property?: (val: T) => any): string;
    getUniqueId(suffix?: string): string;
    tryFindParentCtx<S extends ModifiableEntity>(type: Type<S>): TypeContext<S> | undefined;
    tryFindParentCtx(type: PseudoType): TypeContext<ModifiableEntity> | undefined;
    findParentCtx<S extends ModifiableEntity>(type: Type<S>): TypeContext<S>;
    findParentCtx(type: PseudoType): TypeContext<ModifiableEntity>;
    tryFindParent<S extends ModifiableEntity>(type: Type<S>): S | undefined;
    tryFindParent(type: PseudoType): ModifiableEntity | undefined;
    findParent<S extends ModifiableEntity>(type: Type<S>): S;
    findParent(type: PseudoType): ModifiableEntity;
    using(render: (ctx: this) => React.ReactChild): React.ReactChild;
    mlistItemCtxs<R>(property: (val: T) => MList<R>, styleOptions?: StyleOptions): TypeContext<R>[];
    readonly propertyPath: string | undefined;
    readonly errorClass: string | undefined;
    readonly errorClassBorder: string | undefined;
    errorAttributes(): React.HTMLAttributes<any> | undefined;
}
export interface ButtonsContext {
    pack: EntityPack<ModifiableEntity>;
    frame: EntityFrame;
    isOperationVisible?: (eoc: EntityOperationContext<any>) => boolean;
    tag?: string;
}
export interface ButtonBarElement {
    button: React.ReactElement<any>;
    order?: number;
    shortcut?: (e: KeyboardEvent) => boolean;
}
export interface IRenderButtons {
    renderButtons(ctx: ButtonsContext): (ButtonBarElement | undefined)[];
}
export interface IOperationVisible {
    isOperationVisible(eoc: EntityOperationContext<any>): boolean;
}
export interface IHasChanges {
    componentHasChanges?: () => boolean;
}
export interface EntityFrame {
    frameComponent: React.Component<any, any>;
    entityComponent: React.Component<any, any> | null | undefined;
    pack: EntityPack<ModifiableEntity> | undefined;
    onReload: (pack?: EntityPack<ModifiableEntity>) => void;
    setError: (modelState: ModelState, initialPrefix?: string) => void;
    revalidate: () => void;
    onClose: (ok?: boolean) => void;
    refreshCount: number;
    allowChangeEntity: boolean;
}
export declare function mlistItemContext<T>(ctx: TypeContext<MList<T>>): TypeContext<T>[];
//# sourceMappingURL=TypeContext.d.ts.map