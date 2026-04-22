import * as React from 'react';
import { ModifiableEntity } from '../Signum.Entities';
import { TypeContext } from '../Lines';
import { Type } from '../Reflection';
export default class DynamicComponent extends React.Component<{
    ctx: TypeContext<ModifiableEntity>;
    viewName?: string;
}> {
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
    subContext(ctx: TypeContext<ModifiableEntity>): TypeContext<any>[];
    static customTypeComponent: {
        [typeName: string]: (ctx: TypeContext<any>) => React.ReactElement<any> | null | undefined | "continue";
    };
    static customPropertyComponent: {
        [propertyRoute: string]: (ctx: TypeContext<any>) => React.ReactElement<any> | null | undefined;
    };
    static registerCustomPropertyComponent<T extends ModifiableEntity, V>(type: Type<T>, property: (e: T) => V, component: (ctx: TypeContext<any>) => React.ReactElement<any> | undefined): void;
    static getAppropiateComponent(ctx: TypeContext<any>): React.ReactElement<any> | undefined;
}
//# sourceMappingURL=DynamicComponent.d.ts.map