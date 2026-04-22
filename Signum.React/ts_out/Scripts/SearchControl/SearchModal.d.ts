import * as React from 'react';
import { IModalProps } from '../Modals';
import { FindOptions, FindMode, ResultRow, ModalFindOptions } from '../FindOptions';
import SearchControl, { SearchControlProps } from './SearchControl';
interface SearchModalProps extends React.Props<SearchModal>, IModalProps {
    findOptions: FindOptions;
    findMode: FindMode;
    isMany: boolean;
    title?: string;
    searchControlProps?: Partial<SearchControlProps>;
}
export default class SearchModal extends React.Component<SearchModalProps, {
    show: boolean;
}> {
    static marginVertical: number;
    static minHeight: number;
    constructor(props: SearchModalProps);
    selectedRows: ResultRow[];
    okPressed: boolean;
    handleSelectionChanged: (selected: ResultRow[]) => void;
    handleOkClicked: () => void;
    handleCancelClicked: () => void;
    handleOnExisted: () => void;
    handleDoubleClick: (e: React.MouseEvent<any, MouseEvent>, row: ResultRow) => void;
    searchControl?: SearchControl;
    componentWillMount(): void;
    componentWillUnmount(): void;
    onResize: () => void;
    render(): JSX.Element;
    static open(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<ResultRow | undefined>;
    static openMany(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<ResultRow[] | undefined>;
    static explore(findOptions: FindOptions, modalOptions?: ModalFindOptions): Promise<void>;
}
export {};
//# sourceMappingURL=SearchModal.d.ts.map