import { FindOptions, ResultTable } from './Search';
import { Entity, Lite } from './Signum.Entities';
import { Type, QueryTokenString } from './Reflection';
export declare function useForceUpdate(): () => void;
export declare function useAPI<T>(defaultValue: T, key: ReadonlyArray<any> | undefined, makeCall: (signal: AbortSignal) => Promise<T>): T;
export declare function useQuery(fo: FindOptions | null): ResultTable | undefined | null;
export declare function useInDB<R>(entity: Entity | Lite<Entity> | null, token: QueryTokenString<R> | string): AddToLite<R> | null | undefined;
declare type AddToLite<T> = T extends Entity ? Lite<T> : T;
export declare function useFetchAndForget<T extends Entity>(lite: Lite<T> | null | undefined): T | null | undefined;
export declare function useFetchAndRemember<T extends Entity>(lite: Lite<T> | null, onLoaded?: () => void): T | null | undefined;
export declare function useFetchAll<T extends Entity>(type: Type<T>): T[] | undefined;
export {};
//# sourceMappingURL=Hooks.d.ts.map