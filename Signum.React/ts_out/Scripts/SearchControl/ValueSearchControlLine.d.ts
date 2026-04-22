import * as React from 'react';
import { FindOptions } from '../FindOptions';
import { Lite, Entity } from '../Signum.Entities';
import { QueryTokenString } from '../Reflection';
import { StyleContext } from '../TypeContext';
import ValueSearchControl from './ValueSearchControl';
import { SearchControlProps } from "./SearchControl";
import { BsColor } from '../Components';
export interface ValueSearchControlLineProps extends React.Props<ValueSearchControlLine> {
    ctx: StyleContext;
    findOptions?: FindOptions;
    valueToken?: string | QueryTokenString<any>;
    labelText?: React.ReactChild;
    labelHtmlAttributes?: React.HTMLAttributes<HTMLLabelElement>;
    formGroupHtmlAttributes?: React.HTMLAttributes<HTMLDivElement>;
    initialValue?: any;
    isLink?: boolean;
    isBadge?: boolean | "MoreThanZero";
    badgeColor?: BsColor;
    isFormControl?: boolean;
    findButton?: boolean;
    viewEntityButton?: boolean;
    avoidAutoRefresh?: boolean;
    refreshKey?: string | number;
    extraButtons?: (valueSearchControl: ValueSearchControl) => React.ReactNode;
    searchControlProps?: Partial<SearchControlProps>;
    onExplored?: () => void;
    onViewEntity?: (entity: Lite<Entity>) => void;
    onValueChanged?: (value: any) => void;
}
export default class ValueSearchControlLine extends React.Component<ValueSearchControlLineProps> {
    valueSearchControl?: ValueSearchControl | null;
    handleValueSearchControlLoaded: (vsc: ValueSearchControl | null) => void;
    getFindOptions(props: ValueSearchControlLineProps): FindOptions;
    refreshValue(): void;
    render(): JSX.Element | null;
    handleViewEntityClick: (e: React.MouseEvent<any, MouseEvent>) => void;
}
//# sourceMappingURL=ValueSearchControlLine.d.ts.map