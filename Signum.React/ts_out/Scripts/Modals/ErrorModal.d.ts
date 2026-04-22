import * as React from 'react';
import { IModalProps } from '../Modals';
import { ServiceError, ValidationError } from '../Services';
import "./Modals.css";
interface ErrorModalProps extends IModalProps {
    error: any;
}
export default class ErrorModal extends React.Component<ErrorModalProps, {
    showDetails?: boolean;
    show: boolean;
}> {
    constructor(props: ErrorModalProps);
    handleShowStackTrace: (e: React.MouseEvent<any, MouseEvent>) => void;
    handleOnExited: () => void;
    handleCloseClicked: () => void;
    render(): JSX.Element;
    renderTitle(e: any): JSX.Element;
    renderServiceTitle(se: ServiceError): JSX.Element;
    renderValidationTitle(ve: ValidationError): JSX.Element;
    renderServiceMessage(se: ServiceError): JSX.Element;
    renderValidationeMessage(ve: ValidationError): JSX.Element;
    renderMessage(e: any): {} | React.ReactNodeArray | null | undefined;
    static showError(error: any): Promise<void>;
}
export {};
//# sourceMappingURL=ErrorModal.d.ts.map