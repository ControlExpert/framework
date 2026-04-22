import * as React from 'react';
import { IModalProps, IHandleKeyboard } from '../Modals';
import * as Navigator from '../Navigator';
import ButtonBar from './ButtonBar';
import { TypeContext } from '../TypeContext';
import { Entity, Lite, ModifiableEntity, EntityPack } from '../Signum.Entities';
import { PropertyRoute } from '../Reflection';
import ValidationErrors from './ValidationErrors';
import { EntityOperationContext } from '../Operations';
import { BsSize } from '../Components';
import "./Frames.css";
interface FrameModalProps extends React.Props<FrameModal>, IModalProps {
    title?: string;
    entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>;
    propertyRoute?: PropertyRoute;
    isOperationVisible?: (eoc: EntityOperationContext<any>) => boolean;
    validate?: boolean;
    requiresSaveOperation?: boolean;
    avoidPromptLooseChange?: boolean;
    extraComponentProps?: {};
    getViewPromise?: (e: ModifiableEntity) => (undefined | string | Navigator.ViewPromise<ModifiableEntity>);
    isNavigate?: boolean;
    readOnly?: boolean;
    modalSize?: BsSize;
    createNew?: () => Promise<ModifiableEntity>;
}
interface FrameModalState {
    pack?: EntityPack<ModifiableEntity>;
    lastEntity?: string;
    getComponent?: (ctx: TypeContext<ModifiableEntity>) => React.ReactElement<any>;
    propertyRoute?: PropertyRoute;
    show: boolean;
    refreshCount: number;
}
export default class FrameModal extends React.Component<FrameModalProps, FrameModalState> implements IHandleKeyboard {
    prefix: string;
    static defaultProps: FrameModalProps;
    constructor(props: FrameModalProps);
    componentWillMount(): void;
    componentWillReceiveProps(props: FrameModalProps): void;
    handleKeyDown(e: KeyboardEvent): void;
    getTypeName(): string;
    getTypeInfo(): import("../Reflection").TypeInfo;
    calculateState(props: FrameModalProps): FrameModalState;
    setPack(pack: EntityPack<ModifiableEntity>): EntityPack<ModifiableEntity>;
    loadComponent(pack: EntityPack<ModifiableEntity>): Promise<void>;
    okClicked: boolean;
    handleOkClicked: () => void;
    handleCancelClicked: () => void;
    hasChanges(): boolean;
    handleOnExited: () => void;
    render(): JSX.Element;
    entityComponent?: React.Component<any, any> | null;
    setComponent(c: React.Component<any, any> | null): void;
    buttonBar?: ButtonBar | null;
    renderBody(): JSX.Element;
    validationErrors?: ValidationErrors | null;
    renderTitle(): JSX.Element;
    renderExpandLink(): JSX.Element | undefined;
    handlePopupFullScreen: (e: React.MouseEvent<any, MouseEvent>) => void;
    static openView(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, options: Navigator.ViewOptions): Promise<Entity | undefined>;
    static isModelEntity(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>): boolean;
    static openNavigate(entityOrPack: Lite<Entity> | ModifiableEntity | EntityPack<ModifiableEntity>, options: Navigator.NavigateOptions): Promise<void>;
}
export declare class FunctionalAdapter extends React.Component {
    render(): React.ReactNode;
    static withRef(element: React.ReactElement<any>, ref: (c: React.Component | null) => void): JSX.Element;
}
export {};
//# sourceMappingURL=FrameModal.d.ts.map