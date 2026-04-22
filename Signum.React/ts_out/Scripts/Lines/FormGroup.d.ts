import * as React from 'react';
import { StyleContext } from '../Lines';
import "./Lines.css";
export interface FormGroupProps extends React.Props<FormGroup> {
    labelText?: React.ReactChild;
    controlId?: string;
    ctx: StyleContext;
    labelHtmlAttributes?: React.HTMLAttributes<HTMLLabelElement>;
    htmlAttributes?: React.HTMLAttributes<HTMLDivElement>;
    helpText?: React.ReactChild;
}
export declare class FormGroup extends React.Component<FormGroupProps> {
    render(): JSX.Element;
}
//# sourceMappingURL=FormGroup.d.ts.map