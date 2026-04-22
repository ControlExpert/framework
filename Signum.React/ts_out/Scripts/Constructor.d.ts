import { ModifiableEntity, EntityPack } from './Signum.Entities';
import { Type, PropertyRoute } from './Reflection';
export declare const customConstructors: {
    [typeName: string]: (pr?: PropertyRoute) => ModifiableEntity | Promise<ModifiableEntity | undefined>;
};
export declare function construct<T extends ModifiableEntity>(type: Type<T>, pr?: PropertyRoute): Promise<EntityPack<T> | undefined>;
export declare function construct(type: string, pr?: PropertyRoute): Promise<EntityPack<ModifiableEntity> | undefined>;
export declare function registerConstructor<T extends ModifiableEntity>(type: Type<T>, constructor: (pr?: PropertyRoute) => T | Promise<T | undefined>): void;
//# sourceMappingURL=Constructor.d.ts.map