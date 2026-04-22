import * as React from 'react';
import { TypeContext } from '../TypeContext';
import { LineBase, LineBaseProps } from '../Lines/LineBase';
import { MList } from '../Signum.Entities';
export interface EnumCheckboxListProps extends LineBaseProps {
    data?: string[];
    ctx: TypeContext<MList<string>>;
    columnCount?: number;
    columnWidth?: number;
    avoidFieldSet?: boolean;
}
export declare class EnumCheckboxList extends LineBase<EnumCheckboxListProps, EnumCheckboxListProps> {
    calculateDefaultState(state: EnumCheckboxListProps): void;
    handleOnChange: (event: React.ChangeEvent<HTMLInputElement>, val: string) => void;
    getColumnStyle(): React.CSSProperties | undefined;
    renderInternal(): JSX.Element;
    renderContent(): JSX.Element | null;
}
//# sourceMappingURL=EnumCheckboxList.d.ts.map