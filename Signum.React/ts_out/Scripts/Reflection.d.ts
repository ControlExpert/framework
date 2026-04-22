import { ModifiableEntity, Entity, Lite, MListElement, ModelState, MixinEntity } from './Signum.Entities';
import { MList } from "./Signum.Entities";
export declare function getEnumInfo(enumTypeName: string, enumId: number): MemberInfo;
export interface TypeInfo {
    kind: KindOfType;
    name: string;
    fullName: string;
    niceName?: string;
    nicePluralName?: string;
    gender?: string;
    entityKind?: EntityKind;
    entityData?: EntityData;
    toStringFunction?: string;
    isLowPopulation?: boolean;
    isSystemVersioned?: boolean;
    requiresSaveOperation?: boolean;
    queryDefined?: boolean;
    requiresEntityPack?: boolean;
    members: {
        [name: string]: MemberInfo;
    };
    membersById?: {
        [name: string]: MemberInfo;
    };
    operations?: {
        [name: string]: OperationInfo;
    };
}
export interface MemberInfo {
    name: string;
    niceName: string;
    typeNiceName: string;
    type: TypeReference;
    isReadOnly?: boolean;
    isIgnoredEnum?: boolean;
    unit?: string;
    format?: string;
    required?: boolean;
    maxLength?: number;
    isMultiline?: boolean;
    preserveOrder?: boolean;
    notVisible?: boolean;
    id?: any;
}
export interface OperationInfo {
    key: string;
    niceName: string;
    operationType: OperationType;
    canBeNew: boolean;
    canBeModified: boolean;
    hasCanExecute: boolean;
    hasStates: boolean;
}
export declare enum OperationType {
    Execute,
    Delete,
    Constructor,
    ConstructorFrom,
    ConstructorFromMany
}
export declare function toMomentFormat(format: string | undefined): string | undefined;
export declare function toMomentDurationFormat(format: string | undefined): string | undefined;
export declare function toNumbroFormat(format: string | undefined): string | undefined;
export declare function valToString(val: any): any;
export declare function numberToString(val: any, format?: string): string;
export declare function dateToString(val: any, format?: string): string;
export declare function durationToString(val: any, format?: string): string;
export interface TypeReference {
    name: string;
    typeNiceName?: string;
    isCollection?: boolean;
    isLite?: boolean;
    isNotNullable?: boolean;
    isEmbedded?: boolean;
}
export declare type KindOfType = "Entity" | "Enum" | "Message" | "Query" | "SymbolContainer";
export declare type EntityKind = "SystemString" | "System" | "Relational" | "String" | "Shared" | "Main" | "Part" | "SharedPart";
export declare const EntityKindValues: EntityKind[];
export declare type EntityData = "Master" | "Transactional";
export declare const EntityDataValues: EntityData[];
export declare function getAllTypes(): TypeInfo[];
export interface TypeInfoDictionary {
    [name: string]: TypeInfo;
}
export declare type PseudoType = IType | TypeInfo | string;
export declare function getTypeName(pseudoType: IType | TypeInfo | string | Lite<Entity> | ModifiableEntity): string;
export declare function isTypeEntity(type: PseudoType): boolean;
export declare function isTypeEnum(type: PseudoType): boolean;
export declare function isTypeModel(type: PseudoType): boolean;
export declare function isTypeEmbeddedOrValue(type: PseudoType): boolean;
export declare function isTypeModifiableEntity(type: TypeReference): boolean;
export declare function getTypeInfo(type: PseudoType): TypeInfo;
export declare function isLowPopulationSymbol(type: PseudoType): boolean | undefined;
export declare function parseId(ti: TypeInfo, id: string): string | number;
export declare const IsByAll = "[ALL]";
export declare function getTypeInfos(typeReference: TypeReference | string): TypeInfo[];
export declare function getQueryNiceName(queryName: PseudoType | QueryKey): string;
export declare function getQueryInfo(queryName: PseudoType | QueryKey): MemberInfo | TypeInfo;
export declare function getQueryKey(queryName: PseudoType | QueryKey): string;
export declare function isQueryDefined(queryName: PseudoType | QueryKey): boolean;
export declare function reloadTypes(): Promise<void>;
export declare function setTypes(types: TypeInfoDictionary): void;
export interface IBinding<T> {
    getValue(): T;
    setValue(val: T): void;
    suffix: string;
    getError(): string | undefined;
    setError(value: string | undefined): void;
}
export declare class Binding<T> implements IBinding<T> {
    parentObject: any;
    member: string | number;
    initialValue: T;
    suffix: string;
    constructor(parentObject: any, member: string | number, suffix?: string);
    static create<F, T>(parentValue: F, fieldAccessor: (from: F) => T): Binding<T>;
    static getSingleMember(fieldAccessor: (from: any) => any): string;
    getValue(): T;
    setValue(val: T): void;
    deleteValue(): void;
    getError(): string | undefined;
    setError(value: string | undefined): void;
}
export declare class ReadonlyBinding<T> implements IBinding<T> {
    value: T;
    suffix: string;
    constructor(value: T, suffix: string);
    getValue(): T;
    setValue(val: T): void;
    getError(): string | undefined;
    setError(name: string | undefined): void;
}
export declare class MListElementBinding<T> implements IBinding<T> {
    mListBinding: IBinding<MList<T>>;
    index: number;
    suffix: string;
    constructor(mListBinding: IBinding<MList<T>>, index: number);
    getValue(): T;
    setValue(val: T): void;
    getError(): string | undefined;
    setError(name: string | undefined): void;
}
export declare function createBinding(parentValue: any, lambdaMembers: LambdaMember[]): IBinding<any>;
export declare function getLambdaMembers(lambda: Function): LambdaMember[];
export declare function getFieldMembers(field: string): LambdaMember[];
export interface LambdaMember {
    name: string;
    type: MemberType;
}
export declare type MemberType = "Member" | "Mixin" | "Indexer";
export declare function New(type: PseudoType, props?: any, propertyRoute?: PropertyRoute): ModifiableEntity;
export declare function clone<T>(original: ModifiableEntity, propertyRoute?: PropertyRoute): ModifiableEntity;
export interface IType {
    typeName: string;
}
export declare function isType(obj: any): obj is IType;
export declare function newLite<T extends Entity>(type: Type<T>, id: number | string | undefined): Lite<T>;
export declare function newLite(typeName: PseudoType, id: number | string | undefined): Lite<Entity>;
export declare class Type<T extends ModifiableEntity> implements IType {
    typeName: string;
    New(props?: Partial<T>, propertyRoute?: PropertyRoute): T;
    constructor(typeName: string);
    tryTypeInfo(): TypeInfo;
    typeInfo(): TypeInfo;
    memberInfo(lambdaToProperty: (v: T) => any): MemberInfo;
    hasMixin(mixinType: Type<MixinEntity>): boolean;
    mixinMemberInfo<M extends MixinEntity>(mixinType: Type<M>, lambdaToProperty: (v: M) => any): MemberInfo;
    propertyRoute(lambdaToProperty: (v: T) => any): PropertyRoute;
    mixinPropertyRoute<M extends MixinEntity>(mixinType: Type<M>, lambdaToProperty: (v: M) => any): PropertyRoute;
    niceName(): string;
    nicePluralName(): string;
    niceCount(count: number): string;
    nicePropertyName(lambdaToProperty: (v: T) => any): string;
    isInstance(obj: any): obj is T;
    isLite(obj: any): obj is Lite<T & Entity>;
    token(): QueryTokenString<T>;
    token<S>(lambdaToColumn: (v: T) => S): QueryTokenString<S>;
}
export declare class QueryTokenString<T> {
    token: string;
    constructor(token: string);
    toString(): string;
    static entity<T extends Entity = Entity>(): QueryTokenString<T>;
    static count(): QueryTokenString<{}>;
    systemValidFrom(): QueryTokenString<{}>;
    systemValidTo(): QueryTokenString<{}>;
    entity(): QueryTokenString<T>;
    entity<S>(lambdaToProperty: (v: T) => S): QueryTokenString<S>;
    cast<R extends Entity>(t: Type<R>): QueryTokenString<R>;
    append<S>(lambdaToProperty: (v: T) => S): QueryTokenString<S>;
    mixin<M extends MixinEntity>(t: Type<M>): QueryTokenString<M>;
    expression<S>(expressionName: string): QueryTokenString<S>;
    any<S = ArrayElement<T>>(): QueryTokenString<S>;
}
declare type ArrayElement<ArrayType> = ArrayType extends (infer ElementType)[] ? RemoveMListElement<ElementType> : never;
declare type RemoveMListElement<Type> = Type extends MListElement<infer S> ? S : Type;
export declare class EnumType<T extends string> {
    type: string;
    constructor(type: string);
    typeInfo(): TypeInfo;
    values(): T[];
    isDefined(val: any): val is T;
    assertDefined(val: any): T;
    value(val: T): T;
    niceTypeName(): string | undefined;
    niceToString(value: T): string;
}
export declare class MessageKey {
    type: string;
    name: string;
    constructor(type: string, name: string);
    propertyInfo(): MemberInfo;
    niceToString(...args: any[]): string;
}
export declare class QueryKey {
    type: string;
    name: string;
    constructor(type: string, name: string);
    memberInfo(): MemberInfo;
    niceName(): string;
}
export interface ISymbol {
    Type: string;
    key: string;
    id?: any;
}
export declare function symbolNiceName(symbol: (Entity & ISymbol) | Lite<Entity & ISymbol>): string;
export declare function getSymbol<T extends Entity & ISymbol>(type: Type<T>, key: string): T;
export declare function registerSymbol(type: string, key: string): any;
export declare class PropertyRoute {
    propertyRouteType: PropertyRouteType;
    parent?: PropertyRoute;
    rootType?: TypeInfo;
    member?: MemberInfo;
    mixinName?: string;
    static root(type: PseudoType): PropertyRoute;
    static member(parent: PropertyRoute, member: MemberInfo): PropertyRoute;
    static mixin(parent: PropertyRoute, mixinName: string): PropertyRoute;
    static mlistItem(parent: PropertyRoute): PropertyRoute;
    static liteEntity(parent: PropertyRoute): PropertyRoute;
    static parse(rootType: PseudoType, propertyString: string): PropertyRoute;
    constructor(parent: PropertyRoute | undefined, propertyRouteType: PropertyRouteType, rootType: TypeInfo | undefined, member: MemberInfo | undefined, mixinName: string | undefined);
    addLambda(property: ((val: any) => any) | string): PropertyRoute;
    typeReference(): TypeReference;
    typeReferenceInfo(): TypeInfo;
    findRootType(): TypeInfo;
    propertyPath(): string;
    tryAddMember(memberType: MemberType, memberName: string): PropertyRoute | undefined;
    addLambdaMember(lm: LambdaMember): PropertyRoute;
    addMember(memberType: MemberType, memberName: string): PropertyRoute;
    static generateAll(type: PseudoType): PropertyRoute[];
    subMembers(): {
        [subMemberName: string]: MemberInfo;
    };
    toString(): string;
}
export declare type PropertyRouteType = "Root" | "Field" | "Mixin" | "LiteEntity" | "MListItem";
export declare type GraphExplorerMode = "collect" | "set" | "clean";
export declare class GraphExplorer {
    static propagateAll(...args: any[]): GraphExplorer;
    static setModelState(e: ModifiableEntity, modelState: ModelState | undefined, initialPrefix: string): void;
    static collectModelState(e: ModifiableEntity, initialPrefix: string): ModelState;
    private modified;
    private notModified;
    constructor(mode: GraphExplorerMode, modelState: ModelState);
    private mode;
    private modelState;
    isModified(obj: any, modelStatePrefix: string): boolean;
    private static specialProperties;
    private isModifiableObject;
    static TypesLazilyCreated: string[];
}
export {};
//# sourceMappingURL=Reflection.d.ts.map