import * as React from 'react';
import { ExceptionEntity } from '../Signum.Entities.Basics';
import { TypeContext } from '../Lines';
export default class Exception extends React.Component<{
    ctx: TypeContext<ExceptionEntity>;
}> {
    render(): JSX.Element;
    codeTab(tabId: number, property: (ex: ExceptionEntity) => any): JSX.Element | undefined;
}
//# sourceMappingURL=Exception.d.ts.map