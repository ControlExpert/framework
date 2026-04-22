import * as React from 'react';
export interface TypeaheadProps {
    value?: string;
    onChange?: (newValue: string) => void;
    onBlur?: () => void;
    getItems: (query: string) => Promise<unknown[]>;
    getItemsDelay?: number;
    minLength?: number;
    renderList?: (typeAhead: Typeahead) => React.ReactNode;
    renderItem?: (item: unknown, query: string) => React.ReactNode;
    onSelect?: (item: unknown, e: React.KeyboardEvent<any> | React.MouseEvent<any>) => string | null;
    scrollHeight?: number;
    inputAttrs?: React.InputHTMLAttributes<HTMLInputElement>;
    itemAttrs?: (item: unknown) => React.LiHTMLAttributes<HTMLButtonElement>;
    noResultsMessage?: string;
}
export interface TypeaheadState {
    shown?: boolean;
    items?: any[];
    query?: string;
    selectedIndex?: number;
}
export declare class Typeahead extends React.Component<TypeaheadProps, TypeaheadState> {
    constructor(props: TypeaheadProps);
    rtl: boolean;
    static highlightedText: (val: string, query?: string | undefined) => React.ReactNode;
    static defaultProps: TypeaheadProps;
    handle: number | undefined;
    lookup(): void;
    populate(): void;
    static normalizeString(str: string): string;
    select(e: React.KeyboardEvent<any> | React.MouseEvent<any>): boolean;
    writeInInput(query: string): void;
    focused: boolean;
    handleFocus: () => void;
    handleBlur: () => void;
    blur(): void;
    handleKeyDown: (e: React.KeyboardEvent<any>) => void;
    handleKeyUp: (e: React.KeyboardEvent<any>) => void;
    handleMenuMouseUp: (e: React.MouseEvent<any, MouseEvent>, index: number) => void;
    mouseover: boolean;
    handleElementMouseEnter: (event: React.MouseEvent<any, MouseEvent>, index: number) => void;
    handleElementMouseLeave: (event: React.MouseEvent<any, MouseEvent>, index: number) => void;
    input: HTMLInputElement;
    handleOnChange: () => void;
    render(): JSX.Element;
    toggleEvents(isOpen: boolean | undefined): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillUpdate(nextProps: TypeaheadProps, nextState: TypeaheadState): void;
    handleDocumentClick: (e: MouseEvent | TouchEvent) => void;
    renderDefaultList(): JSX.Element;
}
//# sourceMappingURL=Typeahead.d.ts.map