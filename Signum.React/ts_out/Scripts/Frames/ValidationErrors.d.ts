import * as React from 'react';
import { ModifiableEntity } from '../Signum.Entities';
export default class ValidationErrors extends React.Component<{
    entity: ModifiableEntity;
    prefix: string;
}> {
    render(): JSX.Element | null;
    handleOnClick: (key: string) => void;
}
//# sourceMappingURL=ValidationErrors.d.ts.map