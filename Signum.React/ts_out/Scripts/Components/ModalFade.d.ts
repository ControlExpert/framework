import * as React from 'react';
import { EnterHandler, EndHandler, ExitHandler } from 'react-transition-group/Transition';
export interface FadeProps {
    appear?: boolean;
    in?: boolean;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
    timeout: number | {
        enter?: number;
        exit?: number;
    };
    addEndListener?: EndHandler;
    onEnter?: EnterHandler;
    onEntering?: EnterHandler;
    onEntered?: EnterHandler;
    onExit?: ExitHandler;
    onExiting?: ExitHandler;
    onExited?: ExitHandler;
    children: React.ReactElement<any>;
}
export declare class ModalFade extends React.Component<FadeProps> {
    static defaultProps: {
        in: boolean;
        timeout: number;
        mountOnEnter: boolean;
        unmountOnExit: boolean;
        appear: boolean;
    };
    render(): JSX.Element;
}
//# sourceMappingURL=ModalFade.d.ts.map