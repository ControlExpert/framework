import { MessageKey, Type, EnumType } from './Reflection';
import * as Entities from './Signum.Entities';
export interface ModifiableEntity {
    Type: string;
    toStr: string;
    modified: boolean;
    isNew: boolean;
    error?: {
        [member: string]: string;
    };
}
export interface Entity extends ModifiableEntity {
    id: number | string | undefined;
    ticks: string;
    mixins?: {
        [name: string]: MixinEntity;
    };
}
export interface EnumEntity<T> extends Entity {
}
export interface MixinEntity extends ModifiableEntity {
}
export declare function getMixin<M extends MixinEntity>(entity: Entity, type: Type<M>): M;
export declare function tryGetMixin<M extends MixinEntity>(entity: Entity, type: Type<M>): M | undefined;
export declare type MList<T> = Array<MListElement<T>>;
export interface MListElement<T> {
    rowId: number | string | null;
    element: T;
}
export declare function newMListElement<T>(element: T): MListElement<T>;
export declare function toMList<T>(array: T[]): MList<T>;
export interface Lite<T extends Entity> {
    entity?: T;
    EntityType: string;
    id?: number | string;
    toStr?: string;
}
export interface ModelState {
    [field: string]: string[];
}
export interface EntityPack<T extends ModifiableEntity> {
    readonly entity: T;
    readonly canExecute: {
        [key: string]: string;
    };
}
export interface ExecuteSymbol<T extends Entity> extends OperationSymbol {
    _execute_: T;
}
export interface DeleteSymbol<T extends Entity> extends OperationSymbol {
    _delete_: T;
}
export interface ConstructSymbol_Simple<T extends Entity> extends OperationSymbol {
    _construct_: T;
}
export interface ConstructSymbol_From<T extends Entity, F extends Entity> extends OperationSymbol {
    _constructFrom_: T;
    _from_?: F;
}
export interface ConstructSymbol_FromMany<T extends Entity, F extends Entity> extends OperationSymbol {
    _constructFromMany_: T;
    _from_?: F;
}
export declare const toStringDictionary: {
    [name: string]: ((entity: any) => string) | null;
};
export declare function registerToString<T extends ModifiableEntity>(type: Type<T>, toStringFunc: ((e: T) => string) | null): void;
export declare function getToString(entityOrLite: ModifiableEntity | Lite<Entity> | undefined | null): string;
export declare function toLite<T extends Entity>(entity: T, fat?: boolean, toStr?: string): Lite<T>;
export declare function toLite<T extends Entity>(entity: T | null | undefined, fat?: boolean, toStr?: string): Lite<T> | null;
export declare function toLiteFat<T extends Entity>(entity: T, toStr?: string): Lite<T>;
export declare function liteKey(lite: Lite<Entity>): string;
export declare function parseLite(lite: string): Lite<Entity>;
export declare function is<T extends Entity>(a: Lite<T> | T | null | undefined, b: Lite<T> | T | null | undefined, compareTicks?: boolean): boolean;
export declare function isLite(obj: any): obj is Lite<Entity>;
export declare function isModifiableEntity(obj: any): obj is ModifiableEntity;
export declare function isEntity(obj: any): obj is Entity;
export declare function isEntityPack(obj: any): obj is EntityPack<ModifiableEntity>;
export declare function entityInfo(entity: ModifiableEntity | Lite<Entity> | null | undefined): string;
export declare const BooleanEnum: EnumType<Entities.BooleanEnum>;
export declare type BooleanEnum = "False" | "True";
export declare module CalendarMessage {
    const Today: MessageKey;
}
export declare module ConnectionMessage {
    const AConnectionWithTheServerIsNecessaryToContinue: MessageKey;
    const SessionExpired: MessageKey;
    const ANewVersionHasJustBeenDeployedSaveChangesAnd0: MessageKey;
    const Refresh: MessageKey;
}
export declare const CorruptMixin: Type<Entities.CorruptMixin>;
export interface CorruptMixin extends MixinEntity {
    Type: "CorruptMixin";
    corrupt?: boolean;
}
export interface EmbeddedEntity extends ModifiableEntity {
}
export declare module EngineMessage {
    const ConcurrencyErrorOnDatabaseTable0Id1: MessageKey;
    const EntityWithType0AndId1NotFound: MessageKey;
    const NoWayOfMappingType0Found: MessageKey;
    const TheEntity0IsNew: MessageKey;
    const ThereAre0ThatReferThisEntity: MessageKey;
    const ThereAreRecordsIn0PointingToThisTableByColumn1: MessageKey;
    const UnauthorizedAccessTo0Because1: MessageKey;
    const TheresAlreadyA0With1EqualsTo2_G: MessageKey;
}
export declare module EntityControlMessage {
    const Create: MessageKey;
    const Find: MessageKey;
    const Detail: MessageKey;
    const MoveDown: MessageKey;
    const MoveUp: MessageKey;
    const Move: MessageKey;
    const Navigate: MessageKey;
    const NullValueNotAllowed: MessageKey;
    const Remove: MessageKey;
    const View: MessageKey;
}
export interface ImmutableEntity extends Entity {
    allowChange?: boolean;
}
export declare module JavascriptMessage {
    const chooseAType: MessageKey;
    const chooseAValue: MessageKey;
    const addFilter: MessageKey;
    const openTab: MessageKey;
    const renameColumn: MessageKey;
    const editColumn: MessageKey;
    const enterTheNewColumnName: MessageKey;
    const error: MessageKey;
    const executed: MessageKey;
    const hideFilters: MessageKey;
    const showFilters: MessageKey;
    const groupResults: MessageKey;
    const ungroupResults: MessageKey;
    const activateTimeMachine: MessageKey;
    const deactivateTimeMachine: MessageKey;
    const showRecords: MessageKey;
    const loading: MessageKey;
    const noActionsFound: MessageKey;
    const saveChangesBeforeOrPressCancel: MessageKey;
    const loseCurrentChanges: MessageKey;
    const noElementsSelected: MessageKey;
    const searchForResults: MessageKey;
    const selectOnlyOneElement: MessageKey;
    const popupErrors: MessageKey;
    const popupErrorsStop: MessageKey;
    const insertColumn: MessageKey;
    const removeColumn: MessageKey;
    const reorderColumn_MoveLeft: MessageKey;
    const reorderColumn_MoveRight: MessageKey;
    const saved: MessageKey;
    const search: MessageKey;
    const Selected: MessageKey;
    const selectToken: MessageKey;
    const find: MessageKey;
    const remove: MessageKey;
    const view: MessageKey;
    const create: MessageKey;
    const moveDown: MessageKey;
    const moveUp: MessageKey;
    const navigate: MessageKey;
    const newEntity: MessageKey;
    const ok: MessageKey;
    const cancel: MessageKey;
    const showPeriod: MessageKey;
    const showPreviousOperation: MessageKey;
}
export declare module LiteMessage {
    const IdNotValid: MessageKey;
    const InvalidFormat: MessageKey;
    const New_G: MessageKey;
    const Type0NotFound: MessageKey;
    const ToStr: MessageKey;
}
export interface ModelEntity extends ModifiableEntity {
}
export declare module NormalControlMessage {
    const Save: MessageKey;
    const ViewForType0IsNotAllowed: MessageKey;
    const SaveChangesFirst: MessageKey;
}
export declare module NormalWindowMessage {
    const _0Errors1: MessageKey;
    const _1Error: MessageKey;
    const Cancel: MessageKey;
    const ContinueAnyway: MessageKey;
    const ContinueWithErrors: MessageKey;
    const FixErrors: MessageKey;
    const ImpossibleToSaveIntegrityCheckFailed: MessageKey;
    const Loading0: MessageKey;
    const LoseChanges: MessageKey;
    const NoDirectErrors: MessageKey;
    const Ok: MessageKey;
    const Reload: MessageKey;
    const The0HasErrors1: MessageKey;
    const ThereAreChanges: MessageKey;
    const ThereAreChangesContinue: MessageKey;
    const ThereAreErrors: MessageKey;
    const Message: MessageKey;
    const New0_G: MessageKey;
    const Type0Id1: MessageKey;
}
export declare module OperationMessage {
    const Create: MessageKey;
    const CreateFromRegex: MessageKey;
    const StateShouldBe0InsteadOf1: MessageKey;
    const InUserInterface: MessageKey;
    const Operation01IsNotAuthorized: MessageKey;
    const Confirm: MessageKey;
    const PleaseConfirmYouDLikeToDelete0FromTheSystem: MessageKey;
    const PleaseConfirmYouDLikeToDeleteTheEntityFromTheSystem: MessageKey;
    const PleaseConfirmYouDLikeToDeleteTheSelectedEntitiesFromTheSystem: MessageKey;
    const TheOperation0DidNotReturnAnEntity: MessageKey;
    const Logs: MessageKey;
    const PreviousOperationLog: MessageKey;
    const _0AndClose: MessageKey;
    const _0AndNew: MessageKey;
}
export declare const OperationSymbol: Type<Entities.OperationSymbol>;
export interface OperationSymbol extends Symbol {
    Type: "Operation";
}
export declare const OperationType: EnumType<Entities.OperationType>;
export declare type OperationType = "Execute" | "Delete" | "Constructor" | "ConstructorFrom" | "ConstructorFromMany";
export declare module PaginationMessage {
    const All: MessageKey;
}
export declare module QuickLinkMessage {
    const Quicklinks: MessageKey;
    const No0Found: MessageKey;
}
export declare module SearchMessage {
    const ChooseTheDisplayNameOfTheNewColumn: MessageKey;
    const Field: MessageKey;
    const AddColumn: MessageKey;
    const CollectionsCanNotBeAddedAsColumns: MessageKey;
    const AddFilter: MessageKey;
    const AddGroup: MessageKey;
    const AddValue: MessageKey;
    const DeleteFilter: MessageKey;
    const Filters: MessageKey;
    const Find: MessageKey;
    const FinderOf0: MessageKey;
    const Name: MessageKey;
    const NewColumnSName: MessageKey;
    const NoActionsFound: MessageKey;
    const NoColumnSelected: MessageKey;
    const NoFiltersSpecified: MessageKey;
    const Of: MessageKey;
    const Operation: MessageKey;
    const Query0IsNotAllowed: MessageKey;
    const Query0NotAllowed: MessageKey;
    const Query0NotRegistered: MessageKey;
    const Rename: MessageKey;
    const _0Results_N: MessageKey;
    const First0Results_N: MessageKey;
    const _01of2Results_N: MessageKey;
    const Search: MessageKey;
    const Refresh: MessageKey;
    const Create: MessageKey;
    const CreateNew0_G: MessageKey;
    const SearchControl_Pagination_All: MessageKey;
    const ThereIsNo0: MessageKey;
    const Value: MessageKey;
    const View: MessageKey;
    const ViewSelected: MessageKey;
    const Operations: MessageKey;
    const NoResultsFound: MessageKey;
    const Explore: MessageKey;
    const PinnedFilter: MessageKey;
    const Label: MessageKey;
    const Column: MessageKey;
    const Row: MessageKey;
    const DisableOnNull: MessageKey;
    const SplitText: MessageKey;
    const WhenPressedTheFilterWillTakeNoEffectIfTheValueIsNull: MessageKey;
    const WhenPressedTheFilterValueWillBeSplittedAndAllTheWordsHaveToBeFound: MessageKey;
    const ParentValue: MessageKey;
}
export declare module SelectorMessage {
    const ConstructorSelector: MessageKey;
    const PleaseChooseAValueToContinue: MessageKey;
    const PleaseSelectAConstructor: MessageKey;
    const PleaseSelectAType: MessageKey;
    const TypeSelector: MessageKey;
    const ValueMustBeSpecifiedFor0: MessageKey;
    const ChooseAValue: MessageKey;
    const SelectAnElement: MessageKey;
    const PleaseSelectAnElement: MessageKey;
}
export interface Symbol extends Entity {
    key: string;
}
export declare module SynchronizerMessage {
    const EndOfSyncScript: MessageKey;
    const StartOfSyncScriptGeneratedOn0: MessageKey;
}
export declare module ValidationMessage {
    const _0DoesNotHaveAValid1Format: MessageKey;
    const _0DoesNotHaveAValid1IdentifierFormat: MessageKey;
    const _0HasAnInvalidFormat: MessageKey;
    const _0HasMoreThan1DecimalPlaces: MessageKey;
    const _0HasSomeRepeatedElements1: MessageKey;
    const _0ShouldBe12: MessageKey;
    const _0ShouldBe1InsteadOf2: MessageKey;
    const _0HasToBeBetween1And2: MessageKey;
    const _0HasToBeLowercase: MessageKey;
    const _0HasToBeUppercase: MessageKey;
    const _0IsNecessary: MessageKey;
    const _0IsNecessaryOnState1: MessageKey;
    const _0IsNotAllowed: MessageKey;
    const _0IsNotAllowedOnState1: MessageKey;
    const _0IsNotSet: MessageKey;
    const _0IsSet: MessageKey;
    const _0IsNotA1_G: MessageKey;
    const BeA0_G: MessageKey;
    const Be: MessageKey;
    const BeBetween0And1: MessageKey;
    const BeNotNull: MessageKey;
    const FileName: MessageKey;
    const Have0Decimals: MessageKey;
    const HaveANumberOfElements01: MessageKey;
    const HaveAPrecisionOf: MessageKey;
    const HaveBetween0And1Characters: MessageKey;
    const HaveMaximum0Characters: MessageKey;
    const HaveMinimum0Characters: MessageKey;
    const HaveNoRepeatedElements: MessageKey;
    const HaveValid0Format: MessageKey;
    const InvalidDateFormat: MessageKey;
    const InvalidFormat: MessageKey;
    const NotPossibleToaAssign0: MessageKey;
    const Numeric: MessageKey;
    const OrBeNull: MessageKey;
    const Telephone: MessageKey;
    const _0ShouldHaveJustOneLine: MessageKey;
    const _0ShouldNotHaveInitialSpaces: MessageKey;
    const _0ShouldNotHaveFinalSpaces: MessageKey;
    const TheLenghtOf0HasToBeEqualTo1: MessageKey;
    const TheLengthOf0HasToBeGreaterOrEqualTo1: MessageKey;
    const TheLengthOf0HasToBeLesserOrEqualTo1: MessageKey;
    const TheNumberOf0IsBeingMultipliedBy1: MessageKey;
    const TheRowsAreBeingGroupedBy0: MessageKey;
    const TheNumberOfElementsOf0HasToBe12: MessageKey;
    const Type0NotAllowed: MessageKey;
    const _0IsMandatoryWhen1IsNotSet: MessageKey;
    const _0IsMandatoryWhen1IsNotSetTo2: MessageKey;
    const _0IsMandatoryWhen1IsSet: MessageKey;
    const _0IsMandatoryWhen1IsSetTo2: MessageKey;
    const _0ShouldBeNullWhen1IsNotSet: MessageKey;
    const _0ShouldBeNullWhen1IsNotSetTo2: MessageKey;
    const _0ShouldBeNullWhen1IsSet: MessageKey;
    const _0ShouldBeNullWhen1IsSetTo2: MessageKey;
    const _0ShouldBeNull: MessageKey;
    const _0ShouldBeADateInThePast: MessageKey;
    const BeInThePast: MessageKey;
    const _0ShouldBeGreaterThan1: MessageKey;
    const _0ShouldBeGreaterThanOrEqual1: MessageKey;
    const _0ShouldBeLessThan1: MessageKey;
    const _0ShouldBeLessThanOrEqual1: MessageKey;
    const _0HasAPrecisionOf1InsteadOf2: MessageKey;
    const _0ShouldBeOfType1: MessageKey;
    const _0ShouldNotBeOfType1: MessageKey;
    const _0And1CanNotBeSetAtTheSameTime: MessageKey;
    const _0Or1ShouldBeSet: MessageKey;
    const _0And1And2CanNotBeSetAtTheSameTime: MessageKey;
    const _0Have1ElementsButAllowedOnly2: MessageKey;
    const _0IsEmpty: MessageKey;
    const _AtLeastOneValueIsNeeded: MessageKey;
    const PowerOf: MessageKey;
}
export declare module VoidEnumMessage {
    const Instance: MessageKey;
}
export declare namespace External {
    module CollectionMessage {
        const And: MessageKey;
        const Or: MessageKey;
        const No0Found: MessageKey;
        const MoreThanOne0Found: MessageKey;
    }
    const DayOfWeek: EnumType<DayOfWeek>;
    type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
}
//# sourceMappingURL=Signum.Entities.d.ts.map