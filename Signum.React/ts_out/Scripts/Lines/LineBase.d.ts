import * as React from 'react';
import { TypeContext, StyleOptions } from '../TypeContext';
import { TypeReference } from '../Reflection';
export interface ChangeEvent {
    newValue: any;
    oldValue: any;
}
export interface LineBaseProps extends StyleOptions {
    ctx: TypeContext<any>;
    type?: TypeReference;
    labelText?: React.ReactChild;
    visible?: boolean;
    hideIfNull?: boolean;
    onChange?: (e: ChangeEvent) => void;
    onValidate?: (val: any) => string;
    labelHtmlAttributes?: React.LabelHTMLAttributes<HTMLLabelElement>;
    formGroupHtmlAttributes?: React.HTMLAttributes<any>;
    helpText?: React.ReactChild;
    mandatory?: boolean;
}
export declare abstract class LineBase<P extends LineBaseProps, S extends LineBaseProps> extends React.Component<P, S> {
    constructor(props: P);
    shouldComponentUpdate(nextProps: LineBaseProps, nextState: LineBaseProps): boolean;
    componentWillReceiveProps(nextProps: P, nextContext: any): void;
    changes: number;
    setValue(val: any): void;
    validate(): void;
    defaultValidate(val: any): string | undefined;
    render(): JSX.Element | null;
    calculateState(props: P): S;
    overrideProps(state: S, overridenProps: S): void;
    baseHtmlAttributes(): React.HTMLAttributes<any>;
    calculateDefaultState(state: S): void;
    readonly mandatoryClass: "sf-mandatory" | null;
    abstract renderInternal(): JSX.Element | null;
}
export declare const tasks: ((lineBase: LineBase<LineBaseProps, LineBaseProps>, state: LineBaseProps) => void)[];
export declare function runTasks(lineBase: LineBase<LineBaseProps, LineBaseProps>, state: LineBaseProps): void;
//# sourceMappingURL=LineBase.d.ts.map