import * as React from 'react';
import { IModalProps } from './Modals';
import { TypeInfo } from './Reflection';
import { BsSize } from './Components';
interface SelectorModalProps extends React.Props<SelectorModal>, IModalProps {
    options: {
        value: any;
        displayName: React.ReactNode;
        name: string;
        htmlAttributes?: React.HTMLAttributes<HTMLButtonElement>;
    }[];
    title: React.ReactNode;
    message: React.ReactNode;
    size?: BsSize;
    dialogClassName?: string;
}
export default class SelectorModal extends React.Component<SelectorModalProps, {
    show: boolean;
}> {
    constructor(props: SelectorModalProps);
    selectedValue: any;
    handleButtonClicked: (val: any) => void;
    handleCancelClicked: () => void;
    handleOnExited: () => void;
    render(): JSX.Element;
    static chooseElement<T>(options: T[], config?: SelectorConfig<T>): Promise<T | undefined>;
    static chooseType(options: TypeInfo[]): Promise<TypeInfo | undefined>;
}
export interface SelectorConfig<T> {
    buttonName?: (val: T) => string;
    buttonDisplay?: (val: T) => React.ReactNode;
    buttonHtmlAttributes?: (val: T) => React.HTMLAttributes<HTMLButtonElement>;
    title?: React.ReactNode;
    message?: React.ReactNode;
    size?: BsSize;
    dialogClassName?: string;
    forceShow?: boolean;
}
export {};
//# sourceMappingURL=SelectorModal.d.ts.map