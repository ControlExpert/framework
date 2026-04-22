import * as React from 'react';
import { FindOptions } from '../FindOptions';
import { ModifiableEntity } from '../Signum.Entities';
import { TypeContext } from '../TypeContext';
import { PropertyRoute } from '../Reflection';
export declare class ReactVisitor {
    visitChild(child: React.ReactChild): React.ReactNode;
    visitElement(element: React.ReactElement<any>): React.ReactNode;
    visit(element: React.ReactElement<any>): React.ReactElement<any>;
}
export declare class ReplaceVisitor extends ReactVisitor {
    predicate: (e: React.ReactElement<any>) => boolean;
    replacement: (e: React.ReactElement<any>) => React.ReactNode;
    constructor(predicate: (e: React.ReactElement<any>) => boolean, replacement: (e: React.ReactElement<any>) => React.ReactNode);
    visitElement(element: React.ReactElement<any>): {} | null | undefined;
}
export declare class ReactValidator extends ReactVisitor {
    visitElement(element: React.ReactElement<any>): {} | null | undefined;
    static validTagRegex: RegExp;
    getError(element: React.ReactElement<any>): string | undefined;
}
export declare class ViewReplacer<T extends ModifiableEntity> {
    result: React.ReactElement<any>;
    ctx: TypeContext<T>;
    constructor(result: React.ReactElement<any>, ctx: TypeContext<T>);
    removeElement(filter: (e: React.ReactElement<any>) => boolean): this;
    insertAfterElement(filter: (e: React.ReactElement<any>) => boolean, newElements: (e: React.ReactElement<any>) => (React.ReactElement<any> | undefined | false | null)[]): this;
    insertBeforeElement(filter: (e: React.ReactElement<any>) => boolean, newElements: (e: React.ReactElement<any>) => (React.ReactElement<any> | undefined | false | null)[]): this;
    replaceElement(filter: (e: React.ReactElement<any>) => boolean, newElements: (e: React.ReactElement<any>) => (React.ReactElement<any> | undefined | false | null)[]): this;
    removeLine(propertyRoute: (entity: T) => any): this;
    replaceFindOptions(filter: (findOptions: FindOptions) => boolean, modifier: (clone: FindOptions) => void): this;
    insertAfterLine(propertyRoute: (entity: T) => any, newElements: (ctx: TypeContext<T>) => (React.ReactElement<any> | undefined | false | null)[]): this;
    insertBeforeLine(propertyRoute: (entity: T) => any, newElements: (ctx: TypeContext<T>) => (React.ReactElement<any> | undefined)[]): this;
    previousTypeContext(e: React.ReactElement<any>): TypeContext<T>;
    replaceLine(propertyRoute: (entity: T) => any, newElements: (e: React.ReactElement<any>) => (React.ReactElement<any> | undefined)[]): this;
    removeTab(tabId: string | number): this;
    insertTabAfter(eventKey: string | number, ...newTabs: (React.ReactElement<any> | undefined | false | null)[]): this;
    insertTabBefore(eventKey: string | number, ...newTabs: (React.ReactElement<any> | undefined | false | null)[]): this;
}
export declare function cloneFindOptions(fo: FindOptions): FindOptions;
export declare function hasPropertyRoute(e: React.ReactElement<any>, pr: PropertyRoute): boolean;
//# sourceMappingURL=ReactVisitor.d.ts.map