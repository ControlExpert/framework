import * as React from "react";
import { Entity } from '../Signum.Entities';
import { ButtonsContext, ButtonBarElement } from '../TypeContext';
import { EntityOperationContext, EntityOperationGroup, AlternativeOperationSetting } from '../Operations';
import { ButtonProps } from "../Components/Button";
export declare function getEntityOperationButtons(ctx: ButtonsContext): Array<ButtonBarElement | undefined> | undefined;
export declare function andClose<T extends Entity>(eoc: EntityOperationContext<T>): AlternativeOperationSetting<T>;
export declare function andNew<T extends Entity>(eoc: EntityOperationContext<T>): AlternativeOperationSetting<T>;
interface OperationButtonProps extends ButtonProps {
    eoc: EntityOperationContext<any>;
    group?: EntityOperationGroup;
    canExecute?: string | null;
    onOperationClick?: (eoc: EntityOperationContext<any>) => void;
}
export declare class OperationButton extends React.Component<OperationButtonProps> {
    render(): JSX.Element | (false | "" | JSX.Element | JSX.Element[] | null | undefined)[];
    renderAlternative(aos: AlternativeOperationSetting<Entity>): JSX.Element;
    renderChildren(): {};
    handleOnClick: (event: React.MouseEvent<any, MouseEvent>) => void;
}
export declare function defaultOnClick<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function notifySuccess(): void;
export declare function defaultConstructFromEntity<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function defaultConstructFromLite<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function defaultExecuteEntity<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function defaultExecuteLite<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function defaultDeleteEntity<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function defaultDeleteLite<T extends Entity>(eoc: EntityOperationContext<T>, ...args: any[]): void;
export declare function confirmInNecessary<T extends Entity>(eoc: EntityOperationContext<T>, checkLite?: boolean): Promise<boolean>;
export {};
//# sourceMappingURL=EntityOperations.d.ts.map