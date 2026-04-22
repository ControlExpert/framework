import * as React from 'react';
import { FilterOptionParsed } from '../FindOptions';
import "./FilterBuilder.css";
interface PinnedFilterBuilderProps {
    filterOptions: FilterOptionParsed[];
    onFiltersChanged?: (filters: FilterOptionParsed[]) => void;
    extraSmall?: boolean;
}
export default class PinnedFilterBuilder extends React.Component<PinnedFilterBuilderProps> {
    render(): JSX.Element | null;
    renderValue(filter: FilterOptionParsed): JSX.Element;
    timeoutWriteText?: number | null;
    handleValueChange: (f: FilterOptionParsed) => void;
}
export {};
//# sourceMappingURL=PinnedFilterBuilder.d.ts.map