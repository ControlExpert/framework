import * as React from 'react';
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    innerRef?: (ta: HTMLTextAreaElement | null) => void;
    autoResize?: boolean;
}
export default class TextArea extends React.Component<TextAreaProps> {
    static defaultProps: {
        autoResize: boolean;
    };
    handleResize: (ta: HTMLTextAreaElement) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=TextArea.d.ts.map