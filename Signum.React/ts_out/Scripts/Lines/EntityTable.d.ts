import * as React from 'react';
import { TypeContext } from '../TypeContext';
import { ModifiableEntity, MList } from '../Signum.Entities';
import { EntityListBase, EntityListBaseProps, DragConfig } from './EntityListBase';
import { MaxHeightProperty } from 'csstype';
export interface EntityTableProps extends EntityListBaseProps {
    createAsLink?: boolean | ((er: EntityTable) => React.ReactElement<any>);
    /**Consider using EntityTable.typedColumns to get Autocompletion**/
    columns?: EntityTableColumn<any, any>[];
    fetchRowState?: (ctx: TypeContext<any>, row: EntityTableRow) => Promise<any>;
    onRowHtmlAttributes?: (ctx: TypeContext<any>, row: EntityTableRow, rowState: any) => React.HTMLAttributes<any> | null | undefined;
    avoidFieldSet?: boolean;
    avoidEmptyTable?: boolean;
    maxResultsHeight?: MaxHeightProperty<string | number> | any;
    scrollable?: boolean;
    isRowVisible?: (ctx: TypeContext<any>) => boolean;
    rowSubContext?: (ctx: TypeContext<any>) => TypeContext<any>;
    tableClasses?: string;
    theadClasses?: string;
    createMessage?: string;
}
export interface EntityTableColumn<T, RS> {
    property?: ((a: T) => any) | string;
    header?: React.ReactNode | null;
    headerHtmlAttributes?: React.ThHTMLAttributes<any>;
    cellHtmlAttributes?: (ctx: TypeContext<T>, row: EntityTableRow, rowState: RS) => React.TdHTMLAttributes<any> | null | undefined;
    template?: (ctx: TypeContext<T>, row: EntityTableRow, rowState: RS) => React.ReactChild | null | undefined | false;
}
export declare class EntityTable extends EntityListBase<EntityTableProps, EntityTableProps> {
    static defaultProps: {
        maxResultsHeight: string;
        scrollable: boolean;
    };
    static typedColumns<T extends ModifiableEntity>(columns: (EntityTableColumn<T, any> | false | null | undefined)[]): EntityTableColumn<ModifiableEntity, any>[];
    static typedColumnsWithRowState<T extends ModifiableEntity, RS>(columns: (EntityTableColumn<T, RS> | false | null | undefined)[]): EntityTableColumn<ModifiableEntity, RS>[];
    calculateDefaultState(state: EntityTableProps): void;
    overrideProps(state: EntityTableProps, overridenProps: EntityTableProps): void;
    renderInternal(): JSX.Element;
    renderButtons(): JSX.Element | undefined;
    componentDidMount(): void;
    containerDiv?: HTMLDivElement | null;
    thead?: HTMLTableSectionElement | null;
    renderTable(ctx: TypeContext<MList<ModifiableEntity>>): JSX.Element;
}
export interface EntityTableRowProps {
    ctx: TypeContext<ModifiableEntity>;
    index: number;
    columns: EntityTableColumn<ModifiableEntity, any>[];
    onRemove?: (event: React.MouseEvent<any>) => void;
    draggable?: DragConfig;
    fetchRowState?: (ctx: TypeContext<ModifiableEntity>, row: EntityTableRow) => Promise<any>;
    onRowHtmlAttributes?: (ctx: TypeContext<ModifiableEntity>, row: EntityTableRow, rowState: any) => React.HTMLAttributes<any> | null | undefined;
}
export declare class EntityTableRow extends React.Component<EntityTableRowProps, {
    rowState?: any;
}> {
    constructor(props: EntityTableRowProps);
    render(): JSX.Element;
    getTemplate(col: EntityTableColumn<ModifiableEntity, any>): React.ReactChild | undefined | null | false;
}
//# sourceMappingURL=EntityTable.d.ts.map