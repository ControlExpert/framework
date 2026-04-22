import * as React from 'react';
export default class ContainerToggleComponent extends React.Component<{}, {
    fluid: boolean;
}> {
    state: {
        fluid: boolean;
    };
    constructor(props: React.Props<ContainerToggleComponent>);
    handleExpandToggle: (e: React.MouseEvent<any, MouseEvent>) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=ContainerToggle.d.ts.map