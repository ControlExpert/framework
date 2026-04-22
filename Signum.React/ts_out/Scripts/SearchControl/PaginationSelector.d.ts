import * as React from 'react';
import { ResultTable, Pagination } from '../FindOptions';
import "./PaginationSelector.css";
interface PaginationSelectorProps {
    resultTable?: ResultTable;
    pagination: Pagination;
    onPagination: (pag: Pagination) => void;
}
export default class PaginationSelector extends React.Component<PaginationSelectorProps> {
    render(): JSX.Element | null;
    renderLeft(): React.ReactNode;
    handleMode: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleElementsPerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handlePageClick: (page: number) => void;
    renderCenter(): JSX.Element;
    renderRight(): React.ReactNode;
}
interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    maxButtons: number;
    onSelect: (num: number) => void;
}
export declare class PaginationComponent extends React.Component<PaginationComponentProps> {
    handlePageClicked: (e: React.MouseEvent<any, MouseEvent>, num: number) => void;
    render(): JSX.Element;
    getFirstLast(): {
        first: number;
        last: number;
    };
    addPageLink(key: string, page: number, text: string, ariaLabel: string, mode?: "active" | "disabled"): JSX.Element;
}
export {};
//# sourceMappingURL=PaginationSelector.d.ts.map