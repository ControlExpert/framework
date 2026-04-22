import * as React from 'react';
import { SystemTime, FindOptionsParsed, QueryDescription } from '../FindOptions';
interface SystemTimeEditorProps extends React.Props<SystemTime> {
    findOptions: FindOptionsParsed;
    queryDescription: QueryDescription;
    onChanged: () => void;
}
export default class SystemTimeEditor extends React.Component<SystemTimeEditorProps> {
    render(): JSX.Element;
    handlePeriodClicked: () => void;
    isPeriodChecked(): boolean;
    renderShowPeriod(): JSX.Element;
    handlePreviousOperationClicked: () => void;
    isPreviousOperationChecked(): boolean;
    renderShowOperations(): JSX.Element;
    handleChangeMode: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    renderMode(): JSX.Element;
    renderDateTime(field: "startDate" | "endDate"): JSX.Element;
}
export {};
//# sourceMappingURL=SystemTimeEditor.d.ts.map