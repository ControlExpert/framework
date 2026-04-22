import * as React from 'react';
import { IModalProps } from './Modals';
import { TypeReference } from './Reflection';
import { ValueLineType } from './Lines/ValueLine';
import { MemberInfo } from './Reflection';
import { BsSize } from './Components';
interface ValueLineModalProps extends React.Props<ValueLineModal>, IModalProps {
    options: ValueLineModalOptions;
}
export default class ValueLineModal extends React.Component<ValueLineModalProps, {
    show: boolean;
    value?: any;
}> {
    constructor(props: ValueLineModalProps);
    selectedValue: any;
    handleOkClick: () => void;
    handleCancelClicked: () => void;
    handleOnExited: () => void;
    render(): JSX.Element;
    static show(options: ValueLineModalOptions): Promise<any>;
}
export interface ValueLineModalOptions {
    member?: MemberInfo;
    type?: TypeReference;
    valueLineType?: ValueLineType;
    initialValue?: any;
    title?: React.ReactChild;
    message?: React.ReactChild;
    labelText?: React.ReactChild;
    formatText?: string;
    unitText?: string;
    initiallyFocused?: boolean;
    valueHtmlAttributes?: React.HTMLAttributes<any>;
    allowEmptyValue?: boolean;
    modalSize?: BsSize;
}
export {};
//# sourceMappingURL=ValueLineModal.d.ts.map