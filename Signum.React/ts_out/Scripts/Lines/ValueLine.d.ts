/// <reference path="../ConfigureReactWidgets.d.ts" />
import * as React from 'react';
import { MemberInfo, TypeReference } from '../Reflection';
import { LineBase, LineBaseProps } from '../Lines/LineBase';
import 'react-widgets/dist/css/react-widgets.css';
export interface ValueLineProps extends LineBaseProps, React.Props<ValueLine> {
    valueLineType?: ValueLineType;
    unitText?: React.ReactChild;
    formatText?: string;
    autoTrimString?: boolean;
    autoFixString?: boolean;
    inlineCheckbox?: boolean | "block";
    comboBoxItems?: (OptionItem | MemberInfo | string)[];
    valueHtmlAttributes?: React.AllHTMLAttributes<any>;
    extraButtons?: (vl: ValueLine) => React.ReactNode;
    initiallyFocused?: boolean;
    incrementWithArrow?: boolean | number;
}
export interface OptionItem {
    value: any;
    label: string;
}
export declare type ValueLineType = "Checkbox" | "ComboBox" | "DateTime" | "TextBox" | "TextArea" | "Number" | "Decimal" | "Color" | "TimeSpan";
export declare class ValueLine extends LineBase<ValueLineProps, ValueLineProps> {
    static autoFixString(str: string, autoTrim: boolean): string;
    calculateDefaultState(state: ValueLineProps): void;
    inputElement?: HTMLElement | null;
    componentDidMount(): void;
    static getValueLineType(t: TypeReference): ValueLineType | undefined;
    overrideProps(state: ValueLineProps, overridenProps: ValueLineProps): void;
    static renderers: {
        [valueLineType: string]: (vl: ValueLine) => JSX.Element;
    };
    renderInternal(): JSX.Element | null;
    static withItemGroup(vl: ValueLine, input: JSX.Element): JSX.Element;
    static isNumber(e: React.KeyboardEvent<any>): boolean;
    static isDecimal(e: React.KeyboardEvent<any>): boolean;
    static isDuration(e: React.KeyboardEvent<any>): boolean;
}
export interface NumericTextBoxProps {
    value: number | null;
    onChange: (newValue: number | null) => void;
    validateKey: (e: React.KeyboardEvent<any>) => boolean;
    format?: string;
    formControlClass?: string;
    htmlAttributes?: React.HTMLAttributes<HTMLInputElement>;
    innerRef?: (ta: HTMLInputElement | null) => void;
}
export declare class NumericTextBox extends React.Component<NumericTextBoxProps, {
    text?: string;
}> {
    constructor(props: NumericTextBoxProps);
    render(): JSX.Element;
    handleOnBlur: (e: React.FocusEvent<any>) => void;
    handleOnChange: (e: React.SyntheticEvent<any, Event>) => void;
    handleKeyDown: (e: React.KeyboardEvent<any>) => void;
}
export interface DurationTextBoxProps {
    value: number;
    onChange: (newValue: number | null) => void;
    validateKey: (e: React.KeyboardEvent<any>) => boolean;
    formControlClass?: string;
    format?: string;
    htmlAttributes: React.HTMLAttributes<HTMLInputElement>;
    innerRef?: (ta: HTMLInputElement | null) => void;
}
export declare class DurationTextBox extends React.Component<DurationTextBoxProps, {
    text?: string;
}> {
    constructor(props: DurationTextBoxProps);
    render(): JSX.Element;
    handleOnBlur: (e: React.FocusEvent<any>) => void;
    handleOnChange: (e: React.SyntheticEvent<any, Event>) => void;
    handleKeyDown: (e: React.KeyboardEvent<any>) => void;
}
//# sourceMappingURL=ValueLine.d.ts.map