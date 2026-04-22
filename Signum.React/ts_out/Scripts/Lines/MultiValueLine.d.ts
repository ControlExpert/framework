import * as React from "react";
import { TypeContext, LineBaseProps, LineBase } from "../Lines";
import { MList } from "../Signum.Entities";
interface MultiValueLineProps extends LineBaseProps {
    ctx: TypeContext<MList<any>>;
    onRenderItem?: (ctx: TypeContext<any>) => React.ReactElement<any>;
    onCreate?: () => Promise<any[] | any | undefined>;
    addValueText?: string;
}
export declare class MultiValueLine extends LineBase<MultiValueLineProps, MultiValueLineProps> {
    calculateDefaultState(state: MultiValueLineProps): void;
    handleDeleteValue: (index: number) => void;
    handleAddValue: (e: React.MouseEvent<any, MouseEvent>) => void;
    defaultCreate(): Promise<null>;
    renderInternal(): JSX.Element;
}
export interface MultiValueLineElementProps {
    ctx: TypeContext<any>;
    onRemove: (event: React.MouseEvent<any>) => void;
    onRenderItem?: (ctx: TypeContext<any>) => React.ReactElement<any>;
}
export declare class MultiValueLineElement extends React.Component<MultiValueLineElementProps> {
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=MultiValueLine.d.ts.map