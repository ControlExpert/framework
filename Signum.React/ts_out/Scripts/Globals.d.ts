export declare function isNumber(n: any): boolean;
export declare module Dic {
    const skipClasses: Function[];
    function equals<V>(objA: V, objB: V, deep: boolean, depth?: number, visited?: any[]): boolean;
    function assign<O extends P, P>(obj: O, other: P): void;
    function getValues<V>(obj: {
        [key: string]: V;
    }): V[];
    function getKeys(obj: {
        [key: string]: any;
    }): string[];
    function clear(obj: {
        [key: string]: any;
    }): void;
    function except(obj: {
        [key: string]: any;
    }, keys: string[]): {
        [key: string]: any;
    };
    function map<V, R>(obj: {
        [key: string]: V;
    }, selector: (key: string, value: V, index: number) => R): R[];
    function foreach<V>(obj: {
        [key: string]: V;
    }, action: (key: string, value: V) => void): void;
    function addOrThrow<V>(dic: {
        [key: string]: V;
    }, key: string, value: V, errorContext?: string): void;
    function simplify<T>(a: T): T;
}
export declare function coalesce<T>(value: T | undefined | null, defaultValue: T): T;
export declare function classes(...classNames: (string | null | undefined | boolean)[]): string;
export declare function addClass(props: {
    className?: string;
} | null | undefined, newClasses?: string | null): string | undefined;
export declare function combineFunction<F extends Function>(func1?: F | null, func2?: F | null): F | null | undefined;
export declare function areEqual<T>(a: T | undefined, b: T | undefined, field: (value: T) => any): boolean;
export declare function ifError<E, T>(ErrorClass: {
    new (...args: any[]): E;
}, onError: (error: E) => T): (error: any) => T;
export declare function bytesToSize(bytes: number): string;
export declare module DomUtils {
    function matches(elem: HTMLElement, selector: string): boolean;
    function closest(element: HTMLElement, selector: string, context?: Node): HTMLElement | undefined;
    function offsetParent(element: HTMLElement): HTMLElement | undefined;
}
//# sourceMappingURL=Globals.d.ts.map