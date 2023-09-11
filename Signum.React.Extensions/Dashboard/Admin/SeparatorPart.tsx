import * as React from 'react';
import { TypeContext, ValueLine } from '../../../../Framework/Signum.React/Scripts/Lines';
import { SeparatorPartEntity } from '../Signum.Entities.Dashboard';

export default function SeparatorPart(p: { ctx: TypeContext<SeparatorPartEntity> }) {
  const ctx = p.ctx.subCtx({ formGroupStyle: "SrOnly", placeholderLabels: true });

  return (
    <div className="form-inline">
      <ValueLine ctx={ctx.subCtx(c => c.title)} />
    </div>
  );
}
