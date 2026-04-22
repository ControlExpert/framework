import * as React from 'react';
import { ButtonsContext, ButtonBarElement } from '../TypeContext';
export interface ButtonBarProps extends ButtonsContext {
    align?: "left" | "right";
}
export default class ButtonBar extends React.Component<ButtonBarProps> {
    static clearButtonBarRenderer(): void;
    static onButtonBarRender: Array<(ctx: ButtonsContext) => Array<ButtonBarElement | undefined> | undefined>;
    hanldleKeyDown: (e: KeyboardEvent) => void;
    shortcuts: ((e: KeyboardEvent) => boolean)[];
    render(): React.FunctionComponentElement<any>;
}
//# sourceMappingURL=ButtonBar.d.ts.map