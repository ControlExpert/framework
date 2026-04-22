import * as React from 'react';
import { ColumnOptionParsed, QueryDescription, QueryToken, SubTokensOptions } from '../FindOptions';
import "./ColumnBuilder.css";
export interface ColumnsBuilderProps {
    queryDescription: QueryDescription;
    columnOptions: ColumnOptionParsed[];
    subTokensOptions: SubTokensOptions;
    onColumnsChanged?: (columns: ColumnOptionParsed[]) => void;
    title?: React.ReactNode;
    readonly?: boolean;
}
export default class ColumnsBuilder extends React.Component<ColumnsBuilderProps> {
    handlerNewColumn: () => void;
    handlerDeleteColumn: (column: ColumnOptionParsed) => void;
    handleColumnChanged: (column: ColumnOptionParsed) => void;
    render(): JSX.Element;
}
export interface ColumnComponentProps {
    column: ColumnOptionParsed;
    onDeleteColumn: (fo: ColumnOptionParsed) => void;
    queryDescription: QueryDescription;
    subTokenOptions: SubTokensOptions;
    onTokenChanged?: (token: QueryToken | undefined) => void;
    onColumnChanged: (column: ColumnOptionParsed) => void;
    readonly: boolean;
}
export declare class ColumnComponent extends React.Component<ColumnComponentProps> {
    handleDeleteColumn: () => void;
    handleTokenChanged: (newToken: QueryToken | null | undefined) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ColumnBuilder.d.ts.map