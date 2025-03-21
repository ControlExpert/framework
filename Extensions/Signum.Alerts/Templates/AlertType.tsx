import * as React from 'react'
import { AutoLine } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { AlertTypeSymbol } from '../Signum.Alerts'

export default function AlertType(p : { ctx: TypeContext<AlertTypeSymbol> }){
  const ctx = p.ctx;
  const ctx4 = ctx.subCtx({ labelColumns: 2 });
  return (
    <div>
      <AutoLine ctx={ctx4.subCtx(n => n.name)} />
    </div>
  );
}
