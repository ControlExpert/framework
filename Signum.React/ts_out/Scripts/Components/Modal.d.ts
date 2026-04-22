import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as BaseModal from 'react-overlays/lib/Modal';
import { BsSize, BsColor } from './index';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
export interface ModalProps extends ModelDialogProps {
    /**
     * Include a backdrop component. Specify 'static' for a backdrop that doesn't
     * trigger an "onHide" when clicked.
     */
    backdrop?: 'static' | boolean;
    /**
     * Close the modal when escape key is pressed
     */
    keyboard?: boolean;
    /**
     * Open and close the Modal with a slide and fade animation.
     */
    animation?: boolean;
    /**
     * When `true` The modal will automatically shift focus to itself when it
     * opens, and replace it to the last focused element when it closes.
     * Generally this should never be set to false as it makes the Modal less
     * accessible to assistive technologies, like screen-readers.
     */
    autoFocus?: boolean;
    /**
     * When `true` The modal will prevent focus from leaving the Modal while
     * open. Consider leaving the default value here, as it is necessary to make
     * the Modal work well with assistive technologies, such as screen readers.
     */
    enforceFocus?: boolean;
    /**
     * When `true` The modal will restore focus to previously focused element once
     * modal is hidden
     */
    restoreFocus?: boolean;
    /**
     * When `true` The modal will show itself.
     */
    show: boolean;
    /**
     * A callback fired when the header closeButton or non-static backdrop is
     * clicked. Required if either are specified.
     */
    onHide: () => void;
    /**
     * Callback fired before the Modal transitions in
     */
    onEnter?: () => void;
    /**
     * Callback fired as the Modal begins to transition in
     */
    onEntering?: () => void;
    /**
     * Callback fired after the Modal finishes transitioning in
     */
    onEntered?: () => void;
    /**
     * Callback fired right before the Modal transitions out
     */
    onExit?: () => void;
    /**
     * Callback fired as the Modal begins to transition out
     */
    onExiting?: () => void;
    /**
     * Callback fired after the Modal finishes transitioning out
     */
    onExited?: () => void;
    /**
     * @private
     */
    container?: React.ReactInstance;
    className?: string;
    style?: React.CSSProperties;
}
export interface ModalState {
    style: React.CSSProperties;
}
export declare class Modal extends React.Component<ModalProps, ModalState> {
    static defaultProps: ModalProps;
    static TRANSITION_DURATION: number;
    static BACKDROP_TRANSITION_DURATION: number;
    constructor(props: ModalProps, context: any);
    static childContextTypes: {
        $bs_modal: PropTypes.Requireable<PropTypes.InferProps<{
            onHide: PropTypes.Requireable<(...args: any[]) => any>;
        }>>;
    };
    getChildContext(): {
        $bs_modal: {
            onHide: () => void;
        };
    };
    componentWillUnmount(): void;
    _modal?: BaseModal | null;
    setModalRef: (ref: BaseModal | null) => void;
    handleDialogClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    handleEntering: () => void;
    handleExited: () => void;
    handleWindowResize: () => void;
    updateStyle(): void;
    render(): JSX.Element;
}
interface ModelDialogProps extends React.HTMLAttributes<any> {
    /**
     * A css class to apply to the Modal dialog DOM node.
     */
    dialogClassName?: string;
    className?: string;
    style?: React.CSSProperties;
    size?: BsSize;
    color?: BsColor;
}
interface ModalIconProps {
    color?: BsColor;
    classes?: string;
    icon?: IconProp;
    iconAlign?: string;
}
interface ModalHeaderButtonsProps {
    onClose?: () => void;
    onOk?: () => void;
    okDisabled?: boolean;
    onCancel?: () => void;
    closeBeforeTitle?: boolean;
    htmlAttributes?: React.HTMLAttributes<HTMLDivElement>;
    okButtonProps?: ModalIconProps;
    closeButtonProps?: ModalIconProps;
}
export declare class ModalHeaderButtons extends React.Component<ModalHeaderButtonsProps> {
    render(): JSX.Element;
    renderButton(text: string, mip?: ModalIconProps): string | JSX.Element;
}
export {};
//# sourceMappingURL=Modal.d.ts.map