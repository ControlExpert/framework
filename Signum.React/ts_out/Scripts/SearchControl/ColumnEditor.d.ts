import * as React from 'react';
import { ColumnOptionParsed, QueryDescription, QueryToken, SubTokensOptions } from '../FindOptions';
interface ColumnEditorProps extends React.Props<ColumnEditor> {
    columnOption: ColumnOptionParsed;
    subTokensOptions: SubTokensOptions;
    queryDescription: QueryDescription;
    onChange: (token?: QueryToken) => void;
    close: () => void;
}
export default class ColumnEditor extends React.Component<ColumnEditorProps> {
    handleTokenChanged: (newToken: QueryToken | undefined) => void;
    handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ColumnEditor.d.ts.map